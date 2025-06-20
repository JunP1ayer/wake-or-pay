import { NextRequest, NextResponse } from 'next/server'
import { createSetupIntent, createCustomer } from '@/lib/stripe'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, name } = await request.json()

    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await createCustomer(email, name)
      customerId = customer.id

      // Save customer ID to user profile
      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    // Create setup intent for future payments
    const { client_secret, setup_intent_id } = await createSetupIntent(customerId)

    return NextResponse.json({
      client_secret,
      setup_intent_id,
      customer_id: customerId
    })

  } catch (error) {
    console.error('Setup intent creation failed:', error)
    return NextResponse.json(
      { error: 'Failed to create payment setup' },
      { status: 500 }
    )
  }
}