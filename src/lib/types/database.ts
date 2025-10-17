// Database types for Supabase integration
import { z } from 'zod';

// =====================================================
// MULTI-TENANT TYPES
// =====================================================

// Restaurant Schema (Core multi-tenant entity)
export const RestaurantSchema = z.object({
  id: z.string().uuid(),
  restaurantName: z.string().min(1, 'Restaurant name is required'),
  businessName: z.string().optional(),
  subdomain: z.string().min(1, 'Subdomain is required'),
  customDomain: z.string().optional().nullable(),
  subscriptionTier: z.enum(['trial', 'basic', 'professional', 'enterprise']).default('trial'),
  subscriptionStatus: z.enum(['active', 'inactive', 'suspended', 'cancelled']).default('active'),
  subscriptionStartDate: z.string().datetime().optional().nullable(),
  subscriptionEndDate: z.string().datetime().optional().nullable(),
  billingEmail: z.string().email().optional().nullable(),
  description: z.string().optional().nullable(),
  cuisineType: z.array(z.string()).default([]),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  website: z.string().url().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().default('Mexico'),
  timezone: z.string().default('America/Mexico_City'),
  operatingHours: z.record(z.any()).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  primaryColor: z.string().default('#B0C4DE'),
  secondaryColor: z.string().optional().nullable(),
  bannerImageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
  onboardingCompleted: z.boolean().default(false),
  features: z.record(z.any()).optional().nullable(),
  totalMenuItems: z.number().int().default(0),
  totalCategories: z.number().int().default(0),
  totalAdminUsers: z.number().int().default(0),
  metadata: z.record(z.any()).optional().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  deletedAt: z.string().datetime().optional().nullable(),
});

// Modifier Option Schema
export const ModifierOptionSchema = z.object({
  id: z.string(),
  restaurantId: z.string().uuid().optional(), // Optional for backward compatibility
  label: z.string().min(1, 'Option label is required'),
  priceModifier: z.number().default(0), // Additional cost (can be 0, positive, or negative)
  isDefault: z.boolean().default(false),
  position: z.number().int().min(0).default(0), // Display order
});

// Modifier Group Schema
export const ModifierGroupSchema = z.object({
  id: z.string(),
  restaurantId: z.string().uuid().optional(), // Optional for backward compatibility
  name: z.string().min(1, 'Modifier group name is required'),
  type: z.enum(['single', 'multiple', 'boolean']), // single = radio, multiple = checkbox, boolean = yes/no
  required: z.boolean().default(false),
  options: z.array(ModifierOptionSchema),
  minSelections: z.number().int().min(0).default(0),
  maxSelections: z.number().int().optional(), // For multiple type
  position: z.number().int().min(0).default(0), // Display order
});

// Zod schemas for validation
export const CategorySchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid().optional(), // Optional for backward compatibility
  name: z.string().min(1, 'Category name is required'),
  icon: z.string().min(1, 'Icon is required'),
  position: z.number().int().min(0),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

// Variant Schema (for unlimited size variants)
export const VariantSchema = z.object({
  id: z.string(),
  restaurantId: z.string().uuid().optional(), // Optional for backward compatibility
  name: z.string(),
  price: z.number(),
  position: z.number(),
});

// Ingredient Schema (item-specific ingredients that can be excluded)
export const IngredientSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid().optional(), // Optional for backward compatibility
  name: z.string().min(1, 'Ingredient name is required'),
  canExclude: z.boolean().default(true),
  position: z.number().int().min(0).default(0),
});

export const MenuItemSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid().optional(), // Optional for backward compatibility
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
  modifierGroups: z.union([
    z.array(z.string()), // Array of modifier group IDs (for backward compatibility)
    z.array(ModifierGroupSchema) // Array of full modifier group objects
  ]).default([]),
  variants: z.array(VariantSchema).default([]), // Array of size variants
  ingredients: z.array(IngredientSchema).default([]), // Array of item-specific ingredients
  position: z.number().int().min(0),
  isAvailable: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export const AdminUserSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid().optional().nullable(), // NULL for super_admins
  email: z.string().email(),
  role: z.enum(['super_admin', 'admin', 'manager', 'editor']).default('admin'),
  isSuperAdmin: z.boolean().default(false),
  createdAt: z.string().datetime(),
  lastLogin: z.string().datetime().nullable().optional(),
});

// Promotional Image Schema
export const PromotionalImageSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string().uuid().optional(), // Optional for backward compatibility
  imageUrl: z.string().url(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  linkUrl: z.string().url().optional().nullable(),
  linkMenuItemId: z.string().uuid().optional().nullable(),
  position: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

// TypeScript interfaces derived from schemas
export type Restaurant = z.infer<typeof RestaurantSchema>;
export type ModifierOption = z.infer<typeof ModifierOptionSchema>;
export type ModifierGroup = z.infer<typeof ModifierGroupSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Variant = z.infer<typeof VariantSchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;
export type MenuItem = z.infer<typeof MenuItemSchema>;
export type AdminUser = z.infer<typeof AdminUserSchema>;
export type PromotionalImage = z.infer<typeof PromotionalImageSchema>;

// Customer selection types (for cart/orders)
export type SelectedModifier = {
  groupId: string;
  groupName: string;
  selectedOptions: {
    optionId: string;
    optionLabel: string;
    priceModifier: number;
  }[];
};

export type CartItem = {
  menuItemId: string;
  menuItemName: string;
  basePrice: number;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  totalPrice: number; // basePrice + all modifier prices
};

// Input types for creating/updating (without generated fields)
export type RestaurantInput = Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
export type RestaurantUpdate = Partial<RestaurantInput>;

export type CategoryInput = Omit<Category, 'id' | 'createdAt' | 'updatedAt'>;
export type CategoryUpdate = Partial<CategoryInput>;

export type MenuItemInput = Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>;
export type MenuItemUpdate = Partial<MenuItemInput>;

export type PromotionalImageInput = Omit<PromotionalImage, 'id' | 'createdAt' | 'updatedAt'>;
export type PromotionalImageUpdate = Partial<PromotionalImageInput>;

// Database table types for Supabase
export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: Restaurant;
        Insert: RestaurantInput & { id?: string };
        Update: RestaurantUpdate;
      };
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
      promotional_images: {
        Row: PromotionalImage;
        Insert: PromotionalImageInput & { id?: string };
        Update: PromotionalImageUpdate;
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
      get_restaurant_by_subdomain: {
        Args: { p_subdomain: string };
        Returns: {
          id: string;
          restaurant_name: string;
          subdomain: string;
          custom_domain: string | null;
          is_active: boolean;
          subscription_status: string;
          primary_color: string;
          logo_url: string | null;
        }[];
      };
      check_restaurant_limit: {
        Args: { p_restaurant_id: string; p_limit_type: string };
        Returns: boolean;
      };
      get_restaurant_context: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      user_role: 'super_admin' | 'admin' | 'manager' | 'editor';
      subscription_tier: 'trial' | 'basic' | 'professional' | 'enterprise';
      subscription_status: 'active' | 'inactive' | 'suspended' | 'cancelled';
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
  modifierGroups?: string[];
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
      modifierGroups: item.modifierGroups || [],
      variants: [], // Empty array for legacy items
      ingredients: [], // Empty array for legacy items
      position: index,
      isAvailable: true,
    })),
  };
}