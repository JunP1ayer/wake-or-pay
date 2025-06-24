import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.redirect(`${requestUrl.origin}/auth/error`)
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/error`)
    }

    // Successful auth, redirect to main app
    return NextResponse.redirect(`${requestUrl.origin}/`)
  }

  // No code present, redirect to main app
  return NextResponse.redirect(`${requestUrl.origin}/`)
}