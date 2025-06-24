import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const supabase = getSupabaseAdmin()
    
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { verification_method, alarm_id } = await request.json()
    
    if (!verification_method || !alarm_id) {
      return NextResponse.json({ error: 'verification_method and alarm_id are required' }, { status: 400 })
    }

    const now = new Date()
    const today = now.toISOString().split('T')[0]

    // Get the alarm to check if it's the user's alarm
    const { data: alarm, error: alarmError } = await supabase
      .from('alarms')
      .select('*')
      .eq('id', alarm_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (alarmError || !alarm) {
      return NextResponse.json({ error: 'Alarm not found or not active' }, { status: 404 })
    }

    // Check if verification is within reasonable time (e.g., within 2 hours of alarm time)
    const alarmDateTime = new Date(`${today}T${alarm.alarm_time}`)
    const maxVerificationTime = new Date(alarmDateTime.getTime() + (2 * 60 * 60 * 1000)) // 2 hours after alarm
    
    if (now > maxVerificationTime) {
      return NextResponse.json({ error: 'Verification window has expired' }, { status: 400 })
    }

    // Create successful wake attempt
    const { data: wakeAttempt, error: attemptError } = await supabase
      .from('wake_attempts')
      .insert({
        alarm_id: alarm.id,
        user_id: user.id,
        success: true,
        verification_method,
        attempted_at: now.toISOString()
      })
      .select()
      .single()

    if (attemptError) {
      console.error('Error creating wake attempt:', attemptError)
      return NextResponse.json({ error: 'Failed to record wake attempt' }, { status: 500 })
    }

    // Update or create wake verification record
    const verificationDeadline = new Date(alarmDateTime.getTime() + (30 * 60 * 1000)) // 30 minutes after alarm
    
    const { data: verification, error: verificationError } = await supabase
      .from('wake_verification')
      .upsert({
        user_id: user.id,
        date: today,
        verified: true,
        alarm_time: alarm.alarm_time,
        verification_deadline: verificationDeadline.toISOString()
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .single()

    if (verificationError) {
      console.error('Error updating verification:', verificationError)
      return NextResponse.json({ error: 'Failed to update verification' }, { status: 500 })
    }

    // Check for consecutive success streaks for rewards
    const { data: recentVerifications } = await supabase
      .from('wake_verification')
      .select('date, verified')
      .eq('user_id', user.id)
      .eq('verified', true)
      .order('date', { ascending: false })
      .limit(7)

    const consecutiveDays = recentVerifications?.length || 0

    return NextResponse.json({
      success: true,
      wake_attempt_id: wakeAttempt.id,
      verification_id: verification.id,
      consecutive_success_days: consecutiveDays,
      earned_badge: consecutiveDays >= 7 ? 'early_riser_week' : null,
      message: consecutiveDays >= 7 ? 'Congratulations! You earned the Early Riser badge!' : 'Great job waking up on time!'
    })

  } catch (error) {
    console.error('Error verifying wake-up:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}