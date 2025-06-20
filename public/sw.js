// Service Worker for Wake or Pay PWA with Notification Support
const CACHE_NAME = 'wake-or-pay-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Notification configurations
const NOTIFICATION_CONFIGS = {
  reminder: {
    title: '⏰ Wake or Pay - Reminder',
    body: 'Your alarm will ring in 10 minutes. Get ready to wake up!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    tag: 'wake-reminder',
    requireInteraction: false,
    actions: [
      {
        action: 'dismiss',
        title: 'OK',
        icon: '/icons/icon-96x96.png'
      }
    ]
  },
  alarm: {
    title: '🚨 Wake or Pay - TIME TO WAKE UP!',
    body: 'It\'s time to wake up! Verify you\'re awake to avoid penalty.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [500, 200, 500, 200, 500],
    tag: 'wake-alarm',
    requireInteraction: true,
    actions: [
      {
        action: 'verify-face',
        title: '📷 Face Check',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'verify-shake',
        title: '📱 Shake Phone',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'snooze',
        title: '😴 Snooze 5min',
        icon: '/icons/icon-96x96.png'
      }
    ]
  }
}

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache opened')
        return cache.addAll(urlsToCache)
      })
      .catch((error) => {
        console.error('[SW] Cache failed:', error)
      })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
      .catch(() => {
        // Fallback for offline scenarios
        if (event.request.destination === 'document') {
          return caches.match('/')
        }
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Received message:', event.data)
  
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { notificationType, customData } = event.data
    const config = NOTIFICATION_CONFIGS[notificationType] || NOTIFICATION_CONFIGS.alarm
    
    // Merge custom data if provided
    const notificationOptions = {
      ...config,
      data: {
        ...config.data,
        ...customData,
        timestamp: Date.now()
      }
    }
    
    event.waitUntil(
      self.registration.showNotification(config.title, notificationOptions)
    )
  }
  
  if (event.data && event.data.type === 'SCHEDULE_ALARM') {
    const { alarmTime, reminderTime } = event.data
    console.log('[SW] Scheduling alarm for:', alarmTime)
    console.log('[SW] Scheduling reminder for:', reminderTime)
    
    // Store alarm data for later use
    event.waitUntil(
      caches.open('alarm-data').then(cache => {
        return cache.put('current-alarm', new Response(JSON.stringify({
          alarmTime,
          reminderTime,
          scheduled: Date.now()
        })))
      })
    )
  }
})

// Push notification handling
self.addEventListener('push', (event) => {
  let notificationData = { type: 'alarm' }
  
  if (event.data) {
    try {
      notificationData = event.data.json()
    } catch (e) {
      notificationData = { type: 'alarm', body: event.data.text() }
    }
  }
  
  const config = NOTIFICATION_CONFIGS[notificationData.type] || NOTIFICATION_CONFIGS.alarm
  const options = {
    ...config,
    body: notificationData.body || config.body,
    data: {
      ...config.data,
      ...notificationData,
      timestamp: Date.now()
    }
  }

  event.waitUntil(
    self.registration.showNotification(config.title, options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action, event.notification.data)
  event.notification.close()

  const action = event.action
  const data = event.notification.data || {}

  let targetUrl = '/dashboard'
  
  switch (action) {
    case 'verify-face':
      targetUrl = '/dashboard?action=verify&method=face'
      break
    case 'verify-shake':
      targetUrl = '/dashboard?action=verify&method=shake'
      break
    case 'snooze':
      targetUrl = '/dashboard?action=snooze'
      // Schedule a new notification in 5 minutes
      setTimeout(() => {
        self.registration.showNotification(
          NOTIFICATION_CONFIGS.alarm.title,
          {
            ...NOTIFICATION_CONFIGS.alarm,
            body: 'Snooze time is up! Time to wake up!',
            data: { ...data, snoozeCount: (data.snoozeCount || 0) + 1 }
          }
        )
      }, 5 * 60 * 1000) // 5 minutes
      break
    case 'dismiss':
      // Just close, no further action needed
      return
    default:
      // Default click - open dashboard
      break
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if dashboard is already open
        for (const client of clientList) {
          if (client.url.includes('/dashboard') && 'focus' in client) {
            client.focus()
            // Send message to update UI
            client.postMessage({
              type: 'NOTIFICATION_ACTION',
              action,
              data
            })
            return
          }
        }
        
        // Open new window/tab
        if (clients.openWindow) {
          return clients.openWindow(targetUrl)
        }
      })
  )
})