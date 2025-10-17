# Elysium Database Schema - Visual Diagram

## Complete Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         ELYSIUM RESTAURANT MENU DATABASE                             │
└─────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│      CATEGORIES          │
├──────────────────────────┤
│ 🔑 id (UUID)             │
│ ✏️  name (TEXT)          │
│ 🎨 icon (TEXT)           │
│ 📊 position (INT)        │
│ ✅ is_active (BOOL)      │
│ 📅 created_at            │
│ 📅 updated_at            │
└────────────┬─────────────┘
             │
             │ 1:N (One category has many items)
             │
             ▼
┌──────────────────────────────────────────────────────┐
│                  MENU_ITEMS                          │
├──────────────────────────────────────────────────────┤
│ 🔑 id (UUID)                                         │
│ 🔗 category_id (UUID) → categories.id                │
│ ✏️  name (TEXT)                                      │
│ 📝 description (TEXT)                                │
│ 💰 price (DECIMAL) - for single price items          │
│ 💰 price_medium (DECIMAL) - for sized items          │
│ 💰 price_grande (DECIMAL) - for sized items          │
│ 🖼️  image_url (TEXT) → Supabase Storage             │
│ 🏷️  tags (TEXT[]) - e.g., ["Popular", "Nuevo"]      │
│ 📏 portion (TEXT)                                    │
│ 📊 position (INT)                                    │
│ ✅ is_available (BOOL)                               │
│ 📅 created_at                                        │
│ 📅 updated_at                                        │
└────────────┬─────────────────────────────────────────┘
             │
             │ N:M (Many items can have many modifier groups)
             │
             ▼
┌──────────────────────────────────────────────────────┐
│           MENU_ITEM_MODIFIERS (Junction)             │
├──────────────────────────────────────────────────────┤
│ 🔑 id (UUID)                                         │
│ 🔗 menu_item_id (UUID) → menu_items.id               │
│ 🔗 modifier_group_id (TEXT) → modifier_groups.id     │
│ 📊 position (INT) - display order                    │
│ 📅 created_at                                        │
└────────────┬─────────────────────────────────────────┘
             │
             │ N:1 (Many links to one modifier group)
             │
             ▼
┌──────────────────────────────────────────────────────┐
│              MODIFIER_GROUPS                         │
├──────────────────────────────────────────────────────┤
│ 🔑 id (TEXT) - human-readable (e.g., "milk_types")  │
│ ✏️  name (TEXT) - "Tipo de leche"                   │
│ 🎛️  type (ENUM) - 'single', 'multiple', 'boolean'   │
│ ❗ required (BOOL)                                   │
│ 🔢 min_selections (INT)                              │
│ 🔢 max_selections (INT) - NULL = unlimited           │
│ 📊 position (INT)                                    │
│ 📅 created_at                                        │
│ 📅 updated_at                                        │
└────────────┬─────────────────────────────────────────┘
             │
             │ 1:N (One group has many options)
             │
             ▼
┌──────────────────────────────────────────────────────┐
│              MODIFIER_OPTIONS                        │
├──────────────────────────────────────────────────────┤
│ 🔑 id (TEXT) - human-readable (e.g., "milk_entera") │
│ 🔗 modifier_group_id (TEXT) → modifier_groups.id    │
│ ✏️  label (TEXT) - "Entera"                         │
│ 💰 price_modifier (DECIMAL) - +/- adjustment         │
│ ✅ is_default (BOOL)                                 │
│ 📊 position (INT)                                    │
│ 📅 created_at                                        │
│ 📅 updated_at                                        │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│               ADMIN_USERS                            │
├──────────────────────────────────────────────────────┤
│ 🔑 id (UUID) - from Supabase Auth                    │
│ 📧 email (TEXT)                                      │
│ 👤 role (ENUM) - 'admin', 'manager', 'editor'        │
│ 📅 created_at                                        │
│ 📅 last_login                                        │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│         SUPABASE STORAGE: menu-images                │
├──────────────────────────────────────────────────────┤
│ 📁 Bucket: menu-images (public)                      │
│ 📸 Files: item-uuid.jpg, item-uuid.webp, etc.       │
│ 🔗 Referenced by: menu_items.image_url               │
└──────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Customer View (Public Read)

