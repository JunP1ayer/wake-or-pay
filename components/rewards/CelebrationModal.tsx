'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, Trophy, Star, Sparkles } from 'lucide-react'

interface CelebrationModalProps {
  isOpen: boolean
  onClose: () => void
  consecutiveDays: number
  earnedBadge?: string | null
  message?: string
}

export function CelebrationModal({ 
  isOpen, 
  onClose, 
  consecutiveDays, 
  earnedBadge, 
  message = "Great job waking up on time!" 
}: CelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [animationPhase, setAnimationPhase] = useState<'entering' | 'celebrating' | 'exiting'>('entering')

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      setAnimationPhase('entering')
      
      // Animation sequence
      const timer1 = setTimeout(() => setAnimationPhase('celebrating'), 500)
      const timer2 = setTimeout(() => setShowConfetti(false), 3000)
      
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  const getRandomPosition = () => ({
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 2}s`,
    animationDuration: `${2 + Math.random() * 2}s`
  })

  const confettiColors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']

  const getBadgeInfo = (badgeId: string | null) => {
    switch (badgeId) {
      case 'early_riser_week':
        return {
          name: '🏆 Weekly Champion',
          description: '7 consecutive days completed!'
        }
      case 'streak_master':
        return {
          name: '🔥 Streak Master',
          description: '14-day streak achieved!'
        }
      default:
        return null
    }
  }

  const badgeInfo = earnedBadge ? getBadgeInfo(earnedBadge) : null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 opacity-80"
              style={{
                ...getRandomPosition(),
                backgroundColor: confettiColors[i % confettiColors.length],
                animation: `confetti-fall ${2 + Math.random() * 2}s linear infinite`
              }}
            />
          ))}
        </div>
      )}

      <div 
        className={`bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl transform transition-all duration-500 ${
          animationPhase === 'entering' ? 'scale-0 rotate-12' : 
          animationPhase === 'celebrating' ? 'scale-100 rotate-0' : 'scale-95'
        }`}
      >
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <div className={`w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-700 ${
              animationPhase === 'celebrating' ? 'animate-bounce' : ''
            }`}>
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            
            {/* Sparkle effects */}
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
            <Star className="absolute -bottom-1 -left-2 w-5 h-5 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        {/* Main Content */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">
            🎉 Wake-Up Success!
          </h2>
          
          <p className="text-gray-600 text-lg">
            {message}
          </p>

          {/* Streak Counter */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-semibold">
                {consecutiveDays} day{consecutiveDays !== 1 ? 's' : ''} streak!
              </span>
            </div>
          </div>

          {/* Badge Achievement */}
          {badgeInfo && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-200">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <span className="font-bold text-yellow-800">New Badge Earned!</span>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-yellow-900">
                  {badgeInfo.name}
                </div>
                <div className="text-sm text-yellow-700">
                  {badgeInfo.description}
                </div>
              </div>
            </div>
          )}

          {/* Motivational Messages */}
          <div className="space-y-2">
            {consecutiveDays >= 7 && (
              <p className="text-sm text-green-600 font-medium">
                🌟 You're building an amazing habit!
              </p>
            )}
            {consecutiveDays >= 14 && (
              <p className="text-sm text-purple-600 font-medium">
                🚀 You're unstoppable!
              </p>
            )}
          </div>

          {/* Action Button */}
          <Button 
            onClick={onClose} 
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3"
          >
            Continue to Dashboard
          </Button>
        </div>
      </div>

      {/* CSS for confetti animation */}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}