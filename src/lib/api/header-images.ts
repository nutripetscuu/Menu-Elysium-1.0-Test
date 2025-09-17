// API for header/banner images from Supabase
import { supabase } from '../supabase/client';
import type { ApiResponse } from '../types/database';

export interface HeaderImage {
  id: number;
  created_at: string;
  "Image url": string;
  title?: string;
  subtitle?: string;
  position?: number;
  is_active?: boolean;
}

export interface BannerImage {
  src: string;
  alt: string;
  title?: string;
  subtitle?: string;
}

class HeaderImagesAPI {
  // Get all header images for carousel
  static async getHeaderImages(): Promise<ApiResponse<HeaderImage[]>> {
    try {
      // Check if Supabase is configured
      const isConfigured = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      console.log('🔗 Attempting to fetch from Header Images table...');
      console.log('🔧 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('🔧 Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      console.log('🔧 Anon Key (first 20 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20));
      console.log('🔧 Supabase configured:', isConfigured);

      if (!isConfigured) {
        console.warn('⚠️ Supabase not properly configured, environment variables missing');
        return {
          data: null,
          error: 'Supabase configuration missing - check environment variables',
          success: false
        };
      }

      // Try to fetch with timeout and better error handling
      const { data, error } = await Promise.race([
        supabase
          .from('Header Images')
          .select(`
            id,
            created_at,
            "Image url"
          `)
          .order('created_at', { ascending: true }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
      ]) as any;

      console.log('🔍 Supabase response data:', data);
      console.log('🔍 Supabase response error:', error);
      console.log('🔍 Error type:', typeof error);
      console.log('🔍 Error stringified:', JSON.stringify(error, null, 2));

      if (error) {
        console.error('🚨 Supabase error details:', error);
        console.error('🚨 Error message:', error.message);
        console.error('🚨 Error code:', error.code);
        console.error('🚨 Error details:', error.details);
        console.error('🚨 Error hint:', error.hint);
        return {
          data: null,
          error: `Database error: ${error.message || 'Unknown database error'} (Code: ${error.code || 'N/A'})`,
          success: false
        };
      }

      if (!data || data.length === 0) {
        console.warn('No data found in Header Images table');
        return {
          data: [],
          error: 'No header images found in database',
          success: false
        };
      }

      console.log(`Successfully fetched ${data.length} header images`);
      return {
        data: data || [],
        error: null,
        success: true
      };
    } catch (error) {
      console.error('🚨 Unexpected error in getHeaderImages:', error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          console.error('🌐 Network error detected - likely CORS or connection issue');
        } else if (error.message.includes('timeout')) {
          console.error('⏰ Request timeout - database took too long to respond');
        }
      }

      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false
      };
    }
  }

  // Convert header images to banner carousel format
  static async getBannerImages(): Promise<ApiResponse<BannerImage[]>> {
    try {
      console.log('🎨 Starting getBannerImages...');
      console.log('🔧 Environment check:');
      console.log('  - URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('  - Has Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      // Try to get images from database
      const response = await this.getHeaderImages();

      if (!response.success || !response.data || response.data.length === 0) {
        console.warn('⚠️ Header images fetch failed or no data found, using fallback. Error:', response.error);
        console.warn('⚠️ Using fallback images instead');
        // Return fallback images instead of an error
        return {
          data: this.getFallbackImages(),
          error: null, // Don't propagate error since we have fallback
          success: true
        };
      }

      // Convert to banner format - use all images from database
      const bannerImages: BannerImage[] = response.data.map((image, index) => ({
        src: image["Image url"],
        alt: `Elysium Café Banner ${index + 1}`,
        title: undefined, // Let database images speak for themselves
        subtitle: undefined
      }));

      return {
        data: bannerImages,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('🚨 Error in getBannerImages, using fallback:', error);
      // Always return fallback images on any error
      return {
        data: this.getFallbackImages(),
        error: null, // Don't propagate error since we have fallback
        success: true
      };
    }
  }

  // Get appropriate title based on image position/content
  private static getTitleForImage(index: number): string {
    const titles = [
      'colores que saben',
      'Elysium Café',
      'the matcha'
    ];
    return titles[index] || 'Elysium Café';
  }

  // Get appropriate subtitle based on image position/content
  private static getSubtitleForImage(index: number): string {
    const subtitles = [
      'a México',
      'Un lugar en donde todo sabe',
      'mindset'
    ];
    return subtitles[index] || 'Experiencia gastronómica única';
  }

  // Fallback static images in case database is unavailable
  static getFallbackImages(): BannerImage[] {
    // Use restaurant/food themed images from Unsplash
    const fallbackImageIds = [
      "photo-1555939594-58d7cb561ad1", // Colorful layered drink
      "photo-1554118811-1e0d58224f24", // Food and drink on wooden table
      "photo-1536511132770-e5058c7e8c46", // Matcha drink
      "photo-1504674900247-0877df9cc836", // Restaurant food
      "photo-1565958011703-44f9829ba187"  // Burgers and fries
    ];

    return fallbackImageIds.map((imageId, index) => ({
      src: `https://images.unsplash.com/${imageId}?w=1920&h=600&fit=crop&crop=center`,
      alt: `Elysium Café Banner ${index + 1}`,
      title: undefined,
      subtitle: undefined
    }));
  }
}

export { HeaderImagesAPI };