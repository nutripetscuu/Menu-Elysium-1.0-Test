// Database configuration and setup
export const DATABASE_CONFIG = {
  // Supabase connection details (to be filled when ready)
  url: process.env['NEXT_PUBLIC_SUPABASE_URL'],
  anonKey: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'],
  serviceKey: process.env['SUPABASE_SERVICE_ROLE_KEY'], // Server-side only
  
  // Database schema version
  schemaVersion: '1.0.0',
  
  // Migration settings
  runMigrationsOnStart: process.env.NODE_ENV === 'development',
  
  // Cache settings
  enableCaching: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  
  // Real-time settings
  enableRealtimeUpdates: true,
};

export const TABLE_NAMES = {
  categories: 'categories',
  menuItems: 'menu_items', 
  adminUsers: 'admin_users',
} as const;

export const STORAGE_BUCKETS = {
  menuImages: 'menu-images',
  profileImages: 'profile-images',
  general: 'general-uploads',
} as const;

// SQL for creating the database schema
export const DATABASE_SCHEMA_SQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Menu items table  
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  tags TEXT[] DEFAULT '{}',
  portion VARCHAR(100),
  position INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'editor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_position ON categories(position);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_position ON menu_items(position);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

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

-- Public read access for active items
DROP POLICY IF EXISTS "Public read categories" ON categories;
CREATE POLICY "Public read categories" ON categories
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public read menu_items" ON menu_items;
CREATE POLICY "Public read menu_items" ON menu_items
    FOR SELECT USING (is_available = true);

-- Admin access policies
DROP POLICY IF EXISTS "Admin full access categories" ON categories;
CREATE POLICY "Admin full access categories" ON categories
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin full access menu_items" ON menu_items;
CREATE POLICY "Admin full access menu_items" ON menu_items
    FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin read own profile" ON admin_users;
CREATE POLICY "Admin read own profile" ON admin_users
    FOR SELECT USING (auth.uid() = id);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('menu-images', 'menu-images', true),
  ('profile-images', 'profile-images', false),
  ('general-uploads', 'general-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public read menu images" ON storage.objects;
CREATE POLICY "Public read menu images" ON storage.objects
    FOR SELECT USING (bucket_id = 'menu-images');

DROP POLICY IF EXISTS "Admin manage menu images" ON storage.objects;
CREATE POLICY "Admin manage menu images" ON storage.objects
    FOR ALL USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

-- Initial data migration would go here when ready
-- INSERT INTO categories (name, icon, position) VALUES ...
-- INSERT INTO menu_items (category_id, name, description, price, position) VALUES ...
`;

export const isDbConfigured = (): boolean => {
  return !!(DATABASE_CONFIG.url && DATABASE_CONFIG.anonKey);
};