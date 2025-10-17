-- =====================================================
-- SEED DATA: Modifier Groups and Options
-- Migration: Insert all modifier groups and their options
-- =====================================================

-- =====================================================
-- MILK TYPES
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('milk_types', 'Tipo de leche', 'single', true, 1, 1, 1);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('milk_entera', 'milk_types', 'Entera', 0.00, true, 1),
('milk_deslactosada', 'milk_types', 'Deslactosada', 0.00, false, 2),
('milk_coco', 'milk_types', 'Coco', 10.00, false, 3),
('milk_almendra', 'milk_types', 'Almendra', 10.00, false, 4);

-- =====================================================
-- MILK TO ACCOMPANY (for Americano)
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('milk_to_accompany', 'Tipo de leche para acompañar', 'single', false, 0, 1, 2);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('milk_accompany_entera', 'milk_to_accompany', 'Entera', 0.00, true, 1),
('milk_accompany_deslactosada', 'milk_to_accompany', 'Deslactosada', 0.00, false, 2),
('milk_accompany_coco', 'milk_to_accompany', 'Coco', 10.00, false, 3),
('milk_accompany_almendra', 'milk_to_accompany', 'Almendra', 10.00, false, 4);

-- =====================================================
-- ESSENCES
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('essences', 'Esencia', 'single', false, 0, 1, 3);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('essence_caramelo', 'essences', 'Caramelo', 0.00, false, 1),
('essence_vainilla', 'essences', 'Vainilla', 0.00, false, 2);

-- =====================================================
-- CINNAMON TOPPING
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('cinnamon_topping', 'Topping', 'boolean', false, 0, 1, 4);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('cinnamon_yes', 'cinnamon_topping', 'Canela', 0.00, false, 1);

-- =====================================================
-- TEA TYPES
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('tea_types', 'Tipo de té', 'single', true, 1, 1, 5);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('tea_manzanilla', 'tea_types', 'Manzanilla', 0.00, true, 1),
('tea_verde', 'tea_types', 'Verde', 0.00, false, 2),
('tea_menta', 'tea_types', 'Menta', 0.00, false, 3);

-- =====================================================
-- TEA PRESENTATION
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('tea_presentation', 'Presentación', 'single', true, 1, 1, 6);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('presentation_hot', 'tea_presentation', 'Caliente', 0.00, true, 1),
('presentation_iced', 'tea_presentation', 'En las rocas', 0.00, false, 2);

-- =====================================================
-- WHIPPED CREAM
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('whipped_cream', 'Decoración', 'single', true, 1, 1, 7);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('cream_yes', 'whipped_cream', 'Con crema batida', 0.00, true, 1),
('cream_no', 'whipped_cream', 'Sin crema batida', 0.00, false, 2);

-- =====================================================
-- TAPIOCA TOPPINGS (Multiple)
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('tapioca_toppings', 'Toppings', 'multiple', false, 0, 2, 8);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('tapioca_fresa', 'tapioca_toppings', 'Tapioca fresa', 20.00, false, 1),
('tapioca_tradicional', 'tapioca_toppings', 'Tapioca tradicional', 20.00, false, 2);

-- =====================================================
-- TAPIOCA FRESCOS (Boolean)
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('tapioca_frescos', 'Extras', 'boolean', false, 0, 1, 9);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('tapioca_fresa_single', 'tapioca_frescos', 'Tapioca de fresa', 20.00, false, 1);

-- =====================================================
-- SAUCES
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('sauces', 'Salsas', 'multiple', false, 0, 3, 10);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('sauce_macha', 'sauces', 'Macha', 0.00, false, 1),
('sauce_chipotle', 'sauces', 'Chipotle', 0.00, false, 2),
('sauce_casa', 'sauces', 'De la casa', 0.00, false, 3);

-- =====================================================
-- ADD EGG
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('add_egg', 'Extras', 'boolean', false, 0, 1, 11);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('extra_egg', 'add_egg', 'Agrega huevo', 15.00, false, 1);

