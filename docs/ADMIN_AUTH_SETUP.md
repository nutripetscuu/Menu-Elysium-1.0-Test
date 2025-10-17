# Admin Authentication Setup Guide

## Overview

This guide walks you through setting up admin authentication for the Elysium Restaurant Menu admin panel.

---

## Prerequisites

- Supabase project configured
- Environment variables set in `.env.local`
- Database migrations applied

---

## Step 1: Create Your First Admin User

You need to create an admin user in **both** Supabase Auth and the `admin_users` table.

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com/dashboard
   - Navigate to your project
   - Go to **Authentication** > **Users**

2. **Create User**
   - Click "Add User"
   - Choose "Create new user"
   - Enter email: `admin@elysium.com` (or your email)
   - Set a strong password
   - Click "Create user"
   - **Copy the User UUID** (you'll need it in step 3)

3. **Add to admin_users Table**
   - Go to **SQL Editor**
   - Run this query (replace `YOUR_USER_UUID` with the UUID from step 2):

```sql
INSERT INTO admin_users (id, email, role)
VALUES ('YOUR_USER_UUID', 'admin@elysium.com', 'admin');
```

### Option B: Using SQL Only

Run this in the SQL Editor (replace with your actual email and password):

```sql
-- This is a workaround since Supabase doesn't expose auth.signup() directly
-- You'll need to use the Supabase Dashboard method instead
-- Or use the signup API from your application
```

**Note:** The SQL Editor can't create auth users directly. Use the Dashboard method above.

---

## Step 2: Verify RLS Policies

Run this query to check if RLS policies are properly set:

```sql
-- Check if is_admin() function exists
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'is_admin';

-- List all RLS policies
SELECT schemaname, tablename, policyname, permissive, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test if RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('categories', 'menu_items', 'modifier_groups', 'modifier_options', 'admin_users', 'Header Images');
```

**Expected Results:**
- `is_admin()` function should exist
- All tables should have RLS enabled (`rowsecurity = true`)
- Multiple policies should exist for each table

---

## Step 3: Test Authentication

### Test Login

1. Start the dev server:
```bash
npm run dev
```

2. Navigate to http://localhost:9002/login

3. Enter your credentials:
   - Email: `admin@elysium.com`
   - Password: (the password you set)

4. Click "Sign In"

5. **Expected Result:** You should be redirected to `/admin/dashboard`

### Test Route Protection

1. While logged out, try to access: http://localhost:9002/admin/dashboard
   - **Expected:** Redirected to `/login`

2. Log in, then access: http://localhost:9002/admin/dashboard
   - **Expected:** Dashboard loads successfully

### Test Password Reset

1. Go to http://localhost:9002/reset-password
2. Enter your email
3. Check your email inbox for reset link
4. Click link and set new password

---

## Step 4: Configure Email Templates (Optional)

For a better user experience, customize Supabase Auth email templates:

1. Go to **Authentication** > **Email Templates** in Supabase Dashboard
2. Customize:
   - **Confirm signup** (if you enable signups later)
   - **Reset password** (for password reset emails)
   - **Magic Link** (if you want passwordless login)

### Example Reset Password Template

```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password for Elysium Admin:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>If you didn't request this, please ignore this email.</p>
<p>This link expires in 1 hour.</p>
```

---

## Step 5: Create Additional Admin Users

To invite more admins:

1. **Create in Supabase Auth:**
   - Dashboard > Authentication > Users > Add User

2. **Add to admin_users table:**

```sql
INSERT INTO admin_users (id, email, role)
VALUES
  ('user-uuid-1', 'manager@elysium.com', 'manager'),
  ('user-uuid-2', 'editor@elysium.com', 'editor');
```

### Admin Roles

| Role | Permissions |
|------|-------------|
| **admin** | Full access - can manage all data including other admins |
| **manager** | Can manage menu, settings, promotions (but not other admins) |
| **editor** | Can manage menu items and promotions only |

---

## Troubleshooting

### "You do not have admin access"

**Cause:** User exists in Supabase Auth but not in `admin_users` table.

**Fix:**
```sql
-- Check if user exists in auth
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Add to admin_users (use the id from above)
INSERT INTO admin_users (id, email, role)
VALUES ('user-id-from-above', 'your-email@example.com', 'admin');
```

### Login works but can't access admin pages

**Cause:** RLS policies not properly configured or middleware issue.

**Fix:**
```sql
-- Re-run the RLS migration
-- See: supabase/migrations/004_admin_auth_rls_policies.sql

-- Verify is_admin() function works
SELECT is_admin(); -- Should return false when not logged in
```

### Password reset emails not sending

**Cause:** Supabase email configuration not set up.

**Fix:**
1. Go to **Settings** > **Auth** in Supabase Dashboard
2. Configure SMTP settings (or use Supabase's default email service)
3. Make sure "Enable email confirmations" is enabled

### Middleware redirects in a loop

**Cause:** Session not being properly refreshed.

**Fix:**
1. Clear browser cookies
2. Sign out completely
3. Try logging in again

---

## Security Best Practices

### 1. Use Strong Passwords
- Minimum 12 characters
- Include uppercase, lowercase, numbers, symbols
- Use a password manager

### 2. Enable MFA (Multi-Factor Authentication)
In Supabase Dashboard:
- **Authentication** > **Providers** > **Phone**
- Enable phone-based MFA

### 3. Limit Admin Users
- Only create admin users for trusted staff
- Use `manager` or `editor` roles for less privileged users
- Regularly review and remove inactive admins

### 4. Monitor Auth Logs
In Supabase Dashboard:
- **Authentication** > **Logs**
- Watch for suspicious login attempts
- Enable email notifications for new logins

### 5. Set Session Expiry
In Supabase Dashboard:
- **Settings** > **Auth** > **JWT Expiry**
- Recommended: 1 week (default)
- For high-security: 1 day

---

## Environment Variables

Make sure these are set in `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:9002
```

---

## Next Steps

After authentication is set up:

1. ✅ Test logging in and out
2. ✅ Test password reset flow
3. ✅ Create additional admin users if needed
4. ✅ Proceed to implementing admin CRUD operations for:
   - Categories
   - Menu Items
   - Modifiers
   - Promotions
   - Settings

---

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check Supabase logs: **Logs** > **All Logs**
3. Verify environment variables are correct
4. Review the middleware code in `middleware.ts`
5. Check RLS policies are properly applied

---

## Quick Reference

### Test Credentials (Development Only)

Create a test admin for development:

```sql
-- Create test admin user
-- First create in Supabase Dashboard Auth, then:
INSERT INTO admin_users (id, email, role)
VALUES ('test-uuid', 'test@elysium.local', 'admin');
```

### Useful SQL Queries

```sql
-- List all admin users
SELECT * FROM admin_users;

-- Check if user is admin
SELECT is_admin() FROM admin_users WHERE email = 'your@email.com';

-- View auth users
SELECT id, email, created_at, last_sign_in_at
FROM auth.users;

-- Delete admin user (careful!)
DELETE FROM admin_users WHERE email = 'user@example.com';
```

---

**Documentation Version:** 1.0.0
**Last Updated:** 2025-10-08
