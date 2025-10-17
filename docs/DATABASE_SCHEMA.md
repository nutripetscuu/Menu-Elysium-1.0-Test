# Elysium Restaurant Menu - Database Schema Documentation

## Overview

This document describes the normalized Supabase database schema for the Elysium restaurant menu system. The schema is designed to support a full-featured menu management system with customizable modifiers, admin access control, and future e-commerce capabilities.

---

## Database Architecture

### Design Principles
- **Normalized Structure**: Eliminates data redundancy through proper normalization
- **Flexible Pricing**: Supports both single-price and multi-size pricing models
- **Modifier System**: Comprehensive customization system for drinks and food items
- **Type Safety**: Full TypeScript integration with Zod validation
- **Security First**: Row Level Security (RLS) policies for public read, admin write
- **Future-Ready**: Designed for admin panel and order management expansion

---

## Entity Relationship Diagram

```
┌─────────────────┐
│   categories    │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────┴────────┐           ┌──────────────────────┐
│   menu_items    │───────────│ menu_item_modifiers  │
└────────┬────────┘     N   1 └──────────┬───────────┘
         │                              1 │
         │                                │
         │                                │ N
         │                    ┌───────────┴────────────┐
         │                    │   modifier_groups      │
         │                    └───────────┬────────────┘
         │                              1 │
         │                                │
         │                                │ N
         │                    ┌───────────┴────────────┐
         │                    │   modifier_options     │
         │                    └────────────────────────┘
         │
         │ (Images stored in Supabase Storage)
         │
         └─────────────────────────────────────────────
```

---

## Tables

### 1. `categories`

Stores menu category information (e.g., "Calientes", "Frappés", "Frescos").

| Column       | Type         | Constraints                | Description                          |
|--------------|--------------|----------------------------|--------------------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT uuid  | Unique category identifier           |
| `name`       | TEXT         | NOT NULL, UNIQUE           | Category name (e.g., "Calientes")    |
| `icon`       | TEXT         | NOT NULL                   | Lucide React icon name               |
| `position`   | INTEGER      | NOT NULL, DEFAULT 0        | Display order (0-based)              |
| `is_active`  | BOOLEAN      | NOT NULL, DEFAULT true     | Visibility flag                      |
| `created_at` | TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()    | Creation timestamp                   |
| `updated_at` | TIMESTAMPTZ  | NULL                       | Last update timestamp                |

**Indexes:**
- `idx_categories_active_position` - Optimizes active category queries ordered by position

**Example:**
```sql
INSERT INTO categories (name, icon, position, is_active) VALUES
('Calientes', 'Coffee', 0, true);
```

---

### 2. `menu_items`

Stores individual menu items with flexible pricing (single price OR medium/grande sizes).

| Column          | Type           | Constraints                  | Description                              |
|-----------------|----------------|------------------------------|------------------------------------------|
| `id`            | UUID           | PRIMARY KEY, DEFAULT uuid    | Unique menu item identifier              |
| `category_id`   | UUID           | NOT NULL, FK → categories    | Parent category                          |
| `name`          | TEXT           | NOT NULL                     | Item name (e.g., "Espresso")             |
| `description`   | TEXT           | NOT NULL                     | Item description                         |
| `price`         | DECIMAL(10,2)  | NULL                         | Single price (mutually exclusive)        |
| `price_medium`  | DECIMAL(10,2)  | NULL                         | Medium size price                        |
| `price_grande`  | DECIMAL(10,2)  | NULL                         | Grande size price                        |
| `image_url`     | TEXT           | NULL                         | Image URL (Supabase Storage)             |
| `tags`          | TEXT[]         | DEFAULT '{}'                 | Tags like ["Popular", "Nuevo"]           |
| `portion`       | TEXT           | NULL                         | Portion description                      |
| `position`      | INTEGER        | NOT NULL, DEFAULT 0          | Display order within category            |
| `is_available`  | BOOLEAN        | NOT NULL, DEFAULT true       | Availability status (inventory control)  |
| `created_at`    | TIMESTAMPTZ    | NOT NULL, DEFAULT NOW()      | Creation timestamp                       |
| `updated_at`    | TIMESTAMPTZ    | NULL                         | Last update timestamp                    |

**Constraints:**
- `price_check`: Either `price` is set OR both `price_medium` and `price_grande` are set (not both)

**Indexes:**
- `idx_menu_items_category_position` - Optimizes category item queries
- `idx_menu_items_available` - Optimizes filtering by availability

**Example:**
```sql
-- Single price item
INSERT INTO menu_items (category_id, name, description, price, position) VALUES
('uuid-here', 'Espresso', 'Café concentrado de extracción perfecta.', 40.00, 0);

-- Multi-size item
INSERT INTO menu_items (category_id, name, description, price_medium, price_grande, position) VALUES
('uuid-here', 'Caramelo Frappé', 'Frappé cremoso con delicioso sabor a caramelo.', 80.00, 85.00, 0);
```

---

### 3. `modifier_groups`

