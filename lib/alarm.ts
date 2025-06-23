'use client'

// Global variables to track alarm state
let alarmTimeout: NodeJS.Timeout | null = null
let alarmAudio: HTMLAudioElement | null = null
let isAlarmActive = false

/**
 * Request notification permission if not already granted
 */
async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission === 'denied') {
    console.warn('Notification permission denied')
    return false
  }

  try {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return false
  }
}

/**
 * Show notification for wake-up alarm
 */
function showAlarmNotification() {
  if (Notification.permission === 'granted') {
    const notification = new Notification('起きなきゃ100円 - Wake Up!', {
      body: '起床時間です！アラームを止めて顔認証を完了してください。',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: 'wake-up-alarm',
      requireInteraction: true // Keep notification until user interacts
    })

    // Handle notification click
    notification.onclick = () => {
      window.focus()
      notification.close()
      // Redirect to verification page
      if (typeof window !== 'undefined') {
        window.location.href = '/alarm?triggered=true'
      }
    }

    // Auto-close notification after 30 seconds
    setTimeout(() => {
      notification.close()
    }, 30000)
  }
}

/**
 * Start playing alarm audio
 */
function startAlarmAudio() {
  try {
    // Create new audio instance
    alarmAudio = new Audio('/alarm.mp3')
    alarmAudio.loop = true
    alarmAudio.volume = 0.8
    
    // Play audio
    const playPromise = alarmAudio.play()
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Alarm audio started successfully')
        })
        .catch((error) => {
          console.error('Error playing alarm audio:', error)
          // Fallback: try to play after user interaction
          document.addEventListener('click', () => {
            if (alarmAudio && isAlarmActive) {
              alarmAudio.play().catch(console.error)
            }
          }, { once: true })
        })
    }
  } catch (error) {
    console.error('Error creating alarm audio:', error)
  }
}

/**
 * Stop alarm audio
 */
export function stopAlarmAudio() {
  if (alarmAudio) {
    alarmAudio.pause()
    alarmAudio.currentTime = 0
    alarmAudio = null
  }
  isAlarmActive = false
}

/**
 * Trigger the alarm (audio + notification)
 */
function triggerAlarm() {
  console.log('🚨 ALARM TRIGGERED! Time to wake up!')
  isAlarmActive = true
  
  // Start audio
  startAlarmAudio()
  
  // Show notification
  showAlarmNotification()
  
  // Redirect to alarm page with triggered flag
  if (typeof window !== 'undefined') {
    window.location.href = '/alarm?triggered=true'
  }
}

/**
 * Calculate milliseconds until target time
 * @param timeString Time in HH:MM format (24-hour)
 * @returns Milliseconds until target time
 */
function calculateTimeUntilAlarm(timeString: string): number {
  const now = new Date()
  const [hours, minutes] = timeString.split(':').map(Number)
  
  const alarmTime = new Date()
  alarmTime.setHours(hours, minutes, 0, 0)
  
  // If alarm time is in the past today, set it for tomorrow
  if (alarmTime.getTime() <= now.getTime()) {
    alarmTime.setDate(alarmTime.getDate() + 1)
  }
  
  const msUntilAlarm = alarmTime.getTime() - now.getTime()
  
  console.log(`Alarm scheduled for: ${alarmTime.toLocaleString()}`)
  console.log(`Time until alarm: ${Math.round(msUntilAlarm / 1000 / 60)} minutes`)
  
  return msUntilAlarm
}

/**
 * Schedule an alarm for the specified wake-up time
 * @param wakeUpTime Time in HH:MM format (24-hour)
 */
export async function scheduleAlarm(wakeUpTime: string): Promise<void> {
  console.log(`📅 Scheduling alarm for ${wakeUpTime}`)
  
  // Clear any existing alarm
  if (alarmTimeout) {
    clearTimeout(alarmTimeout)
    alarmTimeout = null
  }
  
  // Stop any existing alarm audio
  stopAlarmAudio()
  
  // Request notification permission
  const hasNotificationPermission = await requestNotificationPermission()
  if (!hasNotificationPermission) {
    console.warn('Notification permission not granted - alarm will still work with audio')
  }
  
  // Validate time format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(wakeUpTime)) {
    throw new Error('Invalid time format. Use HH:MM (24-hour format)')
  }
  
  // Calculate delay until alarm time
  const msUntilAlarm = calculateTimeUntilAlarm(wakeUpTime)
  
  // Schedule the alarm
  alarmTimeout = setTimeout(() => {
    triggerAlarm()
  }, msUntilAlarm)
  
  console.log(`✅ Alarm successfully scheduled for ${wakeUpTime}`)
  
  // Show confirmation notification (optional)
  if (Notification.permission === 'granted') {
    const confirmNotification = new Notification('起きなきゃ100円', {
      body: `アラームを ${wakeUpTime} にセットしました`,
      icon: '/icons/icon-192x192.png',
      tag: 'alarm-scheduled'
    })
    
    setTimeout(() => {
      confirmNotification.close()
    }, 3000)
  }
}

/**
 * Cancel the scheduled alarm
 */
export function cancelAlarm(): void {
  if (alarmTimeout) {
    clearTimeout(alarmTimeout)
    alarmTimeout = null
    console.log('⏰ Alarm cancelled')
  }
  
  stopAlarmAudio()
}

/**
 * Check if an alarm is currently scheduled
 */
export function isAlarmScheduled(): boolean {
  return alarmTimeout !== null
}

/**
 * Get remaining time until alarm (in milliseconds)
 */
export function getTimeUntilAlarm(): number | null {
  // This is a simple implementation - in a real app you'd want to store the target time
  return null
}