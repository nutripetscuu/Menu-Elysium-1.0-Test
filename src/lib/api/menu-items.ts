// API layer for menu items CRUD operations
import { createServerClient } from '../supabase/server-client';
import { assignModifiersToMenuItem, getMenuItemModifiers } from './modifiers';

export interface MenuItemVariant {
  id?: string;
  name: string;
  price: number;
  position: number;
}

export interface MenuItemIngredient {
  id?: string;
  name: string;
  canExclude: boolean;
  position: number;
}

export interface MenuItemInput {
  categoryId: string;
  name: string;
  description: string;
  price?: number | null;
  priceMedium?: number | null;
  priceGrande?: number | null;
  imageUrl?: string;
  tags?: string[];
  portion?: string;
  position: number;
  isAvailable: boolean;
  variants?: MenuItemVariant[]; // New: support for unlimited variants
  modifierGroupIds?: string[]; // IDs of modifier groups assigned to this item
  ingredients?: MenuItemIngredient[]; // Item-specific ingredients
}

export interface MenuItemUpdate {
  categoryId?: string;
  name?: string;
  description?: string;
  price?: number | null;
  priceMedium?: number | null;
  priceGrande?: number | null;
  imageUrl?: string;
  tags?: string[];
  portion?: string;
  position?: number;
  isAvailable?: boolean;
  variants?: MenuItemVariant[]; // New: support for unlimited variants
  modifierGroupIds?: string[]; // IDs of modifier groups assigned to this item
  ingredients?: MenuItemIngredient[]; // Item-specific ingredients
}

export interface ModifierOption {
  id: string;
  label: string;
  priceModifier: number;
  isDefault: boolean;
  position: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  type: 'single' | 'multiple' | 'boolean';
  required: boolean;
  minSelections: number;
  maxSelections?: number;
  position: number;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price?: number;
  priceMedium?: number;
  priceGrande?: number;
  imageUrl?: string;
  tags?: string[];
  portion?: string;
  position: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt?: string;
  variants?: MenuItemVariant[]; // New: support for unlimited variants
  modifierGroups?: ModifierGroup[]; // Full modifier group objects with details
  ingredients?: MenuItemIngredient[]; // Item-specific ingredients
}

