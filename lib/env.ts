// Environment variable validation and defaults
export const env = {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3001',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://fallback:fallback@localhost:5432/fallback',
  NODE_ENV: process.env.NODE_ENV || 'development'
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