-- =====================================================
-- LINK ADMIN USERS TO RESTAURANTS
-- =====================================================
-- BEFORE running this, you need to:
-- 1. Create auth users in Supabase Dashboard
-- 2. Get their User IDs
-- 3. Replace the placeholders below
-- =====================================================

-- REPLACE THESE WITH ACTUAL VALUES:
-- Copy User ID from Supabase Dashboard > Authentication > Users after creating:
-- - tokyo@test.com
-- - osaka@test.com

DO $$
DECLARE
  tokyo_restaurant_id UUID;
  osaka_restaurant_id UUID;
  tokyo_user_id UUID := 'REPLACE_WITH_TOKYO_USER_ID';  -- ← REPLACE THIS
  osaka_user_id UUID := 'REPLACE_WITH_OSAKA_USER_ID';  -- ← REPLACE THIS
BEGIN
  -- Get restaurant IDs
  SELECT id INTO tokyo_restaurant_id FROM restaurants WHERE slug = 'elysium-tokyo';
  SELECT id INTO osaka_restaurant_id FROM restaurants WHERE slug = 'elysium-osaka';

  -- Link Tokyo admin
  INSERT INTO admin_users (id, email, restaurant_id, is_super_admin, created_at)
  VALUES (tokyo_user_id, 'tokyo@test.com', tokyo_restaurant_id, false, NOW())
  ON CONFLICT (id) DO UPDATE SET
    restaurant_id = tokyo_restaurant_id,
    email = 'tokyo@test.com';

  -- Link Osaka admin
  INSERT INTO admin_users (id, email, restaurant_id, is_super_admin, created_at)
  VALUES (osaka_user_id, 'osaka@test.com', osaka_restaurant_id, false, NOW())
  ON CONFLICT (id) DO UPDATE SET
    restaurant_id = osaka_restaurant_id,
    email = 'osaka@test.com';

  RAISE NOTICE 'Admin users linked successfully!';
  RAISE NOTICE 'Tokyo admin linked to restaurant: %', tokyo_restaurant_id;
  RAISE NOTICE 'Osaka admin linked to restaurant: %', osaka_restaurant_id;
END $$;

-- Verify the linkage
SELECT
  au.email,
  r.name as restaurant_name,
  au.is_super_admin,
  'SUCCESS - User linked to restaurant' as status
FROM admin_users au
JOIN restaurants r ON au.restaurant_id = r.id
WHERE au.email IN ('tokyo@test.com', 'osaka@test.com')
ORDER BY r.name;
