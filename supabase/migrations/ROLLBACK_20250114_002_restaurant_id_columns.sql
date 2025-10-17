-- =====================================================
-- ROLLBACK: Remove restaurant_id Columns
-- Version: 1.0.0
-- Date: 2025-01-14
-- Description: Removes restaurant_id columns and related constraints from all tables
-- WARNING: Only run this if you need to revert the multi-tenant migration
-- WARNING: This will NOT restore data, only schema
-- =====================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS sync_menu_item_restaurant_id_trigger ON public.menu_items;
DROP TRIGGER IF EXISTS validate_menu_item_category_restaurant_trigger ON public.menu_items;
DROP TRIGGER IF EXISTS validate_modifier_option_group_restaurant_trigger ON public.modifier_options;

-- Drop functions
DROP FUNCTION IF EXISTS sync_menu_item_restaurant_id();
DROP FUNCTION IF EXISTS validate_menu_item_category_restaurant();
DROP FUNCTION IF EXISTS validate_modifier_option_group_restaurant();
DROP FUNCTION IF EXISTS get_user_restaurant_id();
DROP FUNCTION IF EXISTS set_restaurant_context(UUID);
DROP FUNCTION IF EXISTS get_restaurant_context();

-- Drop unique indexes
DROP INDEX IF EXISTS idx_modifier_groups_id_per_restaurant;
DROP INDEX IF EXISTS idx_modifier_options_id_per_restaurant;
DROP INDEX IF EXISTS idx_categories_name_per_restaurant;

-- Drop regular indexes
DROP INDEX IF EXISTS idx_admin_users_restaurant_id;
DROP INDEX IF EXISTS idx_admin_users_super_admin;
DROP INDEX IF EXISTS idx_categories_restaurant_id;
DROP INDEX IF EXISTS idx_categories_restaurant_active;
DROP INDEX IF EXISTS idx_menu_items_restaurant_id;
DROP INDEX IF EXISTS idx_menu_items_restaurant_available;
DROP INDEX IF EXISTS idx_menu_items_restaurant_position;
DROP INDEX IF EXISTS idx_modifier_groups_restaurant_id;
DROP INDEX IF EXISTS idx_modifier_options_restaurant_id;
DROP INDEX IF EXISTS idx_menu_item_modifiers_restaurant_id;
DROP INDEX IF EXISTS idx_menu_item_variants_restaurant_id;
DROP INDEX IF EXISTS idx_menu_item_ingredients_restaurant_id;
DROP INDEX IF EXISTS idx_promotional_images_restaurant_id;
DROP INDEX IF EXISTS idx_promotional_images_restaurant_active;

-- Remove restaurant_id columns
ALTER TABLE public.promotional_images DROP COLUMN IF EXISTS restaurant_id;
ALTER TABLE public.menu_item_ingredients DROP COLUMN IF EXISTS restaurant_id;
ALTER TABLE public.menu_item_variants DROP COLUMN IF EXISTS restaurant_id;
ALTER TABLE public.menu_item_modifiers DROP COLUMN IF EXISTS restaurant_id;
ALTER TABLE public.modifier_options DROP COLUMN IF EXISTS restaurant_id;
ALTER TABLE public.modifier_groups DROP COLUMN IF EXISTS restaurant_id;
ALTER TABLE public.menu_items DROP COLUMN IF EXISTS restaurant_id;
ALTER TABLE public.categories DROP COLUMN IF EXISTS restaurant_id;

-- Restore original admin_users table structure
ALTER TABLE public.admin_users DROP COLUMN IF EXISTS restaurant_id;
ALTER TABLE public.admin_users DROP COLUMN IF EXISTS is_super_admin;

-- Restore original role constraint
ALTER TABLE public.admin_users DROP CONSTRAINT IF EXISTS admin_users_role_check;
ALTER TABLE public.admin_users
    ADD CONSTRAINT admin_users_role_check
    CHECK (role IN ('admin', 'manager', 'editor'));

-- Restore unique constraint on categories.name
CREATE UNIQUE INDEX IF NOT EXISTS categories_name_key ON public.categories(LOWER(name));

DO $$
BEGIN
    RAISE NOTICE '✅ Rollback completed: restaurant_id columns removed';
    RAISE NOTICE '⚠️  WARNING: Data in restaurant_id columns has been lost';
    RAISE NOTICE '⚠️  You will need to restore from backup if you need this data';
END $$;