```
┌──────────────┐
│   Customer   │
│  (Frontend)  │
└──────┬───────┘
       │
       │ SELECT (RLS: is_active = true)
       ▼
┌──────────────────────────┐
│  Supabase Database       │
│  ┌────────────────────┐  │
│  │ categories         │  │
│  │ (active only)      │  │
│  └─────────┬──────────┘  │
│            │              │
│            │ JOIN         │
│            ▼              │
│  ┌────────────────────┐  │
│  │ menu_items         │  │
│  │ (available only)   │  │
│  └─────────┬──────────┘  │
│            │              │
│            │ JOIN         │
│            ▼              │
│  ┌────────────────────┐  │
│  │ menu_item_modifiers│  │
│  └─────────┬──────────┘  │
│            │              │
│            │ JOIN         │
│            ▼              │
│  ┌────────────────────┐  │
│  │ modifier_groups    │  │
│  └─────────┬──────────┘  │
│            │              │
│            │ JOIN         │
│            ▼              │
│  ┌────────────────────┐  │
│  │ modifier_options   │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

### Admin Panel (Authenticated Write)

```
┌──────────────┐
│    Admin     │
│   (Panel)    │
└──────┬───────┘
       │
       │ 1. Login via Supabase Auth
       │
       ▼
┌──────────────────────────┐
│  Supabase Auth           │
│  Returns: auth.uid()     │
└──────┬───────────────────┘
       │
       │ 2. Check is_admin()
       │
       ▼
┌──────────────────────────┐
│  admin_users table       │
│  WHERE id = auth.uid()   │
└──────┬───────────────────┘
       │
       │ 3. RLS allows INSERT/UPDATE/DELETE
       │
       ▼
┌──────────────────────────┐
│  Full CRUD Access to:    │
│  - categories            │
│  - menu_items            │
│  - modifier_groups       │
│  - modifier_options      │
│  - menu_item_modifiers   │
│  - Storage: menu-images  │
└──────────────────────────┘
```

---

## Example Data Flow

### Example 1: Customer Views "Latte" Item

```sql
-- Frontend Query
SELECT
  mi.id,
  mi.name,
  mi.description,
  mi.price,
  mi.image_url,
  c.name as category_name,
  json_agg(
    json_build_object(
      'group_id', mg.id,
      'group_name', mg.name,
      'type', mg.type,
      'required', mg.required,
      'options', (
        SELECT json_agg(
          json_build_object(
            'id', mo.id,
            'label', mo.label,
            'price_modifier', mo.price_modifier,
            'is_default', mo.is_default
          )
        )
        FROM modifier_options mo
        WHERE mo.modifier_group_id = mg.id
        ORDER BY mo.position
      )
    )
  ) as modifiers
FROM menu_items mi
JOIN categories c ON c.id = mi.category_id
LEFT JOIN menu_item_modifiers mim ON mim.menu_item_id = mi.id
LEFT JOIN modifier_groups mg ON mg.id = mim.modifier_group_id
WHERE mi.id = 'latte-uuid'
  AND mi.is_available = true
GROUP BY mi.id, c.name;
```

**Result:**
```json
{
  "id": "uuid-1234",
  "name": "Latte",
  "description": "Espresso suave con leche vaporizada...",
  "price": 65.00,
  "category_name": "Calientes",
  "modifiers": [
    {
      "group_id": "milk_types",
      "group_name": "Tipo de leche",
      "type": "single",
      "required": true,
      "options": [
        { "id": "milk_entera", "label": "Entera", "price_modifier": 0.00, "is_default": true },
        { "id": "milk_coco", "label": "Coco", "price_modifier": 10.00, "is_default": false }
      ]
    },
    {
      "group_id": "essences",
      "group_name": "Esencia",
      "type": "single",
      "required": false,
      "options": [
        { "id": "essence_caramelo", "label": "Caramelo", "price_modifier": 0.00 }
      ]
    }
  ]
}
```

---

## Pricing Calculation Example

### Scenario: Customer orders Latte with Coco milk + Caramelo essence

```typescript
// Base item
const basePrice = 65.00; // Latte price

// Selected modifiers
const selections = [
  { group_id: "milk_types", option_id: "milk_coco" },      // +10.00
  { group_id: "essences", option_id: "essence_caramelo" }  // +0.00
];

// Calculate total
let totalPrice = basePrice;

selections.forEach(selection => {
  const group = modifierGroups.find(g => g.id === selection.group_id);
  const option = group.options.find(o => o.id === selection.option_id);
  totalPrice += option.price_modifier;
});

// Result: 65.00 + 10.00 + 0.00 = $75.00
```

---

## Modifier Types Explained

### 1. Single Selection (Radio Buttons)
```
Type: 'single'
Example: "Tipo de leche"

