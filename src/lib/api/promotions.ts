// API for promotional images management
import { createServerClient } from '../supabase/server-client';
import type { ApiResponse } from '../types/database';

export interface PromotionalImage {
  id: string;
  image_url: string;
  title?: string | null;
  description?: string | null;
  link_url?: string | null;
  link_menu_item_id?: string | null;
  position: number;
  is_active: boolean;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface CreatePromotionalImageInput {
  image_url: string;
  title?: string;
  description?: string;
  link_url?: string;
  link_menu_item_id?: string;
  position?: number;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
}

export interface UpdatePromotionalImageInput {
  image_url?: string;
  title?: string;
  description?: string;
  link_url?: string;
  link_menu_item_id?: string;
  position?: number;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
}

class PromotionsAPI {
  /**
   * Get all promotional images (admin view)
   * MULTI-TENANT: Filters by authenticated user's restaurant_id
   */
  static async getAllPromotions(): Promise<ApiResponse<PromotionalImage[]>> {
    try {
      const supabase = await createServerClient() as any;

      // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
      const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
      const restaurantId = await getRestaurantId();

      const { data, error } = await supabase
        .from('promotional_images')
        .select('*')
        .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching promotions:', error);
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Unexpected error in getAllPromotions:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  /**
   * Get active promotional images (public view)
   * MULTI-TENANT: Filters by authenticated user's restaurant_id
   */
  static async getActivePromotions(): Promise<ApiResponse<PromotionalImage[]>> {
    try {
      const supabase = await createServerClient() as any;

      // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
      const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
      const restaurantId = await getRestaurantId();

      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('promotional_images')
        .select('*')
        .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching active promotions:', error);
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Unexpected error in getActivePromotions:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  /**
   * Get single promotional image by ID
   * MULTI-TENANT: Ensures promotion belongs to user's restaurant
   */
  static async getPromotionById(id: string): Promise<ApiResponse<PromotionalImage>> {
    try {
      const supabase = await createServerClient() as any;

      // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
      const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
      const restaurantId = await getRestaurantId();

      const { data, error } = await supabase
        .from('promotional_images')
        .select('*')
        .eq('id', id)
        .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
        .single();

      if (error) {
        console.error('Error fetching promotion:', error);
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
      console.error('Unexpected error in getPromotionById:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  /**
   * Create a new promotional image
   */
  static async createPromotion(
    input: CreatePromotionalImageInput
  ): Promise<ApiResponse<PromotionalImage>> {
    try {
      const supabase = await createServerClient() as any;

      // Get restaurant_id from authenticated user (critical for multi-tenancy)
      const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
      const restaurantId = await getRestaurantId();

      // If no position specified, get the max position + 1
      if (input.position === undefined) {
        const { data: maxData } = await supabase
          .from('promotional_images')
          .select('position')
          .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
          .order('position', { ascending: false })
          .limit(1)
          .single();

        input.position = maxData ? maxData.position + 1 : 0;
      }

      const { data, error } = await supabase
        .from('promotional_images')
        .insert([{ ...input, restaurant_id: restaurantId }]) // Multi-tenant: inject restaurant_id
        .select()
        .single();

      if (error) {
        console.error('Error creating promotion:', error);
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
      console.error('Unexpected error in createPromotion:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  /**
   * Update an existing promotional image
   * MULTI-TENANT: Ensures only updating own restaurant's data
   */
  static async updatePromotion(
    id: string,
    input: UpdatePromotionalImageInput
  ): Promise<ApiResponse<PromotionalImage>> {
    try {
      const supabase = await createServerClient() as any;

      // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
      const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
      const restaurantId = await getRestaurantId();

      const { data, error } = await supabase
        .from('promotional_images')
        .update(input)
        .eq('id', id)
        .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
        .select()
        .single();

      if (error) {
        console.error('Error updating promotion:', error);
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
      console.error('Unexpected error in updatePromotion:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  /**
   * Delete a promotional image
   * MULTI-TENANT: Ensures only deleting own restaurant's data
   */
  static async deletePromotion(id: string): Promise<ApiResponse<null>> {
    try {
      const supabase = await createServerClient() as any;

      // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
      const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
      const restaurantId = await getRestaurantId();

      const { error } = await supabase
        .from('promotional_images')
        .delete()
        .eq('id', id)
        .eq('restaurant_id', restaurantId); // MULTI-TENANT FILTER

      if (error) {
        console.error('Error deleting promotion:', error);
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: null,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Unexpected error in deletePromotion:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  /**
   * Reorder promotional images
   * MULTI-TENANT: Ensures only reordering own restaurant's data
   */
  static async reorderPromotions(
    promotionIds: string[]
  ): Promise<ApiResponse<null>> {
    try {
      const supabase = await createServerClient() as any;

      // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
      const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
      const restaurantId = await getRestaurantId();

      // Update positions for all promotions
      const updates = promotionIds.map((id, index) => ({
        id,
        position: index
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('promotional_images')
          .update({ position: update.position })
          .eq('id', update.id)
          .eq('restaurant_id', restaurantId); // MULTI-TENANT FILTER

        if (error) {
          console.error('Error reordering promotions:', error);
          return {
            data: null,
            error: error.message,
            success: false
          };
        }
      }

      return {
        data: null,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Unexpected error in reorderPromotions:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  /**
   * Toggle active status of a promotional image
   * MULTI-TENANT: Ensures only toggling own restaurant's data
   */
  static async togglePromotionStatus(id: string): Promise<ApiResponse<PromotionalImage>> {
    try {
      const supabase = await createServerClient() as any;

      // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
      const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
      const restaurantId = await getRestaurantId();

      // Get current status
      const { data: current, error: fetchError } = await supabase
        .from('promotional_images')
        .select('is_active')
        .eq('id', id)
        .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
        .single();

      if (fetchError) {
        return {
          data: null,
          error: fetchError.message,
          success: false
        };
      }

      // Toggle status
      const { data, error } = await supabase
        .from('promotional_images')
        .update({ is_active: !current.is_active })
        .eq('id', id)
        .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
        .select()
        .single();

      if (error) {
        console.error('Error toggling promotion status:', error);
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
      console.error('Unexpected error in togglePromotionStatus:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  /**
   * Upload image to Supabase Storage
   * MULTI-TENANT: Uploads to tenant-specific folder
   */
  static async uploadImage(
    file: File,
    folder: string = 'promotions'
  ): Promise<ApiResponse<string>> {
    try {
      const supabase = await createServerClient() as any;

      // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
      const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
      const restaurantId = await getRestaurantId();

      // Generate unique filename with tenant-specific path
      const fileExt = file.name.split('.').pop();
      const fileName = `${restaurantId}/${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage with tenant isolation
      const { data, error } = await supabase.storage
        .from('promotional-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
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
      console.error('Unexpected error in uploadImage:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  /**
   * Delete image from Supabase Storage
   * MULTI-TENANT: Verifies image belongs to user's restaurant before deletion
   */
  static async deleteImage(imageUrl: string): Promise<ApiResponse<null>> {
    try {
      const supabase = await createServerClient() as any;

      // Get restaurant_id from authenticated user (CRITICAL for multi-tenancy)
      const { getRestaurantId } = await import('@/lib/utils/get-restaurant-id');
      const restaurantId = await getRestaurantId();

      // Extract path from URL
      const urlParts = imageUrl.split('/');
      const bucketIndex = urlParts.findIndex((part: any) => part === 'promotional-images');

      if (bucketIndex === -1) {
        return {
          data: null,
          error: 'Invalid image URL',
          success: false
        };
      }

      const path = urlParts.slice(bucketIndex + 1).join('/');

      // SECURITY: Verify path starts with user's restaurant_id
      if (!path.startsWith(`${restaurantId}/`)) {
        console.error('[SECURITY] Attempted to delete image from different restaurant:', path);
        return {
          data: null,
          error: 'Unauthorized: Cannot delete images from other restaurants',
          success: false
        };
      }

      const { error } = await supabase.storage
        .from('promotional-images')
        .remove([path]);

      if (error) {
        console.error('Error deleting image from storage:', error);
        return {
          data: null,
          error: error.message,
          success: false
        };
      }

      return {
        data: null,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Unexpected error in deleteImage:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }
}

export { PromotionsAPI };
