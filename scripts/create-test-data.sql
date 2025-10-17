-- =====================================================
-- CREATE TEST DATA FOR BOTH RESTAURANTS
-- =====================================================
-- This creates sample menu data for testing multi-tenancy
-- Run this AFTER linking admin users
-- =====================================================

DO $$
DECLARE
  tokyo_id UUID;
  osaka_id UUID;

  -- Tokyo category IDs
  tokyo_sushi_cat_id UUID;
  tokyo_ramen_cat_id UUID;
  tokyo_drinks_cat_id UUID;

  -- Osaka category IDs
  osaka_sushi_cat_id UUID;
  osaka_ramen_cat_id UUID;
  osaka_drinks_cat_id UUID;

BEGIN
  -- Get restaurant IDs
  SELECT id INTO tokyo_id FROM restaurants WHERE slug = 'elysium-tokyo';
  SELECT id INTO osaka_id FROM restaurants WHERE slug = 'elysium-osaka';

  RAISE NOTICE 'Creating test data for Tokyo (%) and Osaka (%)', tokyo_id, osaka_id;

  -- =====================================================
  -- TOKYO RESTAURANT DATA
  -- =====================================================

  -- Tokyo Categories
  INSERT INTO categories (id, name, slug, icon, position, is_active, restaurant_id, created_at)
  VALUES
    (gen_random_uuid(), 'Tokyo Sushi', 'tokyo-sushi', 'UtensilsCrossed', 0, true, tokyo_id, NOW()),
    (gen_random_uuid(), 'Tokyo Ramen', 'tokyo-ramen', 'Soup', 1, true, tokyo_id, NOW()),
    (gen_random_uuid(), 'Tokyo Drinks', 'tokyo-drinks', 'Coffee', 2, true, tokyo_id, NOW())
  RETURNING id INTO tokyo_sushi_cat_id, tokyo_ramen_cat_id, tokyo_drinks_cat_id;

  -- Get Tokyo category IDs
  SELECT id INTO tokyo_sushi_cat_id FROM categories WHERE slug = 'tokyo-sushi';
  SELECT id INTO tokyo_ramen_cat_id FROM categories WHERE slug = 'tokyo-ramen';
  SELECT id INTO tokyo_drinks_cat_id FROM categories WHERE slug = 'tokyo-drinks';

  -- Tokyo Menu Items
  INSERT INTO menu_items (name, description, price, category_id, position, is_available, restaurant_id, tags, created_at)
  VALUES
    -- Sushi
    ('Tokyo Dragon Roll', 'Eel, cucumber, avocado with special sauce - Tokyo style', 18.99, tokyo_sushi_cat_id, 0, true, tokyo_id, ARRAY['Popular'], NOW()),
    ('Tokyo Rainbow Roll', 'Fresh assorted fish over California roll - Tokyo edition', 16.99, tokyo_sushi_cat_id, 1, true, tokyo_id, ARRAY['New'], NOW()),
    ('Tokyo Nigiri Set', '8 pieces of chef''s selection - Tokyo fresh', 24.99, tokyo_sushi_cat_id, 2, true, tokyo_id, NULL, NOW()),

    -- Ramen
    ('Tokyo Tonkotsu Ramen', 'Rich pork bone broth - Tokyo recipe', 14.99, tokyo_ramen_cat_id, 0, true, tokyo_id, ARRAY['Popular'], NOW()),
    ('Tokyo Miso Ramen', 'Savory miso broth with corn and butter - Tokyo style', 13.99, tokyo_ramen_cat_id, 1, true, tokyo_id, NULL, NOW()),
    ('Tokyo Spicy Tan Tan Ramen', 'Spicy sesame broth - Tokyo heat', 15.99, tokyo_ramen_cat_id, 2, true, tokyo_id, ARRAY['Spicy'], NOW()),

    -- Drinks
    ('Tokyo Green Tea', 'Premium matcha from Tokyo region', 3.99, tokyo_drinks_cat_id, 0, true, tokyo_id, NULL, NOW()),
    ('Tokyo Sake Flight', 'Three premium sake selections - Tokyo breweries', 18.99, tokyo_drinks_cat_id, 1, true, tokyo_id, ARRAY['Popular'], NOW());

  -- =====================================================
  -- OSAKA RESTAURANT DATA
  -- =====================================================

  -- Osaka Categories
  INSERT INTO categories (id, name, slug, icon, position, is_active, restaurant_id, created_at)
  VALUES
    (gen_random_uuid(), 'Osaka Sushi', 'osaka-sushi', 'UtensilsCrossed', 0, true, osaka_id, NOW()),
    (gen_random_uuid(), 'Osaka Ramen', 'osaka-ramen', 'Soup', 1, true, osaka_id, NOW()),
    (gen_random_uuid(), 'Osaka Drinks', 'osaka-drinks', 'Coffee', 2, true, osaka_id, NOW());

  -- Get Osaka category IDs
  SELECT id INTO osaka_sushi_cat_id FROM categories WHERE slug = 'osaka-sushi';
  SELECT id INTO osaka_ramen_cat_id FROM categories WHERE slug = 'osaka-ramen';
  SELECT id INTO osaka_drinks_cat_id FROM categories WHERE slug = 'osaka-drinks';

  -- Osaka Menu Items
  INSERT INTO menu_items (name, description, price, category_id, position, is_available, restaurant_id, tags, created_at)
  VALUES
    -- Sushi
    ('Osaka Tiger Roll', 'Shrimp tempura, spicy tuna - Osaka fusion', 17.99, osaka_sushi_cat_id, 0, true, osaka_id, ARRAY['Popular'], NOW()),
    ('Osaka Sunset Roll', 'Salmon, avocado, cream cheese - Osaka special', 15.99, osaka_sushi_cat_id, 1, true, osaka_id, ARRAY['New'], NOW()),
    ('Osaka Sashimi Platter', 'Premium selection - Osaka market fresh', 28.99, osaka_sushi_cat_id, 2, true, osaka_id, NULL, NOW()),

    -- Ramen
    ('Osaka Shoyu Ramen', 'Classic soy sauce broth - Osaka tradition', 13.99, osaka_ramen_cat_id, 0, true, osaka_id, ARRAY['Popular'], NOW()),
    ('Osaka Tsukemen', 'Dipping ramen - Osaka style', 15.99, osaka_ramen_cat_id, 1, true, osaka_id, NULL, NOW()),
    ('Osaka Black Garlic Ramen', 'Rich garlic oil broth - Osaka signature', 16.99, osaka_ramen_cat_id, 2, true, osaka_id, ARRAY['Popular'], NOW()),

    -- Drinks
    ('Osaka Oolong Tea', 'Traditional oolong from Osaka region', 3.49, osaka_drinks_cat_id, 0, true, osaka_id, NULL, NOW()),
    ('Osaka Whisky Highball', 'Premium Japanese whisky - Osaka distillery', 12.99, osaka_drinks_cat_id, 1, true, osaka_id, ARRAY['Popular'], NOW());

  RAISE NOTICE '';
  RAISE NOTICE '✅ Test data created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Tokyo Restaurant:';
  RAISE NOTICE '  - 3 categories, 8 menu items';
  RAISE NOTICE '';
  RAISE NOTICE 'Osaka Restaurant:';
  RAISE NOTICE '  - 3 categories, 8 menu items';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Login to test data isolation!';
END $$;

-- Verify the data
SELECT
  r.name as restaurant,
  COUNT(DISTINCT c.id) as categories,
  COUNT(DISTINCT mi.id) as menu_items
FROM restaurants r
LEFT JOIN categories c ON c.restaurant_id = r.id
LEFT JOIN menu_items mi ON mi.restaurant_id = r.id
WHERE r.slug IN ('elysium-tokyo', 'elysium-osaka')
GROUP BY r.name
ORDER BY r.name;

-- Show sample data
SELECT
  r.name as restaurant,
  c.name as category,
  mi.name as menu_item,
  mi.price
FROM menu_items mi
JOIN categories c ON mi.category_id = c.id
JOIN restaurants r ON mi.restaurant_id = r.id
WHERE r.slug IN ('elysium-tokyo', 'elysium-osaka')
ORDER BY r.name, c.position, mi.position
LIMIT 5;
