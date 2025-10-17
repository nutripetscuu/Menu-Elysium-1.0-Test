// Admin-specific types and interfaces

import type { User } from '@supabase/supabase-js';

// Admin user roles
export type AdminRole = 'admin' | 'manager' | 'editor';

// Admin user from database
export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
  last_login: string | null;
}

// Auth context state
export interface AuthState {
  user: User | null;
  adminUser: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
  role: AdminRole | null;
}

// Auth context actions
export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  refreshSession: () => Promise<void>;
}

// Combined auth context
export interface AuthContextValue extends AuthState, AuthActions {}

// Role permissions helper
export const ROLE_PERMISSIONS = {
  admin: {
    canManageUsers: true,
    canManageSettings: true,
    canManageMenu: true,
    canManageModifiers: true,
    canManagePromotions: true,
  },
  manager: {
    canManageUsers: false,
    canManageSettings: true,
    canManageMenu: true,
    canManageModifiers: true,
    canManagePromotions: true,
  },
  editor: {
    canManageUsers: false,
    canManageSettings: false,
    canManageMenu: true,
    canManageModifiers: false,
    canManagePromotions: true,
  },
} as const;

// Helper function to check permissions
export function hasPermission(
  role: AdminRole | null,
  permission: keyof typeof ROLE_PERMISSIONS.admin
): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role][permission];
}
