// Supabase Database Schema Types for Waiver Wire Fantasy Football
// Enhanced schema with comprehensive projections and risk analysis

// ============================================================================
// CORE ENUMS
// ============================================================================

export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'DL' | 'LB' | 'DB';

export type NFLTeam = 
  | 'ARI' | 'ATL' | 'BAL' | 'BUF' | 'CAR' | 'CHI' | 'CIN' | 'CLE' | 'DAL' | 'DEN'
  | 'DET' | 'GB' | 'HOU' | 'IND' | 'JAX' | 'KC' | 'LV' | 'LAC' | 'LAR' | 'MIA'
  | 'MIN' | 'NE' | 'NO' | 'NYG' | 'NYJ' | 'PHI' | 'PIT' | 'SF' | 'SEA' | 'TB'
  | 'TEN' | 'WAS';

export type InjuryStatus = 
  | 'HEALTHY' 
  | 'QUESTIONABLE' 
  | 'DOUBTFUL' 
  | 'OUT' 
  | 'IR' 
  | 'PUP' 
  | 'DNR' // Did Not Return
  | 'SUSPENDED';

export type ProjectionTier = 'ELITE' | 'HIGH' | 'MEDIUM' | 'LOW' | 'VOLATILE';

export type RiskLevel = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export type WeatherCondition = 'CLEAR' | 'RAIN' | 'SNOW' | 'WIND' | 'DOME';

// ============================================================================
// CORE NFL PLAYERS TABLE
// ============================================================================

export interface NFLPlayer {
  id: string; // UUID
  player_external_id: string | null; // External API ID (ESPN, Yahoo, etc.)
  first_name: string;
  last_name: string;
  display_name: string; // "J. Smith" format
  position: Position;
  nfl_team: NFLTeam;
  jersey_number: number | null;
  height_inches: number | null; // Height in inches
  weight_pounds: number | null; // Weight in pounds
  age: number | null;
  years_pro: number | null;
  college: string | null;
  bye_week: number | null; // 1-18
  is_active: boolean;
  is_rookie: boolean;
  injury_status: InjuryStatus;
  injury_details: string | null;
  depth_chart_position: number | null; // 1 = starter, 2 = backup, etc.
  target_share: number | null; // Percentage of team targets (WR/TE)
  snap_count_percentage: number | null; // Percentage of offensive snaps
  red_zone_usage: number | null; // Red zone touches/targets per game
  image_url: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// ============================================================================
// COMPREHENSIVE PROJECTIONS TABLE
// ============================================================================

export interface PlayerProjection {
  id: string; // UUID
  player_id: string; // FK to nfl_players
  week: number; // 1-18
  season: number; // 2025
  projection_type: 'WEEKLY' | 'SEASON' | 'PLAYOFF';
  
  // Core Fantasy Projections
  projected_fantasy_points: number;
  projected_fantasy_points_ppr: number; // PPR scoring
  projected_fantasy_points_half_ppr: number; // 0.5 PPR
  projected_fantasy_points_standard: number; // Standard scoring
  
  // Confidence & Risk Metrics
  confidence_score: number; // 0-100
  projection_tier: ProjectionTier;
  risk_level: RiskLevel;
  volatility_score: number; // 0-100 (higher = more volatile)
  floor_points: number; // 25th percentile projection
  ceiling_points: number; // 75th percentile projection
  boom_probability: number; // Probability of 20+ point game
  bust_probability: number; // Probability of <5 point game
  
  // Offensive Projections
  projected_passing_yards: number | null;
  projected_passing_tds: number | null;
  projected_passing_ints: number | null;
  projected_passing_attempts: number | null;
  projected_completions: number | null;
  
  projected_rushing_yards: number | null;
  projected_rushing_tds: number | null;
  projected_rushing_attempts: number | null;
  projected_red_zone_carries: number | null;
  
  projected_receptions: number | null;
  projected_receiving_yards: number | null;
  projected_receiving_tds: number | null;
  projected_targets: number | null;
  projected_air_yards: number | null; // Total air yards on targets
  projected_yac: number | null; // Yards after catch
  projected_red_zone_targets: number | null;
  
