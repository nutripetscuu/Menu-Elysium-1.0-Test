// Admin Supabase client with SERVICE ROLE KEY for server-side admin operations
// WARNING: This client bypasses RLS and should ONLY be used in API routes/server actions
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

/**
 * Creates an admin client with service role privileges
 *
 * SECURITY WARNING:
 * - This client bypasses Row Level Security (RLS)
 * - ONLY use in API routes, server actions, or server components
 * - NEVER expose this client to the browser
 * - NEVER use in client components
 */
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for admin client');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
