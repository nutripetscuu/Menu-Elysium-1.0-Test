# Database Setup Guide for ELYSIUM Menu

This guide will help you set up Supabase database integration for the ELYSIUM restaurant menu system.

## Prerequisites

1. A Supabase account ([sign up here](https://supabase.com))
2. Node.js and npm installed
3. Basic understanding of PostgreSQL

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Fill in:
   - **Name**: `elysium-menu`
   - **Database Password**: Generate a strong password and save it
   - **Region**: Choose the closest to your users
5. Wait for the project to be created (2-3 minutes)

## Step 2: Get Project Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Public anon key** (starts with `eyJ`)
   - **Service role key** (starts with `eyJ`) - **Keep this secret!**

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
   ```

## Step 4: Create Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the SQL from `src/lib/config/database.ts` (the `DATABASE_SCHEMA_SQL` constant)
4. Click **Run** to execute the schema creation

Alternatively, you can run each section separately:

### Categories Table
```sql
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Menu Items Table
```sql
CREATE TABLE menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  tags TEXT[] DEFAULT '{}',
  portion VARCHAR(100),
  position INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Admin Users Table
```sql
CREATE TABLE admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'editor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);
```

## Step 5: Set Up Storage

1. Go to **Storage** in your Supabase dashboard
2. Create the following buckets:
   - `menu-images` (public)
   - `profile-images` (private)
   - `general-uploads` (public)

## Step 6: Migrate Existing Data

Once your tables are created, you can migrate the existing static menu data:

1. Go to **SQL Editor** in Supabase
2. Run the migration script (will be provided separately)
3. Verify the data was imported correctly in the **Table Editor**

## Step 7: Test the Connection

1. Start your development server:
   ```bash
   npm run dev
   ```

2. The application should now connect to your Supabase database
3. Check the browser console for any connection errors
4. Verify menu items are loading from the database

## Step 8: Set Up Authentication (Future)

When you're ready to add admin authentication:

1. Go to **Authentication** → **Settings** in Supabase
2. Configure your authentication providers
3. Set up Row Level Security (RLS) policies
4. Create admin user accounts

## Troubleshooting

### Common Issues:

1. **Connection Error**: Check your environment variables are correct
2. **RLS Policy Error**: Ensure public read policies are enabled for categories and menu_items
3. **Migration Failed**: Check for syntax errors in SQL and run sections individually
4. **Images Not Loading**: Verify storage buckets are created and policies allow public access

### Getting Help:

- Check the Supabase documentation: https://supabase.com/docs
- Join the Supabase Discord: https://discord.supabase.com
- Review the application logs in the browser console

## Security Considerations

1. Never commit `.env.local` to version control
2. Keep your service role key secret
3. Use RLS policies to secure your data
4. Enable 2FA on your Supabase account
5. Regularly rotate your database password

## Performance Tips

1. Add indexes to frequently queried columns
2. Use caching for menu data (already implemented)
3. Optimize images before uploading to storage
4. Monitor your database usage in the Supabase dashboard

## Next Steps

1. Set up the admin panel for menu management
2. Implement real-time updates
3. Add image optimization
4. Set up automated backups
5. Configure monitoring and alerts