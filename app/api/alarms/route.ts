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

export async function GET(request: NextRequest) {
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

    const { data: alarms, error } = await supabase
      .from('alarms')
      .select('*')
      .eq('user_id', user.id)
      .order('alarm_time')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ alarms })
  } catch (error) {
    console.error('Error fetching alarms:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
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

    const { alarm_time } = await request.json()
    
    if (!alarm_time) {
      return NextResponse.json({ error: 'alarm_time is required' }, { status: 400 })
    }

    const { data: alarm, error } = await supabase
      .from('alarms')
      .insert({
        user_id: user.id,
        alarm_time,
        is_active: true,
        penalty_amount: 100
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ alarm }, { status: 201 })
  } catch (error) {
    console.error('Error creating alarm:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}