  projected_fumbles_lost: number | null;
  
  // Kicking Projections
  projected_field_goals_made: number | null;
  projected_field_goals_attempted: number | null;
  projected_extra_points_made: number | null;
  projected_extra_points_attempted: number | null;
  projected_fg_distance_avg: number | null; // Average FG distance
  
  // Defense/Special Teams Projections
  projected_sacks: number | null;
  projected_interceptions: number | null;
  projected_fumble_recoveries: number | null;
  projected_safeties: number | null;
  projected_defensive_tds: number | null;
  projected_points_allowed: number | null;
  projected_yards_allowed: number | null;
  projected_return_tds: number | null;
  
  // Game Context Factors
  opponent_team: NFLTeam | null;
  is_home_game: boolean | null;
  vegas_total_points: number | null; // Over/under for game
  vegas_spread: number | null; // Positive if favored
  implied_team_total: number | null; // Team's implied points
  
  // Environmental Factors
  weather_condition: WeatherCondition | null;
  temperature: number | null; // Fahrenheit
  wind_speed: number | null; // MPH
  precipitation_chance: number | null; // 0-100%
  
  // Usage Projections
  projected_snap_percentage: number | null;
  projected_touch_share: number | null; // RB touches / total team touches
  projected_target_share: number | null; // WR/TE targets / total team targets
  projected_red_zone_share: number | null; // Red zone opportunities
  
  // Injury Impact
  injury_risk_factor: number | null; // 0-1 (impact on performance)
  is_playing_injured: boolean;
  missed_practice_days: number | null;
  
  // Model Metadata
  model_version: string | null; // "v2.1.3"
  last_updated: string; // ISO timestamp
  data_sources: string[] | null; // ["ESPN", "Yahoo", "FantasyPros"]
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// RISK ANALYSIS TABLE
// ============================================================================

export interface PlayerRiskAnalysis {
  id: string; // UUID
  player_id: string; // FK to nfl_players
  week: number;
  season: number;
  
  // Overall Risk Metrics
  overall_risk_score: number; // 0-100 (higher = riskier)
  risk_level: RiskLevel;
  risk_adjusted_points: number; // Fantasy points adjusted for risk
  
  // Risk Categories
  injury_risk_score: number; // 0-100
  usage_risk_score: number; // 0-100 (snap count, target volatility)
  matchup_risk_score: number; // 0-100 (opponent strength)
  weather_risk_score: number; // 0-100
  game_script_risk_score: number; // 0-100 (blowout potential)
  
  // Historical Performance Factors
  consistency_score: number; // 0-100 (lower variance = higher score)
  recent_form_trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  home_away_split: number | null; // Difference in home vs away performance
  vs_position_rank: number | null; // Opponent's rank vs this position
  
  // Advanced Risk Metrics
  correlation_factors: {
    teammate_correlations: Array<{
      player_id: string;
      correlation_coefficient: number; // -1 to 1
    }>;
    opponent_correlations: Array<{
      player_id: string;
      correlation_coefficient: number;
    }>;
  } | null;
  
  // Portfolio Optimization
  optimal_roster_percentage: number | null; // 0-100 (in optimal lineups)
  stack_correlation: number | null; // How often to stack with teammates
  contrarian_value: number | null; // Value when going against chalk
  
  // Salary/Value Metrics (for DFS)
  salary_cap_percentage: number | null; // Percentage of total cap
  points_per_dollar: number | null;
  value_rating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'TERRIBLE';
  
  // Ceiling/Floor Analysis
  ceiling_probability: number; // Probability of hitting ceiling
  floor_probability: number; // Probability of hitting floor
  median_outcome: number; // 50th percentile outcome
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// GAME STATS (ACTUAL PERFORMANCE)
// ============================================================================

export interface PlayerGameStats {
  id: string; // UUID
  player_id: string; // FK to nfl_players
  game_id: string | null; // FK to nfl_games if available
  week: number;
  season: number;
  opponent: NFLTeam;
  is_home_game: boolean;
  
