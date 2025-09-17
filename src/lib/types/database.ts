// Database types for Supabase integration
import { z } from 'zod';

// Zod schemas for validation
export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Category name is required'),
  icon: z.string().min(1, 'Icon is required'),
  position: z.number().int().min(0),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export const MenuItemSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.string().uuid(),
  name: z.string().min(1, 'Menu item name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.union([z.number().positive('Price must be positive'), z.string().min(1)]),
  imageUrl: z.string().url().nullable().optional(),
  tags: z.array(z.string()).default([]),
  portion: z.string().nullable().optional(),
  sizes: z.object({
    medium: z.string(),
    grande: z.string()
  }).nullable().optional(),
  position: z.number().int().min(0),
  isAvailable: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export const AdminUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'editor']).default('admin'),
  createdAt: z.string().datetime(),
  lastLogin: z.string().datetime().nullable().optional(),
});

// TypeScript interfaces derived from schemas
export type Category = z.infer<typeof CategorySchema>;
export type MenuItem = z.infer<typeof MenuItemSchema>;
export type AdminUser = z.infer<typeof AdminUserSchema>;

// Input types for creating/updating (without generated fields)
export type CategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export type CategoryUpdate = Partial<CategoryInput>;

export type MenuItemInput = Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>;
export type MenuItemUpdate = Partial<MenuItemInput>;

// Database table types for Supabase
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: CategoryInput & { id?: string };
        Update: CategoryUpdate;
      };
      menu_items: {
        Row: MenuItem;
        Insert: MenuItemInput & { id?: string };
        Update: MenuItemUpdate;
      };
      admin_users: {
        Row: AdminUser;
        Insert: Omit<AdminUser, 'id' | 'createdAt'> & { id?: string };
        Update: Partial<Omit<AdminUser, 'id' | 'createdAt'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'admin' | 'manager' | 'editor';
    };
  };
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Menu display types (for frontend)
export interface MenuCategoryWithItems extends Category {
  items: MenuItem[];
}

// Legacy types for backward compatibility (can be removed after migration)
export type LegacyMenuCategory = {
  id: string;
  name: string;
  icon: string;
  items: LegacyMenuItem[];
};

export type LegacyMenuItem = {
  name: string;
  description: string;
  price: string;
  image?: {
    id: string;
    url: string;
    hint: string;
  };
  tags?: string[];
  portion?: string;
  sizes?: {
    medium: string;
    grande: string;
  };
};

// Conversion utilities
export function convertLegacyToDatabase(legacy: LegacyMenuCategory): {
  category: CategoryInput;
  items: MenuItemInput[];
} {
  return {
    category: {
      name: legacy.name,
      icon: legacy.icon,
      position: 0,
      isActive: true,
    },
    items: legacy.items.map((item, index) => ({
      categoryId: legacy.id,
      name: item.name,
      description: item.description,
      price: item.sizes ? item.price : (typeof item.price === 'string' ? parseFloat(item.price) : item.price),
      imageUrl: item.image?.url || null,
      tags: item.tags || [],
      portion: item.portion || null,
      sizes: item.sizes || null,
      position: index,
      isAvailable: true,
    })),
  };
}