'use server';

// Server Actions for promotions management (admin panel)

import { PromotionsAPI } from '@/lib/api/promotions';
import type { PromotionalImage, CreatePromotionalImageInput, UpdatePromotionalImageInput } from '@/lib/api/promotions';
import type { ApiResponse } from '@/lib/types/database';

// Note: Types cannot be re-exported from 'use server' files
// Import these types directly from '@/lib/api/promotions' in your components

export async function getAllPromotions(): Promise<ApiResponse<PromotionalImage[]>> {
  return PromotionsAPI.getAllPromotions();
}

export async function getActivePromotions(): Promise<ApiResponse<PromotionalImage[]>> {
  return PromotionsAPI.getActivePromotions();
}

export async function getPromotionById(id: string): Promise<ApiResponse<PromotionalImage>> {
  return PromotionsAPI.getPromotionById(id);
}

export async function createPromotion(
  input: CreatePromotionalImageInput
): Promise<ApiResponse<PromotionalImage>> {
  return PromotionsAPI.createPromotion(input);
}

export async function updatePromotion(
  id: string,
  input: UpdatePromotionalImageInput
): Promise<ApiResponse<PromotionalImage>> {
  return PromotionsAPI.updatePromotion(id, input);
}

export async function deletePromotion(id: string): Promise<ApiResponse<null>> {
  return PromotionsAPI.deletePromotion(id);
}

export async function reorderPromotions(promotionIds: string[]): Promise<ApiResponse<null>> {
  return PromotionsAPI.reorderPromotions(promotionIds);
}

export async function togglePromotionStatus(id: string): Promise<ApiResponse<PromotionalImage>> {
  return PromotionsAPI.togglePromotionStatus(id);
}

// Note: uploadImage and deleteImage work with Files which can't be passed to server actions
// These should be called from API routes instead
