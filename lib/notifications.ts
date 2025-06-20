'use client'

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  vibrate?: number[]
  tag?: string
  requireInteraction?: boolean
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  data?: any
}

export interface AlarmSchedule {
  alarmTime: string // HH:MM format
  reminderMinutes?: number // minutes before alarm (default: 10)
  verificationMethod?: 'face' | 'shake' | 'both'
}

class NotificationManager {
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null
  private permissionGranted = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.init()
    }
  }

  private async init() {
    // Check if notifications are supported
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('[Notifications] Not supported in this browser')
      return
    }

    // Register service worker
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      this.serviceWorkerRegistration = registration
      console.log('[Notifications] Service Worker registered')

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('[Notifications] Message from SW:', event.data)
        this.handleServiceWorkerMessage(event.data)
      })

    } catch (error) {
      console.error('[Notifications] Service Worker registration failed:', error)
    }
  }

  private handleServiceWorkerMessage(data: any) {
    if (data.type === 'NOTIFICATION_ACTION') {
      // Handle notification actions
      this.onNotificationAction?.(data.action, data.data)
    }
  }

  // Callback for notification actions
  public onNotificationAction?: (action: string, data: any) => void

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[Notifications] Not supported')
      return false
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true
      return true
    }

    if (Notification.permission === 'denied') {
      console.warn('[Notifications] Permission denied')
      return false
    }

    // Request permission
    const permission = await Notification.requestPermission()
    this.permissionGranted = permission === 'granted'
    
    if (!this.permissionGranted) {
      console.warn('[Notifications] Permission not granted:', permission)
    }

    return this.permissionGranted
  }

  async showNotification(type: 'reminder' | 'alarm', customData?: any): Promise<boolean> {
    if (!this.permissionGranted) {
      console.warn('[Notifications] Permission not granted')
      return false
    }

    if (!this.serviceWorkerRegistration) {
      console.warn('[Notifications] Service Worker not available')
      return false
    }

    try {
      // Send message to service worker to show notification
      const message = {
        type: 'SHOW_NOTIFICATION',
        notificationType: type,
        customData
      }

      // Use MessageChannel for better communication
      const messageChannel = new MessageChannel()
      messageChannel.port1.onmessage = (event) => {
        console.log('[Notifications] Response from SW:', event.data)
      }

      this.serviceWorkerRegistration.active?.postMessage(message, [messageChannel.port2])
      return true

    } catch (error) {
      console.error('[Notifications] Failed to show notification:', error)
      
      // Fallback: Direct notification
      return this.showDirectNotification(type, customData)
    }
  }

  private async showDirectNotification(type: 'reminder' | 'alarm', customData?: any): Promise<boolean> {
    try {
      const config = type === 'reminder' 
        ? {
            title: '⏰ Wake or Pay - Reminder',
            body: 'Your alarm will ring in 10 minutes. Get ready to wake up!',
            icon: '/icons/icon-192x192.png',
            tag: 'wake-reminder'
          }
        : {
            title: '🚨 Wake or Pay - TIME TO WAKE UP!',
            body: 'It\'s time to wake up! Verify you\'re awake to avoid penalty.',
            icon: '/icons/icon-192x192.png',
            tag: 'wake-alarm',
            requireInteraction: true
          }

      const notification = new Notification(config.title, {
        ...config,
        data: customData
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
        
        // Navigate to dashboard
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard?action=verify'
        }
      }

      return true
    } catch (error) {
      console.error('[Notifications] Direct notification failed:', error)
      return false
    }
  }

  scheduleAlarm(schedule: AlarmSchedule): void {
    const { alarmTime, reminderMinutes = 10 } = schedule
    
    // Parse alarm time
    const [hours, minutes] = alarmTime.split(':').map(Number)
    const now = new Date()
    const alarmDate = new Date()
    alarmDate.setHours(hours, minutes, 0, 0)
    
    // If alarm time is in the past, schedule for tomorrow
    if (alarmDate <= now) {
      alarmDate.setDate(alarmDate.getDate() + 1)
    }
    
    // Calculate reminder time (10 minutes before alarm)
    const reminderDate = new Date(alarmDate.getTime() - reminderMinutes * 60 * 1000)
    
    console.log('[Notifications] Scheduling alarm for:', alarmDate)
    console.log('[Notifications] Scheduling reminder for:', reminderDate)
    
    // Send to service worker for storage
    if (this.serviceWorkerRegistration?.active) {
      this.serviceWorkerRegistration.active.postMessage({
        type: 'SCHEDULE_ALARM',
        alarmTime: alarmDate.toISOString(),
        reminderTime: reminderDate.toISOString()
      })
    }
    
    // Schedule notifications using setTimeout (for development/testing)
    this.scheduleLocalNotifications(reminderDate, alarmDate, schedule)
  }

  private scheduleLocalNotifications(reminderDate: Date, alarmDate: Date, schedule: AlarmSchedule): void {
    const now = new Date()
    
    // Schedule reminder notification
    const reminderDelay = reminderDate.getTime() - now.getTime()
    if (reminderDelay > 0) {
      setTimeout(() => {
        this.showNotification('reminder', {
          alarmTime: alarmDate.toISOString(),
          verificationMethod: schedule.verificationMethod
        })
      }, reminderDelay)
      
      console.log(`[Notifications] Reminder scheduled in ${Math.round(reminderDelay / 1000)} seconds`)
    }
    
    // Schedule main alarm notification
    const alarmDelay = alarmDate.getTime() - now.getTime()
    if (alarmDelay > 0) {
      setTimeout(() => {
        this.showNotification('alarm', {
          alarmTime: alarmDate.toISOString(),
          verificationMethod: schedule.verificationMethod
        })
      }, alarmDelay)
      
      console.log(`[Notifications] Alarm scheduled in ${Math.round(alarmDelay / 1000)} seconds`)
    }
  }

  // Test notifications (for development)
  async testReminder(): Promise<boolean> {
    console.log('[Notifications] Testing reminder notification')
    return this.showNotification('reminder', { test: true })
  }

  async testAlarm(): Promise<boolean> {
    console.log('[Notifications] Testing alarm notification')
    return this.showNotification('alarm', { test: true })
  }

  // Quick test - show notification in 3 seconds
  async testQuick(type: 'reminder' | 'alarm' = 'alarm'): Promise<void> {
    console.log(`[Notifications] Showing ${type} notification in 3 seconds...`)
    setTimeout(() => {
      this.showNotification(type, { test: true, timestamp: Date.now() })
    }, 3000)
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager()

// Utility functions
export async function requestNotificationPermission(): Promise<boolean> {
  return notificationManager.requestPermission()
}

export async function scheduleWakeUpAlarm(alarmTime: string, verificationMethod?: 'face' | 'shake' | 'both'): Promise<void> {
  await notificationManager.requestPermission()
  notificationManager.scheduleAlarm({
    alarmTime,
    verificationMethod,
    reminderMinutes: 10
  })
}

export async function testNotifications(): Promise<void> {
  await notificationManager.requestPermission()
  await notificationManager.testQuick('alarm')
}