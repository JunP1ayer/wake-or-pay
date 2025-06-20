import { supabase } from '@/lib/supabase'
import type { Alarm } from '@/lib/supabase'

export interface RecordResultParams {
  alarm: Alarm
  userId: string
  scheduledTime: Date
  isSuccess: boolean
  verificationMethod?: string
  verificationTime?: Date
}

export async function recordResult({
  alarm,
  userId,
  scheduledTime,
  isSuccess,
  verificationMethod,
  verificationTime
}: RecordResultParams) {
  try {
    // Insert result record
    const { data: result, error: resultError } = await supabase
      .from('results')
      .insert({
        alarm_id: alarm.id,
        user_id: userId,
        scheduled_time: scheduledTime.toISOString(),
        verification_time: verificationTime?.toISOString(),
        is_success: isSuccess,
        verification_method: verificationMethod,
        penalty_charged: false // Will be updated when penalty is charged
      })
      .select()
      .single()

    if (resultError) throw resultError

    // Update user KPI
    const today = new Date().toISOString().split('T')[0]
    
    // Get current KPI for today
    const { data: currentKPI } = await supabase
      .from('user_kpi')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    const newKPI = {
      user_id: userId,
      date: today,
      total_alarms: (currentKPI?.total_alarms || 0) + 1,
      successful_wakeups: (currentKPI?.successful_wakeups || 0) + (isSuccess ? 1 : 0),
      total_penalties: currentKPI?.total_penalties || 0,
      streak_days: isSuccess 
        ? (currentKPI?.streak_days || 0) + 1 
        : 0 // Reset streak on failure
    }

    const { error: kpiError } = await supabase
      .from('user_kpi')
      .upsert(newKPI, {
        onConflict: 'user_id,date'
      })

    if (kpiError) throw kpiError

    return {
      success: true,
      result,
      shouldChargePenalty: !isSuccess
    }

  } catch (error) {
    console.error('Error recording result:', error)
    throw new Error('Failed to record wake-up result')
  }
}

export async function triggerPenaltyCharge(resultId: string, paymentMethodId: string) {
  try {
    const response = await fetch('/api/stripe/charge-penalty', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        result_id: resultId,
        payment_method_id: paymentMethodId
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to charge penalty')
    }

    return data
  } catch (error) {
    console.error('Error triggering penalty charge:', error)
    throw error
  }
}

export async function calculateSuccessRate(userId: string, days: number = 7): Promise<number> {
  try {
    const { data: results } = await supabase
      .from('results')
      .select('is_success')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    if (!results || results.length === 0) return 0

    const successCount = results.filter((r: any) => r.is_success).length
    return Math.round((successCount / results.length) * 100)
  } catch (error) {
    console.error('Error calculating success rate:', error)
    return 0
  }
}