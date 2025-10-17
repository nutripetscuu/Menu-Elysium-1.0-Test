'use server';

// Server Actions for restaurant management (Super Admin only)

import {
  getAllRestaurants as apiGetAllRestaurants,
  getRestaurantById as apiGetRestaurantById,
  getRestaurantBySubdomain as apiGetRestaurantBySubdomain,
  getRestaurantByCustomDomain as apiGetRestaurantByCustomDomain,
  createRestaurant as apiCreateRestaurant,
  updateRestaurant as apiUpdateRestaurant,
  deleteRestaurant as apiDeleteRestaurant,
  hardDeleteRestaurant as apiHardDeleteRestaurant,
  isSubdomainAvailable as apiIsSubdomainAvailable,
  isCustomDomainAvailable as apiIsCustomDomainAvailable,
  checkRestaurantLimit as apiCheckRestaurantLimit,
  updateRestaurantUsage as apiUpdateRestaurantUsage,
  type Restaurant,
  type RestaurantInput,
  type RestaurantUpdate,
} from '@/lib/api/restaurants';
import { createServerClient } from '@/lib/supabase/server-client';

// Re-export types
export type { Restaurant, RestaurantInput, RestaurantUpdate };

/**
 * Check if the current user is a super admin
 * CRITICAL SECURITY CHECK - Must be called before any restaurant management operations
 */
async function verifySuperAdmin(): Promise<void> {
  const supabase = await createServerClient() as any;

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Check if user is a super admin
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('is_super_admin, role')
    .eq('id', user.id)
    .single();

  if (adminError || !adminUser) {
    throw new Error('Admin user not found');
  }

  if (!adminUser.is_super_admin && adminUser.role !== 'super_admin') {
    throw new Error('Unauthorized: Super admin access required');
  }
}

/**
 * Get all restaurants (Super Admin only)
 */
export async function getAllRestaurants(): Promise<Restaurant[]> {
  await verifySuperAdmin();
  return apiGetAllRestaurants();
}

/**
 * Get a single restaurant by ID
 */
export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  await verifySuperAdmin();
  return apiGetRestaurantById(id);
}

/**
 * Get a restaurant by subdomain (public access - no auth required)
 */
export async function getRestaurantBySubdomain(subdomain: string): Promise<Restaurant | null> {
  // Public access - no auth check
  return apiGetRestaurantBySubdomain(subdomain);
}

/**
 * Get a restaurant by custom domain (public access - no auth required)
 */
export async function getRestaurantByCustomDomain(domain: string): Promise<Restaurant | null> {
  // Public access - no auth check
  return apiGetRestaurantByCustomDomain(domain);
}

/**
 * Create a new restaurant (Super Admin only)
 */
export async function createRestaurant(input: RestaurantInput): Promise<Restaurant> {
  await verifySuperAdmin();
  return apiCreateRestaurant(input);
}

/**
 * Update an existing restaurant (Super Admin only)
 */
export async function updateRestaurant(id: string, update: RestaurantUpdate): Promise<Restaurant> {
  await verifySuperAdmin();
  return apiUpdateRestaurant(id, update);
}

/**
 * Soft delete a restaurant (Super Admin only)
 */
export async function deleteRestaurant(id: string): Promise<void> {
  await verifySuperAdmin();
  return apiDeleteRestaurant(id);
}

/**
 * Hard delete a restaurant (Super Admin only - DANGEROUS)
 */
export async function hardDeleteRestaurant(id: string): Promise<void> {
  await verifySuperAdmin();
  return apiHardDeleteRestaurant(id);
}

/**
 * Check if a subdomain is available (Super Admin only)
 */
export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  await verifySuperAdmin();
  return apiIsSubdomainAvailable(subdomain);
}

/**
 * Check if a custom domain is available (Super Admin only)
 */
export async function isCustomDomainAvailable(domain: string): Promise<boolean> {
  await verifySuperAdmin();
  return apiIsCustomDomainAvailable(domain);
}

/**
 * Check restaurant limits (Super Admin only)
 */
export async function checkRestaurantLimit(
  restaurantId: string,
  limitType: 'menu_items' | 'categories' | 'admin_users'
): Promise<boolean> {
  await verifySuperAdmin();
  return apiCheckRestaurantLimit(restaurantId, limitType);
}

/**
 * Update restaurant usage counts (Super Admin only)
 */
export async function updateRestaurantUsage(
  restaurantId: string,
  field: 'total_menu_items' | 'total_categories' | 'total_admin_users',
  increment: boolean = true
): Promise<void> {
  await verifySuperAdmin();
  return apiUpdateRestaurantUsage(restaurantId, field, increment);
}
