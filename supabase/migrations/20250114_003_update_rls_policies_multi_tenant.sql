-- =====================================================
-- MIGRATION: Update RLS Policies for Multi-Tenant Support
-- Version: 1.0.0
-- Date: 2025-01-14
-- Description: Updates all RLS policies to be tenant-aware with proper data isolation
-- =====================================================

-- =====================================================
-- STEP 1: Drop existing RLS policies
-- =====================================================

-- admin_users policies
DROP POLICY IF EXISTS "admin_full_access" ON public.admin_users;
DROP POLICY IF EXISTS "manager_editor_view_only" ON public.admin_users;
DROP POLICY IF EXISTS "all_admin_update_last_login" ON public.admin_users;

-- categories policies
DROP POLICY IF EXISTS "public_view_active_categories" ON public.categories;
DROP POLICY IF EXISTS "admin_full_access_categories" ON public.categories;

-- menu_items policies
DROP POLICY IF EXISTS "public_view_available_items" ON public.menu_items;
DROP POLICY IF EXISTS "admin_full_access_menu_items" ON public.menu_items;

-- modifier_groups policies
DROP POLICY IF EXISTS "public_view_modifier_groups" ON public.modifier_groups;
DROP POLICY IF EXISTS "admin_full_access_modifier_groups" ON public.modifier_groups;

-- modifier_options policies
DROP POLICY IF EXISTS "public_view_modifier_options" ON public.modifier_options;
DROP POLICY IF EXISTS "admin_full_access_modifier_options" ON public.modifier_options;

-- menu_item_modifiers policies
DROP POLICY IF EXISTS "public_view_menu_item_modifiers" ON public.menu_item_modifiers;
DROP POLICY IF EXISTS "admin_full_access_menu_item_modifiers" ON public.menu_item_modifiers;

-- menu_item_variants policies (if they exist)
DROP POLICY IF EXISTS "public_view_menu_item_variants" ON public.menu_item_variants;
DROP POLICY IF EXISTS "admin_full_access_menu_item_variants" ON public.menu_item_variants;

-- menu_item_ingredients policies
DROP POLICY IF EXISTS "public_view_menu_item_ingredients" ON public.menu_item_ingredients;
DROP POLICY IF EXISTS "admin_full_access_menu_item_ingredients" ON public.menu_item_ingredients;

-- promotional_images policies
DROP POLICY IF EXISTS "public_view_active_promotions" ON public.promotional_images;
DROP POLICY IF EXISTS "admin_full_access_promotional_images" ON public.promotional_images;

-- =====================================================
-- STEP 2: admin_users - Tenant-Aware Policies
-- =====================================================

-- Super admins can view all admin users across all restaurants
CREATE POLICY "super_admin_view_all_users"
    ON public.admin_users
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users self
            WHERE self.id = auth.uid()
            AND self.is_super_admin = true
        )
    );

-- Restaurant admins can view users from their own restaurant
CREATE POLICY "restaurant_admin_view_own_users"
    ON public.admin_users
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users self
            WHERE self.id = auth.uid()
            AND self.restaurant_id = admin_users.restaurant_id
            AND self.role IN ('admin', 'manager')
        )
    );

-- Super admins can create users for any restaurant
CREATE POLICY "super_admin_create_users"
    ON public.admin_users
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users self
            WHERE self.id = auth.uid()
            AND self.is_super_admin = true
        )
    );

-- Restaurant admins can create users for their own restaurant
CREATE POLICY "restaurant_admin_create_users"
    ON public.admin_users
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users self
            WHERE self.id = auth.uid()
            AND self.restaurant_id = admin_users.restaurant_id
            AND self.role = 'admin'
        )
    );

-- Super admins can update any user
CREATE POLICY "super_admin_update_users"
    ON public.admin_users
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users self
            WHERE self.id = auth.uid()
            AND self.is_super_admin = true
        )
    );

