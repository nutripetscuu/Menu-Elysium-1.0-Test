-- =====================================================
-- MIGRATION: Add Variants Table for Unlimited Sizing
-- Purpose: Support unlimited size variants per menu item
-- =====================================================

-- Create variants table
CREATE TABLE menu_item_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Variant name (e.g., "Medium", "Grande", "Extra Grande", "Personal", etc.)
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0), -- Variant price
  position INTEGER NOT NULL DEFAULT 0, -- Display order
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,

  -- Ensure no duplicate variant names per item
  UNIQUE(menu_item_id, name)
);

-- Index for efficient lookup of variants for a menu item
CREATE INDEX idx_menu_item_variants_item ON menu_item_variants(menu_item_id, position);

-- Trigger for auto-updating updated_at
CREATE TRIGGER update_menu_item_variants_updated_at BEFORE UPDATE ON menu_item_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Remove the price_check constraint from menu_items
-- Now we support three pricing models:
-- 1. Single price (price field only)
-- 2. Legacy medium/grande (price_medium + price_grande)
-- 3. New variants table (unlimited variants)
ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS price_check;

-- Add new flexible constraint
-- Either: single price, OR medium+grande, OR has variants in variants table
ALTER TABLE menu_items ADD CONSTRAINT price_check_flexible CHECK (
  (price IS NOT NULL AND price_medium IS NULL AND price_grande IS NULL) OR
  (price IS NULL AND price_medium IS NOT NULL AND price_grande IS NOT NULL) OR
  (price IS NULL AND price_medium IS NULL AND price_grande IS NULL)
);

-- Add comment
COMMENT ON TABLE menu_item_variants IS 'Unlimited size variants for menu items (e.g., Small, Medium, Large, Extra Large, etc.)';
COMMENT ON COLUMN menu_item_variants.name IS 'Variant name (e.g., "Medium", "Grande", "Extra Grande", "Personal")';
COMMENT ON COLUMN menu_item_variants.price IS 'Price for this specific variant';
COMMENT ON COLUMN menu_item_variants.position IS 'Display order (0-based, lower numbers appear first)';
