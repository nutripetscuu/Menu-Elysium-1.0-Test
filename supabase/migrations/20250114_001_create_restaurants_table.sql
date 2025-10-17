-- =====================================================
-- MIGRATION: Create Restaurants Table for Multi-Tenancy
-- Version: 1.0.0
-- Date: 2025-01-14
-- Description: Creates the core restaurants table for multi-tenant support
-- =====================================================

-- Create restaurants table
CREATE TABLE IF NOT EXISTS public.restaurants (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Restaurant Identity
    restaurant_name TEXT NOT NULL,
    business_name TEXT, -- Legal business name if different

    -- Multi-tenant URL Strategy
    subdomain TEXT UNIQUE NOT NULL, -- e.g., "elysium" for elysium.yourplatform.com
    custom_domain TEXT UNIQUE, -- e.g., "menu.elysiumrestaurant.com" (optional)

    -- Subscription & Billing
    subscription_tier TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_tier IN ('trial', 'basic', 'professional', 'enterprise')),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended', 'cancelled')),
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    billing_email TEXT,

    -- Restaurant Details
    description TEXT,
    cuisine_type TEXT[], -- Array of cuisine types, e.g., ["Japanese", "Sushi"]
    phone TEXT,
    email TEXT,
    website TEXT,

    -- Location Information
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Mexico',
    timezone TEXT DEFAULT 'America/Mexico_City',

    -- Operating Hours (JSON structure for flexibility)
    operating_hours JSONB DEFAULT '{
        "monday": {"open": "09:00", "close": "22:00", "closed": false},
        "tuesday": {"open": "09:00", "close": "22:00", "closed": false},
        "wednesday": {"open": "09:00", "close": "22:00", "closed": false},
        "thursday": {"open": "09:00", "close": "22:00", "closed": false},
        "friday": {"open": "09:00", "close": "23:00", "closed": false},
        "saturday": {"open": "09:00", "close": "23:00", "closed": false},
        "sunday": {"open": "10:00", "close": "21:00", "closed": false}
    }'::jsonb,

    -- Branding & Customization
    logo_url TEXT,
    primary_color TEXT DEFAULT '#B0C4DE', -- Steel blue default
    secondary_color TEXT,
    banner_image_url TEXT,

    -- Platform Settings
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_verified BOOLEAN NOT NULL DEFAULT false, -- Email/business verification
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,

    -- Features & Limits (based on subscription tier)
    features JSONB DEFAULT '{
        "max_menu_items": 100,
        "max_categories": 20,
        "max_modifiers": 50,
        "max_admin_users": 3,
        "custom_domain": false,
        "analytics": false,
        "api_access": false,
        "white_label": false,
        "priority_support": false
    }'::jsonb,

    -- Usage Tracking
    total_menu_items INTEGER DEFAULT 0,
    total_categories INTEGER DEFAULT 0,
    total_admin_users INTEGER DEFAULT 0,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb, -- Extensible field for custom data

    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ, -- Soft delete support

    -- Constraints
    CONSTRAINT valid_subdomain CHECK (
        subdomain ~ '^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$' -- Valid subdomain pattern
    ),
    CONSTRAINT valid_subscription_dates CHECK (
        subscription_end_date IS NULL OR subscription_end_date > subscription_start_date
    )
);

-- Create indexes for performance
CREATE INDEX idx_restaurants_subdomain ON public.restaurants(subdomain) WHERE deleted_at IS NULL;
CREATE INDEX idx_restaurants_custom_domain ON public.restaurants(custom_domain) WHERE custom_domain IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_restaurants_subscription_status ON public.restaurants(subscription_status, subscription_tier) WHERE deleted_at IS NULL;
CREATE INDEX idx_restaurants_is_active ON public.restaurants(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_restaurants_created_at ON public.restaurants(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_restaurants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER restaurants_updated_at
    BEFORE UPDATE ON public.restaurants
    FOR EACH ROW
    EXECUTE FUNCTION update_restaurants_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view active restaurants (for public menu access)
-- This allows fetching restaurant info by subdomain/domain without auth
CREATE POLICY "public_view_active_restaurants"
    ON public.restaurants
    FOR SELECT
    USING (
        is_active = true
        AND deleted_at IS NULL
        AND subscription_status = 'active'
    );

-- Policy: Super admins can view all restaurants
-- Note: We'll need to add a super_admin flag to admin_users in the next migration
CREATE POLICY "super_admin_view_all_restaurants"
    ON public.restaurants
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'super_admin'
        )
    );