-- =====================================================
-- FOOD ITEM INGREDIENTS - OLIMPO
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('olimpo_ingredients', 'Ingredientes (puedes excluir lo que no desees)', 'multiple', false, 0, 4, 20);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('ing_bistec', 'olimpo_ingredients', 'Bistec', 0.00, true, 1),
('ing_queso_olimpo', 'olimpo_ingredients', 'Queso', 0.00, true, 2),
('ing_lechuga_olimpo', 'olimpo_ingredients', 'Lechuga', 0.00, true, 3),
('ing_pimientos_olimpo', 'olimpo_ingredients', 'Pimientos salteados', 0.00, true, 4);

-- =====================================================
-- FOOD ITEM INGREDIENTS - ELISEO
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('eliseo_ingredients', 'Ingredientes (puedes excluir lo que no desees)', 'multiple', false, 0, 4, 21);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('ing_pollo_eliseo', 'eliseo_ingredients', 'Pollo', 0.00, true, 1),
('ing_queso_eliseo', 'eliseo_ingredients', 'Queso', 0.00, true, 2),
('ing_tocino', 'eliseo_ingredients', 'Tocino', 0.00, true, 3),
('ing_lechuga_eliseo', 'eliseo_ingredients', 'Lechuga', 0.00, true, 4);

-- =====================================================
-- FOOD ITEM INGREDIENTS - CELESTE
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('celeste_ingredients', 'Ingredientes (puedes excluir lo que no desees)', 'multiple', false, 0, 3, 22);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('ing_jamon', 'celeste_ingredients', 'Jamón', 0.00, true, 1),
('ing_queso_celeste', 'celeste_ingredients', 'Queso', 0.00, true, 2),
('ing_lechuga_celeste', 'celeste_ingredients', 'Lechuga', 0.00, true, 3);

-- =====================================================
-- FOOD ITEM INGREDIENTS - CAESAR SALAD
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('caesar_ingredients', 'Ingredientes (puedes excluir lo que no desees)', 'multiple', false, 0, 5, 23);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('ing_lechuga_orejona', 'caesar_ingredients', 'Lechuga orejona', 0.00, true, 1),
('ing_pollo_caesar', 'caesar_ingredients', 'Pollo', 0.00, true, 2),
('ing_queso_parmesano', 'caesar_ingredients', 'Queso parmesano', 0.00, true, 3),
('ing_aderezo_caesar', 'caesar_ingredients', 'Aderezo caesar', 0.00, true, 4),
('ing_pan', 'caesar_ingredients', 'Pan', 0.00, true, 5);

-- =====================================================
-- FOOD ITEM INGREDIENTS - ELYSIUM SALAD
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('elysium_ingredients', 'Ingredientes (puedes excluir lo que no desees)', 'multiple', false, 0, 7, 24);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('ing_lechuga_orejona_elysium', 'elysium_ingredients', 'Lechuga orejona', 0.00, true, 1),
('ing_espinaca', 'elysium_ingredients', 'Espinaca', 0.00, true, 2),
('ing_fresa', 'elysium_ingredients', 'Fresa', 0.00, true, 3),
('ing_arandanos', 'elysium_ingredients', 'Arándanos', 0.00, true, 4),
('ing_queso_cabra', 'elysium_ingredients', 'Queso de cabra', 0.00, true, 5),
('ing_nuez', 'elysium_ingredients', 'Nuez', 0.00, true, 6),
('ing_vinagreta', 'elysium_ingredients', 'Vinagreta de la casa', 0.00, true, 7);

