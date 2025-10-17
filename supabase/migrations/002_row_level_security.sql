-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Supabase Migration: Security Policies
-- =====================================================

-- Enable Row Level Security on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PUBLIC READ ACCESS
-- Allow anonymous users to read menu data
-- =====================================================

-- Categories: Public can read active categories
CREATE POLICY "Public can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Menu Items: Public can read available items
CREATE POLICY "Public can view available menu items"
  ON menu_items FOR SELECT
  USING (is_available = true);

-- Modifier Groups: Public can read all modifier groups
CREATE POLICY "Public can view modifier groups"
  ON modifier_groups FOR SELECT
  USING (true);

-- Modifier Options: Public can read all modifier options
CREATE POLICY "Public can view modifier options"
  ON modifier_options FOR SELECT
  USING (true);

-- Menu Item Modifiers: Public can read modifier associations
CREATE POLICY "Public can view menu item modifiers"
  ON menu_item_modifiers FOR SELECT
  USING (true);

-- =====================================================
-- ADMIN WRITE ACCESS
-- Only authenticated admin users can modify data
-- =====================================================

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Categories: Admin full access
CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  USING (is_admin());

-- Admin users can also view inactive categories
CREATE POLICY "Admins can view all categories"
  ON categories FOR SELECT
  USING (is_admin());

-- Menu Items: Admin full access
CREATE POLICY "Admins can insert menu items"
  ON menu_items FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update menu items"
  ON menu_items FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete menu items"
  ON menu_items FOR DELETE
  USING (is_admin());

-- Admins can view unavailable items
CREATE POLICY "Admins can view all menu items"
  ON menu_items FOR SELECT
  USING (is_admin());

-- Modifier Groups: Admin full access
CREATE POLICY "Admins can insert modifier groups"
  ON modifier_groups FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update modifier groups"
  ON modifier_groups FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete modifier groups"
  ON modifier_groups FOR DELETE
  USING (is_admin());

-- Modifier Options: Admin full access
CREATE POLICY "Admins can insert modifier options"
  ON modifier_options FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update modifier options"
  ON modifier_options FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete modifier options"
  ON modifier_options FOR DELETE
  USING (is_admin());

-- Menu Item Modifiers: Admin full access
CREATE POLICY "Admins can insert menu item modifiers"
  ON menu_item_modifiers FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update menu item modifiers"
  ON menu_item_modifiers FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete menu item modifiers"
  ON menu_item_modifiers FOR DELETE
  USING (is_admin());

-- =====================================================
-- ADMIN USERS TABLE POLICIES
-- =====================================================

-- Only super admins can manage admin users
CREATE POLICY "Super admins can view admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Super admins can insert admin users"
  ON admin_users FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Super admins can update admin users"
  ON admin_users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update their own last_login
CREATE POLICY "Admins can update own last_login"
  ON admin_users FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =====================================================
-- STORAGE POLICIES (for menu images)
-- =====================================================

-- Note: This assumes a storage bucket named 'menu-images' exists
-- Create bucket command (run separately in Supabase dashboard or CLI):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('menu-images', 'menu-images', true);

-- Public can read images
-- CREATE POLICY "Public can view menu images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'menu-images');

-- Admins can upload/update/delete images
-- CREATE POLICY "Admins can manage menu images"
--   ON storage.objects FOR ALL
--   USING (bucket_id = 'menu-images' AND is_admin())
--   WITH CHECK (bucket_id = 'menu-images' AND is_admin());

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON FUNCTION is_admin() IS 'Helper function to check if current user is an authenticated admin';
