-- =====================================================
-- MULTI-TENANT TEST DATA SETUP
-- =====================================================
-- This script creates test restaurants and sample data
-- Run this AFTER creating auth users in Supabase Dashboard
-- =====================================================

-- Step 1: Create Test Restaurants
-- =====================================================
INSERT INTO restaurants (name, slug, created_at, updated_at) VALUES
  ('Elysium Tokyo', 'elysium-tokyo', NOW(), NOW()),
  ('Elysium Osaka', 'elysium-osaka', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Get the restaurant IDs (you'll need these for step 2)
DO $$
DECLARE
  tokyo_id UUID;
  osaka_id UUID;
BEGIN
  -- Get restaurant IDs
  SELECT id INTO tokyo_id FROM restaurants WHERE slug = 'elysium-tokyo';
  SELECT id INTO osaka_id FROM restaurants WHERE slug = 'elysium-osaka';

  RAISE NOTICE 'Tokyo Restaurant ID: %', tokyo_id;
  RAISE NOTICE 'Osaka Restaurant ID: %', osaka_id;
  RAISE NOTICE '';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Go to Supabase Dashboard > Authentication > Users';
  RAISE NOTICE '2. Create user: tokyo@test.com (copy the User ID)';
  RAISE NOTICE '3. Create user: osaka@test.com (copy the User ID)';
  RAISE NOTICE '4. Run the script: scripts/link-admin-users.sql with those IDs';
END $$;

-- Display restaurant info
SELECT
  id,
  name,
  slug,
  'Copy this ID for the next step' as note
FROM restaurants
WHERE slug IN ('elysium-tokyo', 'elysium-osaka')
ORDER BY name;