-- Restaurant admins can update users in their restaurant (except other admins)
CREATE POLICY "restaurant_admin_update_users"
    ON public.admin_users
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users self
            WHERE self.id = auth.uid()
            AND self.restaurant_id = admin_users.restaurant_id
            AND self.role = 'admin'
            AND admin_users.role != 'admin' -- Can't update other admins
        )
    );

-- All admin users can update their own last_login
CREATE POLICY "all_users_update_own_last_login"
    ON public.admin_users
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid()
        AND (OLD.last_login IS DISTINCT FROM NEW.last_login)
        -- Ensure no other fields are modified
        AND OLD.email = NEW.email
        AND OLD.role = NEW.role
        AND OLD.restaurant_id = NEW.restaurant_id
    );

-- Super admins can delete users
CREATE POLICY "super_admin_delete_users"
    ON public.admin_users
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users self
            WHERE self.id = auth.uid()
            AND self.is_super_admin = true
        )
    );

-- Restaurant admins can delete non-admin users from their restaurant
CREATE POLICY "restaurant_admin_delete_users"
    ON public.admin_users
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users self
            WHERE self.id = auth.uid()
            AND self.restaurant_id = admin_users.restaurant_id
            AND self.role = 'admin'
            AND admin_users.role != 'admin'
        )
    );

-- =====================================================
-- STEP 3: categories - Tenant-Aware Policies
-- =====================================================

-- Public can view active categories for any restaurant (needed for public menu)
CREATE POLICY "public_view_active_categories"
    ON public.categories
    FOR SELECT
    USING (is_active = true);

-- Admins can view categories from their restaurant or all (if super admin)
CREATE POLICY "admin_view_categories"
    ON public.categories
    FOR SELECT
    TO authenticated
    USING (
        -- Super admin can see all
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_super_admin = true
        )
        OR
        -- Restaurant admin/staff can see their own
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.restaurant_id = categories.restaurant_id
        )
    );

-- Admins can create categories for their restaurant
CREATE POLICY "admin_create_categories"
    ON public.categories
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Super admin can create for any restaurant
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.is_super_admin = true
        )
        OR
        -- Restaurant admin can create for their restaurant
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.restaurant_id = categories.restaurant_id
            AND admin_users.role IN ('admin', 'manager', 'editor')
        )
    );

-- Admins can update categories in their restaurant
CREATE POLICY "admin_update_categories"
    ON public.categories
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = categories.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager', 'editor')
        )
    );

-- Admins can delete categories from their restaurant
CREATE POLICY "admin_delete_categories"
    ON public.categories
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = categories.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager')
        )
    );

-- =====================================================
-- STEP 4: menu_items - Tenant-Aware Policies
-- =====================================================

-- Public can view available menu items for any restaurant
CREATE POLICY "public_view_available_items"
    ON public.menu_items
    FOR SELECT
    USING (is_available = true);

-- Admins can view menu items from their restaurant or all (if super admin)
CREATE POLICY "admin_view_menu_items"
    ON public.menu_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = menu_items.restaurant_id
            )
        )
    );

-- Admins can create menu items for their restaurant
CREATE POLICY "admin_create_menu_items"
    ON public.menu_items
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = menu_items.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager', 'editor')
        )
    );

-- Admins can update menu items in their restaurant
CREATE POLICY "admin_update_menu_items"
    ON public.menu_items
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = menu_items.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager', 'editor')
        )
    );

-- Admins can delete menu items from their restaurant
CREATE POLICY "admin_delete_menu_items"
    ON public.menu_items
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = menu_items.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager')
        )
    );

-- =====================================================
-- STEP 5: modifier_groups - Tenant-Aware Policies
-- =====================================================

-- Public can view all modifier groups (needed for menu customization)
CREATE POLICY "public_view_modifier_groups"
    ON public.modifier_groups
    FOR SELECT
    USING (true);

