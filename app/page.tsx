'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Shield, Zap, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signInAnonymously, getCurrentUser, createUserProfile } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { scheduleWakeUpAlarm } from '@/lib/notifications'
import type { User } from '@supabase/supabase-js'

export default function HomePage() {
  const [step, setStep] = useState(1)
  const [wakeTime, setWakeTime] = useState('07:00')
  const [penaltyAmount, setPenaltyAmount] = useState(5)
  const [verificationMethod, setVerificationMethod] = useState<'face' | 'shake' | 'both'>('face')
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const currentUser = await getCurrentUser()
    setUser(currentUser)
  }

  const handleQuickStart = async () => {
    setIsLoading(true)
    try {
      let currentUser = user
      
      if (!currentUser) {
        const { user: newUser } = await signInAnonymously()
        if (newUser) {
          await createUserProfile(newUser)
          currentUser = newUser
          setUser(newUser)
        }
      }

      if (currentUser) {
        const { error } = await supabase
          .from('alarms')
          .insert({
            user_id: currentUser.id,
            wake_time: wakeTime,
            penalty_amount: penaltyAmount * 100, // Convert to cents
            verification_method: verificationMethod,
            is_active: true
          })

        if (error) throw error
        
        // Schedule wake-up notifications
        await scheduleWakeUpAlarm(wakeTime, verificationMethod)
        console.log('[Setup] Wake-up alarm scheduled for:', wakeTime)
        
        setStep(4) // Success step
      }
    } catch (error) {
      console.error('Setup failed:', error)
      alert('Setup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    {
      title: "When do you want to wake up?",
      subtitle: "Set your ideal wake-up time",
      icon: Clock
    },
    {
      title: "How much will you pay for sleeping in?",
      subtitle: "Choose your penalty amount",
      icon: Shield
    },
    {
      title: "How will you prove you're awake?",
      subtitle: "Select verification method",
      icon: Zap
    },
    {
      title: "You're all set!",
      subtitle: "Your wake-up alarm is ready",
      icon: CheckCircle
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Wake or Pay
          </h1>
          <p className="text-gray-600">
            Never oversleep again with automatic penalties
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-between mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                index + 1 <= step
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {index + 1}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="card min-h-[300px]">
          {step <= 3 && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                {React.createElement(steps[step - 1].icon, {
                  className: "w-8 h-8 text-primary-600"
                })}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {steps[step - 1].title}
              </h2>
              <p className="text-gray-600">
                {steps[step - 1].subtitle}
              </p>
            </div>
          )}

          {/* Step 1: Wake Time */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wake-up time
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="input-field w-full text-center text-2xl font-mono"
                />
              </div>
              <button
                onClick={() => setStep(2)}
                className="btn-primary w-full"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 2: Penalty Amount */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penalty amount
                </label>
                <div className="flex items-center space-x-4">
                  {[1, 5, 10, 25].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setPenaltyAmount(amount)}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-lg font-medium transition-colors",
                        penaltyAmount === amount
                          ? "bg-primary-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <div className="mt-4">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={penaltyAmount}
                    onChange={(e) => setPenaltyAmount(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center mt-2">
                    <span className="text-2xl font-bold text-primary-600">
                      ${penaltyAmount}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStep(3)}
                className="btn-primary w-full"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 3: Verification Method */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-3">
                {[
                  { value: 'face', label: 'Face Recognition', desc: 'Look at camera to verify' },
                  { value: 'shake', label: 'Phone Shake', desc: 'Shake your phone vigorously' },
                  { value: 'both', label: 'Both Methods', desc: 'Extra security' }
                ].map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setVerificationMethod(method.value as any)}
                    className={cn(
                      "w-full p-4 rounded-lg border-2 text-left transition-colors",
                      verificationMethod === method.value
                        ? "border-primary-600 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="font-medium text-gray-900">
                      {method.label}
                    </div>
                    <div className="text-sm text-gray-600">
                      {method.desc}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={handleQuickStart}
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? 'Setting up...' : 'Start Waking Up!'}
              </button>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-success-100 rounded-full">
                <CheckCircle className="w-10 h-10 text-success-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Perfect! You're all set.
                </h2>
                <p className="text-gray-600 mb-4">
                  Your alarm is set for <strong>{wakeTime}</strong> with a ${penaltyAmount} penalty.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
                  <p className="text-yellow-800">
                    💡 <strong>Pro tip:</strong> We'll send you a reminder 10 minutes before your alarm.
                    Make sure to allow notifications!
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="btn-primary w-full"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Back button for steps 2-3 */}
        {step > 1 && step < 4 && (
          <button
            onClick={() => setStep(step - 1)}
            className="btn-secondary w-full"
          >
            Back
          </button>
        )}
      </div>
    </div>
  )
}