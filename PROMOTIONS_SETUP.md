# Promotional Images Setup Guide

This guide walks you through setting up the Promotional Images management system.

## 🎯 What You Get

- ✅ Grid view of promotional banners
- ✅ Drag-and-drop reordering
- ✅ Image upload to Supabase Storage
- ✅ Active/inactive toggle
- ✅ Optional scheduling (start/end dates)
- ✅ Optional overlay text (title/description)
- ✅ Optional links (external URLs)

## 📋 Setup Steps

### Step 1: Apply Database Migration

Run this migration to create the `promotional_images` table:

```bash
# In Supabase Dashboard > SQL Editor, run:
supabase/migrations/007_create_promotional_images.sql
```

Or manually execute the SQL in your Supabase dashboard.

**What this does:**
- Creates `promotional_images` table with proper schema
- Migrates data from old "Header Images" table (if it exists)
- Sets up Row Level Security (RLS) policies
- Creates indexes for performance

### Step 2: Create Supabase Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Configure:
   - **Name:** `promotional-images`
   - **Public bucket:** ✅ **Yes** (images need to be publicly accessible)
   - **File size limit:** 5MB
   - **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`

4. Click **"Create bucket"**

### Step 3: Set Up Storage Policies

In **Supabase Dashboard** → **Storage** → **promotional-images** → **Policies**:

**Policy 1: Public Read Access**
```sql
CREATE POLICY "Public can view promotional images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'promotional-images');
```

**Policy 2: Admin Upload Access**
```sql
CREATE POLICY "Admins can upload promotional images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'promotional-images'
    AND auth.uid() IN (SELECT id FROM admin_users)
  );
```

**Policy 3: Admin Update/Delete Access**
```sql
CREATE POLICY "Admins can manage promotional images"
  ON storage.objects FOR UPDATE, DELETE
  USING (
    bucket_id = 'promotional-images'
    AND auth.uid() IN (SELECT id FROM admin_users)
  );
```

### Step 4: Verify Setup

1. **Check table exists:**
   ```sql
   SELECT * FROM promotional_images LIMIT 5;
   ```

2. **Check bucket exists:**
   - Go to Storage → You should see `promotional-images` bucket

3. **Test upload:**
   - Navigate to `http://localhost:9002/admin/promotions`
   - Click "Add Promotion"
   - Try uploading an image

## 🎨 Usage

### Access the Promotions Page

Navigate to: `http://localhost:9002/admin/promotions`

Or click **"Promotions"** in the admin sidebar.

### Add a New Promotion

1. Click **"Add Promotion"** button
2. Upload an image (drag & drop or click)
3. Add optional details:
   - Title (overlay text)
   - Description
   - Link URL
   - Schedule (start/end dates)
4. Toggle **Active** to show on homepage
5. Click **"Create Promotion"**

### Reorder Promotions

Simply **drag and drop** promotions to change their order. Lower positions appear first in the carousel.

### Edit/Delete Promotions

Use the action buttons (Eye, Edit, Trash) on each promotion card.

## 📐 Image Specifications

**Recommended Size:** 1920x600px (16:9 aspect ratio)

**Supported Formats:**
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- WebP (`.webp`)

**Max File Size:** 5MB

**Tips:**
- Use high-quality images
- Optimize before uploading (use tools like TinyPNG)
- Ensure text is readable if adding overlay
- Test on mobile devices

## 🔒 Security Features

### Row Level Security (RLS)

- ✅ Public can only view **active** promotions within scheduled dates
- ✅ Admins can view/create/update/delete all promotions
- ✅ Database-level security (protects even if API has bugs)

### Storage Security

- ✅ Public can view images (read-only)
- ✅ Only admins can upload/delete images
- ✅ File type validation (images only)
- ✅ File size limits (5MB max)

## 🔗 API Reference

The Promotions API is located at `src/lib/api/promotions.ts`:

**Available Methods:**
- `getAllPromotions()` - Get all (admin view)
- `getActivePromotions()` - Get active only (public view)
- `createPromotion(data)` - Create new promotion
- `updatePromotion(id, data)` - Update promotion
- `deletePromotion(id)` - Delete promotion
- `reorderPromotions(ids)` - Update display order
- `togglePromotionStatus(id)` - Toggle active/inactive
- `uploadImage(file)` - Upload to Supabase Storage

## 🎯 Integration with Public Menu

The public menu automatically displays active promotional images in the carousel.

**To integrate:**

```typescript
import { PromotionsAPI } from '@/lib/api/promotions';

// In your homepage component
const { data: promotions } = await PromotionsAPI.getActivePromotions();

// promotions array contains only active images within scheduled dates
```

## 🐛 Troubleshooting

### Issue: "Bucket not found"

**Solution:** Make sure the storage bucket `promotional-images` is created in Supabase Dashboard.

### Issue: "Permission denied" when uploading

**Solution:**
1. Check that storage policies are set up correctly
2. Verify you're logged in as an admin user
3. Check that your admin user exists in `admin_users` table

### Issue: Images not showing on public menu

**Solution:**
1. Check that promotion `is_active = true`
2. Verify dates (start_date/end_date) if set
3. Check RLS policies allow public read access
4. Verify image URL is valid

### Issue: Old "Header Images" data not migrated

**Solution:** The migration automatically migrates data if the old table exists. If you need to manually migrate:

```sql
INSERT INTO promotional_images (image_url, position, is_active)
SELECT "Image url", ROW_NUMBER() OVER (ORDER BY created_at), true
FROM "Header Images";
```

## 📊 Database Schema

```sql
promotional_images (
  id UUID PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  link_url TEXT,
  link_menu_item_id UUID (FK to menu_items),
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

## ✅ Checklist

- [ ] Applied database migration `007_create_promotional_images.sql`
- [ ] Created `promotional-images` storage bucket (public)
- [ ] Set up storage policies (public read, admin write)
- [ ] Tested upload functionality
- [ ] Verified drag-and-drop reordering works
- [ ] Checked promotions appear on public menu
- [ ] Tested active/inactive toggle
- [ ] Tested edit/delete functionality

---

**Status:** Production Ready
**Feature:** Complete
**Next Steps:** Begin using the Promotions page to add carousel banners!
