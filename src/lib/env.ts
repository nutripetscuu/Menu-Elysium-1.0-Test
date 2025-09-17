// Environment variable validation and configuration
import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Supabase configuration (optional for now)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // API configuration
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000/api'),

  // Database configuration
  DATABASE_SCHEMA_VERSION: z.string().default('1.0.0'),
  RUN_MIGRATIONS_ON_START: z.string().transform(val => val === 'true').default('false'),

  // Cache configuration
  ENABLE_CACHING: z.string().transform(val => val === 'true').default('true'),
  CACHE_TIMEOUT: z.string().transform(val => parseInt(val, 10)).default('300000'),

  // Real-time updates
  ENABLE_REALTIME_UPDATES: z.string().transform(val => val === 'true').default('true'),

  // Admin configuration
  ADMIN_EMAIL: z.string().email().optional(),

  // AI configuration (optional)
  GOOGLE_GENAI_API_KEY: z.string().min(1).optional(),

  // Firebase configuration (optional)
  FIREBASE_PROJECT_ID: z.string().min(1).optional(),
  FIREBASE_API_KEY: z.string().min(1).optional(),
});

// Parse and validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Environment validation failed:\n${missingVars.join('\n')}`);
    }
    throw error;
  }
}

// Export validated environment
export const env = validateEnv();

// Helper functions
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

// Supabase configuration helpers
export const isSupabaseConfigured = () => {
  return !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
};

// AI configuration helpers
export const isAIConfigured = () => {
  return !!env.GOOGLE_GENAI_API_KEY;
};

// Firebase configuration helpers
export const isFirebaseConfigured = () => {
  return !!(env.FIREBASE_PROJECT_ID && env.FIREBASE_API_KEY);
};