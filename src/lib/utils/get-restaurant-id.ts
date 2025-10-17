/**
 * Utility to get the authenticated user's restaurant_id from admin_users table
 * This is critical for multi-tenant data isolation
 *
 * IMPORTANT: Super admins do NOT have a fixed restaurant_id
 * They need to explicitly set context using cookies/headers or UI selection
 */

import { createServerClient } from '@/lib/supabase/server-client';
import { cookies } from 'next/headers';

export interface RestaurantContext {
  restaurantId: string | null; // Null for super-admins without context
  isSuperAdmin: boolean;
}

/**
 * Get the current authenticated admin user's restaurant context
 * @throws Error if user is not authenticated or not found in admin_users
 */
export async function getRestaurantContext(): Promise<RestaurantContext> {
  const supabase = await createServerClient();

  // Get authenticated user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('User not authenticated');
  }

  // Get admin user record with restaurant_id
  const { data: adminUser, error: adminError } = await supabase
    .from('admin_users')
    .select('restaurant_id, is_super_admin')
    .eq('id', user.id)
    .single();

  if (adminError || !adminUser) {
    throw new Error('Admin user not found');
  }

  // Super admins: Check for context cookie/header
  if (adminUser.is_super_admin) {
    const cookieStore = await cookies();
    const contextRestaurantId = cookieStore.get('admin_restaurant_context')?.value;

    return {
      restaurantId: contextRestaurantId || adminUser.restaurant_id || null,
      isSuperAdmin: true,
    };
  }

  // Regular admins must have a restaurant_id
  if (!adminUser.restaurant_id) {
    throw new Error('Admin user not assigned to a restaurant');
  }

  return {
    restaurantId: adminUser.restaurant_id,
    isSuperAdmin: false,
  };
}

/**
 * Get just the restaurant_id for the current user
 * Convenience wrapper around getRestaurantContext
 *
 * @throws Error if super-admin without restaurant context
 */
export async function getRestaurantId(): Promise<string> {
  const context = await getRestaurantContext();

  if (!context.restaurantId) {
    throw new Error(
      'Super admin restaurant context not set. Please select a restaurant from the admin panel.'
    );
  }

  return context.restaurantId;
}

/**
 * Set restaurant context for super-admin (via cookie)
 * This allows super-admins to work with a specific restaurant
 */
export async function setSuperAdminRestaurantContext(restaurantId: string): Promise<void> {
  const context = await getRestaurantContext();

  if (!context.isSuperAdmin) {
    throw new Error('Only super admins can set restaurant context');
  }

  const cookieStore = await cookies();
  cookieStore.set('admin_restaurant_context', restaurantId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clear super-admin restaurant context
 */
export async function clearSuperAdminRestaurantContext(): Promise<void> {
  const context = await getRestaurantContext();

  if (!context.isSuperAdmin) {
    throw new Error('Only super admins can clear restaurant context');
  }

  const cookieStore = await cookies();
  cookieStore.delete('admin_restaurant_context');
}
