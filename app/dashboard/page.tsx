'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, DollarSign, Clock, Settings, Bell, TestTube } from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { supabase, type Alarm, type Result, type UserKPI } from '@/lib/supabase'
import { formatTime, formatCurrency } from '@/lib/utils'
import { notificationManager, testNotifications } from '@/lib/notifications'
import FaceCheck from '@/components/FaceCheck'
import ShakeCheck from '@/components/ShakeCheck'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null)
  const [recentResults, setRecentResults] = useState<Result[]>([])
  const [userKPI, setUserKPI] = useState<UserKPI | null>(null)
  const [showVerification, setShowVerification] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showTestPanel, setShowTestPanel] = useState(false)

  useEffect(() => {
    loadDashboardData()
    
    // Check URL parameters for notification actions
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const action = params.get('action')
      const method = params.get('method')
      
      if (action === 'verify') {
        console.log('[Dashboard] Auto-starting verification from notification')
        setShowVerification(true)
        
        // Clear URL parameters
        window.history.replaceState({}, '', '/dashboard')
      }
    }
    
    // Listen for messages from service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_ACTION') {
          console.log('[Dashboard] Service worker message:', event.data)
          handleNotificationAction(event.data.action, event.data.data)
        }
      })
    }
  }, [])

  const handleNotificationAction = (action: string, data: any) => {
    switch (action) {
      case 'verify-face':
      case 'verify-shake':
        setShowVerification(true)
        break
      case 'snooze':
        // Handle snooze logic
        console.log('[Dashboard] Snooze requested from notification')
        break
      default:
        console.log('[Dashboard] Unknown notification action:', action)
    }
  }

  const loadDashboardData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        window.location.href = '/'
        return
      }
      
      setUser(currentUser)
      
      // Load active alarm
      const { data: alarms } = await supabase
        .from('alarms')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('is_active', true)
        .limit(1)
      
      if (alarms?.[0]) {
        setActiveAlarm(alarms[0])
      }
      
      // Load recent results
      const { data: results } = await supabase
        .from('results')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(7)
      
      if (results) {
        setRecentResults(results)
      }
      
      // Load today's KPI
      const today = new Date().toISOString().split('T')[0]
      const { data: kpi } = await supabase
        .from('user_kpi')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('date', today)
        .single()
      
      if (kpi) {
        setUserKPI(kpi)
      }
      
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSuccess = async (method: string) => {
    if (!activeAlarm || !user) return
    
    try {
      const now = new Date()
      const scheduledTime = new Date()
      const [hours, minutes] = activeAlarm.wake_time.split(':')
      scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      
      // Record successful verification
      await supabase.from('results').insert({
        alarm_id: activeAlarm.id,
        user_id: user.id,
        scheduled_time: scheduledTime.toISOString(),
        verification_time: now.toISOString(),
        is_success: true,
        verification_method: method,
        penalty_charged: false
      })
      
      setShowVerification(false)
      loadDashboardData() // Refresh data
      
      alert('Great job! You\'re up on time! 🎉')
    } catch (error) {
      console.error('Error recording verification:', error)
    }
  }

  const successRate = recentResults.length > 0 
    ? Math.round((recentResults.filter(r => r.is_success).length / recentResults.length) * 100)
    : 0

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Track your wake-up progress</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowTestPanel(!showTestPanel)}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Test Notifications"
            >
              <TestTube className="w-6 h-6" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Test Panel */}
        {showTestPanel && (
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <TestTube className="w-5 h-5 mr-2" />
              Notification Testing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => notificationManager.testReminder()}
                className="btn-secondary flex items-center justify-center"
              >
                <Bell className="w-4 h-4 mr-2" />
                Test Reminder
              </button>
              <button
                onClick={() => notificationManager.testAlarm()}
                className="btn-primary flex items-center justify-center"
              >
                <Bell className="w-4 h-4 mr-2" />
                Test Alarm
              </button>
              <button
                onClick={() => testNotifications()}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center justify-center"
              >
                <Clock className="w-4 h-4 mr-2" />
                Quick Test (3s)
              </button>
            </div>
            <p className="text-sm text-blue-700 mt-3">
              💡 Make sure notifications are enabled in your browser settings
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Calendar className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Streak</p>
                <p className="text-2xl font-bold text-gray-900">{userKPI?.streak_days || 0} days</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-danger-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-danger-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Penalties</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(userKPI?.total_penalties || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Alarm */}
        {activeAlarm && (
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Clock className="w-8 h-8 text-primary-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Wake up at {activeAlarm.wake_time}
                  </h3>
                  <p className="text-gray-600">
                    Penalty: {formatCurrency(activeAlarm.penalty_amount)} • 
                    Method: {activeAlarm.verification_method}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVerification(true)}
                className="btn-primary"
              >
                I'm Awake!
              </button>
            </div>
          </div>
        )}

        {/* Recent Results */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Wake-ups</h3>
          <div className="space-y-3">
            {recentResults.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                No wake-up attempts yet. Your first alarm will appear here!
              </p>
            ) : (
              recentResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        result.is_success ? 'bg-success-500' : 'bg-danger-500'
                      }`}
                    />
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">
                        {new Date(result.scheduled_time).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {result.verification_time
                          ? `Verified at ${formatTime(new Date(result.verification_time))}`
                          : 'Missed alarm'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        result.is_success ? 'text-success-600' : 'text-danger-600'
                      }`}
                    >
                      {result.is_success ? 'Success' : 'Failed'}
                    </p>
                    {result.penalty_charged && (
                      <p className="text-sm text-danger-600">
                        -{formatCurrency(activeAlarm?.penalty_amount || 0)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Verification Modal */}
        {showVerification && activeAlarm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Prove You're Awake
              </h3>
              
              {activeAlarm.verification_method === 'face' && (
                <FaceCheck 
                  onSuccess={() => handleVerificationSuccess('face')} 
                  onError={(error) => {
                    console.error('Face verification error:', error)
                    alert(`Face verification failed: ${error}`)
                  }}
                />
              )}
              
              {activeAlarm.verification_method === 'shake' && (
                <ShakeCheck onSuccess={() => handleVerificationSuccess('shake')} />
              )}
              
              {activeAlarm.verification_method === 'both' && (
                <div className="space-y-4">
                  <FaceCheck 
                    onSuccess={() => handleVerificationSuccess('face')} 
                    onError={(error) => {
                      console.error('Face verification error:', error)
                      alert(`Face verification failed: ${error}`)
                    }}
                  />
                  <ShakeCheck onSuccess={() => handleVerificationSuccess('shake')} />
                </div>
              )}
              
              <button
                onClick={() => setShowVerification(false)}
                className="btn-secondary w-full mt-4"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}