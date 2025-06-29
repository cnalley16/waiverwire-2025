// API Request/Response Types
// Comprehensive API interfaces for the Waiver Wire fantasy football application

import {
  NFLPlayer,
  PlayerProjection,
  PlayerRiskAnalysis,
  PlayerGameStats,
  PlayerWithProjections,
  OptimizedPlayer,
  Position,
  NFLTeam,
  InjuryStatus,
  RiskLevel,
  ProjectionTier,
  PlayerFilter,
  RiskFilter,
  APIResponse,
  PaginatedResponse
} from './database';

import {
  ProjectionModel,
  EnsembleProjection,
  RiskAssessment,
  LineupOptimization,
  MarketData,
  BacktestResult,
  ProjectionComparison,
  TierBreak,
  StackRecommendation
} from './projections';

// ============================================================================
// AUTHENTICATION & USER TYPES
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse extends APIResponse<{
  user: User;
  session: Session;
}> {}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  subscription_tier: 'FREE' | 'PREMIUM' | 'PRO';
  subscription_expires?: string;
  created_at: string;
  last_login?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  user_id: string;
}

// ============================================================================
// PLAYER API ENDPOINTS
// ============================================================================

export interface GetPlayersRequest {
  position?: Position;
  team?: NFLTeam;
  search?: string;
  active?: boolean;
  sortBy?: 'display_name' | 'first_name' | 'last_name' | 'position' | 'team' | 'age' | 'years_pro';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface GetPlayersResponse extends PaginatedResponse<NFLPlayer> {}

export interface GetPlayerRequest {
  playerId: string;
  includeProjections?: boolean;
  includeStats?: boolean;
  includeRisk?: boolean;
  season?: number;
  week?: number;
}

export interface GetPlayerResponse extends ApiResponse<{
  player: NFLPlayer;
  projections?: PlayerProjection[];
  stats?: PlayerGameStats[];
  riskAnalysis?: PlayerRiskAnalysis;
}> {}

export interface UpdatePlayerRequest {
  playerId: string;
  updates: Partial<Omit<NFLPlayer, 'id' | 'created_at' | 'updated_at'>>;
}

export interface UpdatePlayerResponse extends APIResponse<NFLPlayer> {}

// ============================================================================
// PROJECTION API ENDPOINTS
// ============================================================================

export interface GetProjectionsRequest {
  playerId?: string;
  position?: Position;
  team?: NFLTeam;
  week?: number;
  season?: number;
  modelType?: string;
  minConfidence?: number;
  page?: number;
  limit?: number;
}

export interface GetProjectionsResponse extends PaginatedResponse<PlayerProjection> {}

export interface CreateProjectionRequest {
  projection: Omit<PlayerProjection, 'id' | 'created_at' | 'updated_at'>;
}

export interface CreateProjectionResponse extends APIResponse<PlayerProjection> {}

export interface BulkProjectionsRequest {
  projections: Omit<PlayerProjection, 'id' | 'created_at' | 'updated_at'>[];
  overwrite?: boolean;
}

export interface BulkProjectionsResponse extends APIResponse<{
  created: number;
  updated: number;
  errors: string[];
}> {}

// ============================================================================
// RISK ANALYSIS API ENDPOINTS
// ============================================================================

export interface GetRiskAnalysisRequest {
  playerId?: string;
  position?: Position;
  team?: NFLTeam;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  sortBy?: 'overall_risk' | 'injury_risk' | 'performance_risk';
  page?: number;
  limit?: number;
}

export interface GetRiskAnalysisResponse extends PaginatedResponse<PlayerRiskAnalysis> {}

export interface UpdateRiskAnalysisRequest {
  playerId: string;
  updates: Partial<Omit<PlayerRiskAnalysis, 'id' | 'player_id' | 'created_at' | 'updated_at'>>;
}

export interface UpdateRiskAnalysisResponse extends APIResponse<PlayerRiskAnalysis> {}

// ============================================================================
// LINEUP OPTIMIZATION API ENDPOINTS
// ============================================================================

export interface OptimizeLineupRequest {
  constraints: {
    salary_cap?: number;
    positions: Record<Position, number>;
    players?: {
      include?: string[];
      exclude?: string[];
    };
  };
  objective: 'maximize_points' | 'minimize_risk' | 'balanced';
  settings?: {
    correlation_penalty?: number;
    ownership_penalty?: number;
    stack_bonus?: number;
  };
}

export interface OptimizeLineupResponse extends APIResponse<{
  lineup: Array<{
    player: NFLPlayer;
    projection: PlayerProjection;
    salary?: number;
    ownership?: number;
  }>;
  stats: {
    total_projection: number;
    total_salary?: number;
    risk_score: number;
    diversity_score: number;
  };
  alternatives: Array<{
    player: NFLPlayer;
    reason: string;
  }>;
}> {}

export interface GetOptimalPlayersRequest {
  week: number;
  season?: number;
  position?: Position;
  budget_range?: [number, number];
  ownership_range?: [number, number];
  num_players?: number;
}

export interface GetOptimalPlayersResponse extends APIResponse<OptimizedPlayer[]> {}

export interface GetStackRecommendationsRequest {
  primary_player_id: string;
  week: number;
  season?: number;
  stack_types?: Array<'QB_WR' | 'QB_TE' | 'RB_DST_CONTRARIAN' | 'GAME_STACK'>;
  budget?: number;
}

export interface GetStackRecommendationsResponse extends APIResponse<StackRecommendation[]> {}

// ============================================================================
// MARKET DATA API ENDPOINTS
// ============================================================================

export interface GetMarketDataRequest {
  player_ids?: string[];
  week: number;
  season?: number;
  include_dfs_pricing?: boolean;
  include_betting_lines?: boolean;
  include_ownership?: boolean;
}

export interface GetMarketDataResponse extends APIResponse<MarketData[]> {}

export interface GetOwnershipProjectionsRequest {
  week: number;
  season?: number;
  contest_type?: 'cash' | 'tournament' | 'all';
  positions?: Position[];
  salary_range?: [number, number];
}

export interface GetOwnershipProjectionsResponse extends APIResponse<Array<{
  player_id: string;
  projected_ownership: number;
  leverage_score: number;
  contrarian_value: number;
}>> {}

// ============================================================================
// ANALYTICS & INSIGHTS API ENDPOINTS
// ============================================================================

export interface GetWeeklyInsightsRequest {
  week: number;
  season?: number;
  positions?: Position[];
  insight_types?: Array<'SLEEPERS' | 'BUSTS' | 'VALUE_PLAYS' | 'TIER_BREAKS' | 'STACKS'>;
}

export interface GetWeeklyInsightsResponse extends APIResponse<{
  sleepers: Array<{
    player_id: string;
    reason: string;
    upside_potential: number;
    confidence: number;
  }>;
  bust_candidates: Array<{
    player_id: string;
    risk_factors: string[];
    bust_probability: number;
  }>;
  value_plays: Array<{
    player_id: string;
    value_score: number;
    points_per_dollar: number;
  }>;
  tier_breaks: TierBreak[];
  stack_recommendations: StackRecommendation[];
}> {}

export interface GetTrendingPlayersRequest {
  time_period?: '24h' | '7d' | '30d';
  trend_type?: 'RISING' | 'FALLING' | 'VOLATILE';
  positions?: Position[];
  limit?: number;
}

export interface GetTrendingPlayersResponse extends APIResponse<Array<{
  player_id: string;
  trend_direction: 'UP' | 'DOWN';
  trend_magnitude: number;
  trend_factors: string[];
  momentum_score: number;
}>> {}

// ============================================================================
// HISTORICAL DATA API ENDPOINTS
// ============================================================================

export interface GetHistoricalStatsRequest {
  player_id: string;
  seasons?: number[];
  weeks?: number[];
  include_playoffs?: boolean;
  stat_categories?: Array<'passing' | 'rushing' | 'receiving' | 'defense' | 'kicking'>;
}

export interface GetHistoricalStatsResponse extends APIResponse<PlayerGameStats[]> {}

export interface GetSeasonAveragesRequest {
  player_ids?: string[];
  seasons: number[];
  positions?: Position[];
  min_games_played?: number;
}

export interface GetSeasonAveragesResponse extends APIResponse<Array<{
  player_id: string;
  season: number;
  games_played: number;
  fantasy_points_per_game: number;
  consistency_score: number;
  position_rank: number;
  tier: ProjectionTier;
}>> {}

// ============================================================================
// MODEL PERFORMANCE & BACKTESTING
// ============================================================================

export interface GetModelPerformanceRequest {
  model_ids?: string[];
  test_periods?: Array<{
    start_week: number;
    end_week: number;
    season: number;
  }>;
  positions?: Position[];
  metrics?: Array<'accuracy' | 'rank_correlation' | 'roi' | 'sharpe_ratio'>;
}

export interface GetModelPerformanceResponse extends APIResponse<BacktestResult[]> {}

export interface RunBacktestRequest {
  model_id: string;
  test_period: {
    start_week: number;
    end_week: number;
    season: number;
  };
  positions?: Position[];
  sample_size?: number;
}

export interface RunBacktestResponse extends APIResponse<BacktestResult> {}

// ============================================================================
// WEBHOOK & NOTIFICATION TYPES
// ============================================================================

export interface WebhookPayload {
  event_type: 'PROJECTION_UPDATE' | 'INJURY_UPDATE' | 'LINEUP_ALERT' | 'MARKET_MOVE';
  timestamp: string;
  data: Record<string, any>;
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  notification_types: Array<
    'INJURY_ALERTS' | 
    'PROJECTION_CHANGES' | 
    'VALUE_OPPORTUNITIES' | 
    'LINEUP_REMINDERS'
  >;
  position_alerts?: Position[];
  player_alerts?: string[]; // Player IDs
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportDataRequest {
  format: 'CSV' | 'JSON' | 'XLSX';
  data_type: 'PROJECTIONS' | 'PLAYER_DATA' | 'HISTORICAL_STATS' | 'LINEUP_RESULTS';
  filters?: Record<string, any>;
  week?: number;
  season?: number;
}

export interface ExportDataResponse extends APIResponse<{
  download_url: string;
  expires_at: string;
  file_size: number;
  record_count: number;
}> {}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ValidationError extends APIError {
  field_errors: Record<string, string[]>;
}

export interface RateLimitError extends APIError {
  retry_after: number;
  limit: number;
  remaining: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SortOption<T> = {
  field: keyof T;
  direction: 'asc' | 'desc';
};

export type FilterOption<T> = {
  field: keyof T;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like';
  value: any;
};

export type PaginationOptions = {
  page: number;
  limit: number;
  offset?: number;
};

// ============================================================================
// NEW TYPES
// ============================================================================

// Base API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// Stats API Types
export interface GetStatsRequest {
  playerId?: string;
  position?: Position;
  team?: NFLTeam;
  week?: number;
  season?: number;
  gameType?: 'REGULAR' | 'PLAYOFF' | 'PRESEASON';
  page?: number;
  limit?: number;
}

export interface GetStatsResponse extends PaginatedResponse<PlayerGameStats> {}

export interface CreateStatsRequest {
  stats: Omit<PlayerGameStats, 'id' | 'created_at' | 'updated_at'>;
}

export interface CreateStatsResponse extends ApiResponse<PlayerGameStats> {}

// League and Team API Types
export interface GetTeamsRequest {
  conference?: 'AFC' | 'NFC';
  division?: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
}

export interface GetTeamsResponse extends ApiResponse<{
  team: NFLTeam;
  players: NFLPlayer[];
  stats: {
    totalPlayers: number;
    byPosition: Record<Position, number>;
  };
}[]> {}

// Search and Discovery API Types
export interface SearchRequest {
  query: string;
  type?: 'players' | 'teams' | 'all';
  filters?: {
    position?: Position;
    team?: NFLTeam;
    active?: boolean;
  };
  limit?: number;
}

export interface SearchResponse extends ApiResponse<{
  players: NFLPlayer[];
  teams: Array<{
    team: NFLTeam;
    matchingPlayers: NFLPlayer[];
  }>;
}> {}

// Analytics API Types
export interface GetAnalyticsRequest {
  type: 'trends' | 'comparisons' | 'insights' | 'rankings';
  playerIds?: string[];
  position?: Position;
  timeframe?: 'week' | 'month' | 'season';
  metrics?: string[];
}

export interface GetAnalyticsResponse extends ApiResponse<{
  type: string;
  timeframe: string;
  data: Record<string, unknown>;
  insights: string[];
  recommendations: string[];
}> {}

// User and Authentication Types
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: 'USER' | 'ADMIN' | 'PREMIUM';
  created_at: string;
  last_login?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface RegisterResponse extends ApiResponse<{
  user: AuthUser;
  verification_required: boolean;
}> {}

// Webhook Types
export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
  signature: string;
}

export interface WebhookResponse {
  received: boolean;
  processed: boolean;
  message?: string;
} 