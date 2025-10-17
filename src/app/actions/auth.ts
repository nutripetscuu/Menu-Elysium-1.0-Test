'use server';

import { createAdminClient } from '@/lib/supabase/admin-client';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import type { AdminUser } from '@/lib/types/admin';

/**
 * Server action to fetch admin user data
 * Uses admin client to bypass RLS issues with browser client
 */
export async function getAdminUserData(userId: string): Promise<AdminUser | null> {
  try {
    console.log('[SERVER ACTION] Fetching admin user for:', userId);
    const adminClient = createAdminClient();

    // Fetch admin user
    const { data: adminData, error: adminError } = await adminClient
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (adminError) {
      console.error('[SERVER ACTION] Error fetching admin user:', adminError);
      return null;
    }

    if (!adminData) {
      console.log('[SERVER ACTION] No admin user found');
      return null;
    }

    console.log('[SERVER ACTION] Admin user found');

    // Type assertion for adminData since Supabase inference has issues
    const user = adminData as any;

    // Fetch restaurant if user has restaurant_id
    let restaurantSubdomain = null;
    if (user.restaurant_id) {
      const { data: restaurant, error: restError } = await adminClient
        .from('restaurants')
        .select('subdomain')
        .eq('id', user.restaurant_id)
        .maybeSingle();

      if (!restError && restaurant) {
        restaurantSubdomain = (restaurant as any).subdomain;
        console.log('[SERVER ACTION] Restaurant subdomain:', restaurantSubdomain);
      }
    }

    // Return mapped admin user
    const adminUser: AdminUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurant_id,
      restaurantSubdomain,
      created_at: user.created_at,
      last_login: user.last_login,
    };

    console.log('[SERVER ACTION] Returning admin user:', JSON.stringify(adminUser, null, 2));
    return adminUser;
  } catch (error) {
    console.error('[SERVER ACTION] Exception:', error);
    return null;
  }
}
