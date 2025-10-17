-- =====================================================
-- MIGRATION: Add restaurant_id to All Tables
-- Version: 1.0.0
-- Date: 2025-01-14
-- Description: Adds restaurant_id column to all tenant-specific tables for multi-tenant support
-- =====================================================

-- =====================================================
-- STEP 1: Update admin_users table
-- =====================================================

-- Add restaurant_id and super_admin support to admin_users
ALTER TABLE public.admin_users
    ADD COLUMN restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE,
    ADD COLUMN is_super_admin BOOLEAN NOT NULL DEFAULT false;

-- Update role check constraint to include super_admin
ALTER TABLE public.admin_users
    DROP CONSTRAINT IF EXISTS admin_users_role_check;

ALTER TABLE public.admin_users
    ADD CONSTRAINT admin_users_role_check
    CHECK (role IN ('super_admin', 'admin', 'manager', 'editor'));

-- Create index for restaurant-based queries
CREATE INDEX idx_admin_users_restaurant_id ON public.admin_users(restaurant_id) WHERE restaurant_id IS NOT NULL;
CREATE INDEX idx_admin_users_super_admin ON public.admin_users(is_super_admin) WHERE is_super_admin = true;

COMMENT ON COLUMN public.admin_users.restaurant_id IS 'Links admin user to a specific restaurant. NULL for super_admins who can access all restaurants';
COMMENT ON COLUMN public.admin_users.is_super_admin IS 'Platform super admin flag. Super admins can manage all restaurants and have full system access';

-- =====================================================
-- STEP 2: Add restaurant_id to categories table
-- =====================================================

ALTER TABLE public.categories
    ADD COLUMN restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- Create index for tenant-specific queries
CREATE INDEX idx_categories_restaurant_id ON public.categories(restaurant_id, position);
CREATE INDEX idx_categories_restaurant_active ON public.categories(restaurant_id, is_active);

-- Update unique constraint to be per-restaurant
ALTER TABLE public.categories
    DROP CONSTRAINT IF EXISTS categories_name_key;

CREATE UNIQUE INDEX idx_categories_name_per_restaurant
    ON public.categories(restaurant_id, LOWER(name))
    WHERE restaurant_id IS NOT NULL;

COMMENT ON COLUMN public.categories.restaurant_id IS 'Links category to a specific restaurant for multi-tenant data isolation';

-- =====================================================
-- STEP 3: Add restaurant_id to menu_items table
-- =====================================================

ALTER TABLE public.menu_items
    ADD COLUMN restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- Create indexes for tenant-specific queries
CREATE INDEX idx_menu_items_restaurant_id ON public.menu_items(restaurant_id, category_id);
CREATE INDEX idx_menu_items_restaurant_available ON public.menu_items(restaurant_id, is_available);
CREATE INDEX idx_menu_items_restaurant_position ON public.menu_items(restaurant_id, category_id, position);

COMMENT ON COLUMN public.menu_items.restaurant_id IS 'Links menu item to a specific restaurant for multi-tenant data isolation';

-- =====================================================
-- STEP 4: Add restaurant_id to modifier_groups table
-- =====================================================

ALTER TABLE public.modifier_groups
    ADD COLUMN restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- Create index for tenant-specific queries
CREATE INDEX idx_modifier_groups_restaurant_id ON public.modifier_groups(restaurant_id, position);

-- Update unique constraint to be per-restaurant (id is TEXT, so it should be unique per restaurant)
CREATE UNIQUE INDEX idx_modifier_groups_id_per_restaurant
    ON public.modifier_groups(restaurant_id, id)
    WHERE restaurant_id IS NOT NULL;

COMMENT ON COLUMN public.modifier_groups.restaurant_id IS 'Links modifier group to a specific restaurant for multi-tenant data isolation';

-- =====================================================
-- STEP 5: Add restaurant_id to modifier_options table
-- =====================================================

ALTER TABLE public.modifier_options
    ADD COLUMN restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- Create index for tenant-specific queries
CREATE INDEX idx_modifier_options_restaurant_id ON public.modifier_options(restaurant_id, modifier_group_id);

-- Update unique constraint to be per-restaurant
CREATE UNIQUE INDEX idx_modifier_options_id_per_restaurant
    ON public.modifier_options(restaurant_id, id)
    WHERE restaurant_id IS NOT NULL;

COMMENT ON COLUMN public.modifier_options.restaurant_id IS 'Links modifier option to a specific restaurant for multi-tenant data isolation';

-- =====================================================
-- STEP 6: Add restaurant_id to menu_item_modifiers table
-- =====================================================

