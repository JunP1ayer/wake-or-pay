# 🔔 Notification Features Guide

## Overview

Wake or Pay now includes comprehensive notification support for wake-up alarms and reminders.

## Features

### 1. Reminder Notifications (10 minutes before alarm)
- 📅 **Timing**: 10 minutes before your set alarm time
- 🔔 **Content**: "Your alarm will ring in 10 minutes. Get ready to wake up!"
- 📱 **Vibration**: Gentle reminder pattern (200ms, 100ms, 200ms)
- 🎯 **Action**: Dismiss button

### 2. Alarm Notifications (at alarm time)
- ⏰ **Timing**: Exact alarm time
- 🚨 **Content**: "TIME TO WAKE UP! Verify you're awake to avoid penalty."
- 📱 **Vibration**: Strong wake-up pattern (500ms, 200ms, 500ms, 200ms, 500ms)
- 🎯 **Actions**: 
  - 📷 Face Check
  - 📱 Shake Phone  
  - 😴 Snooze 5min

### 3. Development Testing
- 🧪 **Test Panel**: Available in Dashboard (test tube icon)
- ⚡ **Quick Test**: 3-second countdown for immediate testing
- 🔄 **Fallback**: Works even without Service Worker

## How to Use

### Initial Setup
1. **Enable Notifications**: PWA installer will prompt for permission
2. **Set Alarm**: Use the main setup flow
3. **Automatic Scheduling**: Notifications are scheduled automatically

### Testing (Development)
1. Go to Dashboard
2. Click the test tube icon (🧪)
3. Choose test type:
   - **Test Reminder**: Shows reminder notification
   - **Test Alarm**: Shows alarm notification  
   - **Quick Test (3s)**: Shows alarm in 3 seconds

### Production Usage
1. Set your wake-up time through the app
2. Receive reminder notification 10 minutes before
3. Receive alarm notification at wake-up time
4. Click notification action to verify you're awake

## Technical Implementation

### Service Worker (`/public/sw.js`)
- Handles notification display
- Manages notification actions
- Provides offline functionality
- Caches app resources

### Notification Manager (`/lib/notifications.ts`)
- Permission management
- Scheduling logic
- Fallback for unsupported browsers
- Development testing utilities

### PWA Integration
- Automatic permission requests
- Test notifications after install
- Service worker registration
- Message handling between SW and main thread

## Browser Support

### ✅ Fully Supported
- Chrome 50+
- Firefox 44+
- Safari 16+ (with limitations)
- Edge 17+

### ⚠️ Limited Support
- Safari < 16 (no action buttons)
- iOS Safari (requires PWA installation)

### ❌ Not Supported
- Internet Explorer
- Very old mobile browsers

## Troubleshooting

### Notifications Not Showing
1. **Check Permission**: Browser settings → Notifications → Allow
2. **HTTPS Required**: Notifications require secure context
3. **PWA Installation**: Some browsers require PWA installation
4. **Focus State**: Some browsers suppress notifications when tab is active

### Testing in Development
1. **Use Test Panel**: Dashboard → Test tube icon
2. **Check Console**: Look for `[Notifications]` logs
3. **Fallback Mode**: Direct notifications if Service Worker fails
4. **Permission Reset**: Clear site data to reset permissions

### Service Worker Issues
1. **Registration**: Check browser dev tools → Application → Service Workers
2. **Updates**: Hard refresh (Ctrl+Shift+R) to update SW
3. **Cache**: Clear cache if behavior is inconsistent

## Best Practices

### For Users
1. **Enable Notifications**: Essential for wake-up functionality
2. **Keep Tab Open**: Or install as PWA for background operation
3. **Test First**: Use test features to ensure notifications work
4. **Device Settings**: Check system notification settings

### For Developers
1. **Permission Early**: Request permission during onboarding
2. **Graceful Fallback**: Handle permission denied scenarios
3. **Testing Tools**: Provide easy testing mechanisms
4. **Clear Messaging**: Explain why notifications are needed

## API Reference

### `notificationManager`
```typescript
// Request permission
await notificationManager.requestPermission()

// Show notification
await notificationManager.showNotification('alarm', { customData })

// Schedule alarm
notificationManager.scheduleAlarm({
  alarmTime: '07:00',
  verificationMethod: 'face',
  reminderMinutes: 10
})

// Test notifications
await notificationManager.testQuick('alarm')
```

### Utility Functions
```typescript
// Quick permission request
await requestNotificationPermission()

// Schedule wake-up alarm
await scheduleWakeUpAlarm('07:00', 'face')

// Test notifications
await testNotifications()
```

## Security & Privacy

### Data Handling
- ⭐ **No Server**: Notifications scheduled locally
- 🔒 **No Tracking**: No external notification services
- 📱 **Local Storage**: Alarm data stored in browser only
- 🛡️ **Permission Based**: User controls all notification access

### Browser Permissions
- 🔔 **Notification Permission**: Required for all notifications
- 📷 **Camera Permission**: Separate, for face verification only
- 📱 **Vibration**: No permission required
- 💾 **Storage**: Standard web storage permissions

## Future Enhancements

### Planned Features
- 🌅 **Smart Wake**: Wake during light sleep phases
- 🎵 **Custom Sounds**: User-selected alarm tones
- 📊 **Analytics**: Notification effectiveness tracking
- 🔄 **Sync**: Cross-device alarm synchronization

### Technical Improvements
- 🚀 **Push Server**: External notification service
- 🧠 **ML Integration**: Personalized wake-up timing
- ⚡ **Performance**: Optimized notification scheduling
- 🎨 **Customization**: User-configurable notification styles