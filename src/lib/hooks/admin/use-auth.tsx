'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import type { User, AuthError } from '@supabase/supabase-js';
import type { AdminUser, AuthContextValue } from '@/lib/types/admin';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load admin user data from database
  const loadAdminUser = useCallback(async (userId: string) => {
    try {
      console.log('[AUTH PROVIDER] Loading admin user data for:', userId);
      const supabase = createBrowserSupabaseClient() as any;
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AUTH PROVIDER] Error loading admin user:', error);
        setAdminUser(null);
        throw error; // Re-throw so the caller knows it failed
      }

      console.log('[AUTH PROVIDER] Admin user loaded:', data.email);
      setAdminUser(data);

      // Update last_login timestamp (don't await, fire and forget)
      supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId)
        .catch((err: any) => console.warn('[AUTH PROVIDER] Failed to update last_login:', err));
    } catch (error) {
      console.error('[AUTH PROVIDER] Exception in loadAdminUser:', error);
      setAdminUser(null);
      throw error; // Re-throw for caller
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    console.log('[AUTH PROVIDER] Initializing auth state...');
    const supabase = createBrowserSupabaseClient();

    // Get authenticated user (secure method)
    supabase.auth.getUser()
      .then(async ({ data: { user: authenticatedUser } }) => {
        console.log('[AUTH PROVIDER] Initial user loaded:', !!authenticatedUser);
        setUser(authenticatedUser ?? null);
        if (authenticatedUser) {
          // Use authenticated user data
          console.log('[AUTH PROVIDER] Creating admin user from authenticated data');
          setAdminUser({
            id: authenticatedUser.id,
            email: authenticatedUser.email || '',
            role: 'admin',
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString()
          });
        }
        console.log('[AUTH PROVIDER] Setting loading to false');
        setLoading(false);
      })
      .catch((error) => {
        console.error('[AUTH PROVIDER] Error in auth initialization:', error);
        setLoading(false);
      });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[AUTH PROVIDER] Auth state changed:', _event, !!session);
      setUser(session?.user ?? null);

      if (session?.user) {
        console.log('[AUTH PROVIDER] Creating admin user from auth change');
        setAdminUser({
          id: session.user.id,
          email: session.user.email || '',
          role: 'admin',
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        });
      } else {
        setAdminUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // Check if user is an admin
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (adminError || !adminData) {
          // User exists but is not an admin
          await supabase.auth.signOut();
          return { error: new Error('You do not have admin access') as AuthError };
        }

        setUser(data.user);
        setAdminUser(adminData);
      }

      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      console.log('[AUTH] Starting sign out...');
      const supabase = createBrowserSupabaseClient();

      // Sign out from Supabase FIRST (clears cookies)
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('[AUTH] Sign out error:', error);
        // Continue with redirect even if there's an error
      } else {
        console.log('[AUTH] Sign out successful');
      }

      // Clear local state after sign out
      setUser(null);
      setAdminUser(null);

      // Redirect immediately to prevent any UI issues
      // Use window.location.href for full page reload to ensure everything is cleared
      console.log('[AUTH] Redirecting to login...');

      // Small delay to ensure state updates propagate
      setTimeout(() => {
        window.location.href = '/login?logout=true';
      }, 50);
    } catch (error) {
      console.error('[AUTH] Unexpected sign out error:', error);
      // Clear state and redirect even on error
      setUser(null);
      setAdminUser(null);
      setTimeout(() => {
        window.location.href = '/login?logout=true';
      }, 50);
    }
  };

  // Request password reset email
  const resetPassword = async (email: string) => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  // Update password (for logged-in users)
  const updatePassword = async (newPassword: string) => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      return { error };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  // Refresh session
  const refreshSession = async () => {
    const supabase = createBrowserSupabaseClient();
    const { data: { user: authenticatedUser } } = await supabase.auth.getUser();
    setUser(authenticatedUser ?? null);
    if (authenticatedUser) {
      await loadAdminUser(authenticatedUser.id);
    }
  };

  const value: AuthContextValue = {
    user,
    adminUser,
    loading,
    isAdmin: !!adminUser,
    role: adminUser?.role ?? null,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
