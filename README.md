# 🔔 Wake or Pay - Never Oversleep Again

> 30-second setup to stop oversleeping with biometric verification and automatic penalties

## ✨ Features

- ⏰ **Quick Setup** - Set wake-up time and penalty in 30 seconds
- 👤 **Face Recognition** - Verify you're awake with camera
- 📱 **Shake Detection** - Alternative verification by shaking phone  
- 💰 **Automatic Penalties** - Pay when you miss your alarm
- 📊 **Progress Tracking** - Monitor success rate and streaks
- 📱 **PWA Support** - Install as native mobile app
- 🔒 **Privacy First** - Anonymous authentication, secure data

## 🚀 Quick Start

### Development
```bash
# Clone and install
git clone <repo> wake-or-pay
cd wake-or-pay
npm install

# Start development server (opens at http://localhost:3002)
npm run dev
```

### Production
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📚 Documentation

- [🏗️ Supabase Setup](./docs/supabase-setup.md) - Database and authentication
- [⚙️ Environment Setup](./docs/environment-setup.md) - Configuration guide
- [🚀 Deployment Guide](./docs/deployment-guide.md) - Deploy to Vercel/Render

## 🛠 Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Supabase (Auth, Database, Realtime)
- **Payments:** Stripe (optional)
- **Deployment:** Vercel / Render
- **PWA:** Service Worker, Web App Manifest

## 🎯 Core Features

### 1. Quick Onboarding
- Set wake-up time (< 10 seconds)
- Choose penalty amount (< 10 seconds)
- Select verification method (< 10 seconds)
- Total setup: **< 30 seconds**

### 2. Verification Methods
- **Face Recognition:** Camera-based verification
- **Shake Detection:** Motion-based verification  
- **Both:** Extra security with dual verification

### 3. Progress Tracking
- Success rate percentage
- Consecutive day streaks
- Total penalties paid
- Historical wake-up data

### 4. PWA Support
- Installable on mobile devices
- Offline functionality
- Native app experience

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Render
1. Connect GitHub repository
2. Use included `render.yaml`
3. Set environment variables
4. Deploy automatically

See [Deployment Guide](./docs/deployment-guide.md) for detailed instructions.