# Supabase Setup Guide - Elysium Restaurant Menu

Complete guide to setting up Supabase for the Elysium restaurant menu system.

---

## Prerequisites

- [Supabase Account](https://supabase.com) (free tier works)
- Node.js 18+ installed
- Git repository access

---

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in project details:
   - **Name:** `elysium-menu`
   - **Database Password:** (generate a strong password - save it!)
   - **Region:** Choose closest to your users
4. Click **"Create new project"**
5. Wait for project initialization (~2 minutes)

---

## Step 2: Get API Credentials

1. In your Supabase project dashboard, go to **Settings → API**
2. Copy the following credentials:

```bash
# .env.local (create this file in project root)
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **Important:**
- `ANON_KEY` - Public key (safe for frontend)
- `SERVICE_ROLE_KEY` - **SECRET** - Never commit to Git! (used for data migration only)

---

## Step 3: Run Database Migrations

### Option A: Supabase SQL Editor (Recommended)

1. Go to **SQL Editor** in Supabase dashboard
2. Create a new query
3. Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Click **"Run"**
5. Repeat for:
   - `002_row_level_security.sql`
   - `003_seed_modifier_groups.sql`

### Option B: Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

---

## Step 4: Create Storage Bucket for Images

1. Go to **Storage** in Supabase dashboard
2. Click **"New bucket"**
3. Configure bucket:
   - **Name:** `menu-images`
   - **Public bucket:** ✅ Enabled
   - Click **"Create bucket"**

4. Add storage policies (SQL Editor):
```sql
-- Public can view images
CREATE POLICY "Public can view menu images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-images');

-- Admins can upload/delete images (you'll need to be authenticated)
CREATE POLICY "Admins can manage menu images"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'menu-images'
    AND EXISTS (
      SELECT 1 FROM admin_users WHERE id = auth.uid()
    )
  );
```

---

## Step 5: Migrate Menu Data

### Install Dependencies
```bash
npm install @supabase/supabase-js
npm install --save-dev ts-node
```

### Run Migration Script
```bash
# Make sure .env.local is configured with SUPABASE_SERVICE_ROLE_KEY
npx ts-node scripts/migrate-menu-data.ts
```

### Expected Output
```
🚀 Starting menu data migration...

📁 Migrating categories...
✅ Migrated category: Calientes (calientes -> uuid-1234...)
✅ Migrated category: Frappés (frappes -> uuid-5678...)
...

✅ Successfully migrated 9 categories

🍽️  Migrating menu items...
✅ Migrated: Espresso (Calientes)
✅ Migrated: Americano (Calientes)
...

✅ Successfully migrated 67 menu items

🎉 Migration completed successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Summary:
   Categories: 9
   Menu Items: 67
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Step 6: Verify Data

### Check Tables in Supabase Dashboard

1. Go to **Table Editor**
2. Verify tables exist:
   - ✅ `categories` (should have 9 rows)
   - ✅ `menu_items` (should have ~67 rows)
   - ✅ `modifier_groups` (should have ~20 rows)
   - ✅ `modifier_options` (should have ~80+ rows)
   - ✅ `menu_item_modifiers` (should have many rows)
   - ✅ `admin_users` (empty - you'll add admins next)

### Test Query in SQL Editor
```sql
-- Get all categories with item counts
SELECT
  c.name,
  c.icon,
  COUNT(mi.id) as item_count
FROM categories c
LEFT JOIN menu_items mi ON mi.category_id = c.id
GROUP BY c.id, c.name, c.icon
ORDER BY c.position;
```

---

## Step 7: Create Admin User

### Option A: Manual Insert (SQL Editor)
```sql
-- Replace with your actual Supabase Auth user ID
INSERT INTO admin_users (id, email, role) VALUES
('your-auth-uid-here', 'admin@elysium.com', 'admin');
```

### Option B: Sign Up + Manual Link
1. Create a user via Supabase Auth (Authentication → Users → Add User)
2. Get the user's UUID
3. Insert into `admin_users` table

---

## Step 8: Test Frontend Integration

Update your Next.js app to use Supabase:

### Update `src/lib/api/menu.ts`
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export class MenuAPI {
  static async getMenuWithCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        items:menu_items(
          *,
          modifiers:menu_item_modifiers(
            modifier_group_id,
            position
          )
        )
      `)
      .eq('is_active', true)
      .order('position');

    if (error) {
      return { data: null, error: error.message, success: false };
    }

    return { data, error: null, success: true };
  }
}
```

### Test the App
```bash
npm run dev
```

Visit http://localhost:9002 and verify:
- ✅ Categories load from Supabase
- ✅ Menu items display correctly
- ✅ Modifiers appear in product modals

---

## Step 9: Configure RLS Policies (Already Done)

RLS policies are already set up by migration `002_row_level_security.sql`:

- ✅ Public can read active categories
- ✅ Public can read available menu items
- ✅ Public can read modifier groups and options
- ✅ Admins can manage all data
- ✅ Super admins can manage admin users

---

## Step 10: Optional - Upload Images

### Using Supabase Dashboard
1. Go to **Storage → menu-images**
2. Click **"Upload file"**
3. Upload menu item images (JPEG, PNG, WebP)
4. Copy the public URL
5. Update `menu_items.image_url` in Table Editor

### Using Script (Future)
```typescript
const { data, error } = await supabase.storage
  .from('menu-images')
  .upload(`${itemId}.jpg`, file, {
    cacheControl: '3600',
    upsert: false
  });

const imageUrl = supabase.storage
  .from('menu-images')
  .getPublicUrl(data.path).data.publicUrl;
```

---

## Troubleshooting

### Issue: Migration fails with "relation already exists"
**Solution:** Drop tables and re-run migrations
```sql
DROP TABLE IF EXISTS menu_item_modifiers CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS modifier_options CASCADE;
DROP TABLE IF EXISTS modifier_groups CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
```

### Issue: RLS blocks admin operations
**Solution:** Make sure admin user exists in `admin_users` table and matches Supabase Auth UID

### Issue: Images not loading
**Solution:**
1. Check bucket is public
2. Check storage policies exist
3. Verify image URL format: `https://yourproject.supabase.co/storage/v1/object/public/menu-images/filename.jpg`

### Issue: Migration script can't connect
**Solution:**
1. Check `.env.local` has correct credentials
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is the **service role key**, not anon key
3. Check firewall/network isn't blocking Supabase connection

---

## Rollback (if needed)

To rollback the migration and start fresh:

```bash
npx ts-node scripts/migrate-menu-data.ts --rollback
```

This deletes all migrated data (categories, menu items, and their linkages).

---

## Next Steps

1. ✅ **Build Admin Panel** - Create CRUD interface for managing menu items
2. ✅ **Add Image Upload** - Integrate image uploads in admin panel
3. ✅ **Analytics Dashboard** - Track popular items and modifiers
4. ✅ **Order System** - Add cart and order management
5. ✅ **Multi-language** - Add i18n support for Spanish/English

---

## Support

- **Supabase Docs:** https://supabase.com/docs
- **Project Issues:** https://github.com/your-repo/issues
- **Database Schema:** See `docs/DATABASE_SCHEMA.md`

---

**Setup Complete!** 🎉

Your Elysium menu is now powered by Supabase with:
- ✅ Normalized database schema
- ✅ Row Level Security
- ✅ 67 menu items migrated
- ✅ 20+ modifier groups
- ✅ Admin access control ready
- ✅ Image storage configured
