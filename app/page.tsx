'use client'

import { useState } from 'react'
import { AlarmClock, Plus, Share, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function MainScreen() {
  const [alarmTime, setAlarmTime] = useState('07:00')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center pt-12 pb-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <AlarmClock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            目覚ましチャレンジ
          </h1>
          <p className="text-gray-600">wake-or-pay</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Next Alarm Display */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 text-center max-w-md w-full">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            次のアラーム
          </h2>
          <div className="text-5xl font-bold text-blue-600 mb-2">
            {alarmTime}
          </div>
          <p className="text-gray-500">明日の朝</p>
        </div>

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
                onClick={() => setIsDialogOpen(false)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                設定完了
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      {/* Footer Actions */}
      <footer className="flex justify-center gap-4 pb-8 px-6">
        <Button variant="outline" className="flex items-center gap-2">
          <Share className="w-4 h-4" />
          シェア
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="w-4 h-4" />
          設定
        </Button>
      </footer>
    </div>
  )
}