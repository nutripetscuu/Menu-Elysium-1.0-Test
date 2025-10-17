// API abstraction layer for menu operations
import {
  type Category,
  type MenuItem,
  type MenuCategoryWithItems,
  type ApiResponse,
  type CategoryInput,
  type MenuItemInput,
  type CategoryUpdate,
  type MenuItemUpdate,
  type ModifierGroup,
} from '../types/database';

import { supabase } from '../supabase/client';

class MenuAPI {
  private static baseUrl = process.env['NEXT_PUBLIC_API_URL'] || '/api';

  /**
   * Get restaurant_id from the current domain context
   * This is CRITICAL for multi-tenant public menu access
   *
   * For development: Uses DEFAULT_RESTAURANT_ID from environment
   * For production: Will use subdomain/custom domain detection (needs server-side routing)
   */
  private static async getRestaurantIdFromDomain(): Promise<string> {
    // Development fallback: Use environment variable
    const defaultRestaurantId = process.env.NEXT_PUBLIC_DEFAULT_RESTAURANT_ID || process.env.DEFAULT_RESTAURANT_ID;

    if (defaultRestaurantId) {
      return defaultRestaurantId;
    }

    // Production: This should be passed from server-side page props
    // The restaurant context should be determined server-side and passed to the component
    throw new Error(
      'Restaurant context not available. Set DEFAULT_RESTAURANT_ID in environment or pass restaurantId from server component.'
    );
  }

