# Deployment Guide

## 🚀 Deploy to Vercel (Recommended)

### Prerequisites
1. GitHub repository with your code
2. Supabase project set up (see `docs/supabase-setup.md`)
3. Vercel account

### Steps

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and deploy
   vercel login
   vercel --prod
   ```

2. **Set Environment Variables**
   Go to Vercel Dashboard > Project > Settings > Environment Variables:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your_32_char_secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

3. **Configure Domain (Optional)**
   - Go to Domains tab in Vercel dashboard
   - Add your custom domain

4. **Enable Analytics (Optional)**
   - Enable Vercel Analytics in project settings
   - Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` if using Google Analytics

---

## 🚢 Deploy to Render

### Prerequisites
1. GitHub repository with your code
2. Supabase project set up
3. Render account

### Steps

1. **Create Web Service**
   - Connect your GitHub repository
   - Use `render.yaml` configuration (included)
   - Set build command: `npm ci && npm run build`
   - Set start command: `npm start`

2. **Set Environment Variables**
   Add these in Render Dashboard > Environment:
   
   ```
   NODE_ENV=production
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_APP_URL=https://your-app.onrender.com
   NEXTAUTH_SECRET=your_32_char_secret
   NEXTAUTH_URL=https://your-app.onrender.com
   ```

3. **Deploy**
   - Render will automatically deploy on push to main branch
   - Monitor deployment logs for any issues

---

## 🔧 Post-Deployment Setup

### 1. Test Core Functionality
- [ ] Anonymous authentication works
- [ ] Alarm creation and storage
- [ ] Face/shake verification
- [ ] PWA installation prompt
- [ ] Mobile responsiveness

### 2. Set Up Monitoring
- [ ] Enable error tracking (Sentry recommended)
- [ ] Set up uptime monitoring
- [ ] Configure analytics

### 3. Performance Optimization
- [ ] Test Lighthouse scores
- [ ] Enable compression
- [ ] Optimize images
- [ ] Configure CDN

### 4. Security Review
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] CORS settings correct
- [ ] Rate limiting configured

---

## 📱 PWA Testing

### Desktop
1. Visit your deployed site
2. Look for install prompt
3. Test offline functionality

### Mobile
1. Open in Chrome/Safari
2. "Add to Home Screen" option available
3. App launches in standalone mode
4. Notifications work (if implemented)

---

## 🐛 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

**Environment Variables:**
- Ensure all required variables are set
- Check for typos in variable names
- Verify Supabase URLs are correct

**Database Issues:**
- Confirm RLS policies are enabled
- Check user permissions
- Verify table schemas match

**PWA Issues:**
- Manifest.json served correctly
- Service worker registers
- Icons are accessible

---

## 📈 Scaling Considerations

### Traffic Growth
- Monitor serverless function usage
- Consider upgrading hosting plan
- Implement caching strategies

### Database Scaling
- Monitor Supabase usage
- Optimize queries with indexes
- Consider read replicas for high load

### Cost Optimization
- Review function execution time
- Optimize bundle size
- Use edge caching where possible

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Optional)
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - run: npm run test
```

### Automatic Deployments
- Both Vercel and Render support automatic deployments
- Connect to main/master branch
- Deploy on every push

---

## ✅ Go Live Checklist

- [ ] Domain configured
- [ ] SSL certificate active  
- [ ] All environment variables set
- [ ] Database populated with schema
- [ ] PWA manifest working
- [ ] Error monitoring configured
- [ ] Analytics tracking enabled
- [ ] Performance tested
- [ ] Mobile tested
- [ ] Backup strategy in place