'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Yen } from 'lucide-react'

export default function JapanesePage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleOK = async () => {
    setIsLoading(true)
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Redirect to dashboard or next step
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            起床チャレンジ
          </h1>
          <p className="text-gray-600">
            毎朝の起床を習慣化しましょう
          </p>
        </div>

        {/* Step 1 Indicator */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold mb-2">
              1
            </div>
            <p className="text-sm text-gray-500">ステップ 1 / 1</p>
          </div>

          <div className="space-y-6">
            {/* Amount Display */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                罰金設定
              </h2>
              <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 rounded-lg">
                <Yen className="w-6 h-6 text-gray-600" />
                <span className="text-3xl font-bold text-gray-900">100円</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                起床に失敗した場合の罰金額
              </p>
            </div>

            {/* Description */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                仕組み
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 設定した時間に起床アラームが鳴ります</li>
                <li>• 顔認証で起床を証明してください</li>
                <li>• 失敗すると100円の罰金が発生します</li>
                <li>• 成功すると達成感とご褒美があります</li>
              </ul>
            </div>

            {/* OK Button */}
            <button
              onClick={handleOK}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  処理中...
                </>
              ) : (
                'OK'
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
              「OK」をクリックすることで、利用規約に同意したものとみなします。
              毎日の起床習慣を身につけて、より良い生活を送りましょう。
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            💪 一緒に早起き習慣を作りましょう！
          </p>
        </div>
      </div>
    </div>
  )
}