import { supabaseAPI as supabase } from '@/src/lib/supabase-server'
import type { NFLPlayer } from '@/src/types'

// Get all players
export async function getAllPlayers(): Promise<NFLPlayer[]> {
  const { data, error } = await supabase
    .from('nfl_players')
    .select('*')
  
  if (error) throw error
  return data || []
}

// Get player by ID
export async function getPlayerById(id: string): Promise<NFLPlayer | null> {
  const { data, error } = await supabase
    .from('nfl_players')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null // No rows returned
    throw error
  }
  return data
}

// Get players by position
export async function getPlayersByPosition(position: string): Promise<NFLPlayer[]> {
  const { data, error } = await supabase
    .from('nfl_players')
    .select('*')
    .eq('position', position)
    .order('first_name')
  
  if (error) throw error
  return data || []
}

// Get players by team
export async function getPlayersByTeam(team: string): Promise<NFLPlayer[]> {
  const { data, error } = await supabase
    .from('nfl_players')
    .select('*')
    .eq('nfl_team', team)
    .order('first_name')
  
  if (error) throw error
  return data || []
}

// Get players by availability status
export async function getPlayersByAvailability(isActive: boolean = true): Promise<NFLPlayer[]> {
  const { data, error } = await supabase
    .from('nfl_players')
    .select('*')
    .eq('is_active', isActive)
    .order('first_name')
  
  if (error) throw error
  return data || []
}

// Get players with filters
export async function getPlayersWithFilters(filters: {
  position?: string
  team?: string
  isActive?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}): Promise<{ players: NFLPlayer[], total: number }> {
  let query = supabase
    .from('nfl_players')
    .select('*', { count: 'exact' })

  if (filters.position) {
    query = query.eq('position', filters.position)
  }
  
  if (filters.team) {
    query = query.eq('nfl_team', filters.team)
  }
  
  if (filters.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive)
  }

  // Handle dynamic sorting with validation
  const validSortColumns = ['first_name', 'last_name', 'display_name', 'position', 'nfl_team', 'age', 'years_pro']
  const sortBy = filters.sortBy && validSortColumns.includes(filters.sortBy) ? filters.sortBy : 'display_name'
  const sortOrder = filters.sortOrder || 'asc'
  
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  if (filters.limit) {
    query = query.limit(filters.limit)
  }

  if (filters.offset) {
    query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
  }

  const { data, error, count } = await query
  
  if (error) throw error
  return { 
    players: data || [], 
    total: count || 0 
  }
}

// Create new player
export async function createPlayer(player: Omit<NFLPlayer, 'id' | 'created_at' | 'updated_at'>): Promise<NFLPlayer> {
  const { data, error } = await supabase
    .from('nfl_players')
    .insert(player)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Update player
export async function updatePlayer(id: string, updates: Partial<Omit<NFLPlayer, 'id' | 'created_at'>>): Promise<NFLPlayer> {
  const { data, error } = await supabase
    .from('nfl_players')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Delete player
export async function deletePlayer(id: string): Promise<void> {
  const { error } = await supabase
    .from('nfl_players')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Search players by name
export async function searchPlayersByName(searchTerm: string): Promise<NFLPlayer[]> {
  const { data, error } = await supabase
    .from('nfl_players')
    .select('*')
    .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
    .order('first_name')
  
  if (error) throw error
  return data || []
}

// Get players by injury status
export async function getPlayersByInjuryStatus(status: string = 'HEALTHY'): Promise<NFLPlayer[]> {
  const { data, error } = await supabase
    .from('nfl_players')
    .select('*')
    .eq('injury_status', status)
    .order('first_name')
  
  if (error) throw error
  return data || []
}

// Get players with high risk (for draft analysis) - remove this for now since we don't have risk_score column
export async function getHighRiskPlayers(): Promise<NFLPlayer[]> {
  const { data, error } = await supabase
    .from('nfl_players')
    .select('*')
    .in('injury_status', ['QUESTIONABLE', 'DOUBTFUL', 'OUT', 'IR'])
    .order('first_name')
  
  if (error) throw error
  return data || []
}

// Get top performers by position - remove projected_points for now since we don't have that column
export async function getTopPerformersByPosition(position: string, limit: number = 10): Promise<NFLPlayer[]> {
  const { data, error } = await supabase
    .from('nfl_players')
    .select('*')
    .eq('position', position)
    .eq('is_active', true)
    .order('first_name')
    .limit(limit)
  
  if (error) throw error
  return data || []
} 