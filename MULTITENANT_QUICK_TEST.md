# Multi-Tenant Quick Test Guide

**Time to complete: ~5 minutes**

## Step 1: Create Auth Users (2 minutes)

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to **Authentication** > **Users**

2. **Create User #1**
   - Click **"Add User"** (or "Invite")
   - Email: `tokyo@test.com`
   - Password: `Tokyo123!@#` (or your preferred password)
   - ✅ Check **"Auto Confirm User"**
   - Click **"Create User"** or **"Send Invitation"**
   - **IMPORTANT:** Copy the **User ID** (UUID) - you'll need this!

3. **Create User #2**
   - Click **"Add User"** again
   - Email: `osaka@test.com`
   - Password: `Osaka123!@#` (or your preferred password)
   - ✅ Check **"Auto Confirm User"**
   - Click **"Create User"**
   - **IMPORTANT:** Copy this **User ID** too!

## Step 2: Run SQL Scripts (3 minutes)

Open **Supabase Dashboard** > **SQL Editor** and run these scripts in order:

### Script 1: Create Restaurants

```sql
-- Copy and paste from: scripts/setup-multitenant-test.sql
-- OR copy this:
```

Copy the content from `scripts/setup-multitenant-test.sql` and run it.

This will:
- Create "Elysium Tokyo" restaurant
- Create "Elysium Osaka" restaurant
- Show you the restaurant IDs

### Script 2: Link Admin Users

1. Open `scripts/link-admin-users.sql`
2. **Replace these two lines:**

```sql
tokyo_user_id UUID := 'REPLACE_WITH_TOKYO_USER_ID';  -- ← PASTE Tokyo user ID here
osaka_user_id UUID := 'REPLACE_WITH_OSAKA_USER_ID';  -- ← PASTE Osaka user ID here
```

3. Run the modified script

This will:
- Link `tokyo@test.com` to "Elysium Tokyo" restaurant
- Link `osaka@test.com` to "Elysium Osaka" restaurant

### Script 3: Create Test Data

```sql
-- Copy and paste from: scripts/create-test-data.sql
```

Run the entire content from `scripts/create-test-data.sql`

This will create for EACH restaurant:
- ✅ 3 categories (Sushi, Ramen, Drinks)
- ✅ 8 menu items (different for each restaurant)

## Step 3: Test Multi-Tenancy (2 minutes)

### Test 1: Login as Tokyo Admin

1. Open your app: `http://localhost:9002/login`
2. Login with:
   - Email: `tokyo@test.com`
   - Password: `Tokyo123!@#` (or what you set)

3. **Check Categories:**
   - Navigate to **Categories**
   - ✅ Should see: "Tokyo Sushi", "Tokyo Ramen", "Tokyo Drinks"
   - ❌ Should NOT see any "Osaka" categories

4. **Check Menu Items:**
   - Navigate to **Menu Items**
   - ✅ Should see items like "Tokyo Dragon Roll", "Tokyo Tonkotsu Ramen"
   - ❌ Should NOT see any "Osaka" items

### Test 2: Login as Osaka Admin

1. **Logout** (use logout button in admin panel)
2. Login with:
   - Email: `osaka@test.com`
   - Password: `Osaka123!@#`

3. **Check Categories:**
   - ✅ Should see: "Osaka Sushi", "Osaka Ramen", "Osaka Drinks"
   - ❌ Should NOT see any "Tokyo" categories

4. **Check Menu Items:**
   - ✅ Should see items like "Osaka Tiger Roll", "Osaka Shoyu Ramen"
   - ❌ Should NOT see any "Tokyo" items

## Success Criteria

✅ **Data Isolation:** Each restaurant admin only sees their own data
✅ **No Cross-Contamination:** Tokyo admin can't see Osaka data and vice versa
✅ **Login/Logout Works:** Can switch between accounts smoothly
✅ **All CRUD Operations Work:** Can create/edit/delete items in each restaurant

## What Each Restaurant Has

### Elysium Tokyo
**Categories:**
- Tokyo Sushi (with Dragon Roll, Rainbow Roll, Nigiri Set)
- Tokyo Ramen (with Tonkotsu, Miso, Spicy Tan Tan)
- Tokyo Drinks (with Green Tea, Sake Flight)

**Total:** 3 categories, 8 items

### Elysium Osaka
**Categories:**
- Osaka Sushi (with Tiger Roll, Sunset Roll, Sashimi Platter)
- Osaka Ramen (with Shoyu, Tsukemen, Black Garlic)
- Osaka Drinks (with Oolong Tea, Whisky Highball)

**Total:** 3 categories, 8 items

## Troubleshooting

**Problem: "User not found in admin_users"**
- Solution: Make sure you ran Script 2 (link-admin-users.sql) correctly
- Verify user IDs were pasted correctly

**Problem: "Can see both restaurants' data"**
- Solution: Check `admin_users` table - make sure each user has correct `restaurant_id`
- Run this query to verify:
```sql
SELECT au.email, r.name
FROM admin_users au
JOIN restaurants r ON au.restaurant_id = r.id
WHERE au.email IN ('tokyo@test.com', 'osaka@test.com');
```

**Problem: "No data showing up"**
- Solution: Make sure you ran Script 3 (create-test-data.sql)
- Verify with:
```sql
SELECT r.name, COUNT(mi.id) as item_count
FROM restaurants r
LEFT JOIN menu_items mi ON mi.restaurant_id = r.id
WHERE r.slug IN ('elysium-tokyo', 'elysium-osaka')
GROUP BY r.name;
```

## Cleanup (After Testing)

To remove all test data:

```sql
-- Delete menu items
DELETE FROM menu_items WHERE restaurant_id IN (
  SELECT id FROM restaurants WHERE slug IN ('elysium-tokyo', 'elysium-osaka')
);

-- Delete categories
DELETE FROM categories WHERE restaurant_id IN (
  SELECT id FROM restaurants WHERE slug IN ('elysium-tokyo', 'elysium-osaka')
);

-- Delete admin links
DELETE FROM admin_users WHERE email IN ('tokyo@test.com', 'osaka@test.com');

-- Delete restaurants
DELETE FROM restaurants WHERE slug IN ('elysium-tokyo', 'elysium-osaka');
```

Then manually delete the auth users from Supabase Dashboard > Authentication > Users.

## Next Steps

Once multi-tenancy is confirmed working:
1. You can create your real restaurant data
2. Invite real admin users
3. Each restaurant will automatically have isolated data
4. Scale to as many restaurants as needed!
