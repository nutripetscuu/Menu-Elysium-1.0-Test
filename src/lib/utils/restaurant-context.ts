/**
 * Restaurant Context Utilities
 * Handles multi-tenant restaurant context extraction and management
 */

import { headers } from 'next/headers';
import { getRestaurantBySubdomain, getRestaurantByCustomDomain } from '@/lib/api/restaurants';
import type { Restaurant } from '@/lib/types/database';

/**
 * Extract restaurant from request context
 * Checks subdomain first, then custom domain
 */
export async function getRestaurantFromRequest(): Promise<Restaurant | null> {
  const headersList = await headers();
  const host = headersList.get('host') || '';

  // Extract subdomain or domain
  const hostname = host.split(':')[0]; // Remove port if present

  // Check if it's a custom domain (doesn't match platform pattern)
  // Adjust this logic based on your platform domain
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'yourplatform.com';

  if (hostname.endsWith(`.${platformDomain}`)) {
    // It's a subdomain: extract the subdomain part
    const subdomain = hostname.replace(`.${platformDomain}`, '');
    return getRestaurantBySubdomain(subdomain);
  } else if (hostname === platformDomain) {
    // It's the root platform domain - no restaurant context
    return null;
  } else {
    // It's a custom domain
    return getRestaurantByCustomDomain(hostname);
  }
}

/**
 * Extract restaurant ID from request context
 * Convenience function that returns only the ID
 */
export async function getRestaurantIdFromRequest(): Promise<string | null> {
  const restaurant = await getRestaurantFromRequest();
  return restaurant?.id || null;
}

/**
 * Require restaurant context - throws if not found
 * Use this for pages that MUST have a restaurant context
 */
export async function requireRestaurantFromRequest(): Promise<Restaurant> {
  const restaurant = await getRestaurantFromRequest();

  if (!restaurant) {
    throw new Error('Restaurant context is required but not found');
  }

  return restaurant;
}

/**
 * Get restaurant context from subdomain (client-side compatible)
 * Extracts subdomain from window.location
 */
export function getSubdomainFromWindow(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const hostname = window.location.hostname;
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'yourplatform.com';

  if (hostname.endsWith(`.${platformDomain}`)) {
    return hostname.replace(`.${platformDomain}`, '');
  }

  return null;
}

/**
 * Check if current context is a restaurant (has tenant)
 */
export async function isRestaurantContext(): Promise<boolean> {
  const restaurant = await getRestaurantFromRequest();
  return restaurant !== null;
}

/**
 * Check if current context is the platform admin
 */
export async function isPlatformContext(): Promise<boolean> {
  return !(await isRestaurantContext());
}

/**
 * Restaurant Context Error
 * Thrown when restaurant context is required but not available
 */
export class RestaurantContextError extends Error {
  constructor(message: string = 'Restaurant context is required') {
    super(message);
    this.name = 'RestaurantContextError';
  }
}

/**
 * WithRestaurant HOC type helper
 * Use this to type components/functions that require restaurant context
 */
export type WithRestaurantContext<T = {}> = T & {
  restaurant: Restaurant;
  restaurantId: string;
};

/**
 * Create restaurant-scoped cache key
 * Useful for caching data per restaurant
 */
export function createRestaurantCacheKey(restaurantId: string, key: string): string {
  return `restaurant:${restaurantId}:${key}`;
}

/**
 * Validate restaurant is active and has valid subscription
 */
export function validateRestaurantAccess(restaurant: Restaurant): boolean {
  return (
    restaurant.isActive &&
    restaurant.subscriptionStatus === 'active' &&
    !restaurant.deletedAt
  );
}

/**
 * Get restaurant feature flags
 * Returns feature availability based on subscription tier
 */
export function getRestaurantFeatures(restaurant: Restaurant): Record<string, any> {
  return restaurant.features || {};
}

/**
 * Check if restaurant has a specific feature
 */
export function hasRestaurantFeature(restaurant: Restaurant, feature: string): boolean {
  const features = getRestaurantFeatures(restaurant);
  return features[feature] === true;
}

/**
 * Check if restaurant has reached a limit
 */
export function hasReachedLimit(
  restaurant: Restaurant,
  limitType: 'max_menu_items' | 'max_categories' | 'max_admin_users'
): boolean {
  const features = getRestaurantFeatures(restaurant);
  const maxLimit = features[limitType];

  if (maxLimit === undefined || maxLimit === -1) {
    return false; // No limit or unlimited
  }

  const currentCount = limitType === 'max_menu_items'
    ? restaurant.totalMenuItems
    : limitType === 'max_categories'
    ? restaurant.totalCategories
    : restaurant.totalAdminUsers;

  return currentCount >= maxLimit;
}

/**
 * Multi-tenant middleware helper
 * Returns restaurant context and validation status
 */
export async function getRestaurantMiddlewareContext(): Promise<{
  restaurant: Restaurant | null;
  isValid: boolean;
  error?: string;
}> {
  try {
    const restaurant = await getRestaurantFromRequest();

    if (!restaurant) {
      return { restaurant: null, isValid: false, error: 'Restaurant not found' };
    }

    const isValid = validateRestaurantAccess(restaurant);

    if (!isValid) {
      return {
        restaurant,
        isValid: false,
        error: 'Restaurant access is restricted (inactive or subscription issue)',
      };
    }

    return { restaurant, isValid: true };
  } catch (error) {
    console.error('[RESTAURANT CONTEXT] Error:', error);
    return { restaurant: null, isValid: false, error: 'Internal error' };
  }
}
