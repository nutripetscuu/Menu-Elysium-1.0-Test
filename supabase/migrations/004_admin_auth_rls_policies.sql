-- =====================================================
-- ADMIN AUTHENTICATION & RLS POLICIES
-- Migration: 004 - Enhanced RLS for Admin Panel
-- =====================================================

-- Helper function: Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if user has specific role
CREATE OR REPLACE FUNCTION has_admin_role(required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
    AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CATEGORIES RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view active categories" ON categories;
DROP POLICY IF EXISTS "Allow public read on categories" ON categories;
DROP POLICY IF EXISTS "Allow admin full access on categories" ON categories;

-- Public can view active categories
CREATE POLICY "Public can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Admins can view all categories
CREATE POLICY "Admins can view all categories"
  ON categories FOR SELECT
  USING (is_admin());

-- Admins can insert categories
CREATE POLICY "Admins can create categories"
  ON categories FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update categories
CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete categories
CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  USING (is_admin());

-- =====================================================
-- MENU ITEMS RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view available menu items" ON menu_items;
DROP POLICY IF EXISTS "Allow public read on menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow admin full access on menu_items" ON menu_items;

-- Public can view available items
CREATE POLICY "Public can view available menu items"
  ON menu_items FOR SELECT
  USING (is_available = true);

-- Admins can view all items
CREATE POLICY "Admins can view all menu items"
  ON menu_items FOR SELECT
  USING (is_admin());

-- Admins can insert items
CREATE POLICY "Admins can create menu items"
  ON menu_items FOR INSERT
  WITH CHECK (is_admin());

-- Admins can update items
CREATE POLICY "Admins can update menu items"
  ON menu_items FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- Admins can delete items
CREATE POLICY "Admins can delete menu items"
  ON menu_items FOR DELETE
  USING (is_admin());

-- =====================================================
-- MODIFIER GROUPS RLS POLICIES
-- =====================================================

-- Public can view all modifier groups (needed for customization)
CREATE POLICY "Public can view modifier groups"
  ON modifier_groups FOR SELECT
  USING (true);

-- Admins can manage modifier groups
CREATE POLICY "Admins can create modifier groups"
  ON modifier_groups FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update modifier groups"
  ON modifier_groups FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete modifier groups"
  ON modifier_groups FOR DELETE
  USING (is_admin());

-- =====================================================
-- MODIFIER OPTIONS RLS POLICIES
-- =====================================================

-- Public can view all modifier options
CREATE POLICY "Public can view modifier options"
  ON modifier_options FOR SELECT
  USING (true);

-- Admins can manage modifier options
CREATE POLICY "Admins can create modifier options"
  ON modifier_options FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update modifier options"
  ON modifier_options FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete modifier options"
  ON modifier_options FOR DELETE
  USING (is_admin());

-- =====================================================
-- MENU ITEM MODIFIERS RLS POLICIES
-- =====================================================

-- Public can view linkages
CREATE POLICY "Public can view menu item modifiers"
  ON menu_item_modifiers FOR SELECT
  USING (true);

-- Admins can manage linkages
CREATE POLICY "Admins can create menu item modifiers"
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
-- ADMIN USERS RLS POLICIES
-- =====================================================

-- Admins can view all admin users
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  USING (is_admin());

-- Only super admins (role = 'admin') can manage admin users
CREATE POLICY "Super admins can create admin users"
  ON admin_users FOR INSERT
  WITH CHECK (has_admin_role('admin'));

CREATE POLICY "Super admins can update admin users"
  ON admin_users FOR UPDATE
  USING (has_admin_role('admin'))
  WITH CHECK (has_admin_role('admin'));

CREATE POLICY "Super admins can delete admin users"
  ON admin_users FOR DELETE
  USING (has_admin_role('admin'));

-- =====================================================
-- HEADER IMAGES (PROMOTIONAL IMAGES) RLS POLICIES
-- =====================================================

-- Enable RLS on Header Images table
ALTER TABLE "Header Images" ENABLE ROW LEVEL SECURITY;

-- Public can view all header images
CREATE POLICY "Public can view header images"
  ON "Header Images" FOR SELECT
  USING (true);

-- Admins can manage header images
CREATE POLICY "Admins can create header images"
  ON "Header Images" FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update header images"
  ON "Header Images" FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete header images"
  ON "Header Images" FOR DELETE
  USING (is_admin());

-- =====================================================
-- COMMENTS & METADATA
-- =====================================================

COMMENT ON FUNCTION is_admin() IS 'Helper function to check if current user is an admin';
COMMENT ON FUNCTION has_admin_role(TEXT) IS 'Helper function to check if current user has a specific admin role';

-- =====================================================
-- REALTIME ENABLEMENT
-- =====================================================

-- Enable realtime for all tables so admin changes reflect immediately on public menu
-- Note: Run these individually in Supabase SQL Editor if needed
-- ALTER PUBLICATION supabase_realtime ADD TABLE categories;
-- ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
-- ALTER PUBLICATION supabase_realtime ADD TABLE modifier_groups;
-- ALTER PUBLICATION supabase_realtime ADD TABLE modifier_options;
-- ALTER PUBLICATION supabase_realtime ADD TABLE menu_item_modifiers;
-- ALTER PUBLICATION supabase_realtime ADD TABLE "Header Images";

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Run these to verify policies are working:
-- 1. Check if is_admin() function exists
-- SELECT proname FROM pg_proc WHERE proname = 'is_admin';

-- 2. List all policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- 3. Test public access (should only see active/available items)
-- SET ROLE anon;
-- SELECT * FROM categories; -- Should only return is_active = true
-- SELECT * FROM menu_items; -- Should only return is_available = true
-- RESET ROLE;