// Get all menu items with their variants and modifiers
// MULTI-TENANT: Filters by authenticated user's restaurant_id
export async function getMenuItems(categoryId?: string): Promise<MenuItem[]> {
  const supabase = await createServerClient() as any;

  // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  let query = supabase
    .from('menu_items')
    .select(`
      *,
      variants:menu_item_variants(
        id,
        name,
        price,
        position
      ),
      ingredients:menu_item_ingredients(
        id,
        name,
        can_exclude,
        position
      ),
      menu_item_modifiers(
        modifier_group_id,
        position,
        modifier_groups(
          id,
          name,
          type,
          required,
          min_selections,
          max_selections,
          position,
          options:modifier_options(
            id,
            label,
            price_modifier,
            is_default,
            position
          )
        )
      )
    `)
    .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
    .order('position');

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch menu items: ${error.message}`);
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    categoryId: item.category_id,
    name: item.name,
    description: item.description,
    price: item.price,
    priceMedium: item.price_medium,
    priceGrande: item.price_grande,
    imageUrl: item.image_url,
    tags: item.tags || [],
    portion: item.portion,
    position: item.position,
    isAvailable: item.is_available,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    variants: (item.variants || [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((v: any) => ({
        id: v.id,
        name: v.name,
        price: v.price,
        position: v.position,
      })),
    ingredients: (item.ingredients || [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((ing: any) => ({
        id: ing.id,
        name: ing.name,
        canExclude: ing.can_exclude,
        position: ing.position,
      })),
    modifierGroups: (item.menu_item_modifiers || [])
      .filter((mim: any) => mim.modifier_groups) // Only include if modifier_groups exists
      .sort((a: any, b: any) => a.position - b.position)
      .map((mim: any) => ({
        id: mim.modifier_groups.id,
        name: mim.modifier_groups.name,
        type: mim.modifier_groups.type,
        required: mim.modifier_groups.required,
        minSelections: mim.modifier_groups.min_selections,
        maxSelections: mim.modifier_groups.max_selections,
        position: mim.modifier_groups.position,
        options: (mim.modifier_groups.options || [])
          .sort((a: any, b: any) => a.position - b.position)
          .map((opt: any) => ({
            id: opt.id,
            label: opt.label,
            priceModifier: opt.price_modifier,
            isDefault: opt.is_default,
            position: opt.position,
          }))
      })),
  }));
}

// Get single menu item by ID with variants
// MULTI-TENANT: Ensures item belongs to user's restaurant
export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const supabase = await createServerClient() as any;

  // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from('menu_items')
    .select(`
      *,
      variants:menu_item_variants(
        id,
        name,
        price,
        position
      )
    `)
    .eq('id', id)
    .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to fetch menu item: ${error.message}`);
  }

  if (!data) return null;

  // Fetch assigned modifier groups
  const modifierGroups = await getMenuItemModifiers(id);

  return {
    id: data.id,
    categoryId: data.category_id,
    name: data.name,
    description: data.description,
    price: data.price,
    priceMedium: data.price_medium,
    priceGrande: data.price_grande,
    imageUrl: data.image_url,
    tags: data.tags || [],
    portion: data.portion,
    position: data.position,
    isAvailable: data.is_available,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    variants: (data.variants || [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((v: any) => ({
        id: v.id,
        name: v.name,
        price: v.price,
        position: v.position,
      })),
    modifierGroups: modifierGroups as any,
  };
}

// Create a new menu item with variants
export async function createMenuItem(input: MenuItemInput): Promise<MenuItem> {
  const supabase = await createServerClient() as any;

  // Get restaurant_id from authenticated user (critical for multi-tenancy)
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  // Insert menu item
  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      category_id: input.categoryId,
      name: input.name,
      description: input.description,
      price: input.price,
      price_medium: input.priceMedium,
      price_grande: input.priceGrande,
      image_url: input.imageUrl,
      tags: input.tags || [],
      portion: input.portion,
      position: input.position,
      is_available: input.isAvailable,
      restaurant_id: restaurantId, // Multi-tenant: inject restaurant_id
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create menu item: ${error.message}`);
  }

  // Insert variants if provided
  let variants: MenuItemVariant[] = [];
  if (input.variants && input.variants.length > 0) {
    const variantInserts = input.variants.map((variant, index) => ({
      menu_item_id: data.id,
      name: variant.name,
      price: variant.price,
      position: variant.position ?? index,
      restaurant_id: restaurantId, // Multi-tenant: inject restaurant_id
    }));

    const { data: variantsData, error: variantsError } = await supabase
      .from('menu_item_variants')
      .insert(variantInserts)
      .select();

    if (variantsError) {
      // Rollback: delete the menu item
      await supabase.from('menu_items').delete().eq('id', data.id);
      throw new Error(`Failed to create variants: ${variantsError.message}`);
    }

    variants = (variantsData || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      price: v.price,
      position: v.position,
    }));
  }

  // Insert ingredients if provided
  let ingredients: MenuItemIngredient[] = [];
  if (input.ingredients && input.ingredients.length > 0) {
    const ingredientInserts = input.ingredients.map((ingredient, index) => ({
      menu_item_id: data.id,
      name: ingredient.name,
      can_exclude: ingredient.canExclude,
      position: ingredient.position ?? index,
      restaurant_id: restaurantId, // Multi-tenant: inject restaurant_id
    }));

    const { data: ingredientsData, error: ingredientsError } = await supabase
      .from('menu_item_ingredients')
      .insert(ingredientInserts)
      .select();

    if (ingredientsError) {
      // Rollback: delete the menu item
      await supabase.from('menu_items').delete().eq('id', data.id);
      throw new Error(`Failed to create ingredients: ${ingredientsError.message}`);
    }

    ingredients = (ingredientsData || []).map((ing: any) => ({
      id: ing.id,
      name: ing.name,
      canExclude: ing.can_exclude,
      position: ing.position,
    }));
  }

  // Assign modifiers if provided
  if (input.modifierGroupIds && input.modifierGroupIds.length > 0) {
    try {
      await assignModifiersToMenuItem(data.id, input.modifierGroupIds);
    } catch (error) {
      // Rollback: delete the menu item
      await supabase.from('menu_items').delete().eq('id', data.id);
      throw error;
    }
  }

  return {
    id: data.id,
    categoryId: data.category_id,
    name: data.name,
    description: data.description,
    price: data.price,
    priceMedium: data.price_medium,
    priceGrande: data.price_grande,
    imageUrl: data.image_url,
    tags: data.tags || [],
    portion: data.portion,
    position: data.position,
    isAvailable: data.is_available,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    variants,
    ingredients,
  };
}

// Update a menu item with variants
export async function updateMenuItem(id: string, update: MenuItemUpdate): Promise<MenuItem> {
  const supabase = await createServerClient() as any;

  // Get restaurant_id for inserting related records
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (update.categoryId !== undefined) updateData.category_id = update.categoryId;
  if (update.name !== undefined) updateData.name = update.name;
  if (update.description !== undefined) updateData.description = update.description;
  if (update.price !== undefined) updateData.price = update.price;
  if (update.priceMedium !== undefined) updateData.price_medium = update.priceMedium;
  if (update.priceGrande !== undefined) updateData.price_grande = update.priceGrande;
  if (update.imageUrl !== undefined) updateData.image_url = update.imageUrl;
  if (update.tags !== undefined) updateData.tags = update.tags;
  if (update.portion !== undefined) updateData.portion = update.portion;
  if (update.position !== undefined) updateData.position = update.position;
  if (update.isAvailable !== undefined) updateData.is_available = update.isAvailable;

  const { data, error} = await supabase
    .from('menu_items')
    .update(updateData)
    .eq('id', id)
    .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update menu item: ${error.message}`);
  }

  // Handle variants update if provided
  let variants: MenuItemVariant[] = [];
  if (update.variants !== undefined) {
    // Delete existing variants (MULTI-TENANT: filtered by menu_item_id which already belongs to our restaurant)
    await supabase.from('menu_item_variants').delete().eq('menu_item_id', id).eq('restaurant_id', restaurantId);

    // Insert new variants if any
    if (update.variants.length > 0) {
      const variantInserts = update.variants.map((variant, index) => ({
        menu_item_id: id,
        name: variant.name,
        price: variant.price,
        position: variant.position ?? index,
        restaurant_id: restaurantId, // Multi-tenant: inject restaurant_id
      }));

      const { data: variantsData, error: variantsError } = await supabase
        .from('menu_item_variants')
        .insert(variantInserts)
        .select();

      if (variantsError) {
        throw new Error(`Failed to update variants: ${variantsError.message}`);
      }

      variants = (variantsData || []).map((v: any) => ({
        id: v.id,
        name: v.name,
        price: v.price,
        position: v.position,
      }));
    }
  } else {
    // Fetch existing variants
    const { data: existingVariants } = await supabase
      .from('menu_item_variants')
      .select('*')
      .eq('menu_item_id', id)
      .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
      .order('position');

    variants = (existingVariants || []).map((v: any) => ({
      id: v.id,
      name: v.name,
      price: v.price,
      position: v.position,
    }));
  }

  // Handle ingredients update if provided
  let ingredients: MenuItemIngredient[] = [];
  if (update.ingredients !== undefined) {
    // Delete existing ingredients (MULTI-TENANT: filtered by menu_item_id which already belongs to our restaurant)
    await supabase.from('menu_item_ingredients').delete().eq('menu_item_id', id).eq('restaurant_id', restaurantId);

    // Insert new ingredients if any
    if (update.ingredients.length > 0) {
      const ingredientInserts = update.ingredients.map((ingredient, index) => ({
        menu_item_id: id,
        name: ingredient.name,
        can_exclude: ingredient.canExclude,
        position: ingredient.position ?? index,
        restaurant_id: restaurantId, // Multi-tenant: inject restaurant_id
      }));

      const { data: ingredientsData, error: ingredientsError } = await supabase
        .from('menu_item_ingredients')
        .insert(ingredientInserts)
        .select();

      if (ingredientsError) {
        throw new Error(`Failed to update ingredients: ${ingredientsError.message}`);
      }

      ingredients = (ingredientsData || []).map((ing: any) => ({
        id: ing.id,
        name: ing.name,
        canExclude: ing.can_exclude,
        position: ing.position,
      }));
    }
  } else {
    // Fetch existing ingredients
    const { data: existingIngredients } = await supabase
      .from('menu_item_ingredients')
      .select('*')
      .eq('menu_item_id', id)
      .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
      .order('position');

    ingredients = (existingIngredients || []).map((ing: any) => ({
      id: ing.id,
      name: ing.name,
      canExclude: ing.can_exclude,
      position: ing.position,
    }));
  }

  // Handle modifiers update if provided
  if (update.modifierGroupIds !== undefined) {
    await assignModifiersToMenuItem(id, update.modifierGroupIds);
  }

  return {
    id: data.id,
    categoryId: data.category_id,
    name: data.name,
    description: data.description,
    price: data.price,
    priceMedium: data.price_medium,
    priceGrande: data.price_grande,
    imageUrl: data.image_url,
    tags: data.tags || [],
    portion: data.portion,
    position: data.position,
    isAvailable: data.is_available,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    variants,
    ingredients,
  };
}

