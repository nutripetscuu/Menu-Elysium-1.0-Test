'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/admin/use-auth';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

/**
 * Hook to get the current admin's restaurant slug for public menu links
 * Maps restaurant_id to slug for multi-tenant menu URLs
 */
export function useRestaurantSlug() {
  const { adminUser } = useAuth();
  const [slug, setSlug] = useState<string>('elysium'); // Default fallback
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantSlug = async () => {
      if (!adminUser) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();

        // Get admin user's restaurant_id
        const { data: admin, error: adminError } = await supabase
          .from('admin_users')
          .select('restaurant_id')
          .eq('id', adminUser.id)
          .single();

        if (adminError || !admin?.restaurant_id) {
          console.error('[useRestaurantSlug] Error fetching admin restaurant:', adminError);
          setLoading(false);
          return;
        }

        // Get restaurant details to find subdomain (slug)
        const { data: restaurant, error: restaurantError } = await supabase
          .from('restaurants')
          .select('subdomain')
          .eq('id', admin.restaurant_id)
          .single();

        if (restaurantError || !restaurant?.subdomain) {
          console.error('[useRestaurantSlug] Error fetching restaurant:', restaurantError);
          setLoading(false);
          return;
        }

        // Map subdomain to slug
        const slugMap: Record<string, string> = {
          'elysium': 'elysium',
          'elysium-tokyo': 'tokyo',
          'elysium-osaka': 'osaka',
          'testcafe': 'testcafe',
        };

        const restaurantSlug = slugMap[restaurant.subdomain] || restaurant.subdomain;
        setSlug(restaurantSlug);

      } catch (error) {
        console.error('[useRestaurantSlug] Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantSlug();
  }, [adminUser]);

  return { slug, loading };
}
