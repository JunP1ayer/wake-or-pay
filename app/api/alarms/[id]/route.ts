import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const updates = await request.json()
    const { id } = params

    // Verify the alarm belongs to the user
    const { data: existingAlarm, error: checkError } = await supabase
      .from('alarms')
      .select('user_id')
      .eq('id', id)
      .single()

    if (checkError || !existingAlarm) {
      return NextResponse.json({ error: 'Alarm not found' }, { status: 404 })
    }

    if (existingAlarm.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { data: alarm, error } = await supabase
      .from('alarms')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ alarm })
  } catch (error) {
    console.error('Error updating alarm:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    // Verify the alarm belongs to the user
    const { data: existingAlarm, error: checkError } = await supabase
      .from('alarms')
      .select('user_id')
      .eq('id', id)
      .single()

    if (checkError || !existingAlarm) {
      return NextResponse.json({ error: 'Alarm not found' }, { status: 404 })
    }

    if (existingAlarm.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { error } = await supabase
      .from('alarms')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting alarm:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}