// Delete a menu item
// MULTI-TENANT: Ensures only deleting from user's restaurant
export async function deleteMenuItem(id: string): Promise<void> {
  const supabase = await createServerClient() as any;

  // Get restaurant_id to ensure we only delete our own menu items
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id)
    .eq('restaurant_id', restaurantId); // MULTI-TENANT FILTER

  if (error) {
    throw new Error(`Failed to delete menu item: ${error.message}`);
  }
}

// Reorder menu items within a category
// MULTI-TENANT: Only reorders items from user's restaurant
export async function reorderMenuItems(categoryId: string, itemIds: string[]): Promise<void> {
  const supabase = await createServerClient() as any;

  // Get restaurant_id to ensure we only reorder our own menu items
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  // Update position for each item that belongs to our restaurant
  const updates = itemIds.map((id, index) => ({
    id,
    position: index,
    restaurant_id: restaurantId, // MULTI-TENANT: Ensure upsert only affects our restaurant
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('menu_items')
    .upsert(updates, { onConflict: 'id' });

  if (error) {
    throw new Error(`Failed to reorder menu items: ${error.message}`);
  }
}

// Toggle availability quickly
// MULTI-TENANT: Ensures only toggling items from user's restaurant
export async function toggleMenuItemAvailability(id: string): Promise<MenuItem> {
  const supabase = await createServerClient() as any;

  // Get restaurant_id to ensure we only toggle our own menu items
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  // First get current item to check availability (already filtered by restaurant_id)
  const currentItem = await getMenuItemById(id);

  if (!currentItem) {
    throw new Error('Menu item not found');
  }

  // Toggle it
  const { error } = await supabase
    .from('menu_items')
    .update({
      is_available: !currentItem.isAvailable,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('restaurant_id', restaurantId); // MULTI-TENANT FILTER

  if (error) {
    throw new Error(`Failed to toggle availability: ${error.message}`);
  }

  // Fetch and return the updated item
  const updatedItem = await getMenuItemById(id);

  if (!updatedItem) {
    throw new Error('Failed to fetch updated menu item');
  }

  return updatedItem;
}
