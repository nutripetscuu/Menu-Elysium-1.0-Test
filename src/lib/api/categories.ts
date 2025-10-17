// API functions for category CRUD operations
import { createServerClient } from '@/lib/supabase/server-client';
import type { Category, CategoryInput, CategoryUpdate } from '@/lib/types/database';

// Re-export types for convenience
export type { Category, CategoryInput, CategoryUpdate };

/**
 * Fetch all categories ordered by position
 * MULTI-TENANT: Filters by authenticated user's restaurant_id
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = await createServerClient();

  // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
    .order('position', { ascending: true });

  if (error) {
    console.error('[CATEGORIES API] Error fetching categories:', error);
    throw new Error(error.message);
  }

  if (!data) {
    return [];
  }

  return data.map((cat: any) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    position: cat.position,
    isActive: cat.is_active,
    createdAt: cat.created_at,
    updatedAt: cat.updated_at || undefined,
  }));
}

/**
 * Get a single category by ID
 * MULTI-TENANT: Ensures category belongs to user's restaurant
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const supabase = await createServerClient();

  // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
    .single();

  if (error || !data) {
    console.error('[CATEGORIES API] Error fetching category:', error);
    return null;
  }

  const row: any = data;
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    position: row.position,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
  };
}

/**
 * Create a new category
 */
export async function createCategory(input: CategoryInput): Promise<Category> {
  const supabase = await createServerClient() as any;

  // Get restaurant_id from authenticated user (critical for multi-tenancy)
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: input.name,
      icon: input.icon,
      position: input.position,
      is_active: input.isActive,
      restaurant_id: restaurantId, // Multi-tenant: inject restaurant_id
    })
    .select()
    .single();

  if (error || !data) {
    console.error('[CATEGORIES API] Error creating category:', error);
    throw new Error(error?.message || 'Failed to create category');
  }

  const row: any = data;
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    position: row.position,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
  };
}

/**
 * Update an existing category
 */
export async function updateCategory(id: string, update: CategoryUpdate): Promise<Category> {
  const supabase = await createServerClient() as any;

  // Get restaurant_id to ensure we only update our own categories
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  const updateData: any = {};
  if (update.name !== undefined) updateData.name = update.name;
  if (update.icon !== undefined) updateData.icon = update.icon;
  if (update.position !== undefined) updateData.position = update.position;
  if (update.isActive !== undefined) updateData.is_active = update.isActive;

  const { data, error } = await supabase
    .from('categories')
    .update(updateData)
    .eq('id', id)
    .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
    .select()
    .single();

  if (error || !data) {
    console.error('[CATEGORIES API] Error updating category:', error);
    throw new Error(error?.message || 'Failed to update category');
  }

  const row: any = data;
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    position: row.position,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
  };
}

/**
 * Delete a category
 * MULTI-TENANT: Ensures only deleting from user's restaurant
 */
export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createServerClient();

  // Get restaurant_id to ensure we only delete our own categories
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('restaurant_id', restaurantId); // MULTI-TENANT FILTER

  if (error) {
    console.error('[CATEGORIES API] Error deleting category:', error);
    throw new Error(error.message);
  }
}

/**
 * Reorder categories by updating their positions
 */
export async function reorderCategories(categoryIds: string[]): Promise<void> {
  const supabase = await createServerClient() as any;

  // Get restaurant_id to ensure we only reorder our own categories
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  // Update each category's position based on its index in the array
  const updates = categoryIds.map((id, index) =>
    supabase
      .from('categories')
      .update({ position: index })
      .eq('id', id)
      .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
  );

  const results = await Promise.all(updates);

  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    console.error('[CATEGORIES API] Error reordering categories:', errors);
    throw new Error('Failed to reorder categories');
  }
}