-- Policy: Restaurant admins can view their own restaurant
CREATE POLICY "restaurant_admin_view_own"
    ON public.restaurants
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.restaurant_id = restaurants.id
        )
    );

-- Policy: Super admins can create restaurants
CREATE POLICY "super_admin_create_restaurants"
    ON public.restaurants
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'super_admin'
        )
    );

-- Policy: Super admins can update any restaurant
CREATE POLICY "super_admin_update_any_restaurant"
    ON public.restaurants
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'super_admin'
        )
    );

-- Policy: Restaurant admins can update their own restaurant (limited fields)
CREATE POLICY "restaurant_admin_update_own"
    ON public.restaurants
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.restaurant_id = restaurants.id
            AND admin_users.role IN ('admin', 'manager')
        )
    )
    WITH CHECK (
        -- Prevent restaurant admins from modifying sensitive fields
        (NEW.subscription_tier = OLD.subscription_tier)
        AND (NEW.subscription_status = OLD.subscription_status)
        AND (NEW.features = OLD.features)
        AND (NEW.is_verified = OLD.is_verified)
    );

-- Policy: Only super admins can delete (soft delete) restaurants
CREATE POLICY "super_admin_delete_restaurants"
    ON public.restaurants
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE admin_users.id = auth.uid()
            AND admin_users.role = 'super_admin'
        )
    )
    WITH CHECK (deleted_at IS NOT NULL);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get restaurant by subdomain
CREATE OR REPLACE FUNCTION get_restaurant_by_subdomain(p_subdomain TEXT)
RETURNS TABLE (
    id UUID,
    restaurant_name TEXT,
    subdomain TEXT,
    custom_domain TEXT,
    is_active BOOLEAN,
    subscription_status TEXT,
    primary_color TEXT,
    logo_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.restaurant_name,
        r.subdomain,
        r.custom_domain,
        r.is_active,
        r.subscription_status,
        r.primary_color,
        r.logo_url
    FROM public.restaurants r
    WHERE
        (r.subdomain = p_subdomain OR r.custom_domain = p_subdomain)
        AND r.deleted_at IS NULL
        AND r.is_active = true
        AND r.subscription_status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION check_restaurant_limit(
    p_restaurant_id UUID,
    p_limit_type TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_count INTEGER;
    v_max_allowed INTEGER;
BEGIN
    -- Get the max allowed from features
    SELECT (features->>('max_' || p_limit_type))::INTEGER
    INTO v_max_allowed
    FROM public.restaurants
    WHERE id = p_restaurant_id;

    -- Get current count based on limit type
    CASE p_limit_type
        WHEN 'menu_items' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM public.menu_items
            WHERE restaurant_id = p_restaurant_id;
        WHEN 'categories' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM public.categories
            WHERE restaurant_id = p_restaurant_id;
        WHEN 'admin_users' THEN
            SELECT COUNT(*) INTO v_current_count
            FROM public.admin_users
            WHERE restaurant_id = p_restaurant_id;
        ELSE
            RETURN true; -- Unknown limit type, allow by default
    END CASE;

    RETURN v_current_count < v_max_allowed;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.restaurants IS 'Core table for multi-tenant restaurant management. Each restaurant is a separate tenant with isolated data.';
COMMENT ON COLUMN public.restaurants.subdomain IS 'Unique subdomain for restaurant access (e.g., elysium.yourplatform.com)';
COMMENT ON COLUMN public.restaurants.custom_domain IS 'Optional custom domain (e.g., menu.restaurant.com) - Enterprise feature';
COMMENT ON COLUMN public.restaurants.subscription_tier IS 'trial | basic | professional | enterprise - Determines feature access and limits';
COMMENT ON COLUMN public.restaurants.features IS 'JSON object containing feature flags and limits based on subscription tier';
COMMENT ON COLUMN public.restaurants.operating_hours IS 'JSON object with daily operating hours in restaurant timezone';
COMMENT ON COLUMN public.restaurants.deleted_at IS 'Soft delete timestamp. Non-null values indicate deleted restaurants (data retained for recovery)';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration 20250114_001_create_restaurants_table.sql completed successfully';
    RAISE NOTICE '📋 Created restaurants table with comprehensive multi-tenant support';
    RAISE NOTICE '🔒 Applied RLS policies for secure multi-tenant data access';
    RAISE NOTICE '⚡ Created indexes for optimal query performance';
    RAISE NOTICE '🔧 Created helper functions for common restaurant operations';
END $$;
