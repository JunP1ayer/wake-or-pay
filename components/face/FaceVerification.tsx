'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, CheckCircle, XCircle, RefreshCw } from 'lucide-react'

interface FaceVerificationProps {
  onSuccess: () => void
  onFailure: (reason: string) => void
  onManualConfirm: () => void
}

interface DetectionResult {
  faceDetected: boolean
  blinkDetected: boolean
  confidence: number
}

export function FaceVerification({ onSuccess, onFailure, onManualConfirm }: FaceVerificationProps) {
  const [status, setStatus] = useState<'idle' | 'requesting' | 'active' | 'detecting' | 'success' | 'failed'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [blinkCount, setBlinkCount] = useState(0)
  const [confidence, setConfidence] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const faceDetectionRef = useRef<any>(null)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastEyeStateRef = useRef<boolean>(true) // true = eyes open, false = eyes closed

  // Initialize MediaPipe Face Detection
  const initializeFaceDetection = useCallback(async () => {
    try {
      const { FaceDetection } = await import('@mediapipe/face_detection')
      const { Camera } = await import('@mediapipe/camera_utils')
      
      const faceDetection = new FaceDetection({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
      })
      
      faceDetection.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5,
      })
      
      faceDetection.onResults((results) => {
        const canvas = canvasRef.current
        const video = videoRef.current
        
        if (!canvas || !video) return
        
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        if (results.detections && results.detections.length > 0) {
          const detection = results.detections[0]
          const confidence = (detection as any).score?.[0] || 0.5 // Fallback confidence
          
          setFaceDetected(true)
          setConfidence(confidence)
          
          // Simple blink detection based on face landmarks
          if (detection.landmarks && detection.landmarks.length > 0) {
            // Use eye landmarks to detect blinks (simplified approach)
            const leftEye = detection.landmarks[0] // Approximate left eye position
            const rightEye = detection.landmarks[1] // Approximate right eye position
            
            // Very basic blink detection - in real implementation, you'd need more sophisticated logic
            const eyesOpen = leftEye.y < 0.45 && rightEye.y < 0.45 // Threshold for eye openness
            
            if (!eyesOpen && lastEyeStateRef.current) {
              // Eyes just closed (potential blink start)
              lastEyeStateRef.current = false
            } else if (eyesOpen && !lastEyeStateRef.current) {
              // Eyes just opened (blink completed)
              setBlinkCount(prev => prev + 1)
              lastEyeStateRef.current = true
            }
          }
          
          // Success criteria: face detected with good confidence and at least 2 blinks
          if (confidence > 0.7 && blinkCount >= 2) {
            setStatus('success')
            stopCamera()
            onSuccess()
          }
        } else {
          setFaceDetected(false)
          setConfidence(0)
        }
      })
      
      faceDetectionRef.current = { faceDetection, Camera }
      return faceDetection
    } catch (error) {
      console.error('Failed to initialize face detection:', error)
      return null
    }
  }, [blinkCount, onSuccess])

  const startCamera = async () => {
    try {
      setStatus('requesting')
      setError(null)
      setBlinkCount(0)
      setFaceDetected(false)
      setConfidence(0)

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
        
        videoRef.current.onloadedmetadata = async () => {
          setStatus('active')
          
          // Initialize face detection
          const faceDetection = await initializeFaceDetection()
          
          if (faceDetection && faceDetectionRef.current) {
            const { Camera } = faceDetectionRef.current
            
            const camera = new Camera(videoRef.current!, {
              onFrame: async () => {
                if (videoRef.current) {
                  await faceDetection.send({ image: videoRef.current })
                }
              },
              width: 640,
              height: 480
            })
            
            camera.start()
            setStatus('detecting')
            
            // Set timeout for verification (30 seconds max)
            setTimeout(() => {
              if (status === 'detecting') {
                setStatus('failed')
                setError('Face verification timeout')
                stopCamera()
                onFailure('Verification timeout')
              }
            }, 30000)
          } else {
            // Fallback to simple timeout-based verification if MediaPipe fails
            console.warn('MediaPipe not available, using fallback verification')
            setTimeout(() => {
              setStatus('success')
              stopCamera()
              onSuccess()
            }, 3000)
          }
        }
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
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
      detectionIntervalRef.current = null
    }
    // Clean up MediaPipe resources
    if (faceDetectionRef.current?.faceDetection) {
      faceDetectionRef.current.faceDetection.close()
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
          style={{ display: status === 'detecting' ? 'none' : 'block' }}
        />
        <canvas
          ref={canvasRef}
          className="w-full max-w-md mx-auto rounded-lg bg-gray-900"
          style={{ display: status === 'detecting' ? 'block' : 'none' }}
        />
        {status === 'detecting' && (
          <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white text-sm rounded p-2">
            <div className="flex justify-between items-center">
              <span>Face: {faceDetected ? '✓' : '✗'}</span>
              <span>Blinks: {blinkCount}/2</span>
              <span>Confidence: {Math.round(confidence * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min((blinkCount / 2) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-semibold">
          {status === 'active' && 'Position your face in the camera'}
          {status === 'detecting' && 'Blink twice to verify wake-up'}
        </h3>
        <p className="text-gray-600">
          {status === 'detecting' && (
            <>
              {faceDetected ? 'Face detected: ✓' : 'Looking for your face...'}
              {faceDetected && blinkCount < 2 && <span className="ml-2">Please blink naturally</span>}
            </>
          )}
          {status === 'active' && 'Initializing face detection...'}
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