  // Game Result Context
  team_score: number | null;
  opponent_score: number | null;
  game_total_points: number | null;
  
  // Playing Time
  snaps_played: number | null;
  snap_percentage: number | null;
  time_of_possession: number | null; // Seconds
  
  // Passing Stats
  passing_attempts: number;
  passing_completions: number;
  passing_yards: number;
  passing_tds: number;
  passing_ints: number;
  passing_rating: number | null;
  qb_hits: number | null;
  times_sacked: number | null;
  sack_yards_lost: number | null;
  
  // Rushing Stats
  rushing_attempts: number;
  rushing_yards: number;
  rushing_tds: number;
  rushing_long: number | null; // Longest rush
  red_zone_carries: number | null;
  
  // Receiving Stats
  targets: number;
  receptions: number;
  receiving_yards: number;
  receiving_tds: number;
  receiving_long: number | null; // Longest reception
  air_yards: number | null;
  yards_after_catch: number | null;
  red_zone_targets: number | null;
  end_zone_targets: number | null;
  
  // Other Offensive Stats
  fumbles: number;
  fumbles_lost: number;
  two_point_conversions: number | null;
  
  // Kicking Stats
  field_goals_made: number;
  field_goals_attempted: number;
  field_goal_percentage: number | null;
  longest_field_goal: number | null;
  extra_points_made: number;
  extra_points_attempted: number;
  
  // Defense/Special Teams Stats
  tackles_solo: number | null;
  tackles_assisted: number | null;
  tackles_total: number | null;
  sacks: number | null;
  tackles_for_loss: number | null;
  qb_hits_def: number | null;
  interceptions: number | null;
  passes_defended: number | null;
  fumbles_forced: number | null;
  fumble_recoveries: number | null;
  safeties: number | null;
  defensive_tds: number | null;
  return_tds: number | null;
  blocked_kicks: number | null;
  
  // Team Defense (when player represents entire defense)
  points_allowed: number | null;
  yards_allowed: number | null;
  rushing_yards_allowed: number | null;
  passing_yards_allowed: number | null;
  turnovers_forced: number | null;
  
  // Fantasy Points (Multiple Scoring Systems)
  fantasy_points_standard: number;
  fantasy_points_ppr: number;
  fantasy_points_half_ppr: number;
  fantasy_points_custom: number | null;
  
  // Performance vs Projection
  projected_points_pre_game: number | null;
  points_over_projection: number | null;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// For database operations
export type DatabaseRecord = {
  id: string;
  created_at: string;
  updated_at: string;
};

// For API responses
export type APIResponse<T> = {
  data: T;
  error: string | null;
  status: number;
  message?: string;
};

// Pagination
export type PaginatedResponse<T> = APIResponse<T[]> & {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

// Search/Filter types
export type PlayerFilter = {
  position?: Position[];
  team?: NFLTeam[];
  injury_status?: InjuryStatus[];
  min_projected_points?: number;
  max_projected_points?: number;
  week?: number;
  season?: number;
};

export type RiskFilter = {
  risk_level?: RiskLevel[];
  min_risk_score?: number;
  max_risk_score?: number;
  min_ceiling?: number;
  min_floor?: number;
};

// ============================================================================
// AGGREGATE VIEWS
// ============================================================================

// Combined player data for UI
export interface PlayerWithProjections extends NFLPlayer {
  current_projection?: PlayerProjection;
  risk_analysis?: PlayerRiskAnalysis;
  recent_stats?: PlayerGameStats[];
  season_averages?: {
    fantasy_points_per_game: number;
    consistency_rating: number;
    games_played: number;
  };
}

// For roster optimization
export interface OptimizedPlayer extends PlayerWithProjections {
  optimal_lineup_percentage: number;
  ownership_percentage: number | null; // For DFS
  leverage_score: number | null;
  stack_recommendations: string[]; // Player IDs to stack with
} 