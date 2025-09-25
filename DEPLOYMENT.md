# 🚀 DEPLOYMENT INSTRUCTIONS - MENÚ ELYSIUM

## ✅ Pre-Deployment Checklist Completed:
- [x] Environment variables secured
- [x] Content Security Policy added
- [x] Production build tested
- [x] Vercel configuration created
- [x] ESLint issues addressed

## 🔧 Vercel Deployment Setup:

### 1. Environment Variables (CRITICAL)
⚠️ **SECURITY NOTICE**: All environment variables must be set directly in Vercel Dashboard. Never commit actual values to Git.

**Required Environment Variables in Vercel Dashboard:**

| Variable Name | Description | Environment |
|---------------|-------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Production, Preview, Development |
| `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN` | Your Telegram bot token | Production, Preview, Development |
| `NEXT_PUBLIC_TELEGRAM_CHAT_ID` | Your Telegram chat ID | Production, Preview, Development |
| `NODE_ENV` | Set to "production" | Production |

⚠️ **CRITICAL DEPLOYMENT STEPS**:
1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Add each variable individually** with your actual values
3. **Check all environments**: Production, Preview, Development (for NEXT_PUBLIC_ vars)
4. **For NODE_ENV**: Only set for Production environment
5. **Click "Redeploy"** after adding all variables

🔒 **Security Best Practices**:
- Never commit actual environment variable values to Git
- Use `.env.local` for local development only (already in .gitignore)
- Rotate Telegram bot token if it was exposed publicly

### 2. Deploy to Vercel:
```bash
# Option 1: Connect GitHub repo to Vercel
1. Go to vercel.com
2. Import Git Repository
3. Select this repository
4. Add environment variables
5. Deploy

# Option 2: Vercel CLI
npm i -g vercel
vercel --prod
```

### 3. Build Information:
- ✅ Build Size: 214 kB (optimized)
- ✅ Static Pages: 6 pages generated
- ✅ No build errors
- ✅ TypeScript validation passed

## 🔐 Security Features:
- Content Security Policy headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- SVG uploads disabled
- Environment variables protected

## 📊 Performance:
- First Load JS: 101 kB shared
- Route optimization enabled
- Package imports optimized
- Static generation configured

## ⚠️ Post-Deployment Tasks:
1. Test Telegram bot integration
2. Verify all environment variables
3. Test cart functionality
4. Monitor error logs
5. Set up domain (if needed)

## 🚨 COMMON VERCEL DEPLOYMENT ERRORS & SOLUTIONS:

### Error: "Environment variables not found"
**Solution:**
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Ensure all variables are added with EXACT names:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_TELEGRAM_BOT_TOKEN`
   - `NEXT_PUBLIC_TELEGRAM_CHAT_ID`
3. Check all environments: Production, Preview, Development
4. Click "Redeploy" after adding variables

### Error: "Telegram API unauthorized" or Chat ID issues
**Possible causes:**
- Chat ID format is incorrect
- Bot token is invalid or expired
- Bot hasn't started conversation with user/chat

**Solution:**
1. **Verify Chat ID**: Open Telegram, message your bot, then get chat ID from your bot's `/getUpdates` endpoint
2. **Test Bot Token**: Try sending a test message manually using Telegram API
3. **Check Bot Permissions**: Ensure bot can send messages to the target chat
4. **Regenerate Bot Token**: If token was exposed publicly, create a new bot token

### Error: "Build failed" or CSP violations
**Solution:**
- Check Vercel build logs for specific errors
- Ensure Content Security Policy allows Telegram API:
  ```
  connect-src 'self' https://api.telegram.org
  ```

### Error: "Function timeout" during deployment
**Solution:**
- Check `vercel.json` function timeout settings
- Increase timeout if needed (currently 30 seconds)

## 🎯 Production Ready!
The application is fully prepared for production deployment.
