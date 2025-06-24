'use client'

import { useEffect, useState } from 'react'
import { notificationManager } from '@/lib/notifications'

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)

  useEffect(() => {
    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Handle successful installation
    const handleAppInstalled = () => {
      console.log('[PWA] App was installed')
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      
      // Show notification permission prompt after installation
      setTimeout(() => {
        checkNotificationPermission()
      }, 2000)
    }
    
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check notification permission on load
    checkNotificationPermission()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        setShowNotificationPrompt(true)
      }
    }
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install prompt')
    } else {
      console.log('[PWA] User dismissed install prompt')
    }
    
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  const handleNotificationPermission = async () => {
    const granted = await notificationManager.requestPermission()
    if (granted) {
      console.log('[PWA] Notification permission granted')
      setShowNotificationPrompt(false)
      
      // Show test notification
      setTimeout(() => {
        notificationManager.testQuick('reminder')
      }, 1000)
    } else {
      console.log('[PWA] Notification permission denied')
      setShowNotificationPrompt(false)
    }
  }

  return (
    <>
      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                📱 Install Wake or Pay
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Add to your home screen for quick access
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowInstallPrompt(false)}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                Later
              </button>
              <button
                onClick={handleInstallClick}
                className="px-3 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Permission Prompt */}
      {showNotificationPrompt && (
        <div className="fixed bottom-4 left-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-900">
                🔔 Enable Wake-up Notifications
              </h3>
              <p className="text-xs text-yellow-700 mt-1">
                Get notified 10 minutes before your alarm and when it's time to wake up
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowNotificationPrompt(false)}
                className="px-3 py-1 text-xs text-yellow-700 hover:text-yellow-900"
              >
                Skip
              </button>
              <button
                onClick={handleNotificationPermission}
                className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}