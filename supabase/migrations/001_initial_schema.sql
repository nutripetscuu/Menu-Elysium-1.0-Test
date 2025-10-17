-- =====================================================
-- ELYSIUM RESTAURANT MENU DATABASE SCHEMA
-- Supabase Migration: Initial Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: categories
-- Stores menu categories (Calientes, Frappés, etc.)
-- =====================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL, -- Icon name from Lucide React
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Index for active categories ordered by position
CREATE INDEX idx_categories_active_position ON categories(is_active, position) WHERE is_active = true;

-- =====================================================
-- TABLE: menu_items
-- Stores individual menu items with pricing
-- =====================================================
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Pricing: either single price OR medium/grande sizes
  price DECIMAL(10,2), -- Single price (e.g., 40.00)
  price_medium DECIMAL(10,2), -- Medium size price
  price_grande DECIMAL(10,2), -- Grande size price

  -- Media & metadata
  image_url TEXT,
  tags TEXT[] DEFAULT '{}', -- Array of tags: ["Popular", "Nuevo"]
  portion TEXT, -- Portion description (e.g., "Porción individual")

  -- Display & availability
  position INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,

  -- Constraints: Must have either single price OR both size prices
  CONSTRAINT price_check CHECK (
    (price IS NOT NULL AND price_medium IS NULL AND price_grande IS NULL) OR
    (price IS NULL AND price_medium IS NOT NULL AND price_grande IS NOT NULL)
  )
);

-- Index for category items ordered by position
CREATE INDEX idx_menu_items_category_position ON menu_items(category_id, position);
-- Index for available items
CREATE INDEX idx_menu_items_available ON menu_items(is_available) WHERE is_available = true;

-- =====================================================
-- TABLE: modifier_groups
-- Stores modifier group definitions (e.g., "Tipo de leche")
-- =====================================================
CREATE TABLE modifier_groups (
  id TEXT PRIMARY KEY, -- Human-readable ID (e.g., "milk_types")
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('single', 'multiple', 'boolean')),
  required BOOLEAN NOT NULL DEFAULT false,
  min_selections INTEGER NOT NULL DEFAULT 0,
  max_selections INTEGER, -- NULL = unlimited
  position INTEGER NOT NULL DEFAULT 0, -- Display order
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- =====================================================
-- TABLE: modifier_options
-- Stores individual options within modifier groups
-- =====================================================
CREATE TABLE modifier_options (
  id TEXT PRIMARY KEY, -- Human-readable ID (e.g., "milk_entera")
  modifier_group_id TEXT NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  price_modifier DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Can be positive or negative
  is_default BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0, -- Display order within group
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Index for modifier options by group
CREATE INDEX idx_modifier_options_group ON modifier_options(modifier_group_id, position);

-- =====================================================
-- TABLE: menu_item_modifiers
-- Junction table linking menu items to modifier groups
-- =====================================================
CREATE TABLE menu_item_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  modifier_group_id TEXT NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0, -- Order in which modifiers appear
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate modifier groups per menu item
  UNIQUE(menu_item_id, modifier_group_id)
);

-- Index for efficient lookup of modifiers for a menu item
CREATE INDEX idx_menu_item_modifiers_item ON menu_item_modifiers(menu_item_id, position);

-- =====================================================
-- TABLE: admin_users
-- Stores admin panel users
-- =====================================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'editor')) DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Index for email lookup
CREATE INDEX idx_admin_users_email ON admin_users(email);

-- =====================================================
-- TRIGGERS: Auto-update updated_at timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modifier_groups_updated_at BEFORE UPDATE ON modifier_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modifier_options_updated_at BEFORE UPDATE ON modifier_options
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS: Convenience views for common queries
-- =====================================================

-- View: Full menu with items and modifiers
CREATE OR REPLACE VIEW menu_full AS
SELECT
  c.id as category_id,
  c.name as category_name,
  c.icon as category_icon,
  c.position as category_position,
  mi.id as item_id,
  mi.name as item_name,
  mi.description,
  mi.price,
  mi.price_medium,
  mi.price_grande,
  mi.image_url,
  mi.tags,
  mi.portion,
  mi.position as item_position,
  mi.is_available,
  COALESCE(
    json_agg(
      json_build_object(
        'modifier_group_id', mim.modifier_group_id,
        'position', mim.position
      ) ORDER BY mim.position
    ) FILTER (WHERE mim.modifier_group_id IS NOT NULL),
    '[]'::json
  ) as modifier_groups
FROM categories c
LEFT JOIN menu_items mi ON mi.category_id = c.id
LEFT JOIN menu_item_modifiers mim ON mim.menu_item_id = mi.id
WHERE c.is_active = true
GROUP BY c.id, c.name, c.icon, c.position, mi.id, mi.name, mi.description,
         mi.price, mi.price_medium, mi.price_grande, mi.image_url, mi.tags,
         mi.portion, mi.position, mi.is_available
ORDER BY c.position, mi.position;

-- =====================================================
-- COMMENTS: Table and column documentation
-- =====================================================
COMMENT ON TABLE categories IS 'Menu categories (e.g., Calientes, Frappés, Frescos)';
COMMENT ON TABLE menu_items IS 'Individual menu items with pricing and customization options';
COMMENT ON TABLE modifier_groups IS 'Customization groups (e.g., milk type, sauces, ingredients)';
COMMENT ON TABLE modifier_options IS 'Individual options within modifier groups';
COMMENT ON TABLE menu_item_modifiers IS 'Links menu items to their available modifier groups';
COMMENT ON TABLE admin_users IS 'Admin panel users with role-based access';

COMMENT ON COLUMN menu_items.price IS 'Single price for items without sizes';
COMMENT ON COLUMN menu_items.price_medium IS 'Medium size price (mutually exclusive with single price)';
COMMENT ON COLUMN menu_items.price_grande IS 'Grande size price (mutually exclusive with single price)';
COMMENT ON COLUMN modifier_options.price_modifier IS 'Additional cost (+) or discount (-) for this option';
