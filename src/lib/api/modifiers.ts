// API layer for modifiers CRUD operations
import { createServerClient } from '../supabase/server-client';

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
  maxSelections: number | null;
  position: number;
  options: ModifierOption[];
}

export interface ModifierGroupInput {
  id: string; // User-provided ID (e.g., "custom_milk_types_123")
  name: string;
  type: 'single' | 'multiple' | 'boolean';
  required: boolean;
  minSelections?: number;
  maxSelections?: number | null;
  position?: number;
  options: {
    id: string;
    label: string;
    priceModifier: number;
    isDefault: boolean;
    position: number;
  }[];
}

// Get all modifier groups with their options
// MULTI-TENANT: Filters by authenticated user's restaurant_id
export async function getAllModifierGroups(): Promise<ModifierGroup[]> {
  const supabase = await createServerClient() as any;

  // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  const { data: groups, error: groupsError } = await supabase
    .from('modifier_groups')
    .select(`
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
    `)
    .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
    .order('position');

  if (groupsError) {
    throw new Error(`Failed to fetch modifier groups: ${groupsError.message}`);
  }

  return (groups || []).map((group: any) => ({
    id: group.id,
    name: group.name,
    type: group.type as 'single' | 'multiple' | 'boolean',
    required: group.required,
    minSelections: group.min_selections,
    maxSelections: group.max_selections,
    position: group.position,
    options: (group.options || [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((opt: any) => ({
        id: opt.id,
        label: opt.label,
        priceModifier: opt.price_modifier,
        isDefault: opt.is_default,
        position: opt.position,
      })),
  }));
}

// Create a new modifier group with options
export async function createModifierGroup(input: ModifierGroupInput): Promise<ModifierGroup> {
  const supabase = await createServerClient() as any;

  // Get restaurant_id from authenticated user (critical for multi-tenancy)
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  // Insert modifier group
  const { data: group, error: groupError } = await supabase
    .from('modifier_groups')
    .insert({
      id: input.id,
      name: input.name,
      type: input.type,
      required: input.required,
      min_selections: input.minSelections || 0,
      max_selections: input.maxSelections,
      position: input.position || 0,
      restaurant_id: restaurantId, // Multi-tenant: inject restaurant_id
    })
    .select()
    .single();

  if (groupError) {
    throw new Error(`Failed to create modifier group: ${groupError.message}`);
  }

  // Insert modifier options
  if (input.options.length > 0) {
    const optionInserts = input.options.map((opt: any) => ({
      id: opt.id,
      modifier_group_id: input.id,
      label: opt.label,
      price_modifier: opt.priceModifier,
      is_default: opt.isDefault,
      position: opt.position,
      restaurant_id: restaurantId, // Multi-tenant: inject restaurant_id
    }));

    const { error: optionsError } = await supabase
      .from('modifier_options')
      .insert(optionInserts);

    if (optionsError) {
      // Rollback: delete the group
      await supabase.from('modifier_groups').delete().eq('id', input.id);
      throw new Error(`Failed to create modifier options: ${optionsError.message}`);
    }
  }

  // Fetch the created group with options
  const groups = await getAllModifierGroups();
  const created = groups.find((g: any) => g.id === input.id);

  if (!created) {
    throw new Error('Failed to retrieve created modifier group');
  }

  return created;
}

// Assign modifier groups to a menu item
// MULTI-TENANT: Ensures only modifying own restaurant's data
export async function assignModifiersToMenuItem(
  menuItemId: string,
  modifierGroupIds: string[]
): Promise<void> {
  const supabase = await createServerClient() as any;

  // Get restaurant_id for creating assignments
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  // Delete existing assignments
  await supabase
    .from('menu_item_modifiers')
    .delete()
    .eq('menu_item_id', menuItemId)
    .eq('restaurant_id', restaurantId); // MULTI-TENANT FILTER

  // Insert new assignments if any
  if (modifierGroupIds.length > 0) {
    const assignments = modifierGroupIds.map((groupId, index) => ({
      menu_item_id: menuItemId,
      modifier_group_id: groupId,
      position: index,
      restaurant_id: restaurantId, // Multi-tenant: inject restaurant_id
    }));

    const { error } = await supabase
      .from('menu_item_modifiers')
      .insert(assignments);

    if (error) {
      throw new Error(`Failed to assign modifiers: ${error.message}`);
    }
  }
}

// Get modifier groups assigned to a specific menu item
// MULTI-TENANT: Filters by authenticated user's restaurant_id
export async function getMenuItemModifiers(menuItemId: string): Promise<string[]> {
  const supabase = await createServerClient() as any;

  // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from('menu_item_modifiers')
    .select('modifier_group_id')
    .eq('menu_item_id', menuItemId)
    .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
    .order('position');

  if (error) {
    throw new Error(`Failed to fetch menu item modifiers: ${error.message}`);
  }

  return (data || []).map((row: any) => row.modifier_group_id);
}

// Update an existing modifier group (global update affects all items)
// MULTI-TENANT: Ensures only updating own restaurant's data
export async function updateModifierGroup(groupId: string, updates: Partial<ModifierGroupInput>): Promise<ModifierGroup> {
  const supabase = await createServerClient() as any;

  // Get restaurant_id for inserting new options
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  // Update group basic info if provided
  if (updates.name !== undefined || updates.type !== undefined || updates.required !== undefined) {
    const groupUpdates: any = {};
    if (updates.name !== undefined) groupUpdates.name = updates.name;
    if (updates.type !== undefined) groupUpdates.type = updates.type;
    if (updates.required !== undefined) groupUpdates.required = updates.required;
    if (updates.minSelections !== undefined) groupUpdates.min_selections = updates.minSelections;
    if (updates.maxSelections !== undefined) groupUpdates.max_selections = updates.maxSelections;
    if (updates.position !== undefined) groupUpdates.position = updates.position;

    const { error: groupError } = await supabase
      .from('modifier_groups')
      .update(groupUpdates)
      .eq('id', groupId)
      .eq('restaurant_id', restaurantId); // MULTI-TENANT FILTER

    if (groupError) {
      throw new Error(`Failed to update modifier group: ${groupError.message}`);
    }
  }

  // Update options if provided
  if (updates.options !== undefined) {
    // Delete existing options
    await supabase
      .from('modifier_options')
      .delete()
      .eq('modifier_group_id', groupId)
      .eq('restaurant_id', restaurantId); // MULTI-TENANT FILTER

    // Insert new options
    if (updates.options.length > 0) {
      const optionInserts = updates.options.map((opt: any) => ({
        id: opt.id,
        modifier_group_id: groupId,
        label: opt.label,
        price_modifier: opt.priceModifier,
        is_default: opt.isDefault,
        position: opt.position,
        restaurant_id: restaurantId, // Multi-tenant: inject restaurant_id
      }));

      const { error: optionsError } = await supabase
        .from('modifier_options')
        .insert(optionInserts);

      if (optionsError) {
        throw new Error(`Failed to update modifier options: ${optionsError.message}`);
      }
    }
  }

  // Fetch and return the updated group
  const groups = await getAllModifierGroups();
  const updated = groups.find((g: any) => g.id === groupId);

  if (!updated) {
    throw new Error('Failed to retrieve updated modifier group');
  }

  return updated;
}

// Delete a modifier group (will cascade delete all related data)
// MULTI-TENANT: Ensures only deleting own restaurant's data
export async function deleteModifierGroup(groupId: string): Promise<void> {
  const supabase = await createServerClient() as any;

  // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  // Delete modifier group (cascades to options and menu_item_modifiers)
  const { error } = await supabase
    .from('modifier_groups')
    .delete()
    .eq('id', groupId)
    .eq('restaurant_id', restaurantId); // MULTI-TENANT FILTER

  if (error) {
    throw new Error(`Failed to delete modifier group: ${error.message}`);
  }
}
