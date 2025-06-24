'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlarmClock, Plus, Settings, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AuthButton } from '@/components/auth/AuthButton'
import { useAuth } from '@/components/auth/AuthProvider'
import { ShareButton } from '@/components/share/ShareButton'
import { FaceVerification } from '@/components/face/FaceVerification'
import { getUserAlarms, createAlarm, createWakeAttempt } from '@/lib/supabase'

interface Alarm {
  id: string
  alarm_time: string
  is_active: boolean
  penalty_amount: number
}

export default function MainScreen() {
  const { user, loading } = useAuth()
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [alarmTime, setAlarmTime] = useState('07:00')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isVerificationOpen, setIsVerificationOpen] = useState(false)
  const [currentStreak, setCurrentStreak] = useState(7) // Mock streak for demo

  const loadAlarms = useCallback(async () => {
    if (!user) return
    
    try {
      const userAlarms = await getUserAlarms(user.id)
      setAlarms(userAlarms)
    } catch (error) {
      console.error('Error loading alarms:', error)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadAlarms()
    }
  }, [user, loadAlarms])

  const handleCreateAlarm = async () => {
    if (!user) return

    try {
      const newAlarm = await createAlarm(user.id, alarmTime)
      setAlarms([...alarms, newAlarm])
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error creating alarm:', error)
    }
  }

  const handleWakeSuccess = async () => {
    setIsVerificationOpen(false)
    setCurrentStreak(prev => prev + 1)
    
    // Record successful wake attempt
    if (user && alarms.length > 0) {
      try {
        await createWakeAttempt(alarms[0].id, user.id, true, 'face')
      } catch (error) {
        console.error('Error recording wake attempt:', error)
      }
    }
  }

  const handleWakeFailure = async (reason: string) => {
    setIsVerificationOpen(false)
    
    // Record failed wake attempt
    if (user && alarms.length > 0) {
      try {
        await createWakeAttempt(alarms[0].id, user.id, false, 'face', reason)
        // Here you would typically trigger the payment process
      } catch (error) {
        console.error('Error recording wake attempt:', error)
      }
    }
  }

  const handleManualConfirm = async () => {
    setIsVerificationOpen(false)
    
    if (user && alarms.length > 0) {
      try {
        await createWakeAttempt(alarms[0].id, user.id, true, 'manual')
        setCurrentStreak(prev => prev + 1)
      } catch (error) {
        console.error('Error recording wake attempt:', error)
      }
    }
  }

  const nextAlarm = alarms.find(alarm => alarm.is_active)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <AlarmClock className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              目覚ましチャレンジ
            </h1>
            <p className="text-gray-600 mb-8">
              100円固定ペナルティで早起き習慣を作ろう
            </p>
            <AuthButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
            <AlarmClock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">目覚ましチャレンジ</h1>
            <p className="text-sm text-gray-600">wake-or-pay</p>
          </div>
        </div>
        <AuthButton />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Current Streak */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 text-center max-w-md w-full">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">現在の連続記録</h2>
          </div>
          <div className="text-4xl font-bold text-blue-600 mb-1">
            {currentStreak}日
          </div>
          <p className="text-gray-500">連続早起き成功</p>
        </div>

        {/* Next Alarm Display */}
        {nextAlarm ? (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              次のアラーム
            </h2>
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {nextAlarm.alarm_time}
            </div>
            <p className="text-gray-500 mb-4">明日の朝</p>
            <Button 
              onClick={() => setIsVerificationOpen(true)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              起床確認
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              アラーム未設定
            </h2>
            <p className="text-gray-600 mb-4">
              まだアラームが設定されていません
            </p>
          </div>
        )}

        {/* Add Alarm Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="mb-8 text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-6 h-6 mr-2" />
              アラーム追加
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>時刻設定</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Time Picker */}
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">起床時刻</h3>
                <input
                  type="time"
                  value={alarmTime}
                  onChange={(e) => setAlarmTime(e.target.value)}
                  className="text-3xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center w-full"
                />
              </div>

              {/* Penalty Display */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <h3 className="font-semibold text-blue-900 mb-2">ペナルティ</h3>
                <div className="text-3xl font-bold text-blue-700">¥100</div>
                <p className="text-sm text-blue-600 mt-1">起床失敗時の固定料金</p>
              </div>

              <Button 
                onClick={handleCreateAlarm}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                設定完了
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Face Verification Dialog */}
        <Dialog open={isVerificationOpen} onOpenChange={setIsVerificationOpen}>
          <DialogContent className="sm:max-w-lg">
            <FaceVerification
              onSuccess={handleWakeSuccess}
              onFailure={handleWakeFailure}
              onManualConfirm={handleManualConfirm}
            />
          </DialogContent>
        </Dialog>
      </main>

      {/* Footer Actions */}
      <footer className="flex justify-center gap-4 pb-8 px-6">
        <ShareButton streak={currentStreak} />
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          設定
        </Button>
      </footer>
    </div>
  )
}