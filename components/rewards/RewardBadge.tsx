'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Share2, Download, Trophy, Calendar, Flame } from 'lucide-react'

interface Badge {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  achieved: boolean
  achievedDate?: string
  shareText: string
}

interface RewardBadgeProps {
  consecutiveDays: number
  totalSuccessfulDays: number
  currentStreak: number
  onShare?: (platform: string, badge: Badge) => void
}

export function RewardBadge({ consecutiveDays, totalSuccessfulDays, currentStreak, onShare }: RewardBadgeProps) {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null)

  const badges: Badge[] = [
    {
      id: 'early_riser',
      name: 'Early Riser',
      description: 'Successfully woke up on time',
      icon: <Trophy className="w-8 h-8" />,
      color: 'bg-yellow-500',
      achieved: totalSuccessfulDays >= 1,
      achievedDate: totalSuccessfulDays >= 1 ? new Date().toISOString().split('T')[0] : undefined,
      shareText: '🌅 I successfully woke up on time with the Wake-or-Pay challenge! #EarlyRiser #WakeOrPay'
    },
    {
      id: 'weekly_champion',
      name: 'Weekly Champion',
      description: 'Woke up on time for 7 consecutive days',
      icon: <Calendar className="w-8 h-8" />,
      color: 'bg-blue-500',
      achieved: consecutiveDays >= 7,
      achievedDate: consecutiveDays >= 7 ? new Date().toISOString().split('T')[0] : undefined,
      shareText: '🏆 I completed 7 consecutive days of waking up on time! No penalties for a whole week! #WeeklyChampion #WakeOrPay'
    },
    {
      id: 'streak_master',
      name: 'Streak Master',
      description: 'Maintained a 14-day wake-up streak',
      icon: <Flame className="w-8 h-8" />,
      color: 'bg-red-500',
      achieved: currentStreak >= 14,
      achievedDate: currentStreak >= 14 ? new Date().toISOString().split('T')[0] : undefined,
      shareText: '🔥 14-day wake-up streak achieved! I\'m mastering my morning routine with Wake-or-Pay! #StreakMaster #MorningRoutine'
    },
    {
      id: 'dedication_legend',
      name: 'Dedication Legend',
      description: 'Successfully woke up 30 times total',
      icon: <Trophy className="w-8 h-8" />,
      color: 'bg-purple-500',
      achieved: totalSuccessfulDays >= 30,
      achievedDate: totalSuccessfulDays >= 30 ? new Date().toISOString().split('T')[0] : undefined,
      shareText: '👑 30 successful wake-ups achieved! I\'m a true Wake-or-Pay legend! #DedicationLegend #ConsistencyWins'
    }
  ]

  const generateBadgeImage = async (badge: Badge): Promise<string> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) throw new Error('Canvas not supported')
    
    canvas.width = 400
    canvas.height = 300
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 300)
    gradient.addColorStop(0, '#667eea')
    gradient.addColorStop(1, '#764ba2')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 400, 300)
    
    // Badge background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.roundRect(50, 50, 300, 200, 20)
    ctx.fill()
    
    // Title
    ctx.fillStyle = '#333'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(badge.name, 200, 100)
    
    // Description
    ctx.font = '16px Arial'
    ctx.fillText(badge.description, 200, 130)
    
    // Achievement date
    if (badge.achievedDate) {
      ctx.font = '14px Arial'
      ctx.fillStyle = '#666'
      ctx.fillText(`Achieved: ${badge.achievedDate}`, 200, 160)
    }
    
    // Wake-or-Pay branding
    ctx.font = '12px Arial'
    ctx.fillStyle = '#999'
    ctx.fillText('Wake-or-Pay Challenge', 200, 220)
    
    return canvas.toDataURL('image/png')
  }

  const shareOnTwitter = (badge: Badge) => {
    const text = encodeURIComponent(badge.shareText)
    const url = `https://twitter.com/intent/tweet?text=${text}`
    window.open(url, '_blank')
    onShare?.('twitter', badge)
  }

  const shareOnLine = (badge: Badge) => {
    const text = encodeURIComponent(badge.shareText)
    const url = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}&text=${text}`
    window.open(url, '_blank')
    onShare?.('line', badge)
  }

  const downloadBadge = async (badge: Badge) => {
    try {
      const imageData = await generateBadgeImage(badge)
      const link = document.createElement('a')
      link.download = `${badge.id}-badge.png`
      link.href = imageData
      link.click()
    } catch (error) {
      console.error('Error generating badge image:', error)
      alert('Failed to generate badge image')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">🏆 Your Achievements</h2>
        <p className="text-gray-600">
          Current streak: {currentStreak} days | Total successful: {totalSuccessfulDays} days
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              badge.achieved
                ? 'border-green-500 bg-green-50 shadow-lg'
                : 'border-gray-300 bg-gray-50 opacity-60'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2 rounded-full text-white ${badge.color}`}>
                {badge.icon}
              </div>
              <div>
                <h3 className="font-semibold">{badge.name}</h3>
                <p className="text-sm text-gray-600">{badge.description}</p>
              </div>
            </div>

            {badge.achieved && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => shareOnTwitter(badge)}
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  Twitter
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => shareOnLine(badge)}
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  LINE
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadBadge(badge)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            )}

            {!badge.achieved && (
              <div className="text-sm text-gray-500">
                {badge.id === 'weekly_champion' && `${7 - consecutiveDays} more consecutive days to unlock`}
                {badge.id === 'streak_master' && `${14 - currentStreak} more days in streak to unlock`}
                {badge.id === 'dedication_legend' && `${30 - totalSuccessfulDays} more successful days to unlock`}
                {badge.id === 'early_riser' && totalSuccessfulDays === 0 && 'Complete your first wake-up to unlock'}
              </div>
            )}
          </div>
        ))}
      </div>

      {badges.some(b => b.achieved) && (
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 font-medium">
            🎉 Congratulations on your achievements! Share your success with friends!
          </p>
        </div>
      )}
    </div>
  )
}