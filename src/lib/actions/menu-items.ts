'use server';

// Server Actions for menu items management (admin panel)

import {
  getMenuItems as apiGetMenuItems,
  getMenuItemById as apiGetMenuItemById,
  createMenuItem as apiCreateMenuItem,
  updateMenuItem as apiUpdateMenuItem,
  deleteMenuItem as apiDeleteMenuItem,
  reorderMenuItems as apiReorderMenuItems,
  toggleMenuItemAvailability as apiToggleMenuItemAvailability,
} from '@/lib/api/menu-items';
import type {
  MenuItem,
  MenuItemInput,
  MenuItemUpdate,
  MenuItemVariant,
  MenuItemIngredient,
  ModifierGroup,
  ModifierOption,
} from '@/lib/api/menu-items';

// Note: Types cannot be re-exported from 'use server' files
// Import these types directly from '@/lib/api/menu-items' in your components

export async function getMenuItems(categoryId?: string): Promise<MenuItem[]> {
  return apiGetMenuItems(categoryId);
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  return apiGetMenuItemById(id);
}

export async function createMenuItem(input: MenuItemInput): Promise<MenuItem> {
  return apiCreateMenuItem(input);
}

export async function updateMenuItem(id: string, update: MenuItemUpdate): Promise<MenuItem> {
  return apiUpdateMenuItem(id, update);
}

export async function deleteMenuItem(id: string): Promise<void> {
  return apiDeleteMenuItem(id);
}

export async function reorderMenuItems(categoryId: string, itemIds: string[]): Promise<void> {
  return apiReorderMenuItems(categoryId, itemIds);
}

export async function toggleMenuItemAvailability(id: string): Promise<MenuItem> {
  return apiToggleMenuItemAvailability(id);
}
