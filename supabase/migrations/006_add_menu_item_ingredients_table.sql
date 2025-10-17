-- Migration: Add menu_item_ingredients table for item-specific ingredients
-- This separates ingredients from the shared modifiers system
-- Each menu item can have its own unique list of ingredients that customers can exclude

-- Create menu_item_ingredients table
CREATE TABLE IF NOT EXISTS menu_item_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  can_exclude BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE(menu_item_id, name)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_menu_item_ingredients_menu_item_id
  ON menu_item_ingredients(menu_item_id);

-- Add updated_at trigger
CREATE TRIGGER set_menu_item_ingredients_updated_at
  BEFORE UPDATE ON menu_item_ingredients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE menu_item_ingredients ENABLE ROW LEVEL SECURITY;

-- Public can read ingredients for available menu items
CREATE POLICY "Allow public read access to ingredients"
  ON menu_item_ingredients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM menu_items
      WHERE menu_items.id = menu_item_ingredients.menu_item_id
      AND menu_items.is_available = true
    )
  );

-- Admin users can do everything with ingredients
CREATE POLICY "Allow admin full access to ingredients"
  ON menu_item_ingredients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );
