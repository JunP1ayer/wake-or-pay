import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MainScreen from '@/app/page'

describe('App Router Migration', () => {
  it('should render main page with logo at /', () => {
    render(<MainScreen />)
    
    // Should have wake-or-pay logo/title
    expect(screen.getByText(/wake-or-pay|目覚ましチャレンジ/i)).toBeInTheDocument()
    
    // Should have next alarm placeholder
    expect(screen.getByText(/次のアラーム|Next Alarm/i)).toBeInTheDocument()
  })

  it('should render add alarm button', () => {
    render(<MainScreen />)
    
    // Should have add alarm button
    expect(screen.getByRole('button', { name: /アラーム追加|\+/i })).toBeInTheDocument()
  })

  it('should render share and settings buttons', () => {
    render(<MainScreen />)
    
    // Should have share button
    expect(screen.getByRole('button', { name: /share|シェア/i })).toBeInTheDocument()
    
    // Should have settings button  
    expect(screen.getByRole('button', { name: /settings|設定/i })).toBeInTheDocument()
  })
})