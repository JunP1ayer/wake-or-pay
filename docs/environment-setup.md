# Environment Setup Guide

## Environment Files Overview

- `.env.local` - Local development (uses mock Supabase)
- `.env.production` - Production deployment

## Setting Up Production Environment

### 1. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Get your credentials from Project Settings > API:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`

3. Run the SQL schema from `docs/supabase-setup.md`

### 2. Stripe Setup (Optional for MVP)

1. Create a Stripe account at https://stripe.com
2. Get your keys from Dashboard > Developers > API keys:
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → `STRIPE_SECRET_KEY`
3. Set up webhooks for payment processing

### 3. Deployment Configuration

#### For Vercel:
```bash
# Set environment variables in Vercel dashboard
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# ... add all other variables
```

#### For Render:
```bash
# Set environment variables in Render dashboard
# Environment > Add Environment Variable
```

### 4. Security Checklist

- [ ] Use HTTPS in production
- [ ] Set proper CORS origins in Supabase
- [ ] Enable Row Level Security (RLS) on all tables
- [ ] Use strong secrets (minimum 32 characters)
- [ ] Never commit `.env.production` to git
- [ ] Rotate keys periodically

### 5. Testing Production Build

```bash
# Build and test locally
npm run build
npm run start

# Test with production environment
cp .env.production .env.local
npm run dev
```

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ⭕ | Stripe publishable key |
| `STRIPE_SECRET_KEY` | ⭕ | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | ⭕ | Stripe webhook secret |
| `NEXT_PUBLIC_APP_URL` | ✅ | Production app URL |
| `NEXTAUTH_SECRET` | ✅ | Authentication secret |
| `NEXTAUTH_URL` | ✅ | Authentication URL |