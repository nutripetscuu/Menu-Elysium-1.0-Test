// Supabase client configuration
import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../types/database';

// Environment variables - use direct access for client-side compatibility
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Client Config:');
console.log('  - URL:', supabaseUrl);
console.log('  - Has Anon Key:', !!supabaseAnonKey);
console.log('  - Anon Key (first 20 chars):', supabaseAnonKey?.substring(0, 20));

/**
 * Legacy client - Use createBrowserClient() instead for new code
 * @deprecated Use createBrowserClient() for better SSR support
 */
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-client-info': 'kampai-menu@1.0.0',
      },
    },
  }
);

/**
 * Creates a browser-safe Supabase client for client components
 * Use this in all client-side code (pages, components with 'use client')
 *
 * SECURITY: This uses the ANON KEY (public, safe for browser)
 * NEVER use admin-client.ts in client components!
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Export direct helper function for client-side compatibility
export const isSupabaseClientConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Database migration helper (for development)
export const createTables = async () => {
  if (!isSupabaseClientConfigured()) {
    console.warn('Supabase not configured - skipping table creation');
    return;
  }

  const sql = `
    -- Categories table
    CREATE TABLE IF NOT EXISTS categories (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR NOT NULL,
      icon VARCHAR NOT NULL,
      position INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Menu items table  
    CREATE TABLE IF NOT EXISTS menu_items (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
      name VARCHAR NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      image_url VARCHAR,
      tags TEXT[] DEFAULT '{}',
      portion VARCHAR,
      position INTEGER NOT NULL DEFAULT 0,
      is_available BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );

    -- Admin users table
    CREATE TABLE IF NOT EXISTS admin_users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      email VARCHAR UNIQUE NOT NULL,
      role VARCHAR DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'editor')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      last_login TIMESTAMP WITH TIME ZONE
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_categories_position ON categories(position);
    CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
    CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
    CREATE INDEX IF NOT EXISTS idx_menu_items_position ON menu_items(position);
    CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);

    -- Updated at trigger function
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = now();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Triggers for updated_at
    DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
    CREATE TRIGGER update_categories_updated_at
        BEFORE UPDATE ON categories
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
    CREATE TRIGGER update_menu_items_updated_at
        BEFORE UPDATE ON menu_items
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    -- Row Level Security (RLS)
    ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
    ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
    ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

    -- Public read access for categories and menu_items
    CREATE POLICY IF NOT EXISTS "Allow public read on categories" ON categories
        FOR SELECT USING (is_active = true);

    CREATE POLICY IF NOT EXISTS "Allow public read on menu_items" ON menu_items
        FOR SELECT USING (is_available = true);

    -- Admin access policies (will be refined when auth is implemented)
    CREATE POLICY IF NOT EXISTS "Allow admin full access on categories" ON categories
        FOR ALL USING (auth.role() = 'authenticated');

    CREATE POLICY IF NOT EXISTS "Allow admin full access on menu_items" ON menu_items
        FOR ALL USING (auth.role() = 'authenticated');

    CREATE POLICY IF NOT EXISTS "Allow admin read own profile" ON admin_users
        FOR SELECT USING (auth.uid() = id);
  `;

  try {
    // Note: This would need to be run via SQL editor in Supabase dashboard
    // or through a migration tool - keeping here for reference
    console.log('Database schema ready to be applied:', sql);
  } catch (error) {
    console.error('Database setup error:', error);
  }
};