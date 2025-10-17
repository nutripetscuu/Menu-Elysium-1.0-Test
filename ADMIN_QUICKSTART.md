# Admin Panel - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Create Your First Admin User

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Navigate to your project** → **Authentication** → **Users**
3. **Click "Add User"** → **Create new user**
4. Enter:
   - Email: `admin@elysium.com` (or your email)
   - Password: (set a strong password)
5. **Copy the User UUID** (you'll need it next)

6. **Go to SQL Editor** and run:

```sql
INSERT INTO admin_users (id, email, role)
VALUES ('YOUR_USER_UUID_HERE', 'admin@elysium.com', 'admin');
```

### Step 2: Start the Development Server

```bash
npm run dev
```

### Step 3: Access the Admin Panel

1. Open http://localhost:9002/login
2. Sign in with your credentials
3. You'll be redirected to the admin dashboard!

---

## 🎯 What's Available Now

✅ **Login/Logout** - Secure authentication
✅ **Route Protection** - `/admin` routes are protected
✅ **Password Reset** - Email-based password recovery
✅ **Admin Dashboard** - Overview and quick stats
✅ **Admin Layout** - Sidebar navigation and user menu
✅ **RLS Security** - Database-level access control

---

## 📍 Admin Routes

| Route | Description |
|-------|-------------|
| `/login` | Login page |
| `/reset-password` | Password reset |
| `/admin/dashboard` | Main dashboard |
| `/admin/categories` | Manage categories *(to be implemented)* |
| `/admin/menu-items` | Manage menu items *(to be implemented)* |
| `/admin/modifiers` | Manage modifiers *(to be implemented)* |
| `/admin/promotions` | Manage promotional images *(to be implemented)* |
| `/admin/settings` | Restaurant settings *(to be implemented)* |
| `/admin/users` | Manage admin users *(to be implemented)* |

---

## 🔒 Admin Roles

| Role | Permissions |
|------|-------------|
| **admin** | Full access - can manage everything including other admins |
| **manager** | Can manage menu, modifiers, promotions, settings (no user management) |
| **editor** | Can manage menu items and promotions only |

---

## 🆘 Troubleshooting

### "You do not have admin access"

Your user exists in Supabase Auth but not in `admin_users` table. Run this:

```sql
-- Check auth users
SELECT id, email FROM auth.users;

-- Add to admin_users (use the id from above)
INSERT INTO admin_users (id, email, role)
VALUES ('user-id-here', 'your-email@example.com', 'admin');
```

### Can't log in

1. Check that `.env.local` has correct Supabase credentials
2. Verify user exists in **both** Supabase Auth and `admin_users` table
3. Clear browser cookies and try again

### Middleware redirect loop

1. Clear cookies
2. Sign out completely
3. Restart dev server

---

## 📖 Full Documentation

- **Setup Guide**: `docs/ADMIN_AUTH_SETUP.md`
- **Implementation Summary**: `docs/AUTH_IMPLEMENTATION_SUMMARY.md`
- **Architecture**: `docs/ADMIN_PANEL_ARCHITECTURE.md`

---

## 🎉 Ready to Go!

Authentication is complete. You can now start building CRUD operations for:
- Categories
- Menu Items
- Modifiers
- Promotions
- Settings

Happy coding! 🚀
