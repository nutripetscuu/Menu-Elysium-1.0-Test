# Elysium Café - Vercel Deployment Guide

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/elysium-cafe)

## Environment Variables

Set these in your Vercel dashboard:

### Required for Database
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### Optional Features
```
GOOGLE_GENAI_API_KEY=your_google_ai_api_key_here
NEXT_PUBLIC_API_URL=https://yourdomain.vercel.app/api
NODE_ENV=production
```

## Build Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: Leave empty (auto-detected)
- **Install Command**: `npm install`
- **Node.js Version**: 20.x

## Post-Deployment

1. Set up your Supabase database using the schema in `src/lib/config/database.ts`
2. Upload banner images to Supabase Storage
3. Configure custom domain (optional)

## Performance Features

- ✅ Image optimization with Next.js Image component
- ✅ Bundle optimization for Vercel
- ✅ Static generation for menu pages
- ✅ Edge-ready API routes
- ✅ Security headers configured
- ✅ SEO optimized

## Development vs Production

- **Development**: Uses fallback static data
- **Production**: Connects to Supabase database
- **Fallback**: Graceful degradation if database is unavailable