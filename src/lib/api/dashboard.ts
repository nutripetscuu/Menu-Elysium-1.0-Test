import { createServerClient } from '@/lib/supabase/server-client';

export interface DashboardStats {
  totalMenuItems: number;
  activeMenuItems: number;
  unavailableMenuItems: number;
  totalCategories: number;
  totalModifiers: number;
  totalPromotions: number;
}

export interface RecentActivity {
  id: string;
  type: 'menu_item_created' | 'menu_item_updated' | 'availability_changed';
  title: string;
  description: string;
  timestamp: string;
  itemName?: string;
}

/**
 * Get dashboard statistics
 * MULTI-TENANT: Filters all stats by authenticated user's restaurant_id
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createServerClient();

  // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  // Get menu items stats
  const { data: menuItems, error: itemsError } = await supabase
    .from('menu_items')
    .select('is_available')
    .eq('restaurant_id', restaurantId); // MULTI-TENANT FILTER

  if (itemsError) {
    console.error('Error fetching menu items stats:', itemsError);
    throw new Error('Failed to fetch menu items statistics');
  }

  const totalMenuItems = menuItems?.length || 0;
  const activeMenuItems = menuItems?.filter((item: any) => item.is_available).length || 0;
  const unavailableMenuItems = totalMenuItems - activeMenuItems;

  // Get categories count
  const { count: categoriesCount, error: categoriesError } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurantId); // MULTI-TENANT FILTER

  if (categoriesError) {
    console.error('Error fetching categories count:', categoriesError);
    throw new Error('Failed to fetch categories count');
  }

  // Get modifiers count
  const { count: modifiersCount, error: modifiersError } = await supabase
    .from('modifier_groups')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurantId); // MULTI-TENANT FILTER

  if (modifiersError) {
    console.error('Error fetching modifiers count:', modifiersError);
    throw new Error('Failed to fetch modifiers count');
  }

  // Get promotions count
  const { count: promotionsCount, error: promotionsError } = await supabase
    .from('promotional_images')
    .select('*', { count: 'exact', head: true })
    .eq('restaurant_id', restaurantId); // MULTI-TENANT FILTER

  if (promotionsError) {
    console.error('Error fetching promotions count:', promotionsError);
    throw new Error('Failed to fetch promotions count');
  }

  return {
    totalMenuItems,
    activeMenuItems,
    unavailableMenuItems,
    totalCategories: categoriesCount || 0,
    totalModifiers: modifiersCount || 0,
    totalPromotions: promotionsCount || 0,
  };
}

/**
 * Get recent activity feed
 * MULTI-TENANT: Filters activity by authenticated user's restaurant_id
 */
export async function getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
  const supabase = await createServerClient();

  // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const restaurantId = await getRestaurantId();

  // Get recently updated menu items
  const { data: recentItems, error } = await supabase
    .from('menu_items')
    .select('id, name, is_available, created_at, updated_at')
    .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent activity:', error);
    throw new Error('Failed to fetch recent activity');
  }

  if (!recentItems || recentItems.length === 0) {
    return [];
  }

  // Transform into activity feed format
  const activities: RecentActivity[] = recentItems.map((item: any) => {
    const isNew = new Date(item.created_at).getTime() === new Date(item.updated_at).getTime();
    const timestamp = item.updated_at || item.created_at;

    if (isNew) {
      return {
        id: `${item.id}-created`,
        type: 'menu_item_created' as const,
        title: 'New menu item added',
        description: `"${item.name}" was added to the menu`,
        timestamp,
        itemName: item.name,
      };
    } else {
      return {
        id: `${item.id}-updated`,
        type: 'menu_item_updated' as const,
        title: 'Menu item updated',
        description: `"${item.name}" was modified`,
        timestamp,
        itemName: item.name,
      };
    }
  });

  return activities;
}

/**
 * Get the public menu URL for QR code generation
 * MULTI-TENANT: Uses restaurant's subdomain to generate correct menu URL
 */
export async function getMenuUrl(): Promise<string> {
  // Get restaurant data for subdomain (CRITICAL for multi-tenancy)
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const { getRestaurantById } = await import('@/lib/api/restaurants');

  const restaurantId = await getRestaurantId();
  const restaurant = await getRestaurantById(restaurantId);

  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  // Build menu URL with restaurant subdomain
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:9002';
  const menuUrl = `${baseUrl}/menu?restaurant=${restaurant.subdomain}`;

  return menuUrl;
}

/**
 * Get restaurant subdomain for QR code download
 * MULTI-TENANT: Returns current restaurant's subdomain
 */
export async function getRestaurantSubdomain(): Promise<string> {
  const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
  const { getRestaurantById } = await import('@/lib/api/restaurants');

  const restaurantId = await getRestaurantId();
  const restaurant = await getRestaurantById(restaurantId);

  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  return restaurant.subdomain;
}
