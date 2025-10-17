'use server';

// Server Actions for modifiers management (admin panel)

import {
  getAllModifierGroups as apiGetAllModifierGroups,
  createModifierGroup as apiCreateModifierGroup,
  updateModifierGroup as apiUpdateModifierGroup,
  deleteModifierGroup as apiDeleteModifierGroup,
  assignModifiersToMenuItem as apiAssignModifiersToMenuItem,
  getMenuItemModifiers as apiGetMenuItemModifiers,
} from '@/lib/api/modifiers';
import type { ModifierGroup, ModifierOption, ModifierGroupInput } from '@/lib/api/modifiers';

// Note: Types cannot be re-exported from 'use server' files
// Import these types directly from '@/lib/api/modifiers' in your components

export async function getAllModifierGroups(): Promise<ModifierGroup[]> {
  return apiGetAllModifierGroups();
}

export async function createModifierGroup(input: ModifierGroupInput): Promise<ModifierGroup> {
  return apiCreateModifierGroup(input);
}

export async function updateModifierGroup(
  groupId: string,
  updates: Partial<ModifierGroupInput>
): Promise<ModifierGroup> {
  return apiUpdateModifierGroup(groupId, updates);
}

export async function deleteModifierGroup(groupId: string): Promise<void> {
  return apiDeleteModifierGroup(groupId);
}

export async function assignModifiersToMenuItem(
  menuItemId: string,
  modifierGroupIds: string[]
): Promise<void> {
  return apiAssignModifiersToMenuItem(menuItemId, modifierGroupIds);
}

export async function getMenuItemModifiers(menuItemId: string): Promise<string[]> {
  return apiGetMenuItemModifiers(menuItemId);
}
