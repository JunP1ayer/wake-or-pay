import { NextRequest, NextResponse } from 'next/server'
import { chargePenalty } from '@/lib/stripe'
import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { result_id, payment_method_id, amount, description } = await request.json()

    // Verify the result belongs to the user
    const { data: result } = await supabase
      .from('results')
      .select('*')
      .eq('id', result_id)
      .eq('user_id', user.id)
      .single()

    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 })
    }

    if (result.penalty_charged) {
      return NextResponse.json({ error: 'Penalty already charged' }, { status: 400 })
    }

    // Charge the penalty
    const chargeResult = await chargePenalty({
      payment_method_id,
      amount,
      user_id: user.id,
      description: description || `Wake-up penalty for ${new Date(result.scheduled_time).toLocaleDateString()}`
    })

    if (chargeResult.success) {
      // Update result with charge information
      await supabase
        .from('results')
        .update({
          penalty_charged: true,
          stripe_payment_intent_id: chargeResult.payment_intent_id
        })
        .eq('id', result_id)

      // Update user KPI
      const today = new Date().toISOString().split('T')[0]
      await supabase
        .from('user_kpi')
        .upsert({
          user_id: user.id,
          date: today,
          total_penalties: amount
        }, {
          onConflict: 'user_id,date'
        })

      return NextResponse.json({
        success: true,
        payment_intent_id: chargeResult.payment_intent_id,
        amount_charged: chargeResult.amount_charged
      })
    } else {
      return NextResponse.json({
        success: false,
        error: chargeResult.error || 'Payment failed'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Penalty charge failed:', error)
    return NextResponse.json(
      { error: 'Failed to process penalty charge' },
      { status: 500 }
    )
  }
}