┌─────────────────────────────┐
│ Tipo de leche (Required)    │
├─────────────────────────────┤
│ ◉ Entera          +$0       │
│ ○ Deslactosada    +$0       │
│ ○ Coco            +$10      │
│ ○ Almendra        +$10      │
└─────────────────────────────┘

min_selections: 1
max_selections: 1
required: true
```

### 2. Multiple Selection (Checkboxes)
```
Type: 'multiple'
Example: "Salsas"

┌─────────────────────────────┐
│ Salsas (Optional, max 3)    │
├─────────────────────────────┤
│ ☑ Macha           +$0       │
│ ☐ Chipotle        +$0       │
│ ☑ De la casa      +$0       │
└─────────────────────────────┘

min_selections: 0
max_selections: 3
required: false
```

### 3. Boolean (Yes/No Toggle)
```
Type: 'boolean'
Example: "Add Egg"

┌─────────────────────────────┐
│ Extras                      │
├─────────────────────────────┤
│ ☑ Agrega huevo    +$15      │
└─────────────────────────────┘

min_selections: 0
max_selections: 1
required: false
```

---

## Table Size Estimates

Based on current menu data:

| Table                  | Rows | Avg Size/Row | Total Size |
|------------------------|------|--------------|------------|
| categories             | 9    | ~100 bytes   | ~1 KB      |
| menu_items             | 67   | ~500 bytes   | ~35 KB     |
| modifier_groups        | 20   | ~200 bytes   | ~4 KB      |
| modifier_options       | 85   | ~150 bytes   | ~13 KB     |
| menu_item_modifiers    | 120  | ~100 bytes   | ~12 KB     |
| admin_users            | 5    | ~200 bytes   | ~1 KB      |
| **Total**              | **306** | -         | **~66 KB** |

**Storage Bucket (menu-images):**
- Estimated: 67 images × 200 KB avg = ~13 MB

**Total Database Size:** < 15 MB (extremely lightweight!)

---

## Performance Optimizations

### Indexes Created

```sql
-- Categories
CREATE INDEX idx_categories_active_position
  ON categories(is_active, position)
  WHERE is_active = true;

-- Menu Items
CREATE INDEX idx_menu_items_category_position
  ON menu_items(category_id, position);

CREATE INDEX idx_menu_items_available
  ON menu_items(is_available)
  WHERE is_available = true;

-- Modifier Options
CREATE INDEX idx_modifier_options_group
  ON modifier_options(modifier_group_id, position);

-- Menu Item Modifiers
CREATE INDEX idx_menu_item_modifiers_item
  ON menu_item_modifiers(menu_item_id, position);

-- Admin Users
CREATE INDEX idx_admin_users_email
  ON admin_users(email);
```

### Query Performance

| Query Type                    | Estimated Time | Rows Scanned |
|-------------------------------|----------------|--------------|
| Get all active categories     | < 1ms          | 9            |
| Get category with items       | < 5ms          | ~15          |
| Get item with modifiers       | < 10ms         | ~30          |
| Full menu with all data       | < 20ms         | ~300         |

---

## Security Model

```
┌─────────────────────────────────────────────────────────────┐
│                    ROW LEVEL SECURITY                        │
└─────────────────────────────────────────────────────────────┘

PUBLIC (Unauthenticated)          ADMIN (Authenticated)
─────────────────────────         ───────────────────────
✅ SELECT categories               ✅ SELECT all categories
   WHERE is_active = true             (including inactive)

✅ SELECT menu_items               ✅ INSERT menu_items
   WHERE is_available = true       ✅ UPDATE menu_items
                                   ✅ DELETE menu_items
✅ SELECT modifier_groups
✅ SELECT modifier_options         ✅ Full CRUD on modifiers

❌ INSERT/UPDATE/DELETE            ✅ Manage admin_users (super admin)
   (all write ops blocked)         ✅ Upload/delete images
```

---

## Migration Checklist

- [ ] Create Supabase project
- [ ] Copy API credentials to `.env.local`
- [ ] Run migration `001_initial_schema.sql`
- [ ] Run migration `002_row_level_security.sql`
- [ ] Run migration `003_seed_modifier_groups.sql`
- [ ] Create storage bucket `menu-images`
- [ ] Configure storage policies
- [ ] Run data migration script `migrate-menu-data.ts`
- [ ] Verify data in Supabase dashboard
- [ ] Create first admin user
- [ ] Test frontend integration
- [ ] Upload sample menu images

---

**Schema Version:** 1.0.0
**Last Updated:** 2025-10-05
