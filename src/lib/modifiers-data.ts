import type { ModifierGroup } from "./types/database";

// ==================== MODIFIER GROUPS ====================

// Milk types (used across multiple drinks)
export const MILK_TYPES: ModifierGroup = {
  id: "milk_types",
  name: "Tipo de leche",
  type: "single",
  required: true, position: 0,
  minSelections: 1,
  maxSelections: 1,
  options: [
    { id: "milk_entera", label: "Entera", priceModifier: 0, isDefault: true, position: 0 },
    { id: "milk_deslactosada", label: "Deslactosada", priceModifier: 0, isDefault: false, position: 0 },
    { id: "milk_coco", label: "Coco", priceModifier: 10, isDefault: false, position: 0 },
    { id: "milk_almendra", label: "Almendra", priceModifier: 10, isDefault: false, position: 0 },
  ],
};

// Milk to accompany (for Americano)
export const MILK_TO_ACCOMPANY: ModifierGroup = {
  id: "milk_to_accompany",
  name: "Tipo de leche para acompañar",
  type: "single",
  required: true, position: 0,
  minSelections: 0,
  maxSelections: 1,
  options: [
    { id: "milk_entera", label: "Entera", priceModifier: 0, isDefault: true, position: 0 },
    { id: "milk_deslactosada", label: "Deslactosada", priceModifier: 0, isDefault: false, position: 0 },
    { id: "milk_coco", label: "Coco", priceModifier: 10, isDefault: false, position: 0 },
    { id: "milk_almendra", label: "Almendra", priceModifier: 10, isDefault: false, position: 0 },
  ],
};

// Essences (for Latte)
export const ESSENCES: ModifierGroup = {
  id: "essences",
  name: "Esencia",
  type: "single",
  required: true, position: 0,
  minSelections: 0,
  maxSelections: 1,
  options: [
    { id: "essence_caramelo", label: "Caramelo", priceModifier: 0, isDefault: false, position: 0 },
    { id: "essence_vainilla", label: "Vainilla", priceModifier: 0, isDefault: false, position: 0 },
  ],
};

// Cinnamon topping (for Capuccino)
export const CINNAMON_TOPPING: ModifierGroup = {
  id: "cinnamon_topping",
  name: "Topping",
  type: "boolean",
  required: true, position: 0,
  minSelections: 0,
  maxSelections: 1,
  options: [
    { id: "cinnamon_yes", label: "Canela", priceModifier: 0, isDefault: false, position: 0 },
  ],
};

// Tea types
export const TEA_TYPES: ModifierGroup = {
  id: "tea_types",
  name: "Tipo de té",
  type: "single",
  required: true, position: 0,
  minSelections: 1,
  maxSelections: 1,
  options: [
    { id: "tea_manzanilla", label: "Manzanilla", priceModifier: 0, isDefault: true, position: 0 },
    { id: "tea_verde", label: "Verde", priceModifier: 0, isDefault: false, position: 0 },
    { id: "tea_menta", label: "Menta", priceModifier: 0, isDefault: false, position: 0 },
  ],
};

// Tea presentation
export const TEA_PRESENTATION: ModifierGroup = {
  id: "tea_presentation",
  name: "Presentación",
  type: "single",
  required: true, position: 0,
  minSelections: 1,
  maxSelections: 1,
  options: [
    { id: "presentation_hot", label: "Caliente", priceModifier: 0, isDefault: true, position: 0 },
    { id: "presentation_iced", label: "En las rocas", priceModifier: 0, isDefault: false, position: 0 },
  ],
};

// Frappe sizes
export const FRAPPE_SIZES: ModifierGroup = {
  id: "frappe_sizes",
  name: "Tamaño",
  type: "single",
  required: true, position: 0,
  minSelections: 1,
  maxSelections: 1,
  options: [
    { id: "size_medium", label: "Mediano", priceModifier: 0, isDefault: true, position: 0 },
    { id: "size_grande", label: "Grande", priceModifier: 0, isDefault: false, position: 0 },
  ],
};

// Whipped cream decoration
export const WHIPPED_CREAM: ModifierGroup = {
  id: "whipped_cream",
  name: "Decoración",
  type: "single",
  required: true, position: 0,
  minSelections: 1,
  maxSelections: 1,
  options: [
    { id: "cream_yes", label: "Con crema batida", priceModifier: 0, isDefault: true, position: 0 },
    { id: "cream_no", label: "Sin crema batida", priceModifier: 0, isDefault: false, position: 0 },
  ],
};