-- =====================================================
-- FOOD ITEM INGREDIENTS - POLLO TOAST
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('pollo_toast_ingredients', 'Ingredientes (puedes excluir lo que no desees)', 'multiple', false, 0, 5, 25);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('ing_pollo_toast', 'pollo_toast_ingredients', 'Pollo', 0.00, true, 1),
('ing_pimientos_toast', 'pollo_toast_ingredients', 'Pimientos salteados', 0.00, true, 2),
('ing_salsa_casa', 'pollo_toast_ingredients', 'Salsa de la casa', 0.00, true, 3),
('ing_lechuga_toast', 'pollo_toast_ingredients', 'Lechuga fresca', 0.00, true, 4),
('ing_tomates_cherry', 'pollo_toast_ingredients', 'Tomates cherry', 0.00, true, 5);

-- =====================================================
-- FOOD ITEM INGREDIENTS - AVO TOAST
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('avo_toast_ingredients', 'Ingredientes (puedes excluir lo que no desees)', 'multiple', false, 0, 6, 26);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('ing_jocoque', 'avo_toast_ingredients', 'Jocoque', 0.00, true, 1),
('ing_aguacate', 'avo_toast_ingredients', 'Aguacate fresco', 0.00, true, 2),
('ing_ajonjoli', 'avo_toast_ingredients', 'Ajonjolí', 0.00, true, 3),
('ing_tomates_cherry_salteados', 'avo_toast_ingredients', 'Tomates cherry salteados', 0.00, true, 4),
('ing_lechuga_avo', 'avo_toast_ingredients', 'Lechuga', 0.00, true, 5),
('ing_tomates_cherry_frescos', 'avo_toast_ingredients', 'Tomates cherry frescos', 0.00, true, 6);

-- =====================================================
-- FOOD ITEM INGREDIENTS - PERA TOAST
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('pera_toast_ingredients', 'Ingredientes (puedes excluir lo que no desees)', 'multiple', false, 0, 7, 27);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('ing_queso_crema', 'pera_toast_ingredients', 'Queso crema', 0.00, true, 1),
('ing_pera', 'pera_toast_ingredients', 'Láminas de pera', 0.00, true, 2),
('ing_queso_panela', 'pera_toast_ingredients', 'Queso panela', 0.00, true, 3),
('ing_nueces', 'pera_toast_ingredients', 'Nueces', 0.00, true, 4),
('ing_miel', 'pera_toast_ingredients', 'Miel', 0.00, true, 5),
('ing_fresas', 'pera_toast_ingredients', 'Fresas', 0.00, true, 6),
('ing_moras', 'pera_toast_ingredients', 'Moras', 0.00, true, 7);

-- =====================================================
-- FOOD ITEM INGREDIENTS - PAPAS CASA
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('papas_casa_ingredients', 'Ingredientes (puedes excluir lo que no desees)', 'multiple', false, 0, 3, 28);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('ing_camote', 'papas_casa_ingredients', 'Camote', 0.00, true, 1),
('ing_papas_fritas', 'papas_casa_ingredients', 'Papas fritas', 0.00, true, 2),
('ing_catsup_chile', 'papas_casa_ingredients', 'Salsa catsup con chile quebrado', 0.00, true, 3);

-- =====================================================
-- FOOD ITEM INGREDIENTS - PAPAS PREPARADAS
-- =====================================================
INSERT INTO modifier_groups (id, name, type, required, min_selections, max_selections, position) VALUES
('papas_prep_ingredients', 'Ingredientes (puedes excluir lo que no desees)', 'multiple', false, 0, 5, 29);

INSERT INTO modifier_options (id, modifier_group_id, label, price_modifier, is_default, position) VALUES
('ing_salsa_picante', 'papas_prep_ingredients', 'Salsa picante', 0.00, true, 1),
('ing_jugo_maggi', 'papas_prep_ingredients', 'Jugo maggi', 0.00, true, 2),
('ing_limon', 'papas_prep_ingredients', 'Limón', 0.00, true, 3),
('ing_rielitos', 'papas_prep_ingredients', 'Rielitos', 0.00, true, 4),
('ing_cacahuates', 'papas_prep_ingredients', 'Cacahuates', 0.00, true, 5);
