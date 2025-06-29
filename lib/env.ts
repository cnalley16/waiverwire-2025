// Environment variable validation and defaults
export const env = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://fallback:fallback@localhost:5432/fallback',
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development'
}

// Always validate Supabase variables since they're required for the app to function
if (!env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is required')
  if (env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  }
}

if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  if (env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }
}

// Validate required environment variables in production
if (env.NODE_ENV === 'production') {
  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error('NEXTAUTH_SECRET is required in production')
  }
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required in production')
  }
} 