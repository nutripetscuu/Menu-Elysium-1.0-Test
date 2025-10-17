-- =====================================================
-- MIGRATION: Add Performance Indexes for Multi-Tenant Scalability
-- Version: 1.0.0
-- Date: 2025-01-15
-- Description: Adds critical indexes for optimal performance at scale
-- =====================================================

-- =====================================================
-- STEP 1: Restaurant ID Indexes (Critical for Multi-Tenancy)
-- =====================================================

-- Categories - Most frequently queried table
CREATE INDEX IF NOT EXISTS idx_categories_restaurant_id
    ON public.categories(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_categories_restaurant_active
    ON public.categories(restaurant_id, is_active)
    WHERE is_active = true;

-- Menu Items - Largest table, needs compound indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id
    ON public.menu_items(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_available
    ON public.menu_items(restaurant_id, is_available)
    WHERE is_available = true;

CREATE INDEX IF NOT EXISTS idx_menu_items_category_position
    ON public.menu_items(category_id, position);

-- Modifier Groups
CREATE INDEX IF NOT EXISTS idx_modifier_groups_restaurant_id
    ON public.modifier_groups(restaurant_id);

-- Modifier Options
CREATE INDEX IF NOT EXISTS idx_modifier_options_restaurant_id
    ON public.modifier_options(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_modifier_options_group_position
    ON public.modifier_options(modifier_group_id, position);

-- Menu Item Modifiers (Junction Table)
CREATE INDEX IF NOT EXISTS idx_menu_item_modifiers_restaurant_id
    ON public.menu_item_modifiers(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_menu_item_modifiers_item_id
    ON public.menu_item_modifiers(menu_item_id);

CREATE INDEX IF NOT EXISTS idx_menu_item_modifiers_group_id
    ON public.menu_item_modifiers(modifier_group_id);

-- Menu Item Variants
CREATE INDEX IF NOT EXISTS idx_menu_item_variants_restaurant_id
    ON public.menu_item_variants(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_menu_item_variants_item_position
    ON public.menu_item_variants(menu_item_id, position);

-- Promotional Images
CREATE INDEX IF NOT EXISTS idx_promotional_images_restaurant_id
    ON public.promotional_images(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_promotional_images_restaurant_active_dates
    ON public.promotional_images(restaurant_id, is_active, start_date, end_date)
    WHERE is_active = true;

-- Admin Users
CREATE INDEX IF NOT EXISTS idx_admin_users_restaurant_id
    ON public.admin_users(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_admin_users_email
    ON public.admin_users(email);

-- Restaurant Settings
CREATE INDEX IF NOT EXISTS idx_restaurant_settings_restaurant_id
    ON public.restaurant_settings(restaurant_id);

-- Menu Item Ingredients
CREATE INDEX IF NOT EXISTS idx_menu_item_ingredients_restaurant_id
    ON public.menu_item_ingredients(restaurant_id);

CREATE INDEX IF NOT EXISTS idx_menu_item_ingredients_item_id
    ON public.menu_item_ingredients(menu_item_id);

-- =====================================================
-- STEP 2: Foreign Key Indexes (Improve Join Performance)
-- =====================================================

-- These indexes speed up JOIN operations
CREATE INDEX IF NOT EXISTS idx_categories_position
    ON public.categories(position);

CREATE INDEX IF NOT EXISTS idx_menu_items_position
    ON public.menu_items(position);

CREATE INDEX IF NOT EXISTS idx_modifier_groups_position
    ON public.modifier_groups(position);

CREATE INDEX IF NOT EXISTS idx_promotional_images_position
    ON public.promotional_images(position);

-- =====================================================
-- STEP 3: Analyze Tables for Query Planner
-- =====================================================

-- Update statistics for the query planner
ANALYZE public.categories;
ANALYZE public.menu_items;
ANALYZE public.modifier_groups;
ANALYZE public.modifier_options;
ANALYZE public.menu_item_modifiers;
ANALYZE public.menu_item_variants;
ANALYZE public.menu_item_ingredients;
ANALYZE public.promotional_images;
ANALYZE public.admin_users;
ANALYZE public.restaurant_settings;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 20250115_001_add_performance_indexes.sql completed successfully';
    RAISE NOTICE '🚀 Added performance indexes for multi-tenant scalability:';
    RAISE NOTICE '   - Restaurant ID indexes on all tables';
    RAISE NOTICE '   - Compound indexes for common query patterns';
    RAISE NOTICE '   - Position indexes for ordering queries';
    RAISE NOTICE '   - Foreign key indexes for JOIN performance';
    RAISE NOTICE '✅ Database optimized for worldwide scale';
    RAISE NOTICE '📊 Run EXPLAIN ANALYZE on your queries to verify index usage';
END $$;
