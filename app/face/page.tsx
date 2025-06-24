'use client';

import { Camera, CheckCircle, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function FacePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Camera className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            顔認証セットアップ
          </h1>
          <p className="text-gray-600">
            起床時の本人確認設定
          </p>
        </div>

        {/* Setup Card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-bold mb-2">
              3
            </div>
            <p className="text-sm text-gray-500">Step 3 / 3</p>
          </div>

          <div className="space-y-6">
            {/* Placeholder Content */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                顔認証機能
              </h2>
              <div className="flex items-center justify-center gap-2 p-8 bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-blue-400 mx-auto mb-2" />
                  <div className="text-lg text-blue-600">開発中</div>
                  <div className="text-sm text-gray-500">Coming Soon</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                起床時の顔認証による本人確認機能
              </p>
            </div>

            {/* Features */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                実装予定機能
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• カメラによる顔認証</li>
                <li>• リアルタイム本人確認</li>
                <li>• セキュリティ認証</li>
                <li>• 起床証明の自動記録</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-lg">
                <CheckCircle className="w-5 h-5" />
                セットアップ完了
              </button>
              
              <button 
                onClick={() => router.push('/amount')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                前のステップに戻る
              </button>
            </div>

            {/* Info */}
            <p className="text-xs text-gray-500 text-center">
              現在、顔認証機能は開発中です。
              セットアップを完了して、アラーム機能をお試しいただけます。
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            📱 技術開発進行中...
          </p>
        </div>
      </div>
    </div>
  );
}