import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Check if we're using demo/mock environment
const isDemo = supabaseUrl === 'https://demo.supabase.co' || !supabaseUrl || supabaseUrl.includes('demo')

// Create a mock Supabase client for local development
const createMockSupabaseClient = () => {
  const mockData = {
    alarms: [] as any[],
    results: [] as any[],
    user_kpi: [] as any[],
    user_profiles: [] as any[]
  }

  return {
    auth: {
      signInAnonymously: () => {
        console.log('[Supabase Mock] Anonymous sign in')
        return Promise.resolve({ 
          data: {
            user: {
              id: `mock_user_${Date.now()}`,
              aud: 'authenticated',
              role: 'authenticated',
              email: null,
              created_at: new Date().toISOString(),
              app_metadata: {},
              user_metadata: {}
            },
            session: {
              access_token: 'mock_token',
              refresh_token: 'mock_refresh',
              expires_in: 3600,
              expires_at: Date.now() + 3600000,
              token_type: 'bearer'
            }
          }, 
          error: null 
        })
      },
      signInWithOtp: () => Promise.resolve({ data: null, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => {
        const mockUser = localStorage.getItem('mock_user')
        return Promise.resolve({ 
          data: { 
            user: mockUser ? JSON.parse(mockUser) : null 
          } 
        })
      },
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({
        data: { subscription: {} },
        unsubscribe: () => {}
      })
    },
    from: (table: string) => ({
      select: (columns = '*') => ({
        eq: (column: string, value: any) => ({
          limit: (count: number) => Promise.resolve({ 
            data: mockData[table as keyof typeof mockData] || [], 
            error: null 
          }),
          single: () => Promise.resolve({ data: null, error: null }),
          order: (column: string, options?: any) => ({
            limit: (count: number) => Promise.resolve({ 
              data: mockData[table as keyof typeof mockData] || [], 
              error: null 
            })
          })
        }),
        limit: (count: number) => Promise.resolve({ 
          data: mockData[table as keyof typeof mockData] || [], 
          error: null 
        }),
        single: () => Promise.resolve({ data: null, error: null }),
        order: (column: string, options?: any) => ({
          limit: (count: number) => Promise.resolve({ 
            data: mockData[table as keyof typeof mockData] || [], 
            error: null 
          })
        })
      }),
      insert: (data: any) => {
        console.log(`[Supabase Mock] Insert into ${table}:`, data)
        return Promise.resolve({ data: { id: `mock_${Date.now()}`, ...data }, error: null })
      },
      upsert: (data: any) => ({
        select: (columns = '*') => ({
          single: () => Promise.resolve({ 
            data: { id: `mock_${Date.now()}`, ...data }, 
            error: null 
          })
        })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => Promise.resolve({ data: null, error: null })
      }),
      delete: () => ({
        eq: (column: string, value: any) => Promise.resolve({ error: null })
      })
    })
  }
}

// Create the appropriate client based on environment
export const supabase = isDemo 
  ? createMockSupabaseClient() as any
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'implicit'
      },
      realtime: {
        params: {
          eventsPerSecond: 2
        }
      }
    })

// Export a flag to check if we're using mock
export const isUsingMock = isDemo

// Types for our database tables
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface Alarm {
  id: string
  user_id: string
  wake_time: string
  penalty_amount: number
  is_active: boolean
  verification_method: 'face' | 'shake' | 'both'
  days_of_week: number[]
  created_at: string
  updated_at: string
}

export interface Result {
  id: string
  alarm_id: string
  user_id: string
  scheduled_time: string
  verification_time?: string
  is_success: boolean
  verification_method?: string
  penalty_charged: boolean
  stripe_payment_intent_id?: string
  created_at: string
}

export interface UserKPI {
  id: string
  user_id: string
  date: string
  total_alarms: number
  successful_wakeups: number
  total_penalties: number
  streak_days: number
  created_at: string
}

export interface Experiment {
  id: string
  user_id: string
  experiment_name: string
  variant: string
  assigned_at: string
}