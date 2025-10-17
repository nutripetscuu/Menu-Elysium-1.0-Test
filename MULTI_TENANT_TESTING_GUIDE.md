# Multi-Tenant Testing Guide

This guide will help you test the multi-tenant functionality of your restaurant menu system.

## Architecture Overview

The system uses a **many-to-one** relationship where:
- One restaurant can have multiple admin users
- Each admin user belongs to one restaurant
- Data isolation is enforced through `restaurant_id` on all records

## Testing Strategy

### Phase 1: Create Test Restaurants

You'll need to create **at least 2 separate restaurant accounts** to test data isolation.

#### Option A: Using Supabase Dashboard (Recommended for Testing)

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to Table Editor

2. **Create Restaurant #1**
   ```sql
   -- In the SQL Editor or via Table Editor
   INSERT INTO restaurants (name, slug, created_at)
   VALUES ('Restaurant A', 'restaurant-a', NOW());
   ```

3. **Create Restaurant #2**
   ```sql
   INSERT INTO restaurants (name, slug, created_at)
   VALUES ('Restaurant B', 'restaurant-b', NOW());
   ```

4. **Get the Restaurant IDs**
   ```sql
   SELECT id, name FROM restaurants ORDER BY created_at DESC;
   ```
   Note down both IDs (they'll be UUIDs like `123e4567-e89b-12d3-a456-426614174000`)

#### Option B: Using SQL Directly

Run this in the Supabase SQL Editor:

```sql
-- Create two test restaurants
INSERT INTO restaurants (name, slug, created_at) VALUES
  ('Elysium Tokyo', 'elysium-tokyo', NOW()),
  ('Elysium Osaka', 'elysium-osaka', NOW())
RETURNING id, name, slug;
```

### Phase 2: Create Admin Users for Each Restaurant

You have two approaches:

#### Approach 1: Create Auth Users in Supabase Dashboard

1. **Go to Authentication > Users** in Supabase Dashboard

2. **Create User #1 (Restaurant A Admin)**
   - Click "Add User"
   - Email: `admin-a@test.com`
   - Password: Choose a strong password
   - Auto-confirm user: ✓ (check this)
   - Click "Create user"
   - **Copy the User ID** (UUID)

3. **Link User #1 to Restaurant A**
   ```sql
   -- Replace USER_ID_1 and RESTAURANT_A_ID with actual values
   INSERT INTO admin_users (id, email, restaurant_id, is_super_admin, created_at)
   VALUES (
     'USER_ID_1',  -- The auth.users ID you just copied
     'admin-a@test.com',
     'RESTAURANT_A_ID',  -- Restaurant A's ID from Phase 1
     false,
     NOW()
   );
   ```

4. **Create User #2 (Restaurant B Admin)**
   - Repeat the same process with:
   - Email: `admin-b@test.com`
   - Link to Restaurant B's ID

#### Approach 2: Complete SQL Script

```sql
-- First, create auth users (run in Supabase Dashboard > Authentication)
-- Then link them to restaurants:

-- Get restaurant IDs
SELECT id, name FROM restaurants WHERE name LIKE 'Elysium%';

-- Assuming you have the auth user IDs and restaurant IDs:
INSERT INTO admin_users (id, email, restaurant_id, is_super_admin, created_at) VALUES
  ('AUTH_USER_ID_1', 'admin-a@test.com', 'RESTAURANT_A_ID', false, NOW()),
  ('AUTH_USER_ID_2', 'admin-b@test.com', 'RESTAURANT_B_ID', false, NOW());
```

### Phase 3: Test Data Isolation

#### Test 1: Login and Create Data

1. **Login as Restaurant A Admin**
   - Go to `http://localhost:9002/login`
   - Email: `admin-a@test.com`
   - Password: [your password]

2. **Create Test Data for Restaurant A**
   - Categories: "Sushi A", "Ramen A"
   - Menu Items: "Special Roll A", "Tonkotsu A"
   - Set distinctive names so you can identify them

3. **Logout**
   - Use the logout button in admin panel

4. **Login as Restaurant B Admin**
   - Email: `admin-b@test.com`
   - Password: [your password]

5. **Create Test Data for Restaurant B**
   - Categories: "Sushi B", "Ramen B"
   - Menu Items: "Special Roll B", "Tonkotsu B"

#### Test 2: Verify Data Isolation

**Expected Behavior:**
- Restaurant A admin should ONLY see Restaurant A's data
- Restaurant B admin should ONLY see Restaurant B's data

**What to Check:**

1. **While logged in as Restaurant A Admin:**
   - Navigate to Categories - should only see "Sushi A" and "Ramen A"
   - Navigate to Menu Items - should only see items with "A" suffix
   - Try to view settings - should show Restaurant A's info

2. **While logged in as Restaurant B Admin:**
   - Navigate to Categories - should only see "Sushi B" and "Ramen B"
   - Navigate to Menu Items - should only see items with "B" suffix
   - Settings should show Restaurant B's info

#### Test 3: Database-Level Verification

Run these queries in Supabase SQL Editor:

```sql
-- Check all categories with restaurant assignment
SELECT c.name, r.name as restaurant_name, c.restaurant_id
FROM categories c
JOIN restaurants r ON c.restaurant_id = r.id
ORDER BY r.name, c.name;

-- Check all menu items with restaurant assignment
SELECT mi.name, r.name as restaurant_name, mi.restaurant_id
FROM menu_items mi
JOIN restaurants r ON mi.restaurant_id = r.id
ORDER BY r.name, mi.name;

-- Verify admin users are correctly linked
SELECT au.email, r.name as restaurant_name, au.is_super_admin
FROM admin_users au
JOIN restaurants r ON au.restaurant_id = r.id
ORDER BY r.name;
```

**Expected Results:**
- All Restaurant A data should have Restaurant A's ID
- All Restaurant B data should have Restaurant B's ID
- No cross-contamination between restaurants

#### Test 4: Public Menu Isolation

Each restaurant should have its own unique menu URL based on the restaurant slug.

**Currently:** The public menu shows all restaurants' data (not filtered by restaurant).

**To test proper isolation, you would need to:**
1. Modify the public menu to filter by restaurant (using subdomain or URL parameter)
2. For now, verify the data structure supports it by checking the database

### Phase 4: Advanced Tests

#### Test 5: Super Admin (Optional)

Create a super admin user to test cross-restaurant access:

```sql
-- Create a super admin
INSERT INTO admin_users (id, email, restaurant_id, is_super_admin, created_at)
VALUES (
  'SUPER_ADMIN_AUTH_ID',
  'superadmin@test.com',
  'RESTAURANT_A_ID',  -- Required but may not be enforced
  true,
  NOW()
);
```

**Expected:** Super admin should potentially see all restaurants' data (depending on implementation)

#### Test 6: URL Manipulation Test

1. Login as Restaurant A admin
2. Try to manually edit URLs to access Restaurant B's data
3. **Expected:** Should be blocked or show no data

### Troubleshooting

**Issue: Can see other restaurant's data**
- Check RLS policies are enabled in Supabase
- Verify `restaurant_id` is being injected correctly
- Check `get-restaurant-id.ts` is working properly

**Issue: Can't login**
- Verify user exists in `auth.users` table
- Verify user exists in `admin_users` table
- Check email/password are correct
- Review middleware logs

**Issue: No data showing**
- Check `restaurant_id` on created records
- Verify admin user has correct `restaurant_id`
- Check browser console for errors

## Quick Test Script

Here's a complete SQL script to set up a test environment:

```sql
-- 1. Create restaurants
INSERT INTO restaurants (id, name, slug, created_at) VALUES
  (gen_random_uuid(), 'Test Restaurant Alpha', 'test-alpha', NOW()),
  (gen_random_uuid(), 'Test Restaurant Beta', 'test-beta', NOW());

-- 2. Get the IDs (copy these)
SELECT id, name, slug FROM restaurants WHERE name LIKE 'Test Restaurant%';

-- 3. After creating auth users in Supabase Auth Dashboard, link them:
-- INSERT INTO admin_users (id, email, restaurant_id, is_super_admin, created_at) VALUES
--   ('AUTH_USER_ALPHA_ID', 'alpha@test.com', 'RESTAURANT_ALPHA_ID', false, NOW()),
--   ('AUTH_USER_BETA_ID', 'beta@test.com', 'RESTAURANT_BETA_ID', false, NOW());

-- 4. Verify setup
SELECT
  au.email,
  r.name as restaurant_name,
  au.is_super_admin
FROM admin_users au
JOIN restaurants r ON au.restaurant_id = r.id
WHERE au.email LIKE '%@test.com';
```

## Cleanup After Testing

```sql
-- Delete test data
DELETE FROM menu_items WHERE restaurant_id IN (
  SELECT id FROM restaurants WHERE name LIKE 'Test Restaurant%'
);

DELETE FROM categories WHERE restaurant_id IN (
  SELECT id FROM restaurants WHERE name LIKE 'Test Restaurant%'
);

DELETE FROM admin_users WHERE restaurant_id IN (
  SELECT id FROM restaurants WHERE name LIKE 'Test Restaurant%'
);

DELETE FROM restaurants WHERE name LIKE 'Test Restaurant%';

-- Note: You'll need to manually delete auth users from Supabase Dashboard
```

## Success Criteria

✅ Restaurant A admin only sees Restaurant A's data
✅ Restaurant B admin only sees Restaurant B's data
✅ All created data has correct `restaurant_id`
✅ Cannot access other restaurant's data via URL manipulation
✅ Logout/login switches between restaurants correctly
✅ Database queries confirm proper data isolation
