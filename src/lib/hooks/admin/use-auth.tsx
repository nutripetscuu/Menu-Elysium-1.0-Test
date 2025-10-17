'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import type { User, AuthError } from '@supabase/supabase-js';
import type { AdminUser, AuthContextValue } from '@/lib/types/admin';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('[AUTH PROVIDER v2] Component mounting/rendering - NEW VERSION WITH FIXES');
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  console.log('[AUTH PROVIDER v2] Current state:', { user: !!user, adminUser: !!adminUser, loading });

  // Load admin user data from database using server action
  const loadAdminUser = useCallback(async (userId: string) => {
    try {
      console.log('[AUTH PROVIDER] 🔄 Loading admin user data for:', userId);

      // Import server action dynamically
      const { getAdminUserData } = await import('@/app/actions/auth');

      console.log('[AUTH PROVIDER] 🔄 Calling server action...');
      const adminUserData = await getAdminUserData(userId);

      console.log('[AUTH PROVIDER] 📊 Server action result:', { hasData: !!adminUserData });

      if (!adminUserData) {
        console.error('[AUTH PROVIDER] ❌ No admin user data returned');
        // Don't throw - just set a fallback admin user
        setAdminUser({
          id: userId,
          email: '',
          role: 'admin',
          restaurantId: null,
          restaurantSubdomain: null,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString()
        });
        return;
      }

      console.log('[AUTH PROVIDER] ✅ Admin user data loaded:', JSON.stringify(adminUserData, null, 2));
      setAdminUser(adminUserData);

      // Update last_login timestamp (fire and forget) - wrapped in try/catch
      try {
        const supabase = createBrowserSupabaseClient();
        const updatePromise = supabase
          .from('admin_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', userId);

        updatePromise.then(() => {
          console.log('[AUTH PROVIDER] last_login updated');
        }).catch((err: any) => {
          console.warn('[AUTH PROVIDER] Failed to update last_login:', err);
        });
      } catch (err) {
        console.warn('[AUTH PROVIDER] Exception updating last_login:', err);
      }
    } catch (error) {
      console.error('[AUTH PROVIDER] ❌ Exception in loadAdminUser:', error);
      // Don't throw - set a fallback admin user to prevent auth session loss
      setAdminUser({
        id: userId,
        email: '',
        role: 'admin',
        restaurantId: null,
        restaurantSubdomain: null,
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString()
      });
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
          // Load full admin user data from database (includes restaurantId)
          console.log('[AUTH PROVIDER] Waiting for loadAdminUser to complete...');
          await loadAdminUser(authenticatedUser.id);
          console.log('[AUTH PROVIDER] loadAdminUser completed');
        }
        console.log('[AUTH PROVIDER] ✅ Setting loading to false');
        setLoading(false);
      })
      .catch((error) => {
        console.error('[AUTH PROVIDER] ❌ Error in auth initialization:', error);
        setLoading(false);
      });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[AUTH PROVIDER] Auth state changed:', _event, !!session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Load full admin user data from database (includes restaurantId)
        await loadAdminUser(session.user.id);
      } else {
        setAdminUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - loadAdminUser is stable due to useCallback

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
