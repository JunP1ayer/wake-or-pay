import { loadStripe } from '@stripe/stripe-js'
import Stripe from 'stripe'

// Client-side Stripe
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

// Server-side Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export interface PaymentMethodSetup {
  client_secret: string
  payment_method_id?: string
}

export interface ChargeRequest {
  payment_method_id: string
  amount: number
  user_id: string
  description: string
}

export async function createSetupIntent(customerId?: string) {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card'],
      usage: 'off_session', // For future payments
    })

    return {
      client_secret: setupIntent.client_secret,
      setup_intent_id: setupIntent.id
    }
  } catch (error) {
    console.error('Error creating setup intent:', error)
    throw new Error('Failed to create payment setup')
  }
}

export async function createCustomer(email: string, name?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        created_via: 'wake-or-pay-app'
      }
    })

    return customer
  } catch (error) {
    console.error('Error creating customer:', error)
    throw new Error('Failed to create customer')
  }
}

export async function chargePenalty({
  payment_method_id,
  amount,
  user_id,
  description
}: ChargeRequest) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method: payment_method_id,
      confirmation_method: 'automatic',
      confirm: true,
      off_session: true, // Charge without user present
      description,
      metadata: {
        user_id,
        type: 'penalty_charge',
        app: 'wake-or-pay'
      }
    })

    return {
      success: paymentIntent.status === 'succeeded',
      payment_intent_id: paymentIntent.id,
      amount_charged: paymentIntent.amount,
      status: paymentIntent.status
    }
  } catch (error) {
    console.error('Error charging penalty:', error)
    
    if (error instanceof Stripe.errors.StripeCardError) {
      return {
        success: false,
        error: error.message,
        error_code: error.code
      }
    }
    
    throw new Error('Failed to process penalty charge')
  }
}

export async function getPaymentMethods(customerId: string) {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    })

    return paymentMethods.data
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    throw new Error('Failed to fetch payment methods')
  }
}