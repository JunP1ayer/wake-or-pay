'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

interface FaceVerificationProps {
  onSuccess: () => void
  onFailure: (reason: string) => void
  onManualConfirm: () => void
}

export function FaceVerification({ onSuccess, onFailure, onManualConfirm }: FaceVerificationProps) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'active' | 'detecting' | 'success' | 'failed'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      setStatus('requesting')
      setError(null)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      })

      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setStatus('active')
        
        // Simulate face detection after 2 seconds
        setTimeout(() => {
          setStatus('detecting')
          setFaceDetected(true)
          
          // Simulate successful detection after another 2 seconds
          setTimeout(() => {
            setStatus('success')
            stopCamera()
            onSuccess()
          }, 2000)
        }, 2000)
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError('Camera access denied or not available')
      setStatus('failed')
      onFailure('Camera access denied')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const retry = () => {
    setStatus('idle')
    setError(null)
    setFaceDetected(false)
    stopCamera()
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  if (status === 'idle') {
    return (
      <div className="text-center space-y-4">
        <div className="w-32 h-32 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
          <Camera className="w-16 h-16 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Face Verification</h3>
          <p className="text-gray-600 mb-4">
            Please verify your wake-up with face detection
          </p>
          <div className="space-y-2">
            <Button onClick={startCamera} className="w-full">
              Start Face Verification
            </Button>
            <Button 
              onClick={onManualConfirm} 
              variant="outline" 
              className="w-full"
            >
              Manual Confirmation
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            For accessibility, you can manually confirm your wake-up
          </p>
        </div>
      </div>
    )
  }

  if (status === 'requesting') {
    return (
      <div className="text-center space-y-4">
        <div className="w-32 h-32 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
          <RefreshCw className="w-16 h-16 text-blue-600 animate-spin" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Requesting Camera Access</h3>
          <p className="text-gray-600">Please allow camera permission</p>
        </div>
      </div>
    )
  }

  if (status === 'failed') {
    return (
      <div className="text-center space-y-4">
        <div className="w-32 h-32 mx-auto bg-red-50 rounded-full flex items-center justify-center">
          <XCircle className="w-16 h-16 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-900">Face verification not available</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={retry} variant="outline" className="w-full">
              Retry
            </Button>
            <Button onClick={onManualConfirm} className="w-full">
              Manual Wake Confirmation
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="text-center space-y-4">
        <div className="w-32 h-32 mx-auto bg-green-50 rounded-full flex items-center justify-center">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-green-900">Face Verified Successfully!</h3>
          <p className="text-green-600">Wake-up confirmed. Great job!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="text-center space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-md mx-auto rounded-lg bg-gray-900"
        />
        {status === 'detecting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <div className="text-white text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Detecting face...</p>
            </div>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold">
          {status === 'active' && 'Position your face in the camera'}
          {status === 'detecting' && 'Verifying...'}
        </h3>
        <p className="text-gray-600">
          {faceDetected ? 'Face detected: ✓' : 'Looking for your face...'}
        </p>
      </div>

      <div className="space-y-2">
        <Button onClick={stopCamera} variant="outline" className="w-full">
          Cancel
        </Button>
        <Button onClick={onManualConfirm} variant="outline" className="w-full">
          Manual Confirmation
        </Button>
      </div>
    </div>
  )
}