# Multi-Tenant Database Migration Guide

**Version:** 1.0.0
**Date:** January 14, 2025
**Migration:** Phase 2.1 - Multi-Tenant Database Refactoring

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Pre-Migration Checklist](#pre-migration-checklist)
3. [Migration Steps](#migration-steps)
4. [Data Migration](#data-migration)
5. [Post-Migration Verification](#post-migration-verification)
6. [Rollback Procedures](#rollback-procedures)
7. [API Changes](#api-changes)
8. [Testing Guide](#testing-guide)
9. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This migration transforms your single-tenant restaurant application into a professional multi-tenant SaaS platform capable of serving multiple restaurants with complete data isolation.

### What This Migration Does

1. **Creates `restaurants` table** - Core multi-tenant entity with subscription management
2. **Adds `restaurant_id`** to all relevant tables for tenant data isolation
3. **Updates RLS policies** for tenant-aware security
4. **Implements tenant context** utilities for extracting restaurant from requests
5. **Enables subdomain routing** (e.g., `elysium.yourplatform.com`)
6. **Supports custom domains** (e.g., `menu.restaurant.com`) as enterprise feature

### Key Features

- **Complete Data Isolation**: RLS policies ensure restaurants can only access their data
- **Super Admin Role**: Platform administrators can manage all restaurants
- **Subscription Tiers**: trial, basic, professional, enterprise with feature limits
- **Safe Rollback**: Comprehensive rollback scripts for each migration step

---

## ✅ Pre-Migration Checklist

### 1. Backup Your Database

```bash
# Using Supabase CLI
supabase db dump --db-url "postgresql://..." > backup_$(date +%Y%m%d_%H%M%S).sql

# Or via Supabase Dashboard
# Project Settings → Database → Create Backup
```

### 2. Environment Setup

Ensure you have these environment variables:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# New for multi-tenancy
NEXT_PUBLIC_PLATFORM_DOMAIN=yourplatform.com  # Your main platform domain
```

### 3. Stop Production Traffic

**WARNING:** This is a major schema change. Schedule downtime or use a blue-green deployment strategy.

```bash
# If using Vercel/Netlify
# Set maintenance mode or pause deployments
```

### 4. Verify Current Schema

```bash
# Check current tables
supabase db diff

# Ensure no pending migrations
supabase migration list
```

### 5. Test in Staging First

**CRITICAL:** Always test the migration in a staging environment before production.

---

## 🚀 Migration Steps

### Step 1: Run Migrations in Order

The migrations **MUST** be run in this exact order:

```bash
# Migration 1: Create restaurants table
supabase db push supabase/migrations/20250114_001_create_restaurants_table.sql

# Migration 2: Add restaurant_id to all tables
supabase db push supabase/migrations/20250114_002_add_restaurant_id_to_tables.sql

# Migration 3: Update RLS policies
supabase db push supabase/migrations/20250114_003_update_rls_policies_multi_tenant.sql
```

**Using Supabase Dashboard:**
1. Go to SQL Editor
2. Open each migration file
3. Run them sequentially
4. Verify success messages

### Step 2: Verify Migrations

After each migration, verify it succeeded:

```sql
-- Check restaurants table exists
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'restaurants';

-- Check restaurant_id columns were added
SELECT table_name, column_name
FROM information_schema.columns
WHERE column_name = 'restaurant_id';

-- Check RLS policies were updated
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('categories', 'menu_items', 'admin_users');
```

### Step 3: Create Your First Restaurant

```sql
-- Create a restaurant for your existing data
INSERT INTO restaurants (
  restaurant_name,
  subdomain,
  subscription_tier,
  subscription_status,
  is_active,
  is_verified,
  onboarding_completed
) VALUES (
  'Elysium',  -- Your restaurant name
  'elysium',  -- Subdomain
  'professional',  -- Subscription tier
  'active',
  true,
  true,
  true
) RETURNING id;

-- Save the returned ID - you'll need it for the next step
```

### Step 4: Link Existing Data to Restaurant

```sql
-- Set the restaurant_id you got from Step 3
SET restaurant_id = 'YOUR_RESTAURANT_ID_HERE';

-- Update all existing data
UPDATE categories SET restaurant_id = :restaurant_id WHERE restaurant_id IS NULL;
UPDATE menu_items SET restaurant_id = :restaurant_id WHERE restaurant_id IS NULL;
UPDATE modifier_groups SET restaurant_id = :restaurant_id WHERE restaurant_id IS NULL;
UPDATE modifier_options SET restaurant_id = :restaurant_id WHERE restaurant_id IS NULL;
UPDATE menu_item_modifiers SET restaurant_id = :restaurant_id WHERE restaurant_id IS NULL;
UPDATE menu_item_variants SET restaurant_id = :restaurant_id WHERE restaurant_id IS NULL;
UPDATE menu_item_ingredients SET restaurant_id = :restaurant_id WHERE restaurant_id IS NULL;
UPDATE promotional_images SET restaurant_id = :restaurant_id WHERE restaurant_id IS NULL;

-- Verify all data has been linked
SELECT
  (SELECT COUNT(*) FROM categories WHERE restaurant_id IS NULL) as cats_without_restaurant,
  (SELECT COUNT(*) FROM menu_items WHERE restaurant_id IS NULL) as items_without_restaurant,
  (SELECT COUNT(*) FROM modifier_groups WHERE restaurant_id IS NULL) as groups_without_restaurant;
-- All counts should be 0
```

### Step 5: Update Admin Users

```sql
-- Option A: Make yourself a super admin (platform admin)
UPDATE admin_users
SET is_super_admin = true,
    role = 'super_admin',
    restaurant_id = NULL
WHERE email = 'your_email@example.com';

-- Option B: Link admin to restaurant
UPDATE admin_users
SET restaurant_id = 'YOUR_RESTAURANT_ID_HERE'
WHERE email = 'your_email@example.com';
```

### Step 6: Make restaurant_id Required (Optional but Recommended)

After all data is migrated, make the columns NOT NULL:

```sql
-- Only run this after ALL data has restaurant_id set
ALTER TABLE categories ALTER COLUMN restaurant_id SET NOT NULL;
ALTER TABLE menu_items ALTER COLUMN restaurant_id SET NOT NULL;
ALTER TABLE modifier_groups ALTER COLUMN restaurant_id SET NOT NULL;
ALTER TABLE modifier_options ALTER COLUMN restaurant_id SET NOT NULL;
ALTER TABLE menu_item_modifiers ALTER COLUMN restaurant_id SET NOT NULL;
ALTER TABLE menu_item_variants ALTER COLUMN restaurant_id SET NOT NULL;
ALTER TABLE menu_item_ingredients ALTER COLUMN restaurant_id SET NOT NULL;
ALTER TABLE promotional_images ALTER COLUMN restaurant_id SET NOT NULL;
```

---

## 📊 Data Migration

### Automated Data Migration Script

For large datasets, use this script:

```typescript
// scripts/migrate-data-to-multitenant.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function migrateData() {
  // 1. Create restaurant
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .insert({
      restaurant_name: 'Your Restaurant',
      subdomain: 'yourslug',
      subscription_tier: 'professional',
      subscription_status: 'active',
      is_active: true,
    })
    .select()
    .single();

  if (restaurantError || !restaurant) {
    throw new Error('Failed to create restaurant');
  }

  console.log('✅ Created restaurant:', restaurant.id);

  // 2. Update all tables
  const tables = [
    'categories',
    'menu_items',
    'modifier_groups',
    'modifier_options',
    'menu_item_modifiers',
    'menu_item_variants',
    'menu_item_ingredients',
    'promotional_images',
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .update({ restaurant_id: restaurant.id })
      .is('restaurant_id', null)
      .select('id');

    if (error) {
      console.error(`❌ Error updating ${table}:`, error);
    } else {
      console.log(`✅ Updated ${data?.length || 0} rows in ${table}`);
    }
  }

  console.log('🎉 Migration complete!');
}

migrateData().catch(console.error);
```

Run it:

```bash
npx tsx scripts/migrate-data-to-multitenant.ts
```

---

## ✅ Post-Migration Verification

### 1. Check Data Integrity

```sql
-- Verify all data has restaurant_id
SELECT
  'categories' as table_name, COUNT(*) as total,
  COUNT(*) FILTER (WHERE restaurant_id IS NOT NULL) as with_restaurant
FROM categories
UNION ALL
SELECT 'menu_items', COUNT(*), COUNT(*) FILTER (WHERE restaurant_id IS NOT NULL)
FROM menu_items
UNION ALL
SELECT 'modifier_groups', COUNT(*), COUNT(*) FILTER (WHERE restaurant_id IS NOT NULL)
FROM modifier_groups;

-- Both columns should match for each table
```

### 2. Test RLS Policies

```sql
-- Set user context (use a real user ID from admin_users)
SET request.jwt.claims.sub = 'USER_ID_HERE';

-- Try to query data (should only see data for user's restaurant)
SELECT * FROM categories;
SELECT * FROM menu_items;
```

### 3. Test Subdomain Access

```bash
# Update your /etc/hosts for local testing
127.0.0.1 elysium.localhost

# Test the subdomain
curl http://elysium.localhost:3000
```

### 4. Verify Admin Panel Access

```bash
# Test admin login
# Ensure you can still access the admin panel
# Verify you see the correct restaurant data
```

---

## 🔄 Rollback Procedures

If something goes wrong, rollback in **reverse order**:

```bash
# Rollback Step 3: Revert RLS policies
supabase db push supabase/migrations/ROLLBACK_20250114_003_rls_policies.sql

# Rollback Step 2: Remove restaurant_id columns
supabase db push supabase/migrations/ROLLBACK_20250114_002_restaurant_id_columns.sql

# Rollback Step 1: Drop restaurants table
supabase db push supabase/migrations/ROLLBACK_20250114_001_restaurants_table.sql

# Restore from backup
psql $DATABASE_URL < backup_TIMESTAMP.sql
```

**WARNING:** Rollback scripts will delete all restaurant data. Only use if migration fails and you have a backup.

---

## 🔧 API Changes

### Before Migration (Single-Tenant)

```typescript
// Old API - no restaurant context
const categories = await getCategories();
```

### After Migration (Multi-Tenant)

```typescript
// New API - with restaurant context
import { getRestaurantIdFromRequest } from '@/lib/utils/restaurant-context';

const restaurantId = await getRestaurantIdFromRequest();
const categories = await getCategories(); // Automatically filtered by RLS

// For API routes that need explicit restaurant_id
const { data } = await supabase
  .from('categories')
  .select('*')
  .eq('restaurant_id', restaurantId);
```

### Updated API Functions

All API functions in `src/lib/api/` now support multi-tenancy through RLS policies. No code changes required for basic CRUD operations.

**New API functions added:**
- `src/lib/api/restaurants.ts` - Restaurant management
- `src/lib/utils/restaurant-context.ts` - Context utilities

---

## 🧪 Testing Guide

### 1. Unit Tests

Test restaurant context extraction:

```typescript
import { getRestaurantFromRequest } from '@/lib/utils/restaurant-context';

describe('Restaurant Context', () => {
  it('should extract restaurant from subdomain', async () => {
    // Mock headers with subdomain
    const restaurant = await getRestaurantFromRequest();
    expect(restaurant).toBeDefined();
    expect(restaurant?.subdomain).toBe('elysium');
  });
});
```

### 2. Integration Tests

Test multi-tenant data isolation:

```typescript
describe('Multi-Tenant Data Isolation', () => {
  it('should only return data for current restaurant', async () => {
    // Login as restaurant A admin
    const categoriesA = await getCategories();

    // Login as restaurant B admin
    const categoriesB = await getCategories();

    // Should be different sets
    expect(categoriesA).not.toEqual(categoriesB);
  });
});
```

### 3. E2E Tests

```bash
# Test subdomain routing
cypress run --spec "cypress/e2e/multi-tenant.cy.ts"
```

---

## 🔍 Troubleshooting

### Issue 1: "Restaurant not found" error

**Cause:** Subdomain routing not configured or restaurant doesn't exist.

**Fix:**
1. Verify restaurant exists: `SELECT * FROM restaurants WHERE subdomain = 'yourslug';`
2. Check `NEXT_PUBLIC_PLATFORM_DOMAIN` environment variable
3. Verify DNS/subdomain configuration

### Issue 2: RLS policy blocking data access

**Cause:** User doesn't have proper restaurant_id or admin_users record.

**Fix:**
```sql
-- Check user's restaurant assignment
SELECT * FROM admin_users WHERE id = 'USER_ID';

-- Fix restaurant assignment
UPDATE admin_users
SET restaurant_id = 'CORRECT_RESTAURANT_ID'
WHERE id = 'USER_ID';
```

### Issue 3: Some data still missing restaurant_id

**Cause:** Data was created after migration but before restaurant_id was made required.

**Fix:**
```sql
-- Find orphaned data
SELECT id FROM categories WHERE restaurant_id IS NULL;

-- Assign to a restaurant
UPDATE categories
SET restaurant_id = 'YOUR_RESTAURANT_ID'
WHERE restaurant_id IS NULL;
```

### Issue 4: Migration fails with foreign key error

**Cause:** Existing data has referential integrity issues.

**Fix:**
```sql
-- Check for orphaned records
SELECT mi.id
FROM menu_items mi
LEFT JOIN categories c ON mi.category_id = c.id
WHERE c.id IS NULL;

-- Fix or delete orphaned records before migration
```

---

## 📞 Support

If you encounter issues:

1. **Check logs:**
   ```bash
   supabase logs --level error
   ```

2. **Verify environment variables:**
   ```bash
   env | grep SUPABASE
   ```

3. **Database status:**
   ```bash
   supabase status
   ```

4. **Restore from backup if needed:**
   ```bash
   supabase db reset
   psql $DATABASE_URL < backup.sql
   ```

---

## 🎉 Success Checklist

- [ ] All migrations ran successfully
- [ ] Restaurant created and verified
- [ ] All existing data linked to restaurant
- [ ] Admin users configured (super admin or restaurant admin)
- [ ] RLS policies tested and working
- [ ] Subdomain routing tested
- [ ] Admin panel accessible
- [ ] Public menu accessible via subdomain
- [ ] No data visible across different restaurants
- [ ] Backup created and verified
- [ ] Documentation updated
- [ ] Team trained on multi-tenant architecture

---

## 📚 Next Steps

After successful migration:

1. **Configure DNS** for subdomains (wildcard CNAME)
2. **Set up second restaurant** to test multi-tenancy
3. **Implement super admin dashboard** for platform management
4. **Set up billing integration** for subscription management
5. **Configure custom domains** (enterprise feature)
6. **Implement usage tracking** and analytics per restaurant
7. **Create onboarding flow** for new restaurants

---

**Migration Version:** 1.0.0
**Last Updated:** January 14, 2025
**Compatibility:** Supabase PostgreSQL 15+, Next.js 15+