  // Get all categories with their menu items
  // MULTI-TENANT: Filters by restaurant_id from domain context (subdomain/custom domain)
  static async getMenuWithCategories(): Promise<ApiResponse<MenuCategoryWithItems[]>> {
    try {
      // Get restaurant_id from domain (CRITICAL for multi-tenancy)
      const restaurantId = await this.getRestaurantIdFromDomain();

      console.log('[MENU API] Fetching menu for restaurant:', restaurantId);

      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          icon,
          position,
          is_active,
          created_at,
          updated_at,
          items:menu_items(
            id,
            category_id,
            name,
            description,
            price,
            price_medium,
            price_grande,
            image_url,
            tags,
            portion,
            position,
            is_available,
            created_at,
            updated_at,
            menu_item_modifiers(
              modifier_group_id,
              position,
              modifier_groups(
                id,
                name,
                type,
                required,
                min_selections,
                max_selections,
                position,
                options:modifier_options(
                  id,
                  label,
                  price_modifier,
                  is_default,
                  position
                )
              )
            ),
            variants:menu_item_variants(
              id,
              name,
              price,
              position
            )
          )
        `)
        .eq('restaurant_id', restaurantId) // MULTI-TENANT FILTER
        .eq('is_active', true)
        .order('position');

      if (categoriesError) {
        throw new Error(`Supabase error: ${categoriesError.message}`);
      }

      // Transform to match MenuCategoryWithItems type
      const formattedData: MenuCategoryWithItems[] = (categories || []).map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        position: cat.position,
        isActive: cat.is_active,
        createdAt: cat.created_at,
        updatedAt: cat.updated_at || undefined,
        items: (cat.items || [])
          .sort((a: any, b: any) => a.position - b.position)
          .map((item: any) => {
            // Transform modifier groups with full details
            const modifierGroups = (item.menu_item_modifiers || [])
              .filter((mim: any) => mim.modifier_groups) // Only include if modifier_groups exists
              .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
              .map((mim: any) => ({
                id: mim.modifier_groups.id,
                name: mim.modifier_groups.name,
                type: mim.modifier_groups.type as 'single' | 'multiple' | 'boolean',
                required: mim.modifier_groups.required,
                minSelections: mim.modifier_groups.min_selections,
                maxSelections: mim.modifier_groups.max_selections,
                position: mim.modifier_groups.position,
                options: (mim.modifier_groups.options || [])
                  .sort((a: any, b: any) => a.position - b.position)
                  .map((opt: any) => ({
                    id: opt.id,
                    label: opt.label,
                    priceModifier: opt.price_modifier,
                    isDefault: opt.is_default,
                    position: opt.position,
                  }))
              }));

            return {
              id: item.id,
              categoryId: item.category_id,
              name: item.name,
              description: item.description,
              price: item.price || (item.price_medium && item.price_grande ? `M: $${item.price_medium} | G: $${item.price_grande}` : ''),
              imageUrl: item.image_url || undefined,
              tags: item.tags || [],
              portion: item.portion || undefined,
              sizes: (item.price_medium && item.price_grande) ? {
                medium: item.price_medium.toString(),
                grande: item.price_grande.toString()
              } : undefined,
              modifierGroups: modifierGroups,
              variants: (item.variants || [])
                .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
                .map((v: { id: string, name: string, price: number, position: number }) => ({
                  id: v.id,
                  name: v.name,
                  price: v.price,
                  position: v.position
                })),
              position: item.position,
              isAvailable: item.is_available,
              createdAt: item.created_at,
              updatedAt: item.updated_at || undefined,
            };
          })
      }));

      return {
        data: formattedData,
        error: null,
        success: true
      };
    } catch (error) {
      console.error('Error fetching menu from Supabase:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  // Get all categories
  static async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      // TODO: Replace with Supabase query
      // const { data, error } = await supabase
      //   .from('categories')
      //   .select('*')
      //   .eq('isActive', true)
      //   .order('position');

      const { data: menuData } = await this.getMenuWithCategories();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const categories = menuData?.map(({ items: _items, ...category }) => category) || [];

      return {
        data: categories,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  // Get menu items by category
  static async getMenuItems(categoryId?: string): Promise<ApiResponse<MenuItem[]>> {
    try {
      // TODO: Replace with Supabase query
      const { data: menuData } = await this.getMenuWithCategories();
      
      if (!menuData) {
        return { data: [], error: null, success: true };
      }

      const items = categoryId
        ? menuData.find((cat: any) => cat.id === categoryId)?.items || []
        : menuData.flatMap((cat: any) => cat.items);

      return {
        data: items,
        error: null,
        success: true
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  // Admin operations (for future admin panel)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async createCategory(_data: CategoryInput): Promise<ApiResponse<Category>> {
    try {
      // TODO: Replace with Supabase mutation
      // const { data: newCategory, error } = await supabase
      //   .from('categories')
      //   .insert(data)
      //   .select()
      //   .single();

      throw new Error('Admin operations not yet implemented');
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async updateCategory(_id: string, _data: CategoryUpdate): Promise<ApiResponse<Category>> {
    try {
      // TODO: Replace with Supabase mutation
      throw new Error('Admin operations not yet implemented');
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async deleteCategory(_id: string): Promise<ApiResponse<boolean>> {
    try {
      // TODO: Replace with Supabase mutation
      throw new Error('Admin operations not yet implemented');
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async createMenuItem(_data: MenuItemInput): Promise<ApiResponse<MenuItem>> {
    try {
      // TODO: Replace with Supabase mutation
      throw new Error('Admin operations not yet implemented');
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async updateMenuItem(_id: string, _data: MenuItemUpdate): Promise<ApiResponse<MenuItem>> {
    try {
      // TODO: Replace with Supabase mutation
      throw new Error('Admin operations not yet implemented');
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async deleteMenuItem(_id: string): Promise<ApiResponse<boolean>> {
    try {
      // TODO: Replace with Supabase mutation
      throw new Error('Admin operations not yet implemented');
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }

  // Image upload helper
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static async uploadImage(_file: File, _folder: string = 'menu'): Promise<ApiResponse<string>> {
    try {
      // TODO: Replace with Supabase Storage
      throw new Error('Image upload not yet implemented');
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      };
    }
  }
}

export { MenuAPI };
