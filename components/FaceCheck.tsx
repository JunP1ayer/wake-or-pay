'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, CheckCircle, AlertCircle } from 'lucide-react'

interface FaceCheckProps {
  onSuccess: () => void
  onError?: (error: string) => void
}

export default function FaceCheck({ onSuccess, onError }: FaceCheckProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'setup' | 'recording' | 'analyzing' | 'success'>('setup')
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  const addDebugLog = (message: string) => {
    console.log(`[FaceCheck] ${message}`)
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      addDebugLog('Starting camera setup...')
      setIsLoading(true)
      setError('')
      
      // Check browser support
      addDebugLog(`Navigator available: ${!!navigator}`)
      addDebugLog(`MediaDevices available: ${!!navigator.mediaDevices}`)
      addDebugLog(`getUserMedia available: ${!!navigator.mediaDevices?.getUserMedia}`)
      addDebugLog(`Location protocol: ${window.location.protocol}`)
      addDebugLog(`Location hostname: ${window.location.hostname}`)
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported. Please use HTTPS or a modern browser.')
      }
      
      addDebugLog('Requesting camera permissions...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      })
      
      addDebugLog(`Camera stream obtained: ${!!stream}`)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        addDebugLog('Video stream started successfully')
        setStep('recording')
      }
    } catch (err) {
      addDebugLog(`Camera setup failed: ${err}`)
      let message = 'Camera access denied. Please allow camera permissions.'
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          message = 'Camera access denied. Please allow camera permissions in your browser settings.'
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          message = 'No camera found. Please connect a camera and try again.'
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          message = 'Camera is already in use by another application.'
        } else if (err.name === 'OverconstrainedError') {
          message = 'Camera does not support the requested settings.'
        } else if (err.message.includes('HTTPS') || err.message.includes('Camera API')) {
          message = err.message
        } else {
          message = `Camera error: ${err.message}`
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
      
      // Simple face detection simulation
      // In a real app, you'd use face detection APIs or ML models
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate successful verification
      const hasValidFace = Math.random() > 0.1 // 90% success rate for demo
      
      if (hasValidFace) {
        setStep('success')
        stopCamera()
        setTimeout(() => {
          onSuccess()
        }, 1500)
      } else {
        throw new Error('No face detected. Please position your face clearly in the camera.')
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
          Look directly at the camera to verify you're awake
        </p>
      </div>

      {/* Camera View */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
        {step === 'setup' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={startCamera}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Starting Camera...' : 'Start Camera'}
            </button>
          </div>
        )}
        
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
        
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

      {/* Debug Info */}
      {debugInfo.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-700 mb-2">Debug Info:</p>
          <div className="space-y-1">
            {debugInfo.map((info, index) => (
              <p key={index} className="text-xs text-gray-600 font-mono">
                {info}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <strong>Tips:</strong> Make sure you have good lighting and position your face 
          clearly within the frame. The verification should take just a few seconds.
        </p>
      </div>
    </div>
  )
}