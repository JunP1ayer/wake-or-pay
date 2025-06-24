import Stripe from 'stripe'

// Runtime Stripe client initialization
const getStripeClient = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY
  
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-05-28.basil',
    typescript: true,
  })
}

export const PENALTY_AMOUNT = 100 // 100 yen

export async function createPaymentIntent(
  amount: number = PENALTY_AMOUNT,
  metadata: { user_id: string; wake_attempt_id?: string } = { user_id: '' }
) {
  try {
    const stripe = getStripeClient()
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'jpy',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata,
      description: 'Wake-or-Pay Challenge Penalty',
    })

    return paymentIntent
  } catch (error) {
    console.error('Error creating payment intent:', error)
    throw error
  }
}

export async function confirmPaymentIntent(paymentIntentId: string) {
  try {
    const stripe = getStripeClient()
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error('Error confirming payment intent:', error)
    throw error
  }
}

export async function getPaymentIntent(paymentIntentId: string) {
  try {
    const stripe = getStripeClient()
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    return paymentIntent
  } catch (error) {
    console.error('Error retrieving payment intent:', error)
    throw error
  }
}

export function constructWebhookEvent(body: string, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  }

  try {
    const stripe = getStripeClient()
    return stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    )
  } catch (error) {
    console.error('Error constructing webhook event:', error)
    throw error
  }
}