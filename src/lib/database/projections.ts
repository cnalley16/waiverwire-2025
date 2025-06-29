import { supabaseAPI as supabase } from '@/src/lib/supabase-server'
import type { PlayerProjection, PlayerRiskAnalysis } from '@/src/types'

// ============================================================================
// PLAYER PROJECTIONS
// ============================================================================

// Get all projections
export async function getAllProjections(): Promise<PlayerProjection[]> {
  const { data, error } = await supabase
    .from('player_projections')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Get projections by player ID
export async function getProjectionsByPlayerId(playerId: string): Promise<PlayerProjection[]> {
  const { data, error } = await supabase
    .from('player_projections')
    .select('*')
    .eq('player_id', playerId)
    .order('week', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Get latest projection for a player
export async function getLatestProjection(playerId: string): Promise<PlayerProjection | null> {
  const { data, error } = await supabase
    .from('player_projections')
    .select('*')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

// Get projections by week
export async function getProjectionsByWeek(week: number, season: number = 2024): Promise<PlayerProjection[]> {
  const { data, error } = await supabase
    .from('player_projections')
    .select('*')
    .eq('week', week)
    .eq('season', season)
    .order('expected_points', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Get projections with filters
export async function getProjectionsWithFilters(filters: {
  playerId?: string
  week?: number
  season?: number
  minPoints?: number
  maxPoints?: number
  position?: string
  limit?: number
}): Promise<PlayerProjection[]> {
  let query = supabase
    .from('player_projections')
    .select(`
      *,
      nfl_players (
        name,
        position,
        team
      )
    `)

  if (filters.playerId) {
    query = query.eq('player_id', filters.playerId)
  }
  
  if (filters.week) {
    query = query.eq('week', filters.week)
  }
  
  if (filters.season) {
    query = query.eq('season', filters.season)
  }
  
  if (filters.minPoints) {
    query = query.gte('expected_points', filters.minPoints)
  }
  
  if (filters.maxPoints) {
    query = query.lte('expected_points', filters.maxPoints)
  }

  query = query.order('expected_points', { ascending: false })

  if (filters.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query
  
  if (error) throw error
  return data || []
}

// Create new projection
export async function createProjection(projection: Omit<PlayerProjection, 'id' | 'created_at' | 'updated_at'>): Promise<PlayerProjection> {
  const { data, error } = await supabase
    .from('player_projections')
    .insert(projection)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Update projection
export async function updateProjection(id: string, updates: Partial<Omit<PlayerProjection, 'id' | 'created_at'>>): Promise<PlayerProjection> {
  const { data, error } = await supabase
    .from('player_projections')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Delete projection
export async function deleteProjection(id: string): Promise<void> {
  const { error } = await supabase
    .from('player_projections')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ============================================================================
// RISK ANALYSIS
// ============================================================================

// Get risk analysis by player ID
export async function getRiskAnalysisByPlayerId(playerId: string): Promise<PlayerRiskAnalysis | null> {
  const { data, error } = await supabase
    .from('player_risk_analysis')
    .select('*')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

// Get all risk analyses
export async function getAllRiskAnalyses(): Promise<PlayerRiskAnalysis[]> {
  const { data, error } = await supabase
    .from('player_risk_analysis')
    .select('*')
    .order('overall_risk_score', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Get high-risk players
export async function getHighRiskAnalyses(riskThreshold: number = 0.7): Promise<PlayerRiskAnalysis[]> {
  const { data, error } = await supabase
    .from('player_risk_analysis')
    .select(`
      *,
      nfl_players (
        name,
        position,
        team
      )
    `)
    .gte('overall_risk_score', riskThreshold)
    .order('overall_risk_score', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Create risk analysis
export async function createRiskAnalysis(riskAnalysis: Omit<PlayerRiskAnalysis, 'id' | 'created_at' | 'updated_at'>): Promise<PlayerRiskAnalysis> {
  const { data, error } = await supabase
    .from('player_risk_analysis')
    .insert(riskAnalysis)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Update risk analysis
export async function updateRiskAnalysis(id: string, updates: Partial<Omit<PlayerRiskAnalysis, 'id' | 'created_at'>>): Promise<PlayerRiskAnalysis> {
  const { data, error } = await supabase
    .from('player_risk_analysis')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============================================================================
// COMBINED QUERIES
// ============================================================================

// Get player with projections and risk analysis
export async function getPlayerWithAnalytics(playerId: string) {
  const [player, projections, riskAnalysis] = await Promise.all([
    supabase
      .from('nfl_players')
      .select('*')
      .eq('id', playerId)
      .single(),
    getProjectionsByPlayerId(playerId),
    getRiskAnalysisByPlayerId(playerId)
  ])

  if (player.error) throw player.error

  return {
    player: player.data,
    projections,
    riskAnalysis
  }
}

// Get top projections by position
export async function getTopProjectionsByPosition(position: string, week: number, season: number = 2024, limit: number = 10) {
  const { data, error } = await supabase
    .from('player_projections')
    .select(`
      *,
      nfl_players!inner (
        name,
        position,
        team,
        is_active
      )
    `)
    .eq('week', week)
    .eq('season', season)
    .eq('nfl_players.position', position)
    .eq('nfl_players.is_active', true)
    .order('expected_points', { ascending: false })
    .limit(limit)
  
  if (error) throw error
  return data || []
} 