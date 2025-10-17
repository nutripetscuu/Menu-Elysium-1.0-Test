/**
 * Domain-based restaurant context for public menu access
 * This module determines which restaurant's menu to display based on the incoming request domain
 */

import { headers } from 'next/headers';
import { getRestaurantBySubdomain, getRestaurantByCustomDomain, type Restaurant } from '@/lib/api/restaurants';

export interface PublicRestaurantContext {
  restaurant: Restaurant;
  detectionMethod: 'subdomain' | 'custom_domain' | 'default';
}

/**
 * Extract restaurant context from the current request's domain
 * Used by public-facing pages (menu, home) to determine which restaurant to show
 *
 * Detection Strategy:
 * 1. Custom Domain (e.g., menu.elysium.com) - Priority 1
 * 2. Subdomain (e.g., elysium.yourplatform.com) - Priority 2
 * 3. Default fallback (e.g., localhost:9002) - Development only
 *
 * @throws Error if restaurant cannot be determined or is not active
 */
export async function getPublicRestaurantContext(): Promise<PublicRestaurantContext> {
  const headersList = await headers();
  const host = headersList.get('host') || '';

  console.log('[PUBLIC CONTEXT] Determining restaurant from host:', host);

  // Extract domain parts
  const hostParts = host.split(':')[0].split('.'); // Remove port, split by dots

  // Strategy 1: Check for custom domain first
  // Custom domains are full matches (e.g., "menu.elysium.com")
  const customDomainRestaurant = await getRestaurantByCustomDomain(host.split(':')[0]);

  if (customDomainRestaurant) {
    console.log('[PUBLIC CONTEXT] Found restaurant via custom domain:', customDomainRestaurant.restaurantName);
    return {
      restaurant: customDomainRestaurant,
      detectionMethod: 'custom_domain'
    };
  }

  // Strategy 2: Extract subdomain
  // For multi-level domains like elysium.platform.com, take first part
  // For single domains like localhost, use the whole thing
  let subdomain: string;

  if (hostParts.length >= 3) {
    // Multi-level domain: elysium.platform.com → "elysium"
    subdomain = hostParts[0];
  } else if (hostParts.length === 2) {
    // Two-level domain: elysium.com → "elysium"
    subdomain = hostParts[0];
  } else {
    // Single domain: localhost → "localhost"
    subdomain = hostParts[0];
  }

  console.log('[PUBLIC CONTEXT] Extracted subdomain:', subdomain);

  // Check if subdomain matches a restaurant
  const subdomainRestaurant = await getRestaurantBySubdomain(subdomain);

  if (subdomainRestaurant) {
    console.log('[PUBLIC CONTEXT] Found restaurant via subdomain:', subdomainRestaurant.restaurantName);
    return {
      restaurant: subdomainRestaurant,
      detectionMethod: 'subdomain'
    };
  }

  // Strategy 3: Development fallback - use environment variable
  // This allows localhost:9002 to show a default restaurant during development
  const defaultRestaurantId = process.env.DEFAULT_RESTAURANT_ID;

  if (defaultRestaurantId && (host.includes('localhost') || host.includes('127.0.0.1'))) {
    console.log('[PUBLIC CONTEXT] Using default restaurant for development');
    const { getRestaurantById } = await import('@/lib/api/restaurants');
    const defaultRestaurant = await getRestaurantById(defaultRestaurantId);

    if (defaultRestaurant) {
      return {
        restaurant: defaultRestaurant,
        detectionMethod: 'default'
      };
    }
  }

  // No restaurant found
  throw new Error(`No active restaurant found for domain: ${host}`);
}

/**
 * Get just the restaurant_id from the current domain context
 * Convenience wrapper for APIs that only need the ID
 */
export async function getPublicRestaurantId(): Promise<string> {
  const context = await getPublicRestaurantContext();
  return context.restaurant.id;
}

/**
 * Check if a request is coming from a recognized restaurant domain
 * Useful for middleware or edge cases
 */
export async function isValidRestaurantDomain(host?: string): Promise<boolean> {
  try {
    if (host) {
      // Override headers for testing
      const customDomain = await getRestaurantByCustomDomain(host.split(':')[0]);
      if (customDomain) return true;

      const subdomain = host.split('.')[0];
      const subdomainMatch = await getRestaurantBySubdomain(subdomain);
      if (subdomainMatch) return true;
    } else {
      await getPublicRestaurantContext();
    }
    return true;
  } catch {
    return false;
  }
}
