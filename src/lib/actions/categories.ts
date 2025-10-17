'use server';

// Server Actions for category management (admin panel)
// These can safely use server-only code and are called from client components

import {
  getCategories as apiGetCategories,
  getCategoryById as apiGetCategoryById,
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
  reorderCategories as apiReorderCategories,
} from '@/lib/api/categories';
import type { Category, CategoryInput, CategoryUpdate } from '@/lib/api/categories';

// Note: Types cannot be re-exported from 'use server' files
// Import these types directly from '@/lib/api/categories' in your components

export async function getCategories(): Promise<Category[]> {
  return apiGetCategories();
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return apiGetCategoryById(id);
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  return apiCreateCategory(input);
}

export async function updateCategory(id: string, update: CategoryUpdate): Promise<Category> {
  return apiUpdateCategory(id, update);
}

export async function deleteCategory(id: string): Promise<void> {
  return apiDeleteCategory(id);
}

export async function reorderCategories(categoryIds: string[]): Promise<void> {
  return apiReorderCategories(categoryIds);
}
