// Central export file for all database functions
// Waiver Wire Fantasy Football Application

// Export all player-related functions
export {
  getAllPlayers,
  getPlayerById,
  getPlayersByPosition,
  getPlayersByTeam,
  getPlayersByAvailability,
  getPlayersWithFilters,
  createPlayer,
  updatePlayer,
  deletePlayer,
  searchPlayersByName,
  getPlayersByInjuryStatus,
  getHighRiskPlayers,
  getTopPerformersByPosition,
} from './players'

// Export all projection-related functions
export {
  getAllProjections,
  getProjectionsByPlayerId,
  getLatestProjection,
  getProjectionsByWeek,
  getProjectionsWithFilters,
  createProjection,
  updateProjection,
  deleteProjection,
  getRiskAnalysisByPlayerId,
  getAllRiskAnalyses,
  getHighRiskAnalyses,
  createRiskAnalysis,
  updateRiskAnalysis,
  getPlayerWithAnalytics,
  getTopProjectionsByPosition,
} from './projections'

// Export Supabase clients
export { supabase } from '../supabase'
export { supabaseAPI, createServerSupabaseClient, createAPISupabaseClient } from '../supabase-server' 