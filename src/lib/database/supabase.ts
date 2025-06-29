import { createClient } from '@supabase/supabase-js'
import { env } from '../../../lib/env'

// Supabase client for client-side operations
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Helper functions for common database operations
export const supabaseHelpers = {
  // Auth helpers
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
  },
  
  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password })
  },
  
  signOut: async () => {
    return await supabase.auth.signOut()
  },
  
  getCurrentUser: async () => {
    return await supabase.auth.getUser()
  },

  // Database helpers for fantasy football
  getPlayers: async () => {
    return await supabase.from('players').select('*')
  },
  
  getLeagues: async (userId: string) => {
    return await supabase.from('leagues').select('*').eq('user_id', userId)
  },
  
  getProjections: async (playerId: string, week?: number) => {
    let query = supabase.from('projections').select('*').eq('player_id', playerId)
    if (week) {
      query = query.eq('week', week)
    }
    return await query
  }
} 