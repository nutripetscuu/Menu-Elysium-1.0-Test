// API functions for restaurant CRUD operations (Multi-Tenant Management)
import { createServerClient } from '@/lib/supabase/server-client';
import type { Restaurant, RestaurantInput, RestaurantUpdate } from '@/lib/types/database';

// Re-export types for convenience
export type { Restaurant, RestaurantInput, RestaurantUpdate };

/**
 * Fetch all restaurants (Super Admin only)
 */
export async function getAllRestaurants(): Promise<Restaurant[]> {
  const supabase = await createServerClient() as any;

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[RESTAURANTS API] Error fetching restaurants:', error);
    throw new Error(error.message);
  }

  if (!data) {
    return [];
  }

  return data.map(convertDbRowToRestaurant);
}

/**
 * Get a single restaurant by ID
 */
export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const supabase = await createServerClient() as any;

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    console.error('[RESTAURANTS API] Error fetching restaurant:', error);
    return null;
  }

  return convertDbRowToRestaurant(data);
}

/**
 * Get a restaurant by subdomain (public access)
 */
export async function getRestaurantBySubdomain(subdomain: string): Promise<Restaurant | null> {
  const supabase = await createServerClient() as any;

  // Use the database function for optimal performance
  const { data, error } = await (supabase.rpc as any)('get_restaurant_by_subdomain', {
    p_subdomain: subdomain,
  });

  if (error || !data || data.length === 0) {
    console.error('[RESTAURANTS API] Error fetching restaurant by subdomain:', error);
    return null;
  }

  // The function returns a simplified structure, fetch full details
  return getRestaurantById(data[0].id);
}

/**
 * Get a restaurant by custom domain (public access)
 */
export async function getRestaurantByCustomDomain(domain: string): Promise<Restaurant | null> {
  const supabase = await createServerClient() as any;

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('custom_domain', domain)
    .eq('is_active', true)
    .eq('subscription_status', 'active')
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    console.error('[RESTAURANTS API] Error fetching restaurant by custom domain:', error);
    return null;
  }

  return convertDbRowToRestaurant(data);
}

/**
 * Create a new restaurant (Super Admin only)
 */
export async function createRestaurant(input: RestaurantInput): Promise<Restaurant> {
  const supabase = await createServerClient() as any;

  const dbInput = convertRestaurantInputToDb(input);

  const { data, error } = await supabase
    .from('restaurants')
    .insert(dbInput)
    .select()
    .single();

  if (error || !data) {
    console.error('[RESTAURANTS API] Error creating restaurant:', error);
    throw new Error(error?.message || 'Failed to create restaurant');
  }

  return convertDbRowToRestaurant(data);
}

/**
 * Update an existing restaurant
 */
export async function updateRestaurant(id: string, update: RestaurantUpdate): Promise<Restaurant> {
  const supabase = await createServerClient() as any;

  const dbUpdate = convertRestaurantUpdateToDb(update);

  const { data, error } = await supabase
    .from('restaurants')
    .update(dbUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('[RESTAURANTS API] Error updating restaurant:', error);
    throw new Error(error?.message || 'Failed to update restaurant');
  }

  return convertDbRowToRestaurant(data);
}

/**
 * Soft delete a restaurant (Super Admin only)
 */
export async function deleteRestaurant(id: string): Promise<void> {
  const supabase = await createServerClient() as any;

  const { error } = await supabase
    .from('restaurants')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('[RESTAURANTS API] Error deleting restaurant:', error);
    throw new Error(error.message);
  }
}

/**
 * Hard delete a restaurant (Super Admin only - DANGEROUS)
 */
export async function hardDeleteRestaurant(id: string): Promise<void> {
  const supabase = await createServerClient() as any;

  const { error } = await supabase
    .from('restaurants')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[RESTAURANTS API] Error hard deleting restaurant:', error);
    throw new Error(error.message);
  }
}

/**
 * Check if a subdomain is available
 */