Stores modifier group definitions (e.g., "Tipo de leche", "Salsas").

| Column             | Type         | Constraints                                 | Description                               |
|--------------------|--------------|---------------------------------------------|-------------------------------------------|
| `id`               | TEXT         | PRIMARY KEY                                 | Human-readable ID (e.g., "milk_types")    |
| `name`             | TEXT         | NOT NULL                                    | Display name (e.g., "Tipo de leche")      |
| `type`             | TEXT         | NOT NULL, CHECK IN (...)                    | Type: 'single', 'multiple', 'boolean'     |
| `required`         | BOOLEAN      | NOT NULL, DEFAULT false                     | Must customer select this group?          |
| `min_selections`   | INTEGER      | NOT NULL, DEFAULT 0                         | Minimum number of selections              |
| `max_selections`   | INTEGER      | NULL                                        | Maximum selections (NULL = unlimited)     |
| `position`         | INTEGER      | NOT NULL, DEFAULT 0                         | Display order                             |
| `created_at`       | TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()                     | Creation timestamp                        |
| `updated_at`       | TIMESTAMPTZ  | NULL                                        | Last update timestamp                     |

**Modifier Types:**
- `single` - Radio button (e.g., milk type: Entera, Deslactosada, Coco, Almendra)
- `multiple` - Checkboxes (e.g., sauces: Macha, Chipotle, De la casa)
- `boolean` - Single toggle (e.g., add egg: Yes/No)

**Example:**
```sql
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections) VALUES
('milk_types', 'Tipo de leche', 'single', true, 1, 1);
```

---

### 4. `modifier_options`

Stores individual options within modifier groups.

| Column               | Type           | Constraints                        | Description                          |
|----------------------|----------------|------------------------------------|--------------------------------------|
| `id`                 | TEXT           | PRIMARY KEY                        | Human-readable ID (e.g., "milk_entera") |
| `modifier_group_id`  | TEXT           | NOT NULL, FK → modifier_groups     | Parent modifier group                |
| `label`              | TEXT           | NOT NULL                           | Display label (e.g., "Entera")       |
| `price_modifier`     | DECIMAL(10,2)  | NOT NULL, DEFAULT 0.00             | Price adjustment (+/-)               |
| `is_default`         | BOOLEAN        | NOT NULL, DEFAULT false            | Pre-selected option?                 |
| `position`           | INTEGER        | NOT NULL, DEFAULT 0                | Display order within group           |
| `created_at`         | TIMESTAMPTZ    | NOT NULL, DEFAULT NOW()            | Creation timestamp                   |
| `updated_at`         | TIMESTAMPTZ    | NULL                               | Last update timestamp                |

**Indexes:**
- `idx_modifier_options_group` - Optimizes option queries by group

**Example:**
```sql
INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default) VALUES
('milk_entera', 'milk_types', 'Entera', 0.00, true),
('milk_coco', 'milk_types', 'Coco', 10.00, false);
```

---

### 5. `menu_item_modifiers`

Junction table linking menu items to their available modifier groups.

| Column               | Type         | Constraints                        | Description                          |
|----------------------|--------------|------------------------------------|--------------------------------------|
| `id`                 | UUID         | PRIMARY KEY, DEFAULT uuid          | Unique link identifier               |
| `menu_item_id`       | UUID         | NOT NULL, FK → menu_items          | Menu item reference                  |
| `modifier_group_id`  | TEXT         | NOT NULL, FK → modifier_groups     | Modifier group reference             |
| `position`           | INTEGER      | NOT NULL, DEFAULT 0                | Display order on menu item           |
| `created_at`         | TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()            | Creation timestamp                   |

**Constraints:**
- `UNIQUE(menu_item_id, modifier_group_id)` - Prevents duplicate modifier groups per item

**Indexes:**
- `idx_menu_item_modifiers_item` - Optimizes modifier lookup for menu items

**Example:**
```sql
INSERT INTO menu_item_modifiers (menu_item_id, modifier_group_id, position) VALUES
('item-uuid', 'milk_types', 0),
('item-uuid', 'essences', 1);
```

---

### 6. `admin_users`

Stores admin panel users with role-based access control.

| Column       | Type         | Constraints                        | Description                          |
|--------------|--------------|------------------------------------|--------------------------------------|
| `id`         | UUID         | PRIMARY KEY, DEFAULT uuid          | User identifier (from Supabase Auth) |
| `email`      | TEXT         | NOT NULL, UNIQUE                   | Admin email address                  |
| `role`       | TEXT         | NOT NULL, CHECK IN (...), DEFAULT  | Role: 'admin', 'manager', 'editor'   |
| `created_at` | TIMESTAMPTZ  | NOT NULL, DEFAULT NOW()            | Account creation timestamp           |
| `last_login` | TIMESTAMPTZ  | NULL                               | Last login timestamp                 |

**Indexes:**
- `idx_admin_users_email` - Optimizes email-based lookups

**Roles:**
- `admin` - Full access (can manage other admins)
- `manager` - Can manage menu data
- `editor` - Can edit menu items

