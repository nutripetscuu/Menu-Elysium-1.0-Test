-- =====================================================
-- ROLLBACK: Revert RLS Policies to Single-Tenant
-- Version: 1.0.0
-- Date: 2025-01-14
-- Description: Rolls back multi-tenant RLS policies to original single-tenant policies
-- WARNING: Only run this if you need to revert the multi-tenant migration
-- =====================================================

-- Drop all multi-tenant policies
DROP POLICY IF EXISTS "super_admin_view_all_users" ON public.admin_users;
DROP POLICY IF EXISTS "restaurant_admin_view_own_users" ON public.admin_users;
DROP POLICY IF EXISTS "super_admin_create_users" ON public.admin_users;
DROP POLICY IF EXISTS "restaurant_admin_create_users" ON public.admin_users;
DROP POLICY IF EXISTS "super_admin_update_users" ON public.admin_users;
DROP POLICY IF EXISTS "restaurant_admin_update_users" ON public.admin_users;
DROP POLICY IF EXISTS "all_users_update_own_last_login" ON public.admin_users;
DROP POLICY IF EXISTS "super_admin_delete_users" ON public.admin_users;
DROP POLICY IF EXISTS "restaurant_admin_delete_users" ON public.admin_users;

DROP POLICY IF EXISTS "public_view_active_categories" ON public.categories;
DROP POLICY IF EXISTS "admin_view_categories" ON public.categories;
DROP POLICY IF EXISTS "admin_create_categories" ON public.categories;
DROP POLICY IF EXISTS "admin_update_categories" ON public.categories;
DROP POLICY IF EXISTS "admin_delete_categories" ON public.categories;

DROP POLICY IF EXISTS "public_view_available_items" ON public.menu_items;
DROP POLICY IF EXISTS "admin_view_menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "admin_create_menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "admin_update_menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "admin_delete_menu_items" ON public.menu_items;

DROP POLICY IF EXISTS "public_view_modifier_groups" ON public.modifier_groups;
DROP POLICY IF EXISTS "admin_view_modifier_groups" ON public.modifier_groups;
DROP POLICY IF EXISTS "admin_create_modifier_groups" ON public.modifier_groups;
DROP POLICY IF EXISTS "admin_update_modifier_groups" ON public.modifier_groups;
DROP POLICY IF EXISTS "admin_delete_modifier_groups" ON public.modifier_groups;

DROP POLICY IF EXISTS "public_view_modifier_options" ON public.modifier_options;
DROP POLICY IF EXISTS "admin_view_modifier_options" ON public.modifier_options;
DROP POLICY IF EXISTS "admin_create_modifier_options" ON public.modifier_options;
DROP POLICY IF EXISTS "admin_update_modifier_options" ON public.modifier_options;
DROP POLICY IF EXISTS "admin_delete_modifier_options" ON public.modifier_options;

DROP POLICY IF EXISTS "public_view_menu_item_modifiers" ON public.menu_item_modifiers;
DROP POLICY IF EXISTS "admin_view_menu_item_modifiers" ON public.menu_item_modifiers;
DROP POLICY IF EXISTS "admin_create_menu_item_modifiers" ON public.menu_item_modifiers;
DROP POLICY IF EXISTS "admin_update_menu_item_modifiers" ON public.menu_item_modifiers;
DROP POLICY IF EXISTS "admin_delete_menu_item_modifiers" ON public.menu_item_modifiers;

DROP POLICY IF EXISTS "public_view_menu_item_variants" ON public.menu_item_variants;
DROP POLICY IF EXISTS "admin_view_menu_item_variants" ON public.menu_item_variants;
DROP POLICY IF EXISTS "admin_create_menu_item_variants" ON public.menu_item_variants;
DROP POLICY IF EXISTS "admin_update_menu_item_variants" ON public.menu_item_variants;
DROP POLICY IF EXISTS "admin_delete_menu_item_variants" ON public.menu_item_variants;

DROP POLICY IF EXISTS "public_view_menu_item_ingredients" ON public.menu_item_ingredients;
DROP POLICY IF EXISTS "admin_view_menu_item_ingredients" ON public.menu_item_ingredients;
DROP POLICY IF EXISTS "admin_create_menu_item_ingredients" ON public.menu_item_ingredients;
DROP POLICY IF EXISTS "admin_update_menu_item_ingredients" ON public.menu_item_ingredients;
DROP POLICY IF EXISTS "admin_delete_menu_item_ingredients" ON public.menu_item_ingredients;

DROP POLICY IF EXISTS "public_view_active_promotions" ON public.promotional_images;
DROP POLICY IF EXISTS "admin_view_promotional_images" ON public.promotional_images;
DROP POLICY IF EXISTS "admin_create_promotional_images" ON public.promotional_images;
DROP POLICY IF EXISTS "admin_update_promotional_images" ON public.promotional_images;
DROP POLICY IF EXISTS "admin_delete_promotional_images" ON public.promotional_images;

-- Restore original single-tenant policies
-- admin_users
CREATE POLICY "admin_full_access"
    ON public.admin_users
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.id = auth.uid() AND au.role = 'admin'
        )
    );

CREATE POLICY "manager_editor_view_only"
    ON public.admin_users
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users au
            WHERE au.id = auth.uid() AND au.role IN ('manager', 'editor')
        )
    );

CREATE POLICY "all_admin_update_last_login"
    ON public.admin_users
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- categories
CREATE POLICY "public_view_active_categories"
    ON public.categories
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "admin_full_access_categories"
    ON public.categories
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
        )
    );

-- menu_items
CREATE POLICY "public_view_available_items"
    ON public.menu_items
    FOR SELECT
    USING (is_available = true);

CREATE POLICY "admin_full_access_menu_items"
    ON public.menu_items
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
        )
    );

-- modifier_groups
CREATE POLICY "public_view_modifier_groups"
    ON public.modifier_groups
    FOR SELECT
    USING (true);

CREATE POLICY "admin_full_access_modifier_groups"
    ON public.modifier_groups
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
        )
    );

-- modifier_options
CREATE POLICY "public_view_modifier_options"
    ON public.modifier_options
    FOR SELECT
    USING (true);

CREATE POLICY "admin_full_access_modifier_options"
    ON public.modifier_options
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
        )
    );

-- menu_item_modifiers
CREATE POLICY "public_view_menu_item_modifiers"
    ON public.menu_item_modifiers
    FOR SELECT
    USING (true);

CREATE POLICY "admin_full_access_menu_item_modifiers"
    ON public.menu_item_modifiers
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
        )
    );

-- menu_item_variants
CREATE POLICY "public_view_menu_item_variants"
    ON public.menu_item_variants
    FOR SELECT
    USING (true);

CREATE POLICY "admin_full_access_menu_item_variants"
    ON public.menu_item_variants
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
        )
    );

-- menu_item_ingredients
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

CREATE POLICY "admin_full_access_menu_item_ingredients"
    ON public.menu_item_ingredients
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
        )
    );

-- promotional_images
CREATE POLICY "public_view_active_promotions"
    ON public.promotional_images
    FOR SELECT
    USING (
        is_active = true
        AND (start_date IS NULL OR start_date <= now())
        AND (end_date IS NULL OR end_date >= now())
    );

CREATE POLICY "admin_full_access_promotional_images"
    ON public.promotional_images
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
        )
    );

DO $$
BEGIN
    RAISE NOTICE '✅ Rollback completed: RLS policies reverted to single-tenant';
END $$;
