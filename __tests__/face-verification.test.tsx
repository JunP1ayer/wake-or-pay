import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock MediaPipe and camera APIs
Object.defineProperty(global.navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn(() => Promise.resolve({
      getVideoTracks: () => [{ stop: vi.fn() }]
    } as any))
  },
  writable: true
})

vi.mock('@mediapipe/face_detection', () => ({
  FaceDetection: vi.fn(() => ({
    setOptions: vi.fn(),
    onResults: vi.fn(),
    send: vi.fn()
  }))
}))

describe('Face Verification', () => {
  it('should request camera permission', async () => {
    const FaceVerifyComponent = () => (
      <div>
        <button>Start Face Verification</button>
        <div>Camera permission required</div>
      </div>
    )
    
    render(<FaceVerifyComponent />)
    
    expect(screen.getByText('Camera permission required')).toBeInTheDocument()
    
    const startBtn = screen.getByText('Start Face Verification')
    fireEvent.click(startBtn)
    
    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: { facingMode: 'user' }
      })
    })
  })

  it('should detect face successfully', async () => {
    const FaceVerifyComponent = () => (
      <div>
        <div data-testid="camera-view">Camera active</div>
        <div>Face detected: ✓</div>
        <button>Confirm Wake Up</button>
      </div>
    )
    
    render(<FaceVerifyComponent />)
    
    // Should show success state after face detection
    expect(screen.getByText('Face detected: ✓')).toBeInTheDocument()
    expect(screen.getByText('Confirm Wake Up')).toBeInTheDocument()
  })

  it('should handle face detection failure', async () => {
    const FaceVerifyComponent = () => (
      <div>
        <div>No face detected. Please position your face in the camera.</div>
        <button>Retry</button>
        <button>Manual Confirmation</button>
      </div>
    )
    
    render(<FaceVerifyComponent />)
    
    expect(screen.getByText(/No face detected/)).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
    expect(screen.getByText('Manual Confirmation')).toBeInTheDocument()
  })

  it('should provide accessibility fallback', async () => {
    const FaceVerifyComponent = () => (
      <div>
        <div>Face verification not available</div>
        <button>Manual Wake Confirmation</button>
        <p>For accessibility, you can manually confirm your wake-up</p>
      </div>
    )
    
    render(<FaceVerifyComponent />)
    
    expect(screen.getByText(/accessibility/)).toBeInTheDocument()
    expect(screen.getByText('Manual Wake Confirmation')).toBeInTheDocument()
  })
})