export async function isSubdomainAvailable(subdomain: string): Promise<boolean> {
  const supabase = await createServerClient() as any;

  const { data, error } = await supabase
    .from('restaurants')
    .select('id')
    .eq('subdomain', subdomain)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    console.error('[RESTAURANTS API] Error checking subdomain:', error);
    return false;
  }

  return !data; // Available if no restaurant found
}

/**
 * Check if a custom domain is available
 */
export async function isCustomDomainAvailable(domain: string): Promise<boolean> {
  const supabase = await createServerClient() as any;

  const { data, error } = await supabase
    .from('restaurants')
    .select('id')
    .eq('custom_domain', domain)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    console.error('[RESTAURANTS API] Error checking custom domain:', error);
    return false;
  }

  return !data; // Available if no restaurant found
}

/**
 * Check restaurant limits (e.g., max menu items, categories)
 */
export async function checkRestaurantLimit(
  restaurantId: string,
  limitType: 'menu_items' | 'categories' | 'admin_users'
): Promise<boolean> {
  const supabase = await createServerClient() as any;

  const { data, error } = await (supabase.rpc as any)('check_restaurant_limit', {
    p_restaurant_id: restaurantId,
    p_limit_type: limitType,
  });

  if (error) {
    console.error('[RESTAURANTS API] Error checking restaurant limit:', error);
    return false;
  }

  return data as boolean;
}

/**
 * Update restaurant usage counts
 */
export async function updateRestaurantUsage(
  restaurantId: string,
  field: 'total_menu_items' | 'total_categories' | 'total_admin_users',
  increment: boolean = true
): Promise<void> {
  const supabase = await createServerClient() as any;

  // Get current value
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select(field)
    .eq('id', restaurantId)
    .single();

  if (!restaurant) {
    throw new Error('Restaurant not found');
  }

  const currentValue = restaurant[field] as number;
  const newValue = increment ? currentValue + 1 : Math.max(0, currentValue - 1);

  await supabase
    .from('restaurants')
    .update({ [field]: newValue })
    .eq('id', restaurantId);
}

// =====================================================
// HELPER FUNCTIONS - Database <-> TypeScript conversion
// =====================================================

function convertDbRowToRestaurant(row: any): Restaurant {
  return {
    id: row.id,
    restaurantName: row.restaurant_name,
    businessName: row.business_name || undefined,
    subdomain: row.subdomain,
    customDomain: row.custom_domain || undefined,
    subscriptionTier: row.subscription_tier,
    subscriptionStatus: row.subscription_status,
    subscriptionStartDate: row.subscription_start_date || undefined,
    subscriptionEndDate: row.subscription_end_date || undefined,
    billingEmail: row.billing_email || undefined,
    description: row.description || undefined,
    cuisineType: row.cuisine_type || [],
    phone: row.phone || undefined,
    email: row.email || undefined,
    website: row.website || undefined,
    addressLine1: row.address_line1 || undefined,
    addressLine2: row.address_line2 || undefined,
    city: row.city || undefined,
    state: row.state || undefined,
    postalCode: row.postal_code || undefined,
    country: row.country || 'Mexico',
    timezone: row.timezone || 'America/Mexico_City',
    operatingHours: row.operating_hours || undefined,
    logoUrl: row.logo_url || undefined,
    primaryColor: row.primary_color || '#B0C4DE',
    secondaryColor: row.secondary_color || undefined,
    bannerImageUrl: row.banner_image_url || undefined,
    isActive: row.is_active,
    isVerified: row.is_verified,
    onboardingCompleted: row.onboarding_completed,
    features: row.features || undefined,
    totalMenuItems: row.total_menu_items || 0,
    totalCategories: row.total_categories || 0,
    totalAdminUsers: row.total_admin_users || 0,
    metadata: row.metadata || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at || undefined,
    deletedAt: row.deleted_at || undefined,
  };
}

