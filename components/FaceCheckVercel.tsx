'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, CheckCircle, AlertCircle, Smartphone } from 'lucide-react'

interface FaceCheckProps {
  onSuccess: () => void
  onError?: (error: string) => void
}

export default function FaceCheck({ onSuccess, onError }: FaceCheckProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'setup' | 'recording' | 'analyzing' | 'success'>('setup')
  const [isMobile, setIsMobile] = useState(false)
  const [useFileUpload, setUseFileUpload] = useState(false)

  useEffect(() => {
    // Detect mobile device
    const checkMobile = () => {
      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      setIsMobile(mobile)
      
      // Check if running in Vercel production (HTTPS)
      const isProduction = window.location.protocol === 'https:'
      
      // Some mobile browsers may have issues with getUserMedia even on HTTPS
      if (mobile && !navigator.mediaDevices?.getUserMedia) {
        setUseFileUpload(true)
      }
    }
    
    checkMobile()
    
    return () => {
      // Defensive cleanup with timeout to prevent DOM access errors
      setTimeout(() => {
        stopCamera()
      }, 0)
    }
  }, [])

  const startCamera = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Enhanced browser compatibility check
      if (!navigator.mediaDevices?.getUserMedia) {
        // Fallback to file upload for incompatible browsers
        setUseFileUpload(true)
        throw new Error('Camera API not supported. You can upload a photo instead.')
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: isMobile ? 'user' : 'user'
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setStep('recording')
      }
    } catch (err) {
      let message = 'Camera access denied. Please allow camera permissions.'
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          message = 'Camera access denied. Please check your browser settings.'
        } else if (err.name === 'NotFoundError') {
          message = 'No camera found. You can upload a photo instead.'
          setUseFileUpload(true)
        } else if (err.message.includes('upload')) {
          message = err.message
        }
      }
      
      setError(message)
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setStep('analyzing')
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file')
      }

      // Create image element to read the file
      const img = new Image()
      const url = URL.createObjectURL(file)
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = url
      })

      // Clean up
      URL.revokeObjectURL(url)

      // Simulate face verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setStep('success')
      setTimeout(() => {
        onSuccess()
      }, 1500)
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Photo verification failed'
      setError(message)
      onError?.(message)
      setStep('setup')
    }
  }

  const captureAndVerify = async () => {
    if (!videoRef.current || !canvasRef.current) return
    
    try {
      setStep('analyzing')
      
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      if (!context) return
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Simulate face verification (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // High success rate for MVP demo
      const hasValidFace = Math.random() > 0.05 // 95% success rate
      
      if (hasValidFace) {
        setStep('success')
        stopCamera()
        setTimeout(() => {
          onSuccess()
        }, 1500)
      } else {
        throw new Error('No face detected. Please position your face clearly.')
      }
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Face verification failed'
      setError(message)
      onError?.(message)
      setStep('recording')
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <Camera className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Face Verification
        </h3>
        <p className="text-gray-600 text-sm">
          {useFileUpload 
            ? 'Take a selfie to verify you\'re awake' 
            : 'Look directly at the camera to verify you\'re awake'}
        </p>
      </div>

      {/* Camera/Upload View */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
        {step === 'setup' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {useFileUpload ? (
              <div className="text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary flex items-center gap-2"
                >
                  <Smartphone className="w-5 h-5" />
                  Take Selfie
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  Your photo will be processed locally
                </p>
              </div>
            ) : (
              <button
                onClick={startCamera}
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? 'Starting Camera...' : 'Start Camera'}
              </button>
            )}
          </div>
        )}
        
        {!useFileUpload && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
          />
        )}
        
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Face Detection Overlay */}
        {step === 'recording' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-60 border-4 border-white rounded-lg opacity-75">
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-white" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-white" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-white" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-white" />
            </div>
          </div>
        )}
        
        {step === 'analyzing' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
              <p className="text-lg font-medium">Analyzing...</p>
            </div>
          </div>
        )}
        
        {step === 'success' && (
          <div className="absolute inset-0 bg-success-500 bg-opacity-90 flex items-center justify-center">
            <div className="text-center text-white">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" />
              <p className="text-xl font-semibold">Verified!</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {step === 'recording' && (
        <button
          onClick={captureAndVerify}
          className="btn-primary w-full"
        >
          Verify Face
        </button>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center p-3 bg-danger-50 border border-danger-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-danger-600 mr-2" />
          <p className="text-sm text-danger-800">{error}</p>
        </div>
      )}

      {/* Fallback Option */}
      {error && !useFileUpload && (
        <button
          onClick={() => setUseFileUpload(true)}
          className="text-sm text-primary-600 hover:text-primary-700 underline"
        >
          Try uploading a photo instead
        </button>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>Tips:</strong> {useFileUpload 
            ? 'Take a clear selfie with your face visible. The photo will be processed on your device.'
            : 'Make sure you have good lighting and position your face clearly within the frame.'}
        </p>
      </div>
    </div>
  )
}