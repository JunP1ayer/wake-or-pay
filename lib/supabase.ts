import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a function to get Supabase client with runtime checks
export const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing Supabase environment variables in production')
    }
    // Return a mock client for build time
    return null as any
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  })
}

// Legacy export for compatibility
export const supabase = getSupabaseClient()

// Database types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          display_name: string | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      alarms: {
        Row: {
          id: string
          user_id: string
          alarm_time: string
          is_active: boolean
          penalty_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          alarm_time: string
          is_active?: boolean
          penalty_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          alarm_time?: string
          is_active?: boolean
          penalty_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      wake_attempts: {
        Row: {
          id: string
          alarm_id: string
          user_id: string
          attempted_at: string
          success: boolean
          verification_method: 'face' | 'manual'
          failure_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          alarm_id: string
          user_id: string
          attempted_at?: string
          success: boolean
          verification_method: 'face' | 'manual'
          failure_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          alarm_id?: string
          user_id?: string
          attempted_at?: string
          success?: boolean
          verification_method?: 'face' | 'manual'
          failure_reason?: string | null
          created_at?: string
        }
      }
      payment_transactions: {
        Row: {
          id: string
          user_id: string
          stripe_payment_intent_id: string
          amount: number
          status: string
          wake_attempt_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_payment_intent_id: string
          amount: number
          status: string
          wake_attempt_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_payment_intent_id?: string
          amount?: number
          status?: string
          wake_attempt_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Helper functions
export const signInWithGitHub = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
    }
  })
  
  if (error) throw error
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export const createUserProfile = async (userId: string, displayName?: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      display_name: displayName,
      timezone: 'Asia/Tokyo'
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getUserAlarms = async (userId: string) => {
  const { data, error } = await supabase
    .from('alarms')
    .select('*')
    .eq('user_id', userId)
    .order('alarm_time')
  
  if (error) throw error
  return data
}

export const createAlarm = async (userId: string, alarmTime: string) => {
  const { data, error } = await supabase
    .from('alarms')
    .insert({
      user_id: userId,
      alarm_time: alarmTime,
      is_active: true,
      penalty_amount: 100
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const updateAlarm = async (alarmId: string, updates: Partial<Database['public']['Tables']['alarms']['Update']>) => {
  const { data, error } = await supabase
    .from('alarms')
    .update(updates)
    .eq('id', alarmId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteAlarm = async (alarmId: string) => {
  const { error } = await supabase
    .from('alarms')
    .delete()
    .eq('id', alarmId)
  
  if (error) throw error
}

export const createWakeAttempt = async (
  alarmId: string,
  userId: string,
  success: boolean,
  verificationMethod: 'face' | 'manual',
  failureReason?: string
) => {
  const { data, error } = await supabase
    .from('wake_attempts')
    .insert({
      alarm_id: alarmId,
      user_id: userId,
      success,
      verification_method: verificationMethod,
      failure_reason: failureReason
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}