// Tapioca toppings
export const TAPIOCA_TOPPINGS: ModifierGroup = {
  id: "tapioca_toppings",
  name: "Toppings",
  type: "multiple",
  required: true, position: 0,
  minSelections: 0,
  maxSelections: 2,
  options: [
    { id: "tapioca_fresa", label: "Tapioca fresa", priceModifier: 20, isDefault: false, position: 0 },
    { id: "tapioca_tradicional", label: "Tapioca tradicional", priceModifier: 20, isDefault: false, position: 0 },
  ],
};

// Tapioca for fresh drinks (single option)
export const TAPIOCA_FRESCOS: ModifierGroup = {
  id: "tapioca_frescos",
  name: "Extras",
  type: "boolean",
  required: true, position: 0,
  minSelections: 0,
  maxSelections: 1,
  options: [
    { id: "tapioca_fresa_single", label: "Tapioca de fresa", priceModifier: 20, isDefault: false, position: 0 },
  ],
};

// Sauces (for food items)
export const SAUCES: ModifierGroup = {
  id: "sauces",
  name: "Salsas",
  type: "multiple",
  required: true, position: 0,
  minSelections: 0,
  maxSelections: 3,
  options: [
    { id: "sauce_macha", label: "Macha", priceModifier: 0, isDefault: false, position: 0 },
    { id: "sauce_chipotle", label: "Chipotle", priceModifier: 0, isDefault: false, position: 0 },
    { id: "sauce_casa", label: "De la casa", priceModifier: 0, isDefault: false, position: 0 },
  ],
};

// ==================== INGREDIENT MODIFIERS ====================

