import { useState } from 'react'
import { useRouter } from 'next/router'
import { DollarSign, ArrowRight } from 'lucide-react'

export default function AmountPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleContinue = async () => {
    setIsLoading(true)
    
    // Save the penalty amount (fixed at 100 yen)
    localStorage.setItem('penaltyAmount', '100')
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Redirect to face verification setup
    router.push('/face')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            固定ペナルティ
          </h1>
          <p className="text-gray-600">
            国内専用・100円固定料金
          </p>
        </div>

        {/* Amount Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold mb-2">
              2
            </div>
            <p className="text-sm text-gray-500">Step 2 / 3</p>
          </div>

          <div className="space-y-6">
            {/* Fixed Amount Display */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                100円固定ペナルティ
              </h2>
              <div className="flex items-center justify-center gap-2 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-700 mb-1">¥100</div>
                  <div className="text-lg text-blue-600">国内固定料金</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                起床失敗時に自動請求される金額
              </p>
            </div>

            {/* Description */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                ペナルティの仕組み
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 100円固定でシンプル・公平</li>
                <li>• 負担にならず、やる気を引き出す金額</li>
                <li>• 顔認証失敗時に自動請求</li>
                <li>• 成功時は無料＋達成ポイント獲得</li>
              </ul>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Setting up...
                </>
              ) : (
                <>
                  セットアップへ進む
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
              続行により、ペナルティ規約に同意したものとします。
              継続的な早起き習慣を身につけましょう！
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            💰 小さなペナルティ、大きなモチベーション！
          </p>
        </div>
      </div>
    </div>
  )
}