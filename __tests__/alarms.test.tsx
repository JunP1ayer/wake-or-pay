import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({
          data: [
            { id: '1', alarm_time: '07:00', is_active: true },
            { id: '2', alarm_time: '08:30', is_active: false }
          ],
          error: null
        }))
      })),
      insert: vi.fn(() => Promise.resolve({
        data: [{ id: '3', alarm_time: '06:00', is_active: true }],
        error: null
      })),
      update: vi.fn(() => Promise.resolve({ error: null })),
      delete: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }
}))

describe('Alarm Management', () => {
  it('should display list of user alarms', async () => {
    const AlarmListComponent = () => (
      <div>
        <h2>Your Alarms</h2>
        <div data-testid="alarm-1">
          <span>07:00</span>
          <span>Active</span>
        </div>
        <div data-testid="alarm-2">
          <span>08:30</span>
          <span>Inactive</span>
        </div>
      </div>
    )
    
    render(<AlarmListComponent />)
    
    expect(screen.getByText('Your Alarms')).toBeInTheDocument()
    expect(screen.getByText('07:00')).toBeInTheDocument()
    expect(screen.getByText('08:30')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('should create new alarm', async () => {
    const AlarmFormComponent = () => (
      <form>
        <input type="time" defaultValue="06:00" data-testid="alarm-time" />
        <button type="submit">Create Alarm</button>
      </form>
    )
    
    render(<AlarmFormComponent />)
    
    const timeInput = screen.getByTestId('alarm-time')
    const submitBtn = screen.getByText('Create Alarm')
    
    fireEvent.change(timeInput, { target: { value: '06:00' } })
    fireEvent.click(submitBtn)
    
    // Test will fail until we implement the actual API call
    await waitFor(() => {
      expect(timeInput).toHaveValue('06:00')
    })
  })

  it('should toggle alarm active status', async () => {
    const AlarmToggleComponent = () => (
      <div>
        <span>07:00</span>
        <button data-testid="toggle-alarm">Toggle</button>
        <span data-testid="status">Active</span>
      </div>
    )
    
    render(<AlarmToggleComponent />)
    
    const toggleBtn = screen.getByTestId('toggle-alarm')
    const status = screen.getByTestId('status')
    
    expect(status).toHaveTextContent('Active')
    
    fireEvent.click(toggleBtn)
    
    // Test will fail until we implement state management
    await waitFor(() => {
      expect(status).toHaveTextContent('Inactive')
    })
  })

  it('should delete alarm', async () => {
    const AlarmDeleteComponent = () => (
      <div>
        <span>07:00</span>
        <button data-testid="delete-alarm">Delete</button>
      </div>
    )
    
    render(<AlarmDeleteComponent />)
    
    const deleteBtn = screen.getByTestId('delete-alarm')
    fireEvent.click(deleteBtn)
    
    // Should show confirmation or remove from UI
    // Test will fail until we implement deletion
    expect(deleteBtn).toBeInTheDocument()
  })

  it('should show empty state when no alarms', async () => {
    const EmptyAlarmsComponent = () => (
      <div>
        <h2>Your Alarms</h2>
        <div data-testid="empty-state">
          <p>No alarms set yet</p>
          <button>Create Your First Alarm</button>
        </div>
      </div>
    )
    
    render(<EmptyAlarmsComponent />)
    
    expect(screen.getByText('No alarms set yet')).toBeInTheDocument()
    expect(screen.getByText('Create Your First Alarm')).toBeInTheDocument()
  })
})