import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// For API routes - doesn't use cookies
export function createAPISupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseKey)
}

// For server components - uses cookies (call this inside request context)
export function createServerSupabaseClient() {
  return createServerComponentClient({ cookies })
}

// Lazy initialization to avoid "cookies called outside request scope" error
let _supabaseAPI: ReturnType<typeof createAPISupabaseClient> | null = null
export const supabaseAPI = new Proxy({} as ReturnType<typeof createAPISupabaseClient>, {
  get(target, prop) {
    if (!_supabaseAPI) {
      _supabaseAPI = createAPISupabaseClient()
    }
    return (_supabaseAPI as any)[prop]
  }
}) 