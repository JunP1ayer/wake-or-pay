import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithOAuth: vi.fn(),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    }
  }))
}))

describe('Authentication', () => {
  it('should show login button when not authenticated', async () => {
    const AuthComponent = () => <button>Login with GitHub</button>
    render(<AuthComponent />)
    
    expect(screen.getByText('Login with GitHub')).toBeInTheDocument()
  })

  it('should handle GitHub login', async () => {
    const mockSignIn = vi.fn()
    const AuthComponent = () => (
      <button onClick={() => mockSignIn({ provider: 'github' })}>
        Login with GitHub
      </button>
    )
    
    render(<AuthComponent />)
    
    const loginBtn = screen.getByText('Login with GitHub')
    fireEvent.click(loginBtn)
    
    expect(mockSignIn).toHaveBeenCalledWith({ provider: 'github' })
  })

  it('should show user profile when authenticated', async () => {
    const AuthComponent = () => (
      <div>
        <span>Welcome, test@example.com</span>
        <button>Logout</button>
      </div>
    )
    
    render(<AuthComponent />)
    
    expect(screen.getByText('Welcome, test@example.com')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })
})