-- Admins can view modifier groups from their restaurant or all (if super admin)
CREATE POLICY "admin_view_modifier_groups"
    ON public.modifier_groups
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = modifier_groups.restaurant_id
            )
        )
    );

-- Admins can create modifier groups for their restaurant
CREATE POLICY "admin_create_modifier_groups"
    ON public.modifier_groups
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = modifier_groups.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager', 'editor')
        )
    );

-- Admins can update modifier groups in their restaurant
CREATE POLICY "admin_update_modifier_groups"
    ON public.modifier_groups
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = modifier_groups.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager', 'editor')
        )
    );

-- Admins can delete modifier groups from their restaurant
CREATE POLICY "admin_delete_modifier_groups"
    ON public.modifier_groups
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = modifier_groups.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager')
        )
    );

-- =====================================================
-- STEP 6: modifier_options - Tenant-Aware Policies
-- =====================================================

-- Public can view all modifier options
CREATE POLICY "public_view_modifier_options"
    ON public.modifier_options
    FOR SELECT
    USING (true);

-- Admins can view modifier options from their restaurant or all (if super admin)
CREATE POLICY "admin_view_modifier_options"
    ON public.modifier_options
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = modifier_options.restaurant_id
            )
        )
    );

-- Admins can create modifier options for their restaurant
CREATE POLICY "admin_create_modifier_options"
    ON public.modifier_options
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = modifier_options.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager', 'editor')
        )
    );

-- Admins can update modifier options in their restaurant
CREATE POLICY "admin_update_modifier_options"
    ON public.modifier_options
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = modifier_options.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager', 'editor')
        )
    );

-- Admins can delete modifier options from their restaurant
CREATE POLICY "admin_delete_modifier_options"
    ON public.modifier_options
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = modifier_options.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager')
        )
    );

-- =====================================================
-- STEP 7: menu_item_modifiers - Tenant-Aware Policies
-- =====================================================

-- Public can view all menu item modifier associations
CREATE POLICY "public_view_menu_item_modifiers"
    ON public.menu_item_modifiers
    FOR SELECT
    USING (true);

-- Admins can view associations from their restaurant or all (if super admin)
CREATE POLICY "admin_view_menu_item_modifiers"
    ON public.menu_item_modifiers
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = menu_item_modifiers.restaurant_id
            )
        )
    );

-- Admins can create associations for their restaurant
CREATE POLICY "admin_create_menu_item_modifiers"
    ON public.menu_item_modifiers
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = menu_item_modifiers.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager', 'editor')
        )
    );

-- Admins can update associations in their restaurant
CREATE POLICY "admin_update_menu_item_modifiers"
    ON public.menu_item_modifiers
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = menu_item_modifiers.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager', 'editor')
        )
    );

-- Admins can delete associations from their restaurant
CREATE POLICY "admin_delete_menu_item_modifiers"
    ON public.menu_item_modifiers
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = menu_item_modifiers.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager')
        )
    );

-- =====================================================
-- STEP 8: menu_item_variants - Tenant-Aware Policies
-- =====================================================

-- Public can view all menu item variants
CREATE POLICY "public_view_menu_item_variants"
    ON public.menu_item_variants
    FOR SELECT
    USING (true);

-- Admins can view variants from their restaurant or all (if super admin)
CREATE POLICY "admin_view_menu_item_variants"
    ON public.menu_item_variants
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = menu_item_variants.restaurant_id
            )
        )
    );

-- Admins can create variants for their restaurant
CREATE POLICY "admin_create_menu_item_variants"
    ON public.menu_item_variants
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = menu_item_variants.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager', 'editor')
        )
    );

-- Admins can update variants in their restaurant
CREATE POLICY "admin_update_menu_item_variants"
    ON public.menu_item_variants
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = menu_item_variants.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager', 'editor')
        )
    );

