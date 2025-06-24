'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, ArrowRight } from 'lucide-react'

export default function AmountPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleContinue = async () => {
    setIsLoading(true)
    
    // Save the penalty amount
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
            Penalty Amount
          </h1>
          <p className="text-gray-600">
            Set your wake-up accountability amount
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
                Fixed Penalty Amount
              </h2>
              <div className="flex items-center justify-center gap-2 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-700 mb-1">¥100</div>
                  <div className="text-lg text-blue-600">≈ $1 USD</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Amount charged if you miss your alarm
              </p>
            </div>

            {/* Description */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                How the penalty works
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Fixed amount keeps things simple and fair</li>
                <li>• Small enough to be manageable, large enough to motivate</li>
                <li>• Automatic charge if face verification fails</li>
                <li>• Success means no charge + achievement points</li>
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
                  Continue to Setup
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
              By continuing, you agree to the penalty terms. 
              Build consistency with accountability!
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            💰 Small penalty, big motivation!
          </p>
        </div>
      </div>
    </div>
  )
}