ALTER TABLE public.menu_item_modifiers
    ADD COLUMN restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- Create index for tenant-specific queries
CREATE INDEX idx_menu_item_modifiers_restaurant_id ON public.menu_item_modifiers(restaurant_id, menu_item_id);

COMMENT ON COLUMN public.menu_item_modifiers.restaurant_id IS 'Links menu item modifier association to a specific restaurant for multi-tenant data isolation';

-- =====================================================
-- STEP 7: Add restaurant_id to menu_item_variants table
-- =====================================================

ALTER TABLE public.menu_item_variants
    ADD COLUMN restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- Create index for tenant-specific queries
CREATE INDEX idx_menu_item_variants_restaurant_id ON public.menu_item_variants(restaurant_id, menu_item_id);

COMMENT ON COLUMN public.menu_item_variants.restaurant_id IS 'Links menu item variant to a specific restaurant for multi-tenant data isolation';

-- =====================================================
-- STEP 8: Add restaurant_id to menu_item_ingredients table
-- =====================================================

ALTER TABLE public.menu_item_ingredients
    ADD COLUMN restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- Create index for tenant-specific queries
CREATE INDEX idx_menu_item_ingredients_restaurant_id ON public.menu_item_ingredients(restaurant_id, menu_item_id);

COMMENT ON COLUMN public.menu_item_ingredients.restaurant_id IS 'Links menu item ingredient to a specific restaurant for multi-tenant data isolation';

-- =====================================================
-- STEP 9: Add restaurant_id to promotional_images table
-- =====================================================

ALTER TABLE public.promotional_images
    ADD COLUMN restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE CASCADE;

-- Create indexes for tenant-specific queries
CREATE INDEX idx_promotional_images_restaurant_id ON public.promotional_images(restaurant_id, position);
CREATE INDEX idx_promotional_images_restaurant_active ON public.promotional_images(restaurant_id, is_active);

COMMENT ON COLUMN public.promotional_images.restaurant_id IS 'Links promotional image to a specific restaurant for multi-tenant data isolation';

-- =====================================================
-- STEP 10: Create function to sync restaurant_id across related tables
-- =====================================================