// OLIMPO Panini ingredients
export const OLIMPO_INGREDIENTS: ModifierGroup = {
  id: "olimpo_ingredients",
  name: "Ingredientes (puedes excluir lo que no desees)",
  type: "multiple",
  required: true, position: 0,
  minSelections: 0,
  maxSelections: 4,
  options: [
    { id: "ing_bistec", label: "Bistec", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_queso", label: "Queso", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_lechuga", label: "Lechuga", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_pimientos", label: "Pimientos salteados", priceModifier: 0, isDefault: true, position: 0 },
  ],
};

// ELISEO Panini ingredients
export const ELISEO_INGREDIENTS: ModifierGroup = {
  id: "eliseo_ingredients",
  name: "Ingredientes (puedes excluir lo que no desees)",
  type: "multiple",
  required: true, position: 0,
  minSelections: 0,
  maxSelections: 4,
  options: [
    { id: "ing_pollo", label: "Pollo", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_queso", label: "Queso", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_tocino", label: "Tocino", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_lechuga", label: "Lechuga", priceModifier: 0, isDefault: true, position: 0 },
  ],
};

// CELESTE Panini ingredients
export const CELESTE_INGREDIENTS: ModifierGroup = {
  id: "celeste_ingredients",
  name: "Ingredientes (puedes excluir lo que no desees)",
  type: "multiple",
  required: true, position: 0,
  minSelections: 0,
  maxSelections: 3,
  options: [
    { id: "ing_jamon", label: "Jamón", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_queso", label: "Queso", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_lechuga", label: "Lechuga", priceModifier: 0, isDefault: true, position: 0 },
  ],
};

// CAESAR Salad ingredients
export const CAESAR_INGREDIENTS: ModifierGroup = {
  id: "caesar_ingredients",
  name: "Ingredientes (puedes excluir lo que no desees)",
  type: "multiple",
  required: true, position: 0,
  minSelections: 0,
  maxSelections: 5,
  options: [
    { id: "ing_lechuga_orejona", label: "Lechuga orejona", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_pollo", label: "Pollo", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_queso_parmesano", label: "Queso parmesano", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_aderezo_caesar", label: "Aderezo caesar", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_pan", label: "Pan", priceModifier: 0, isDefault: true, position: 0 },
  ],
};

// ELYSIUM Salad ingredients
export const ELYSIUM_INGREDIENTS: ModifierGroup = {
  id: "elysium_ingredients",
  name: "Ingredientes (puedes excluir lo que no desees)",
  type: "multiple",
  required: true, position: 0,
  minSelections: 0,
  maxSelections: 7,
  options: [
    { id: "ing_lechuga_orejona", label: "Lechuga orejona", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_espinaca", label: "Espinaca", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_fresa", label: "Fresa", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_arandanos", label: "Arándanos", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_queso_cabra", label: "Queso de cabra", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_nuez", label: "Nuez", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_vinagreta", label: "Vinagreta de la casa", priceModifier: 0, isDefault: true, position: 0 },
  ],
};

// POLLO Toast ingredients
export const POLLO_TOAST_INGREDIENTS: ModifierGroup = {
  id: "pollo_toast_ingredients",
  name: "Ingredientes (puedes excluir lo que no desees)",
  type: "multiple",
  required: true, position: 0,
  minSelections: 0,
  maxSelections: 5,
  options: [
    { id: "ing_pollo", label: "Pollo", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_pimientos", label: "Pimientos salteados", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_salsa_casa", label: "Salsa de la casa", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_lechuga", label: "Lechuga fresca", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_tomates_cherry", label: "Tomates cherry", priceModifier: 0, isDefault: true, position: 0 },
  ],
};

// AVO Toast ingredients
export const AVO_TOAST_INGREDIENTS: ModifierGroup = {
  id: "avo_toast_ingredients",
  name: "Ingredientes (puedes excluir lo que no desees)",
  type: "multiple",
  required: true, position: 0,
  minSelections: 0,
  maxSelections: 6,
  options: [
    { id: "ing_jocoque", label: "Jocoque", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_aguacate", label: "Aguacate fresco", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_ajonjoli", label: "Ajonjolí", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_tomates_cherry_salteados", label: "Tomates cherry salteados", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_lechuga", label: "Lechuga", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_tomates_cherry", label: "Tomates cherry frescos", priceModifier: 0, isDefault: true, position: 0 },
  ],
};

// PERA Toast ingredients
export const PERA_TOAST_INGREDIENTS: ModifierGroup = {
  id: "pera_toast_ingredients",
  name: "Ingredientes (puedes excluir lo que no desees)",
  type: "multiple",
  required: true, position: 0,
  minSelections: 0,
  maxSelections: 7,
  options: [
    { id: "ing_queso_crema", label: "Queso crema", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_pera", label: "Láminas de pera", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_queso_panela", label: "Queso panela", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_nueces", label: "Nueces", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_miel", label: "Miel", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_fresas", label: "Fresas", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_moras", label: "Moras", priceModifier: 0, isDefault: true, position: 0 },
  ],
};

// PAPAS DE LA CASA ingredients
export const PAPAS_CASA_INGREDIENTS: ModifierGroup = {
  id: "papas_casa_ingredients",
  name: "Ingredientes (puedes excluir lo que no desees)",
  type: "multiple",
  required: true, position: 0,
  minSelections: 0,
  maxSelections: 3,
  options: [
    { id: "ing_camote", label: "Camote", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_papas_fritas", label: "Papas fritas", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_catsup_chile", label: "Salsa catsup con chile quebrado", priceModifier: 0, isDefault: true, position: 0 },
  ],
};

// PAPAS PREPARADAS ingredients
export const PAPAS_PREP_INGREDIENTS: ModifierGroup = {
  id: "papas_prep_ingredients",
  name: "Ingredientes (puedes excluir lo que no desees)",
  type: "multiple",
  required: true, position: 0,
  minSelections: 0,
  maxSelections: 5,
  options: [
    { id: "ing_salsa_picante", label: "Salsa picante", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_jugo_maggi", label: "Jugo maggi", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_limon", label: "Limón", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_rielitos", label: "Rielitos", priceModifier: 0, isDefault: true, position: 0 },
    { id: "ing_cacahuates", label: "Cacahuates", priceModifier: 0, isDefault: true, position: 0 },
  ],
};

// Add egg option (for AVO TOAST)
export const ADD_EGG: ModifierGroup = {
  id: "add_egg",
  name: "Extras",
  type: "boolean",
  required: true, position: 0,
  minSelections: 0,
  maxSelections: 1,
  options: [
    { id: "extra_egg", label: "Agrega huevo", priceModifier: 15, isDefault: false, position: 0 },
  ],
};

// ==================== MODIFIER PRESETS ====================

// Common combinations for easy assignment
export const MODIFIER_PRESETS = {
  // Hot drinks with milk
  HOT_DRINK_WITH_MILK: [MILK_TYPES.id],

  // Hot drinks with milk and essences
  HOT_DRINK_WITH_MILK_AND_ESSENCES: [MILK_TYPES.id, ESSENCES.id],

  // Americano (milk to accompany)
  AMERICANO: [MILK_TO_ACCOMPANY.id],

  // Capuccino (milk + cinnamon)
  CAPUCCINO: [MILK_TYPES.id, CINNAMON_TOPPING.id],

  // Tea (types + presentation)
  TEA: [TEA_TYPES.id, TEA_PRESENTATION.id],

  // Standard frappe (all frappe modifiers) - no size selector as it's handled separately
  FRAPPE_STANDARD: [MILK_TYPES.id, WHIPPED_CREAM.id, TAPIOCA_TOPPINGS.id],

  // Frappe "en las rocas" (no decoration)
  FRAPPE_EN_LAS_ROCAS: [MILK_TYPES.id, TAPIOCA_TOPPINGS.id],

  // Fresh drinks
  FRESCOS: [TAPIOCA_FRESCOS.id],

  // Food items with sauces
  FOOD_WITH_SAUCES: [SAUCES.id],

  // Paninis with ingredients and sauces
  OLIMPO: [OLIMPO_INGREDIENTS.id, SAUCES.id],
  ELISEO: [ELISEO_INGREDIENTS.id, SAUCES.id],
  CELESTE: [CELESTE_INGREDIENTS.id, SAUCES.id],

  // Salads with ingredients and sauces
  CAESAR: [CAESAR_INGREDIENTS.id, SAUCES.id],
  ELYSIUM_SALAD: [ELYSIUM_INGREDIENTS.id, SAUCES.id],

  // Toasts with ingredients and sauces
  POLLO_TOAST: [POLLO_TOAST_INGREDIENTS.id, SAUCES.id],
  AVO_TOAST: [AVO_TOAST_INGREDIENTS.id, SAUCES.id, ADD_EGG.id],
  PERA_TOAST: [PERA_TOAST_INGREDIENTS.id, SAUCES.id],

  // Para compartir with ingredients and sauces
  PAPAS_CASA: [PAPAS_CASA_INGREDIENTS.id, SAUCES.id],
  PAPAS_PREP: [PAPAS_PREP_INGREDIENTS.id, SAUCES.id],
};

// ==================== MODIFIER REGISTRY ====================

// Central registry of all modifier groups
export const MODIFIER_GROUPS_REGISTRY: Record<string, ModifierGroup> = {
  [MILK_TYPES.id]: MILK_TYPES,
  [MILK_TO_ACCOMPANY.id]: MILK_TO_ACCOMPANY,
  [ESSENCES.id]: ESSENCES,
  [CINNAMON_TOPPING.id]: CINNAMON_TOPPING,
  [TEA_TYPES.id]: TEA_TYPES,
  [TEA_PRESENTATION.id]: TEA_PRESENTATION,
  [FRAPPE_SIZES.id]: FRAPPE_SIZES,
  [WHIPPED_CREAM.id]: WHIPPED_CREAM,
  [TAPIOCA_TOPPINGS.id]: TAPIOCA_TOPPINGS,
  [TAPIOCA_FRESCOS.id]: TAPIOCA_FRESCOS,
  [SAUCES.id]: SAUCES,
  [ADD_EGG.id]: ADD_EGG,
  [OLIMPO_INGREDIENTS.id]: OLIMPO_INGREDIENTS,
  [ELISEO_INGREDIENTS.id]: ELISEO_INGREDIENTS,
  [CELESTE_INGREDIENTS.id]: CELESTE_INGREDIENTS,
  [CAESAR_INGREDIENTS.id]: CAESAR_INGREDIENTS,
  [ELYSIUM_INGREDIENTS.id]: ELYSIUM_INGREDIENTS,
  [POLLO_TOAST_INGREDIENTS.id]: POLLO_TOAST_INGREDIENTS,
  [AVO_TOAST_INGREDIENTS.id]: AVO_TOAST_INGREDIENTS,
  [PERA_TOAST_INGREDIENTS.id]: PERA_TOAST_INGREDIENTS,
  [PAPAS_CASA_INGREDIENTS.id]: PAPAS_CASA_INGREDIENTS,
  [PAPAS_PREP_INGREDIENTS.id]: PAPAS_PREP_INGREDIENTS,
};

// Helper function to get modifier groups for a product
export function getModifierGroups(modifierGroupIds: string[]): ModifierGroup[] {
  return modifierGroupIds
    .map(id => MODIFIER_GROUPS_REGISTRY[id])
    .filter(Boolean);
}

// Helper function to calculate total price with modifiers
export function calculatePriceWithModifiers(
  basePrice: number,
  selectedModifiers: { groupId: string; optionIds: string[] }[]
): number {
  let totalPrice = basePrice;

  selectedModifiers.forEach(({ groupId, optionIds }) => {
    const group = MODIFIER_GROUPS_REGISTRY[groupId];
    if (!group) return;

    optionIds.forEach(optionId => {
      const option = group.options.find(opt => opt.id === optionId);
      if (option) {
        totalPrice += option.priceModifier;
      }
    });
  });

  return totalPrice;
}
