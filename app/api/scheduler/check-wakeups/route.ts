import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createPaymentIntent, PENALTY_AMOUNT } from '@/lib/stripe'

// Create Supabase admin client
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Verify this is a legitimate cron job request
function verifySchedulerAuth(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const expectedSecret = process.env.SCHEDULER_SECRET_KEY
  
  if (!expectedSecret) {
    throw new Error('SCHEDULER_SECRET_KEY not set')
  }
  
  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return false
  }
  
  return true
}

export async function POST(request: NextRequest) {
  try {
    // Verify this is a legitimate scheduler request
    if (!verifySchedulerAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    console.log(`Running wake-up check for ${today} at ${now.toISOString()}`)

    // Get all active alarms
    const { data: alarms, error: alarmsError } = await supabase
      .from('alarms')
      .select('*')
      .eq('is_active', true)

    if (alarmsError) {
      console.error('Error fetching alarms:', alarmsError)
      return NextResponse.json({ error: 'Failed to fetch alarms' }, { status: 500 })
    }

    let processedCount = 0
    let chargedCount = 0
    let errorCount = 0

    // Process each alarm
    for (const alarm of alarms) {
      try {
        // Create or get today's wake verification record
        const alarmDateTime = new Date(`${today}T${alarm.alarm_time}`)
        const verificationDeadline = new Date(alarmDateTime.getTime() + (30 * 60 * 1000)) // 30 minutes after alarm time
        
        // Check if verification deadline has passed
        if (now < verificationDeadline) {
          console.log(`Skipping alarm ${alarm.id} - deadline not reached yet`)
          continue
        }

        // Get or create wake verification record
        const { data: verification, error: verificationError } = await supabase
          .from('wake_verification')
          .upsert({
            user_id: alarm.user_id,
            date: today,
            alarm_time: alarm.alarm_time,
            verification_deadline: verificationDeadline.toISOString(),
            verified: false
          }, {
            onConflict: 'user_id,date'
          })
          .select()
          .single()

        if (verificationError) {
          console.error(`Error handling verification for alarm ${alarm.id}:`, verificationError)
          errorCount++
          continue
        }

        // If already verified, skip
        if (verification.verified) {
          console.log(`User ${alarm.user_id} already verified for ${today}`)
          processedCount++
          continue
        }

        // Check if we already charged for this
        const { data: existingTransaction } = await supabase
          .from('payment_transactions')
          .select('*')
          .eq('user_id', alarm.user_id)
          .eq('created_at', today)
          .single()

        if (existingTransaction) {
          console.log(`User ${alarm.user_id} already charged for ${today}`)
          processedCount++
          continue
        }

        // Create wake attempt record for failed wake-up
        const { data: wakeAttempt, error: attemptError } = await supabase
          .from('wake_attempts')
          .insert({
            alarm_id: alarm.id,
            user_id: alarm.user_id,
            success: false,
            verification_method: null,
            failure_reason: 'No verification received within deadline',
            attempted_at: verificationDeadline.toISOString()
          })
          .select()
          .single()

        if (attemptError) {
          console.error(`Error creating wake attempt for alarm ${alarm.id}:`, attemptError)
          errorCount++
          continue
        }

        // Create automatic payment intent
        const paymentIntent = await createPaymentIntent(
          alarm.penalty_amount || PENALTY_AMOUNT,
          {
            user_id: alarm.user_id,
            wake_attempt_id: wakeAttempt.id
          }
        )

        // Record payment transaction
        const { error: transactionError } = await supabase
          .from('payment_transactions')
          .insert({
            user_id: alarm.user_id,
            stripe_payment_intent_id: paymentIntent.id,
            amount: alarm.penalty_amount || PENALTY_AMOUNT,
            status: paymentIntent.status,
            wake_attempt_id: wakeAttempt.id
          })

        if (transactionError) {
          console.error(`Error recording transaction for alarm ${alarm.id}:`, transactionError)
          errorCount++
          continue
        }

        console.log(`Successfully charged user ${alarm.user_id} for failed wake-up on ${today}`)
        chargedCount++
        processedCount++

      } catch (error) {
        console.error(`Error processing alarm ${alarm.id}:`, error)
        errorCount++
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      charged: chargedCount,
      errors: errorCount,
      total_alarms: alarms.length,
      timestamp: now.toISOString()
    })

  } catch (error) {
    console.error('Scheduler error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Also support GET for health checks
export async function GET(request: NextRequest) {
  if (!verifySchedulerAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'wake-or-pay-scheduler'
  })
}