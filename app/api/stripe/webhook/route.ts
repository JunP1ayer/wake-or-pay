import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { constructWebhookEvent } from '@/lib/stripe'

// Create Supabase client with runtime initialization
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('Stripe-Signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    const event = constructWebhookEvent(body, signature)

    console.log('Received Stripe webhook:', event.type)

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object)
        break
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object)
        break
      case 'payment_intent.canceled':
        await handlePaymentCanceled(event.data.object)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('payment_transactions')
      .update({ status: 'succeeded' })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (error) {
      console.error('Error updating payment status:', error)
    }

    console.log(`Payment succeeded: ${paymentIntent.id}`)
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('payment_transactions')
      .update({ status: 'failed' })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (error) {
      console.error('Error updating payment status:', error)
    }

    console.log(`Payment failed: ${paymentIntent.id}`)
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

async function handlePaymentCanceled(paymentIntent: any) {
  try {
    const supabase = getSupabaseAdmin()
    const { error } = await supabase
      .from('payment_transactions')
      .update({ status: 'canceled' })
      .eq('stripe_payment_intent_id', paymentIntent.id)

    if (error) {
      console.error('Error updating payment status:', error)
    }

    console.log(`Payment canceled: ${paymentIntent.id}`)
  } catch (error) {
    console.error('Error handling payment cancellation:', error)
  }
}