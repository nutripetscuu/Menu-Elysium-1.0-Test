-- =====================================================
-- PROMOTIONAL IMAGES TABLE
-- Replaces the manually created "Header Images" table
-- with proper schema and security
-- =====================================================

-- Create promotional_images table
CREATE TABLE IF NOT EXISTS promotional_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Image information
  image_url TEXT NOT NULL,
  title TEXT,
  description TEXT,

  -- Optional features
  link_url TEXT, -- Link to menu item or external URL
  link_menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,

  -- Display control
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,

  -- Scheduling (optional)
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT check_dates CHECK (
    (start_date IS NULL OR end_date IS NULL) OR
    (start_date < end_date)
  )
);

-- Index for active promotions ordered by position
CREATE INDEX idx_promotional_images_active ON promotional_images(is_active, position)
  WHERE is_active = true;

-- Index for scheduled promotions
CREATE INDEX idx_promotional_images_schedule ON promotional_images(start_date, end_date)
  WHERE start_date IS NOT NULL OR end_date IS NOT NULL;

-- Auto-update updated_at timestamp
CREATE TRIGGER update_promotional_images_updated_at
  BEFORE UPDATE ON promotional_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE promotional_images IS 'Promotional banner/carousel images for the menu homepage';
COMMENT ON COLUMN promotional_images.link_menu_item_id IS 'Optional link to a specific menu item';
COMMENT ON COLUMN promotional_images.position IS 'Display order in carousel (lower numbers appear first)';

-- =====================================================
-- MIGRATE DATA FROM OLD "Header Images" TABLE
-- =====================================================

-- Only run if old table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'Header Images'
  ) THEN
    -- Migrate existing data
    INSERT INTO promotional_images (image_url, position, is_active, created_at)
    SELECT
      "Image url" as image_url,
      ROW_NUMBER() OVER (ORDER BY created_at) - 1 as position,
      COALESCE(is_active, true) as is_active,
      created_at
    FROM "Header Images"
    ON CONFLICT DO NOTHING;

    -- Log migration
    RAISE NOTICE 'Migrated % rows from "Header Images" to promotional_images',
      (SELECT COUNT(*) FROM "Header Images");
  ELSE
    RAISE NOTICE '"Header Images" table does not exist, skipping migration';
  END IF;
END $$;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE promotional_images ENABLE ROW LEVEL SECURITY;

-- Public can view active promotions that are currently scheduled
CREATE POLICY "Public can view active promotions"
  ON promotional_images
  FOR SELECT
  USING (
    is_active = true AND
    (start_date IS NULL OR start_date <= NOW()) AND
    (end_date IS NULL OR end_date >= NOW())
  );

-- Admins can view all promotions
CREATE POLICY "Admins can view all promotions"
  ON promotional_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- Admins can insert promotions
CREATE POLICY "Admins can create promotions"
  ON promotional_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- Admins can update promotions
CREATE POLICY "Admins can update promotions"
  ON promotional_images
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- Admins can delete promotions
CREATE POLICY "Admins can delete promotions"
  ON promotional_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid()
    )
  );

-- =====================================================
-- STORAGE BUCKET SETUP INSTRUCTIONS
-- =====================================================

-- Run these commands in Supabase Dashboard > Storage:
-- 1. Create bucket named "promotional-images" with public access
-- 2. Set max file size to 5MB
-- 3. Allowed file types: image/jpeg, image/png, image/webp

-- Storage policies will need to be set up in the Supabase dashboard:
-- Policy 1: Public can view images
--   SELECT on storage.objects where bucket_id = 'promotional-images'
--
-- Policy 2: Admins can upload images
--   INSERT on storage.objects where bucket_id = 'promotional-images'
--   and auth.uid() IN (SELECT id FROM admin_users)
--
-- Policy 3: Admins can update/delete images
--   UPDATE/DELETE on storage.objects where bucket_id = 'promotional-images'
--   and auth.uid() IN (SELECT id FROM admin_users)
