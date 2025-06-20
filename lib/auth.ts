import { supabase, isUsingMock } from './supabase'
import type { User } from '@supabase/supabase-js'

export async function signInAnonymously() {
  try {
    const { data, error } = await supabase.auth.signInAnonymously()
    
    if (error) {
      throw new Error(`Authentication failed: ${error.message}`)
    }
    
    // Store user in localStorage for persistence (both mock and real)
    if (data.user) {
      localStorage.setItem('current_user', JSON.stringify(data.user))
      console.log(`[Auth] ${isUsingMock ? 'Mock' : 'Supabase'} authentication successful:`, data.user.id)
    }
    
    return data
  } catch (error) {
    console.error('[Auth] Sign in failed:', error)
    throw error
  }
}

export async function signInWithEmail(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    }
  })
  
  if (error) {
    throw new Error(`Email sign in failed: ${error.message}`)
  }
  
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    throw new Error(`Sign out failed: ${error.message}`)
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    // If no user from Supabase, check localStorage as fallback
    if (!user) {
      const storedUser = localStorage.getItem('current_user')
      if (storedUser) {
        return JSON.parse(storedUser)
      }
    }
    
    return user
  } catch (error) {
    console.error('[Auth] Get current user failed:', error)
    
    // Fallback to localStorage
    const storedUser = localStorage.getItem('current_user')
    if (storedUser) {
      return JSON.parse(storedUser)
    }
    
    return null
  }
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function createUserProfile(user: User) {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    })
    .select()
    .single()
  
  if (error) {
    throw new Error(`Failed to create user profile: ${error.message}`)
  }
  
  return data
}