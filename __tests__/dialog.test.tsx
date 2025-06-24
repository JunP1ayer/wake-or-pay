import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import MainScreen from '@/app/page'

describe('Dialog Interactions', () => {
  it('should open alarm dialog on + button click', () => {
    render(<MainScreen />)
    
    // Find and click the add alarm button
    const addButton = screen.getByRole('button', { name: /アラーム追加|\+/i })
    fireEvent.click(addButton)
    
    // Should show alarm setup dialog
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/時刻設定|Time Setting/i)).toBeInTheDocument()
  })

  it('should show time picker in dialog', () => {
    render(<MainScreen />)
    
    // Open dialog
    const addButton = screen.getByRole('button', { name: /アラーム追加|\+/i })
    fireEvent.click(addButton)
    
    // Should have time input in dialog
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    const timeInputs = screen.getAllByDisplayValue('07:00')
    expect(timeInputs.length).toBeGreaterThan(0)
  })

  it('should show penalty amount (¥100) in dialog', () => {
    render(<MainScreen />)
    
    // Open dialog
    const addButton = screen.getByRole('button', { name: /アラーム追加|\+/i })
    fireEvent.click(addButton)
    
    // Should show ¥100 penalty
    expect(screen.getByText(/¥100|100円/)).toBeInTheDocument()
  })
})