-- Admins can delete variants from their restaurant
CREATE POLICY "admin_delete_menu_item_variants"
    ON public.menu_item_variants
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = menu_item_variants.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager')
        )
    );

-- =====================================================
-- STEP 9: menu_item_ingredients - Tenant-Aware Policies
-- =====================================================

-- Public can view ingredients for available menu items
CREATE POLICY "public_view_menu_item_ingredients"
    ON public.menu_item_ingredients
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.menu_items
            WHERE menu_items.id = menu_item_ingredients.menu_item_id
            AND menu_items.is_available = true
        )
    );

-- Admins can view ingredients from their restaurant or all (if super admin)
CREATE POLICY "admin_view_menu_item_ingredients"
    ON public.menu_item_ingredients
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = menu_item_ingredients.restaurant_id
            )
        )
    );

-- Admins can create ingredients for their restaurant
CREATE POLICY "admin_create_menu_item_ingredients"
    ON public.menu_item_ingredients
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = menu_item_ingredients.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager', 'editor')
        )
    );

-- Admins can update ingredients in their restaurant
CREATE POLICY "admin_update_menu_item_ingredients"
    ON public.menu_item_ingredients
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = menu_item_ingredients.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager', 'editor')
        )
    );

-- Admins can delete ingredients from their restaurant
CREATE POLICY "admin_delete_menu_item_ingredients"
    ON public.menu_item_ingredients
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = menu_item_ingredients.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager')
        )
    );

-- =====================================================
-- STEP 10: promotional_images - Tenant-Aware Policies
-- =====================================================

-- Public can view active promotions that are within their date range
CREATE POLICY "public_view_active_promotions"
    ON public.promotional_images
    FOR SELECT
    USING (
        is_active = true
        AND (start_date IS NULL OR start_date <= now())
        AND (end_date IS NULL OR end_date >= now())
    );

-- Admins can view promotions from their restaurant or all (if super admin)
CREATE POLICY "admin_view_promotional_images"
    ON public.promotional_images
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = promotional_images.restaurant_id
            )
        )
    );

-- Admins can create promotions for their restaurant
CREATE POLICY "admin_create_promotional_images"
    ON public.promotional_images
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = promotional_images.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager', 'editor')
        )
    );

-- Admins can update promotions in their restaurant
CREATE POLICY "admin_update_promotional_images"
    ON public.promotional_images
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = promotional_images.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager', 'editor')
        )
    );

-- Admins can delete promotions from their restaurant
CREATE POLICY "admin_delete_promotional_images"
    ON public.promotional_images
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND (
                admin_users.is_super_admin = true
                OR admin_users.restaurant_id = promotional_images.restaurant_id
            )
            AND admin_users.role IN ('super_admin', 'admin', 'manager')
        )
    );

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 20250114_003_update_rls_policies_multi_tenant.sql completed successfully';
    RAISE NOTICE '🔒 Updated RLS policies for all tables to be tenant-aware:';
    RAISE NOTICE '   - admin_users: Super admin and restaurant-scoped access';
    RAISE NOTICE '   - categories: Public view + tenant-scoped admin access';
    RAISE NOTICE '   - menu_items: Public view + tenant-scoped admin access';
    RAISE NOTICE '   - modifier_groups: Public view + tenant-scoped admin access';
    RAISE NOTICE '   - modifier_options: Public view + tenant-scoped admin access';
    RAISE NOTICE '   - menu_item_modifiers: Public view + tenant-scoped admin access';
    RAISE NOTICE '   - menu_item_variants: Public view + tenant-scoped admin access';
    RAISE NOTICE '   - menu_item_ingredients: Public view + tenant-scoped admin access';
    RAISE NOTICE '   - promotional_images: Public view with date filtering + tenant-scoped admin access';
    RAISE NOTICE '✅ All policies enforce proper data isolation between restaurants';
    RAISE NOTICE '🎯 Super admins have cross-tenant access, restaurant admins have single-tenant access';
END $$;
