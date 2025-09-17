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
  convertLegacyToDatabase
} from '../types/database';

// Static data import for fallback
import { menuData as staticMenuData } from '../menu-data';

class MenuAPI {
  private static baseUrl = process.env['NEXT_PUBLIC_API_URL'] || '/api';

  // Get all categories with their menu items
  static async getMenuWithCategories(): Promise<ApiResponse<MenuCategoryWithItems[]>> {
    try {
      // TODO: Replace with actual Supabase API call
      // For now, use static data converted to new format
      const convertedData = staticMenuData.map(category => {
        const { category: cat, items } = convertLegacyToDatabase(category);
        return {
          ...cat,
          id: category.id,
          createdAt: new Date().toISOString(),
          items: items.map((item, index) => ({
            ...item,
            id: `${category.id}-item-${index}`,
            categoryId: category.id,
            createdAt: new Date().toISOString(),
          }))
        } as MenuCategoryWithItems;
      });

      return {
        data: convertedData,
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
        ? menuData.find(cat => cat.id === categoryId)?.items || []
        : menuData.flatMap(cat => cat.items);

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