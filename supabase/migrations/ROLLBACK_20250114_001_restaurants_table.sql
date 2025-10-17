-- =====================================================
-- ROLLBACK: Drop Restaurants Table
-- Version: 1.0.0
-- Date: 2025-01-14
-- Description: Removes the restaurants table and related functions
-- WARNING: Only run this if you need to revert the multi-tenant migration
-- WARNING: This will permanently delete all restaurant data
-- =====================================================

-- Drop helper functions
DROP FUNCTION IF EXISTS get_restaurant_by_subdomain(TEXT);
DROP FUNCTION IF EXISTS check_restaurant_limit(UUID, TEXT);

-- Drop trigger
DROP TRIGGER IF EXISTS restaurants_updated_at ON public.restaurants;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_restaurants_updated_at();

-- Drop indexes (will be automatically dropped with table, but explicit for clarity)
DROP INDEX IF EXISTS idx_restaurants_subdomain;
DROP INDEX IF EXISTS idx_restaurants_custom_domain;
DROP INDEX IF EXISTS idx_restaurants_subscription_status;
DROP INDEX IF EXISTS idx_restaurants_is_active;
DROP INDEX IF EXISTS idx_restaurants_created_at;

-- Drop the restaurants table (CASCADE will drop foreign key constraints)
DROP TABLE IF EXISTS public.restaurants CASCADE;

DO $$
BEGIN
    RAISE NOTICE '✅ Rollback completed: restaurants table dropped';
    RAISE NOTICE '⚠️  WARNING: All restaurant data has been permanently deleted';
    RAISE NOTICE '⚠️  You will need to restore from backup if you need this data';
END $$;
