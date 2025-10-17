'use server';

// Server Actions for settings management (admin panel)

import { SettingsAPI } from '@/lib/api/settings';
import type { RestaurantSettings, UpdateSettingsInput, BusinessHours } from '@/lib/api/settings';
import type { ApiResponse } from '@/lib/types/database';

// Note: Types cannot be re-exported from 'use server' files
// Import these types directly from '@/lib/api/settings' and '@/lib/types/database' in your components

export async function getSettings(): Promise<ApiResponse<RestaurantSettings>> {
  return SettingsAPI.getSettings();
}

export async function updateSettings(
  input: UpdateSettingsInput
): Promise<ApiResponse<RestaurantSettings>> {
  return SettingsAPI.updateSettings(input);
}

/**
 * DEPRECATED: Use getMenuUrl() instead for multi-tenant safety
 * @deprecated
 */
export async function generateMenuUrl(): Promise<string> {
  return SettingsAPI.generateMenuUrl();
}

/**
 * Get the multi-tenant menu URL for the authenticated restaurant
 */
export async function getMenuUrl(): Promise<string> {
  const { getMenuUrl: apiGetMenuUrl } = await import('@/lib/api/dashboard');
  return await apiGetMenuUrl();
}

/**
 * Get the restaurant subdomain for the authenticated user
 */
export async function getRestaurantSubdomain(): Promise<string> {
  const { getRestaurantSubdomain: apiGetRestaurantSubdomain } = await import('@/lib/api/dashboard');
  return await apiGetRestaurantSubdomain();
}

export async function formatWhatsAppNumber(number: string | null): Promise<string> {
  return SettingsAPI.formatWhatsAppNumber(number);
}

export async function generateWhatsAppLink(number: string | null, message?: string): Promise<string> {
  return SettingsAPI.generateWhatsAppLink(number, message);
}

// Note: uploadLogo works with Files which can't be passed to server actions
// This should be called from an API route instead
