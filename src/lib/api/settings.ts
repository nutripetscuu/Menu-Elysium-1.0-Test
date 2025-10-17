// API for restaurant settings management
import { createServerClient } from '../supabase/server-client';
import type { ApiResponse } from '../types/database';

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface RestaurantSettings {
  id: string;
  restaurant_name: string;
  whatsapp_number: string | null;
  online_ordering_enabled: boolean;
  business_hours: BusinessHours;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  menu_url: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface UpdateSettingsInput {
  restaurant_name?: string;
  whatsapp_number?: string | null;
  online_ordering_enabled?: boolean;
  business_hours?: BusinessHours;
  logo_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  menu_url?: string | null;
}

class SettingsAPI {
  /**
   * Get restaurant settings (single row)
   * MULTI-TENANT: Filters by authenticated user's restaurant_id
   */
  static async getSettings(): Promise<ApiResponse<RestaurantSettings>> {
    try {
      const supabase = await createServerClient() as any;

      // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
      const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
      const restaurantId = await getRestaurantId();

      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
        .single();

      if (error) {
        console.error('Error fetching settings:', error);
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: data,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Unexpected error in getSettings:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  /**
   * Update restaurant settings
   * MULTI-TENANT: Ensures only updating own restaurant's settings
   */
  static async updateSettings(
    input: UpdateSettingsInput
  ): Promise<ApiResponse<RestaurantSettings>> {
    try {
      const supabase = await createServerClient() as any;

      // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
      const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
      const restaurantId = await getRestaurantId();

      // Validate WhatsApp number format if provided
      if (input.whatsapp_number && input.whatsapp_number.trim() !== '') {
        const cleaned = input.whatsapp_number.replace(/\D/g, '');
        if (cleaned.length < 10 || cleaned.length > 15) {
          return {
            data: null,
            error: 'WhatsApp number must be between 10 and 15 digits',
            success: false
          };
        }
      }

      const { data, error } = await supabase
        .from('restaurant_settings')
        .update(input)
        .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
        .select()
        .single();

      if (error) {
        console.error('Error updating settings:', error);
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: data,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Unexpected error in updateSettings:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  /**
   * Upload logo to Supabase Storage
   */
  static async uploadLogo(
    file: File
  ): Promise<ApiResponse<string>> {
    try {
      const supabase = await createServerClient() as any;

      // Get restaurant_id for tenant-specific storage path (CRITICAL for multi-tenancy)
      const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
      const restaurantId = await getRestaurantId();

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return {
          data: null,
          error: 'Please select an image file',
          success: false
        };
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        return {
          data: null,
          error: 'Logo must be less than 2MB',
          success: false
        };
      }

      // Generate unique filename with restaurant_id prefix (prevents collisions between tenants)
      const fileExt = file.name.split('.').pop();
      const fileName = `logo/${restaurantId}/restaurant-logo-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('promotional-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error uploading logo:', error);
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('promotional-images')
        .getPublicUrl(data.path);

      return {
        data: urlData.publicUrl,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Unexpected error in uploadLogo:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  /**
   * Generate menu URL based on current domain
   */
  static generateMenuUrl(): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}`;
    }
    return '';
  }

  /**
   * Format WhatsApp number for display
   */
  static formatWhatsAppNumber(number: string | null): string {
    if (!number) return '';
    const cleaned = number.replace(/\D/g, '');
    return `+${cleaned}`;
  }

  /**
   * Generate WhatsApp order link
   */
  static generateWhatsAppLink(number: string | null, message?: string): string {
    if (!number) return '#';
    const cleaned = number.replace(/\D/g, '');
    const encodedMessage = message ? encodeURIComponent(message) : '';
    return `https://wa.me/${cleaned}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
  }
}

export { SettingsAPI };