**Example:**
```sql
INSERT INTO admin_users (email, role) VALUES
('admin@elysium.com', 'admin');
```

---

## Row Level Security (RLS) Policies

### Public Access (Read-Only)
All menu data is publicly readable for the customer-facing application:

```sql
-- Public can view active categories
CREATE POLICY "Public can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Public can view available menu items
CREATE POLICY "Public can view available menu items"
  ON menu_items FOR SELECT
  USING (is_available = true);

-- Public can view all modifier groups and options
-- (modifiers are always public for menu customization)
```

### Admin Access (Write)
Only authenticated admin users can modify data:

```sql
-- Helper function to check if user is admin
CREATE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager', 'editor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admins can insert/update/delete categories, menu items, modifiers
CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
```

**Security Notes:**
- Public users can only read `is_active = true` categories
- Public users can only read `is_available = true` menu items
- Admins can view and manage all data (including inactive/unavailable items)
- Super admins (role = 'admin') can manage admin users

---

## Views

### `menu_full` (Convenience View)

Pre-joins categories, menu items, and modifier groups for efficient frontend queries:

```sql
SELECT
  c.id as category_id,
  c.name as category_name,
  c.icon as category_icon,
  mi.id as item_id,
  mi.name as item_name,
  mi.price,
  mi.price_medium,
  mi.price_grande,
  json_agg(modifier_groups) as modifier_groups
FROM categories c
LEFT JOIN menu_items mi ON mi.category_id = c.id
LEFT JOIN menu_item_modifiers mim ON mim.menu_item_id = mi.id
WHERE c.is_active = true
GROUP BY c.id, mi.id
ORDER BY c.position, mi.position;
```

---

## Triggers

### Auto-Update Timestamps

All tables with `updated_at` columns have triggers to automatically update the timestamp:

```sql
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

This applies to:
- `categories`
- `menu_items`
- `modifier_groups`
- `modifier_options`

---

## Storage Buckets

### `menu-images`

Stores menu item images with public read access.

**Configuration:**
- Bucket Name: `menu-images`
- Public Access: `true`
- Max File Size: `5 MB`
- Allowed File Types: `image/jpeg`, `image/png`, `image/webp`

**Storage Policies:**
```sql
-- Public can view images
CREATE POLICY "Public can view menu images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'menu-images');

-- Admins can upload/delete images
CREATE POLICY "Admins can manage menu images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'menu-images' AND is_admin());
```

**Image URLs:**
```typescript
const imageUrl = `${supabaseUrl}/storage/v1/object/public/menu-images/${filename}`;
```

---

## Migration Plan

### Step 1: Run Migrations
```bash
# In Supabase SQL Editor or CLI
psql -h db.yourproject.supabase.co -U postgres -d postgres -f supabase/migrations/001_initial_schema.sql
psql -h db.yourproject.supabase.co -U postgres -d postgres -f supabase/migrations/002_row_level_security.sql
psql -h db.yourproject.supabase.co -U postgres -d postgres -f supabase/migrations/003_seed_modifier_groups.sql
```

### Step 2: Configure Environment
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 3: Migrate Data
```bash
npm install --save-dev ts-node
npx ts-node scripts/migrate-menu-data.ts
```

### Step 4: Verify Data
```sql
-- Check categories
SELECT COUNT(*) FROM categories;

-- Check menu items
SELECT COUNT(*) FROM menu_items;

-- Check modifier linkage
SELECT mi.name, COUNT(mim.id) as modifier_count
FROM menu_items mi
LEFT JOIN menu_item_modifiers mim ON mim.menu_item_id = mi.id
GROUP BY mi.id, mi.name;
```

---

## TypeScript Integration

### Supabase Client Setup
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### Query Examples

**Fetch all categories with items:**
```typescript
const { data: categories } = await supabase
  .from('categories')
  .select(`
    *,
    items:menu_items(*)
  `)
  .eq('is_active', true)
  .order('position');
```

**Fetch menu item with modifiers:**
```typescript
const { data: item } = await supabase
  .from('menu_items')
  .select(`
    *,
    category:categories(*),
    modifiers:menu_item_modifiers(
      *,
      modifier_group:modifier_groups(
        *,
        options:modifier_options(*)
      )
    )
  `)
  .eq('id', itemId)
  .single();
```

---

## Future Enhancements

### Phase 2: Orders & Cart System
- `orders` table with customer info and total
- `order_items` junction table with selected modifiers
- Order status tracking (pending, confirmed, preparing, ready, delivered)

### Phase 3: Analytics
- `menu_item_analytics` for tracking popular items
- `modifier_analytics` for tracking popular customizations
- Daily/weekly sales reports

### Phase 4: Promotions
- `promotions` table with discount rules
- `promotional_items` junction table
- Time-based promotions

---

## Schema Version

**Version:** 1.0.0
**Created:** 2025-10-05
**Last Updated:** 2025-10-05
**Author:** Claude Code + Elysium Team
