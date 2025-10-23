# QR Code Fix - Environment Configuration Guide

## Problem Identified

The QR codes were pointing to `http://localhost:9002` instead of your production URL because the `NEXT_PUBLIC_SITE_URL` environment variable was not set.

## What Was Fixed

### 1. Updated `src/lib/api/dashboard.ts`
- Added intelligent URL detection with priority order:
  1. `NEXT_PUBLIC_SITE_URL` (if explicitly set)
  2. `VERCEL_URL` (automatically set by Vercel)
  3. `http://localhost:9002` (fallback for local development)

### 2. Updated Environment Files
- Added `NEXT_PUBLIC_SITE_URL` to `.env.example`
- Added `NEXT_PUBLIC_SITE_URL` to `.env.local` with localhost value for development

## How to Fix on Vercel (CRITICAL)

To fix the QR codes on your Vercel deployment, you need to set the environment variable:

### Option 1: Set Your Custom Domain (Recommended)
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name:** `NEXT_PUBLIC_SITE_URL`
   - **Value:** `https://your-custom-domain.com` (your actual production domain)
   - **Environment:** Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your application for changes to take effect

### Option 2: Use Vercel's Auto-Generated URL
If you don't set `NEXT_PUBLIC_SITE_URL`, the code will automatically use Vercel's `VERCEL_URL` environment variable, which Vercel sets automatically to your project's URL (e.g., `your-project.vercel.app`).

**However**, if you have a custom domain, you MUST use Option 1.

## Testing the Fix

### Local Testing
1. Restart your dev server (if it was running)
2. Go to Admin → Settings → QR Code tab
3. The QR code should now point to `http://localhost:9002/menu?restaurant=your-subdomain`
4. Scan the QR code - it should work locally

### Production Testing (After Vercel Configuration)
1. Deploy your changes to Vercel
2. Set the `NEXT_PUBLIC_SITE_URL` environment variable (as described above)
3. Trigger a new deployment (or it will redeploy automatically)
4. Go to your admin panel on production
5. Navigate to Settings → QR Code tab
6. Download the QR code
7. Scan it with your phone - it should now redirect to your production URL!

## Important Notes

- **NEXT_PUBLIC_** prefix is required for environment variables that need to be exposed to the browser
- Changes to environment variables on Vercel require a **new deployment** to take effect
- The QR code generation is multi-tenant safe - each restaurant gets their own subdomain in the URL
- All existing QR codes will automatically update once you regenerate them in the admin panel

## Verification Checklist

- [ ] `NEXT_PUBLIC_SITE_URL` is set in Vercel environment variables
- [ ] New deployment triggered after setting the environment variable
- [ ] Admin panel Settings page loads without errors
- [ ] QR Code tab displays a QR code
- [ ] QR code URL shows correct production domain (not localhost)
- [ ] Scanning QR code redirects to correct production menu page
- [ ] Each restaurant has the correct subdomain in their QR code URL

## Need Help?

If QR codes still point to localhost after following these steps:
1. Verify the environment variable is set correctly in Vercel
2. Check that you triggered a new deployment after setting the variable
3. Clear your browser cache and try again
4. Check the Network tab in browser DevTools to see what URL the QR code is encoding
