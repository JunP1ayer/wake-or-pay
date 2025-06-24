'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, AlarmClock } from 'lucide-react'

export default function Home() {
  const [selectedTime, setSelectedTime] = useState('07:00')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleNext = async () => {
    setIsLoading(true)
    
    // Save the alarm time (you can expand this to actually set the alarm)
    localStorage.setItem('alarmTime', selectedTime)
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Redirect to amount selection
    router.push('/amount')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header - Root Page */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <AlarmClock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            目覚ましチャレンジ
          </h1>
          <p className="text-gray-600">
            起床時刻を設定して健康的な朝の習慣を作りましょう
          </p>
        </div>

        {/* Time Picker Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold mb-2">
              1
            </div>
            <p className="text-sm text-gray-500">Step 1 / 3</p>
          </div>

          <div className="space-y-6">
            {/* Time Selection */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                起床時刻を選択
              </h2>
              <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-lg">
                <Clock className="w-6 h-6 text-gray-600" />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="text-3xl font-bold text-gray-900 bg-transparent border-none outline-none text-center"
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                毎日のアラーム時刻
              </p>
            </div>

            {/* Description */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                使い方
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 設定した時間にアラームが鳴ります</li>
                <li>• 顔認証で起床を証明してください</li>
                <li>• アラームを止め損ねると小額のペナルティ</li>
                <li>• 成功すると報酬と達成ポイントを獲得</li>
              </ul>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Setting up...
                </>
              ) : (
                '次へ: ペナルティ設定'
              )}
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            💪 一緒に健康的な早起き習慣を作りましょう！
          </p>
        </div>
      </div>
    </div>
  )
}