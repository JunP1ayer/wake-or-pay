import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createPaymentIntent, PENALTY_AMOUNT } from '@/lib/stripe'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { wake_attempt_id } = await request.json()
    
    if (!wake_attempt_id) {
      return NextResponse.json({ error: 'wake_attempt_id is required' }, { status: 400 })
    }

    // Verify the wake attempt belongs to the user and was a failure
    const { data: wakeAttempt, error: attemptError } = await supabase
      .from('wake_attempts')
      .select('*')
      .eq('id', wake_attempt_id)
      .eq('user_id', user.id)
      .single()

    if (attemptError || !wakeAttempt) {
      return NextResponse.json({ error: 'Wake attempt not found' }, { status: 404 })
    }

    if (wakeAttempt.success) {
      return NextResponse.json({ error: 'Cannot charge for successful wake attempt' }, { status: 400 })
    }

    // Check if payment already exists for this wake attempt
    const { data: existingPayment } = await supabase
      .from('payment_transactions')
      .select('stripe_payment_intent_id')
      .eq('wake_attempt_id', wake_attempt_id)
      .single()

    if (existingPayment) {
      return NextResponse.json({ error: 'Payment already processed for this wake attempt' }, { status: 400 })
    }

    // Create Stripe payment intent
    const paymentIntent = await createPaymentIntent(PENALTY_AMOUNT, {
      user_id: user.id,
      wake_attempt_id
    })

    // Record payment transaction in database
    const { data: transaction, error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user.id,
        stripe_payment_intent_id: paymentIntent.id,
        amount: PENALTY_AMOUNT,
        status: paymentIntent.status,
        wake_attempt_id
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error recording transaction:', transactionError)
      return NextResponse.json({ error: 'Failed to record transaction' }, { status: 500 })
    }

    return NextResponse.json({
      client_secret: paymentIntent.client_secret,
      amount: PENALTY_AMOUNT,
      payment_intent_id: paymentIntent.id,
      transaction_id: transaction.id
    })
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}