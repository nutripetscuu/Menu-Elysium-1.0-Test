-- =====================================================
-- Create Restaurant Settings for Tokyo and Osaka
-- Purpose: Enable multi-tenant testing with proper settings data
-- =====================================================

-- First, check existing restaurants
SELECT
    id,
    restaurant_name,
    subdomain,
    is_active
FROM restaurants
WHERE deleted_at IS NULL
ORDER BY created_at;

-- Expected results:
-- 1. Elysium (existing)
-- 2. Tokyo (test restaurant)
-- 3. Osaka (test restaurant)

-- =====================================================
-- Check if settings already exist
-- =====================================================

SELECT
    rs.id,
    rs.restaurant_id,
    rs.restaurant_name,
    r.subdomain
FROM restaurant_settings rs
JOIN restaurants r ON rs.restaurant_id = r.id
WHERE r.deleted_at IS NULL;

-- =====================================================
-- Create settings for Tokyo Restaurant
-- =====================================================

-- Replace 'TOKYO_RESTAURANT_ID_HERE' with actual UUID from restaurants table
INSERT INTO restaurant_settings (
    restaurant_id,
    restaurant_name,
    whatsapp_number,
    online_ordering_enabled,
    business_hours,
    logo_url,
    primary_color,
    secondary_color,
    font_family,
    menu_url
)
SELECT
    id as restaurant_id,
    restaurant_name,
    NULL as whatsapp_number,
    true as online_ordering_enabled,
    jsonb_build_object(
        'monday', jsonb_build_object('open', '09:00', 'close', '22:00', 'closed', false),
        'tuesday', jsonb_build_object('open', '09:00', 'close', '22:00', 'closed', false),
        'wednesday', jsonb_build_object('open', '09:00', 'close', '22:00', 'closed', false),
        'thursday', jsonb_build_object('open', '09:00', 'close', '22:00', 'closed', false),
        'friday', jsonb_build_object('open', '09:00', 'close', '23:00', 'closed', false),
        'saturday', jsonb_build_object('open', '09:00', 'close', '23:00', 'closed', false),
        'sunday', jsonb_build_object('open', '10:00', 'close', '21:00', 'closed', false)
    ) as business_hours,
    NULL as logo_url,
    '#B0C4DE' as primary_color,
    '#F8F9FA' as secondary_color,
    'Inter' as font_family,
    NULL as menu_url
FROM restaurants
WHERE restaurant_name = 'Tokyo Restaurant'
    AND deleted_at IS NULL
    AND NOT EXISTS (
        SELECT 1 FROM restaurant_settings
        WHERE restaurant_id = restaurants.id
    );

-- =====================================================
-- Create settings for Osaka Restaurant
-- =====================================================

INSERT INTO restaurant_settings (
    restaurant_id,
    restaurant_name,
    whatsapp_number,
    online_ordering_enabled,
    business_hours,
    logo_url,
    primary_color,
    secondary_color,
    font_family,
    menu_url
)
SELECT
    id as restaurant_id,
    restaurant_name,
    NULL as whatsapp_number,
    true as online_ordering_enabled,
    jsonb_build_object(
        'monday', jsonb_build_object('open', '09:00', 'close', '22:00', 'closed', false),
        'tuesday', jsonb_build_object('open', '09:00', 'close', '22:00', 'closed', false),
        'wednesday', jsonb_build_object('open', '09:00', 'close', '22:00', 'closed', false),
        'thursday', jsonb_build_object('open', '09:00', 'close', '22:00', 'closed', false),
        'friday', jsonb_build_object('open', '09:00', 'close', '23:00', 'closed', false),
        'saturday', jsonb_build_object('open', '09:00', 'close', '23:00', 'closed', false),
        'sunday', jsonb_build_object('open', '10:00', 'close', '21:00', 'closed', false)
    ) as business_hours,
    NULL as logo_url,
    '#E91E63' as primary_color,
    '#FCE4EC' as secondary_color,
    'Inter' as font_family,
    NULL as menu_url
FROM restaurants
WHERE restaurant_name = 'Osaka Restaurant'
    AND deleted_at IS NULL
    AND NOT EXISTS (
        SELECT 1 FROM restaurant_settings
        WHERE restaurant_id = restaurants.id
    );

-- =====================================================
-- Verify settings were created
-- =====================================================

SELECT
    rs.id,
    rs.restaurant_id,
    rs.restaurant_name,
    r.subdomain,
    rs.primary_color,
    rs.online_ordering_enabled,
    rs.created_at
FROM restaurant_settings rs
JOIN restaurants r ON rs.restaurant_id = r.id
WHERE r.deleted_at IS NULL
ORDER BY rs.created_at;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Restaurant settings created successfully';
    RAISE NOTICE '📋 Tokyo Restaurant: Blue theme (#B0C4DE)';
    RAISE NOTICE '📋 Osaka Restaurant: Pink theme (#E91E63)';
    RAISE NOTICE '🔧 All restaurants now have proper settings for testing';
END $$;