function convertRestaurantInputToDb(input: RestaurantInput): any {
  return {
    restaurant_name: input.restaurantName,
    business_name: input.businessName,
    subdomain: input.subdomain,
    custom_domain: input.customDomain,
    subscription_tier: input.subscriptionTier,
    subscription_status: input.subscriptionStatus,
    subscription_start_date: input.subscriptionStartDate,
    subscription_end_date: input.subscriptionEndDate,
    billing_email: input.billingEmail,
    description: input.description,
    cuisine_type: input.cuisineType,
    phone: input.phone,
    email: input.email,
    website: input.website,
    address_line1: input.addressLine1,
    address_line2: input.addressLine2,
    city: input.city,
    state: input.state,
    postal_code: input.postalCode,
    country: input.country,
    timezone: input.timezone,
    operating_hours: input.operatingHours,
    logo_url: input.logoUrl,
    primary_color: input.primaryColor,
    secondary_color: input.secondaryColor,
    banner_image_url: input.bannerImageUrl,
    is_active: input.isActive,
    is_verified: input.isVerified,
    onboarding_completed: input.onboardingCompleted,
    features: input.features,
    metadata: input.metadata,
  };
}

function convertRestaurantUpdateToDb(update: RestaurantUpdate): any {
  const dbUpdate: any = {};

  if (update.restaurantName !== undefined) dbUpdate.restaurant_name = update.restaurantName;
  if (update.businessName !== undefined) dbUpdate.business_name = update.businessName;
  if (update.subdomain !== undefined) dbUpdate.subdomain = update.subdomain;
  if (update.customDomain !== undefined) dbUpdate.custom_domain = update.customDomain;
  if (update.subscriptionTier !== undefined) dbUpdate.subscription_tier = update.subscriptionTier;
  if (update.subscriptionStatus !== undefined) dbUpdate.subscription_status = update.subscriptionStatus;
  if (update.subscriptionStartDate !== undefined) dbUpdate.subscription_start_date = update.subscriptionStartDate;
  if (update.subscriptionEndDate !== undefined) dbUpdate.subscription_end_date = update.subscriptionEndDate;
  if (update.billingEmail !== undefined) dbUpdate.billing_email = update.billingEmail;
  if (update.description !== undefined) dbUpdate.description = update.description;
  if (update.cuisineType !== undefined) dbUpdate.cuisine_type = update.cuisineType;
  if (update.phone !== undefined) dbUpdate.phone = update.phone;
  if (update.email !== undefined) dbUpdate.email = update.email;
  if (update.website !== undefined) dbUpdate.website = update.website;
  if (update.addressLine1 !== undefined) dbUpdate.address_line1 = update.addressLine1;
  if (update.addressLine2 !== undefined) dbUpdate.address_line2 = update.addressLine2;
  if (update.city !== undefined) dbUpdate.city = update.city;
  if (update.state !== undefined) dbUpdate.state = update.state;
  if (update.postalCode !== undefined) dbUpdate.postal_code = update.postalCode;
  if (update.country !== undefined) dbUpdate.country = update.country;
  if (update.timezone !== undefined) dbUpdate.timezone = update.timezone;
  if (update.operatingHours !== undefined) dbUpdate.operating_hours = update.operatingHours;
  if (update.logoUrl !== undefined) dbUpdate.logo_url = update.logoUrl;
  if (update.primaryColor !== undefined) dbUpdate.primary_color = update.primaryColor;
  if (update.secondaryColor !== undefined) dbUpdate.secondary_color = update.secondaryColor;
  if (update.bannerImageUrl !== undefined) dbUpdate.banner_image_url = update.bannerImageUrl;
  if (update.isActive !== undefined) dbUpdate.is_active = update.isActive;
  if (update.isVerified !== undefined) dbUpdate.is_verified = update.isVerified;
  if (update.onboardingCompleted !== undefined) dbUpdate.onboarding_completed = update.onboardingCompleted;
  if (update.features !== undefined) dbUpdate.features = update.features;
  if (update.metadata !== undefined) dbUpdate.metadata = update.metadata;

  return dbUpdate;
}
