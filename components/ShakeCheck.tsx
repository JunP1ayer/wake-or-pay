'use client'

import { useState, useEffect, useRef } from 'react'
import { Smartphone, CheckCircle, AlertCircle } from 'lucide-react'

interface ShakeCheckProps {
  onSuccess: () => void
  onError?: (error: string) => void
}

export default function ShakeCheck({ onSuccess, onError }: ShakeCheckProps) {
  const [isActive, setIsActive] = useState(false)
  const [shakeCount, setShakeCount] = useState(0)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'setup' | 'shaking' | 'success'>('setup')
  
  const shakeThreshold = 15 // Minimum acceleration to count as shake
  const requiredShakes = 10 // Number of shakes needed
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastUpdateRef = useRef<number>(0)
  const shakeCountRef = useRef<number>(0)

  useEffect(() => {
    return () => {
      stopShakeDetection()
    }
  }, [])

  const startShakeDetection = async () => {
    try {
      if (typeof DeviceMotionEvent === 'undefined') {
        throw new Error('Device motion not supported on this device')
      }

      // Request permission for iOS 13+
      if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const permission = await (DeviceMotionEvent as any).requestPermission()
        if (permission !== 'granted') {
          throw new Error('Motion permission denied')
        }
      }

      setError('')
      setShakeCount(0)
      shakeCountRef.current = 0
      setStep('shaking')
      setIsActive(true)

      const handleMotion = (event: DeviceMotionEvent) => {
        if (!isActive) return

        const acceleration = event.accelerationIncludingGravity
        if (!acceleration) return
        
        const { x, y, z } = acceleration
        const accelerationX = x || 0
        const accelerationY = y || 0
        const accelerationZ = z || 0
        
        const now = Date.now()
        
        // Throttle to prevent too many rapid updates
        if (now - lastUpdateRef.current < 100) return
        lastUpdateRef.current = now

        // Calculate total acceleration
        const totalAcceleration = Math.sqrt(
          accelerationX * accelerationX + 
          accelerationY * accelerationY + 
          accelerationZ * accelerationZ
        )
        
        // Detect shake if acceleration exceeds threshold
        if (totalAcceleration > shakeThreshold) {
          shakeCountRef.current += 1
          setShakeCount(shakeCountRef.current)
          
          // Check if we've reached the required number of shakes
          if (shakeCountRef.current >= requiredShakes) {
            handleSuccess()
          }
        }
      }

      window.addEventListener('devicemotion', handleMotion)
      
      // Set timeout to stop detection after 30 seconds
      timeoutRef.current = setTimeout(() => {
        stopShakeDetection()
        setError('Time limit exceeded. Please try again.')
        setStep('setup')
      }, 30000)

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Shake detection failed'
      setError(message)
      onError?.(message)
    }
  }

  const stopShakeDetection = () => {
    setIsActive(false)
    window.removeEventListener('devicemotion', () => {})
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleSuccess = () => {
    stopShakeDetection()
    setStep('success')
    
    setTimeout(() => {
      onSuccess()
    }, 1500)
  }

  const progress = Math.min((shakeCount / requiredShakes) * 100, 100)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <Smartphone className={`w-8 h-8 text-primary-600 ${isActive ? 'animate-shake' : ''}`} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Shake Verification
        </h3>
        <p className="text-gray-600 text-sm">
          Shake your phone vigorously to prove you're awake
        </p>
      </div>

      {/* Shake Interface */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        {step === 'setup' && (
          <div className="space-y-4">
            <p className="text-gray-700">
              Hold your phone firmly and shake it {requiredShakes} times
            </p>
            <button
              onClick={startShakeDetection}
              className="btn-primary"
            >
              Start Shake Detection
            </button>
          </div>
        )}

        {step === 'shaking' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">
                {shakeCount}
              </div>
              <p className="text-gray-600">
                out of {requiredShakes} shakes
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <p className="text-lg font-medium text-gray-900">
              Keep shaking! 📱
            </p>
            
            <button
              onClick={() => {
                stopShakeDetection()
                setStep('setup')
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-4">
            <CheckCircle className="w-16 h-16 text-success-600 mx-auto" />
            <div>
              <p className="text-xl font-semibold text-success-600">
                Shake Verified!
              </p>
              <p className="text-gray-600">
                Great job waking up! 🎉
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center p-3 bg-danger-50 border border-danger-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-danger-600 mr-2" />
          <p className="text-sm text-danger-800">{error}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>Tips:</strong> Hold your phone securely and shake it up and down 
          or side to side. The motion sensor will detect your movements automatically.
        </p>
      </div>
    </div>
  )
}