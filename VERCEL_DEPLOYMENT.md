# Vercel Deployment Guide - NoWaiter Restaurant Management Platform

## Prerequisites

1. **Supabase Project** - Make sure your Supabase project is set up with:
   - Database tables created (restaurants, admin_users, categories, menu_items, modifiers, etc.)
   - RLS policies configured
   - Service role key available

2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)

3. **GitHub Repository** - Push your code to GitHub (recommended for automatic deployments)

## Environment Variables

You need to configure the following environment variables in Vercel:

### Required Variables

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Security (REQUIRED FOR PRODUCTION)
NEXTAUTH_SECRET=your_generated_secret_32_chars_minimum
NEXTAUTH_URL=https://your-domain.vercel.app
```

### Optional Variables

```bash
# Google AI (if using AI features)
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Telegram Bot (if using Telegram integration)
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
NEXT_PUBLIC_TELEGRAM_CHAT_ID=your_telegram_chat_id

# Production Settings
NODE_ENV=production
```

## Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Import Project to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (or leave empty)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### 3. Configure Environment Variables

In the Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add each variable from the list above
3. Important notes:
   - Use `SUPABASE_SERVICE_ROLE_KEY` (NOT the anon key) for server-side operations
   - Generate `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
   - Set `NEXTAUTH_URL` to your Vercel domain (e.g., `https://your-app.vercel.app`)

### 4. Deploy

Click **Deploy** and wait for the build to complete (~2-3 minutes).

## Post-Deployment Configuration

### 1. Update Supabase URLs

In your Supabase project dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Add your Vercel URL to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs:
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/login`
     - `https://your-app.vercel.app/admin`

### 2. Configure Custom Domain (Optional)

1. In Vercel: **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` environment variable to your custom domain

### 3. Verify Deployment

Test critical paths:
- ✅ Public menu: `https://your-app.vercel.app/menu?restaurant=elysium`
- ✅ Admin login: `https://your-app.vercel.app/login`
- ✅ Admin dashboard: `https://your-app.vercel.app/admin`
- ✅ Live Preview functionality
- ✅ Image uploads (if using Supabase Storage)

## Troubleshooting

### Build Fails

1. **Check Build Logs** in Vercel dashboard
2. Common issues:
   - TypeScript errors → Run `npm run typecheck` locally
   - Missing environment variables → Check Vercel environment variable settings
   - Dependency issues → Ensure `package.json` is committed

### Runtime Errors

1. **Check Function Logs** in Vercel dashboard
2. Common issues:
   - Database connection errors → Verify Supabase credentials
   - RLS policy blocking queries → Check Supabase RLS policies
   - CORS issues → Verify Supabase URL configuration

### Authentication Issues

1. **Verify Supabase Redirect URLs** are configured correctly
2. **Check NEXTAUTH_SECRET** is set
3. **Verify NEXTAUTH_URL** matches your deployed domain

### Live Preview Not Loading

1. **Check Console** for iframe errors
2. **Verify** restaurant subdomain exists in database
3. **Test** menu URL directly: `/menu?restaurant=your-subdomain`

## Environment Variable Reference

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ Yes | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (safe for browser) | ✅ Yes | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin key for server operations | ✅ Yes | `eyJhbGc...` |
| `NEXTAUTH_SECRET` | Session encryption key | ✅ Yes | `32+ character random string` |
| `NEXTAUTH_URL` | Your deployed URL | ✅ Yes | `https://your-app.vercel.app` |
| `GOOGLE_AI_API_KEY` | Google AI features | ❌ Optional | `AIza...` |
| `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN` | Telegram integration | ❌ Optional | `123456:ABC-DEF...` |
| `NEXT_PUBLIC_TELEGRAM_CHAT_ID` | Telegram chat ID | ❌ Optional | `123456789` |

## Security Best Practices

1. ✅ **Never commit** `.env.local` or environment variable values to Git
2. ✅ **Rotate secrets** regularly (especially `NEXTAUTH_SECRET` and `SUPABASE_SERVICE_ROLE_KEY`)
3. ✅ **Use HTTPS** only for production (Vercel provides this automatically)
4. ✅ **Enable RLS** on all Supabase tables
5. ✅ **Restrict CORS** in Supabase to your Vercel domain
6. ✅ **Monitor logs** for suspicious activity

## Continuous Deployment

Vercel automatically deploys when you push to your GitHub repository:

- **Main branch** → Production deployment
- **Other branches** → Preview deployments

Configure branch protection in GitHub for added safety.

## Performance Optimization

Already configured in the project:
- ✅ Next.js Image Optimization
- ✅ Code splitting and lazy loading
- ✅ Turbopack for faster builds
- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ Edge Runtime where applicable

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Project Issues**: Check console logs and Vercel function logs first

## Success Checklist

Before going live:

- [ ] All environment variables configured in Vercel
- [ ] Production build succeeds locally (`npm run build`)
- [ ] Supabase redirect URLs updated
- [ ] Custom domain configured (if applicable)
- [ ] Admin login works
- [ ] Public menu loads correctly
- [ ] Live Preview functions properly
- [ ] Image uploads work (if using)
- [ ] Database queries execute successfully
- [ ] No console errors in browser
- [ ] Mobile responsive design verified
- [ ] Test on multiple browsers

---

**Ready to Deploy!** 🚀

Your NoWaiter platform is production-ready and optimized for Vercel's Edge Network.