-- This function ensures that when a menu_item's restaurant_id is set,
-- all its related records (variants, ingredients, modifiers) inherit the same restaurant_id
CREATE OR REPLACE FUNCTION sync_menu_item_restaurant_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Update variants
    UPDATE public.menu_item_variants
    SET restaurant_id = NEW.restaurant_id
    WHERE menu_item_id = NEW.id
    AND (restaurant_id IS NULL OR restaurant_id != NEW.restaurant_id);

    -- Update ingredients
    UPDATE public.menu_item_ingredients
    SET restaurant_id = NEW.restaurant_id
    WHERE menu_item_id = NEW.id
    AND (restaurant_id IS NULL OR restaurant_id != NEW.restaurant_id);

    -- Update menu_item_modifiers associations
    UPDATE public.menu_item_modifiers
    SET restaurant_id = NEW.restaurant_id
    WHERE menu_item_id = NEW.id
    AND (restaurant_id IS NULL OR restaurant_id != NEW.restaurant_id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_menu_item_restaurant_id_trigger
    AFTER INSERT OR UPDATE OF restaurant_id ON public.menu_items
    FOR EACH ROW
    WHEN (NEW.restaurant_id IS NOT NULL)
    EXECUTE FUNCTION sync_menu_item_restaurant_id();

-- =====================================================
-- STEP 11: Create function to validate restaurant_id consistency
-- =====================================================

-- Ensures that menu_items can only reference categories from the same restaurant
CREATE OR REPLACE FUNCTION validate_menu_item_category_restaurant()
RETURNS TRIGGER AS $$
DECLARE
    v_category_restaurant_id UUID;
BEGIN
    -- Get the category's restaurant_id
    SELECT restaurant_id INTO v_category_restaurant_id
    FROM public.categories
    WHERE id = NEW.category_id;

    -- Check if restaurant_ids match
    IF v_category_restaurant_id IS DISTINCT FROM NEW.restaurant_id THEN
        RAISE EXCEPTION 'Menu item restaurant_id (%) must match category restaurant_id (%)',
            NEW.restaurant_id, v_category_restaurant_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_menu_item_category_restaurant_trigger
    BEFORE INSERT OR UPDATE OF restaurant_id, category_id ON public.menu_items
    FOR EACH ROW
    WHEN (NEW.restaurant_id IS NOT NULL AND NEW.category_id IS NOT NULL)
    EXECUTE FUNCTION validate_menu_item_category_restaurant();

-- Ensures that modifier_options can only reference modifier_groups from the same restaurant
CREATE OR REPLACE FUNCTION validate_modifier_option_group_restaurant()
RETURNS TRIGGER AS $$
DECLARE
    v_group_restaurant_id UUID;
BEGIN
    -- Get the modifier_group's restaurant_id
    SELECT restaurant_id INTO v_group_restaurant_id
    FROM public.modifier_groups
    WHERE id = NEW.modifier_group_id;

    -- Check if restaurant_ids match
    IF v_group_restaurant_id IS DISTINCT FROM NEW.restaurant_id THEN
        RAISE EXCEPTION 'Modifier option restaurant_id (%) must match modifier group restaurant_id (%)',
            NEW.restaurant_id, v_group_restaurant_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_modifier_option_group_restaurant_trigger
    BEFORE INSERT OR UPDATE OF restaurant_id, modifier_group_id ON public.modifier_options
    FOR EACH ROW
    WHEN (NEW.restaurant_id IS NOT NULL AND NEW.modifier_group_id IS NOT NULL)
    EXECUTE FUNCTION validate_modifier_option_group_restaurant();

-- =====================================================
-- STEP 12: Create helper function to get current restaurant context
-- =====================================================

-- This function retrieves the restaurant_id for the current authenticated user
-- Super admins need to explicitly pass restaurant_id, others get their assigned restaurant
CREATE OR REPLACE FUNCTION get_user_restaurant_id()
RETURNS UUID AS $$
DECLARE
    v_restaurant_id UUID;
    v_is_super_admin BOOLEAN;
BEGIN
    -- Get user's restaurant_id and super_admin status
    SELECT restaurant_id, is_super_admin
    INTO v_restaurant_id, v_is_super_admin
    FROM public.admin_users
    WHERE id = auth.uid();

    -- Super admins don't have a default restaurant_id
    -- They need to explicitly specify which restaurant they're working with
    IF v_is_super_admin THEN
        RETURN NULL; -- Super admin must explicitly set restaurant context
    END IF;

    RETURN v_restaurant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_restaurant_id() IS 'Returns the restaurant_id for the current authenticated user. Returns NULL for super_admins who must explicitly set restaurant context.';

-- =====================================================
-- STEP 13: Create function to set restaurant context (for super admins)
-- =====================================================

-- Super admins can temporarily set their restaurant context for operations
-- This is stored in a config setting for the current session
CREATE OR REPLACE FUNCTION set_restaurant_context(p_restaurant_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Verify user is a super admin
    IF NOT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid()
        AND is_super_admin = true
    ) THEN
        RAISE EXCEPTION 'Only super admins can set restaurant context';
    END IF;

    -- Set the restaurant context for this session
    PERFORM set_config('app.current_restaurant_id', p_restaurant_id::TEXT, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get the current restaurant context (for super admins)
CREATE OR REPLACE FUNCTION get_restaurant_context()
RETURNS UUID AS $$
BEGIN
    -- Try to get from session config first (super admin context)
    DECLARE
        v_context_restaurant_id TEXT;
    BEGIN
        v_context_restaurant_id := current_setting('app.current_restaurant_id', true);
        IF v_context_restaurant_id IS NOT NULL THEN
            RETURN v_context_restaurant_id::UUID;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            -- Setting doesn't exist, continue
    END;

    -- Fall back to user's assigned restaurant
    RETURN get_user_restaurant_id();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION set_restaurant_context(UUID) IS 'Allows super admins to set which restaurant they are currently managing in their session';
COMMENT ON FUNCTION get_restaurant_context() IS 'Returns the current restaurant context - either from session (super admin) or user assignment';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 20250114_002_add_restaurant_id_to_tables.sql completed successfully';
    RAISE NOTICE '📋 Added restaurant_id column to all tenant-specific tables:';
    RAISE NOTICE '   - admin_users (with super_admin support)';
    RAISE NOTICE '   - categories';
    RAISE NOTICE '   - menu_items';
    RAISE NOTICE '   - modifier_groups';
    RAISE NOTICE '   - modifier_options';
    RAISE NOTICE '   - menu_item_modifiers';
    RAISE NOTICE '   - menu_item_variants';
    RAISE NOTICE '   - menu_item_ingredients';
    RAISE NOTICE '   - promotional_images';
    RAISE NOTICE '⚡ Created indexes for optimal tenant-specific queries';
    RAISE NOTICE '🔧 Created triggers for automatic restaurant_id syncing';
    RAISE NOTICE '✅ Created validation triggers for referential integrity';
    RAISE NOTICE '🔒 Created context management functions for super admin operations';
END $$;
