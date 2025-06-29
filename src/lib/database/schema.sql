-- Supabase Database Schema for Waiver Wire Fantasy Football
-- Enhanced schema with comprehensive projections and risk analysis
-- Matches TypeScript types in src/types/database.ts

-- ============================================================================
-- ENABLE EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

-- NFL Position Types
CREATE TYPE position_type AS ENUM (
  'QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'DL', 'LB', 'DB'
);

-- NFL Teams
CREATE TYPE nfl_team_type AS ENUM (
  'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN',
  'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'LAR', 'MIA',
  'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB',
  'TEN', 'WAS'
);

-- Injury Status Types
CREATE TYPE injury_status_type AS ENUM (
  'HEALTHY', 'QUESTIONABLE', 'DOUBTFUL', 'OUT', 'IR', 'PUP', 'DNR', 'SUSPENDED'
);

-- Projection Tiers
CREATE TYPE projection_tier_type AS ENUM (
  'ELITE', 'HIGH', 'MEDIUM', 'LOW', 'VOLATILE'
);

-- Risk Levels
CREATE TYPE risk_level_type AS ENUM (
  'VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'
);

-- Weather Conditions
CREATE TYPE weather_condition_type AS ENUM (
  'CLEAR', 'RAIN', 'SNOW', 'WIND', 'DOME'
);

-- Projection Types
CREATE TYPE projection_type_enum AS ENUM (
  'WEEKLY', 'SEASON', 'PLAYOFF'
);

-- Recent Form Trends
CREATE TYPE form_trend_type AS ENUM (
  'IMPROVING', 'DECLINING', 'STABLE'
);

-- Value Ratings
CREATE TYPE value_rating_type AS ENUM (
  'EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'TERRIBLE'
);

-- ============================================================================
-- CORE NFL PLAYERS TABLE
-- ============================================================================

CREATE TABLE nfl_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_external_id VARCHAR(50) UNIQUE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  display_name VARCHAR(100) NOT NULL, -- "J. Smith" format
  position position_type NOT NULL,
  nfl_team nfl_team_type NOT NULL,
  jersey_number INTEGER,
  height_inches INTEGER,
  weight_pounds INTEGER,
  age INTEGER,
  years_pro INTEGER,
  college VARCHAR(100),
  bye_week INTEGER CHECK (bye_week BETWEEN 1 AND 18),
  is_active BOOLEAN DEFAULT true,
  is_rookie BOOLEAN DEFAULT false,
  injury_status injury_status_type DEFAULT 'HEALTHY',
  injury_details TEXT,
  depth_chart_position INTEGER, -- 1 = starter, 2 = backup, etc.
  target_share DECIMAL(5,3), -- Percentage of team targets (WR/TE)
  snap_count_percentage DECIMAL(5,3), -- Percentage of offensive snaps
  red_zone_usage DECIMAL(5,2), -- Red zone touches/targets per game
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_nfl_players_position ON nfl_players(position);
CREATE INDEX idx_nfl_players_team ON nfl_players(nfl_team);
CREATE INDEX idx_nfl_players_active ON nfl_players(is_active);
CREATE INDEX idx_nfl_players_external_id ON nfl_players(player_external_id);
CREATE INDEX idx_nfl_players_name ON nfl_players(last_name, first_name);

-- ============================================================================
-- COMPREHENSIVE PROJECTIONS TABLE
-- ============================================================================

CREATE TABLE player_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES nfl_players(id) ON DELETE CASCADE,
  week INTEGER NOT NULL CHECK (week BETWEEN 1 AND 18),
  season INTEGER NOT NULL DEFAULT 2025,
  projection_type projection_type_enum DEFAULT 'WEEKLY',
  
  -- Core Fantasy Projections
  projected_fantasy_points DECIMAL(6,2) NOT NULL,
  projected_fantasy_points_ppr DECIMAL(6,2) NOT NULL,
  projected_fantasy_points_half_ppr DECIMAL(6,2) NOT NULL,
  projected_fantasy_points_standard DECIMAL(6,2) NOT NULL,
  
  -- Confidence & Risk Metrics
  confidence_score DECIMAL(5,2) CHECK (confidence_score BETWEEN 0 AND 100),
  projection_tier projection_tier_type,
  risk_level risk_level_type,
  volatility_score DECIMAL(5,2) CHECK (volatility_score BETWEEN 0 AND 100),
  floor_points DECIMAL(6,2), -- 25th percentile
  ceiling_points DECIMAL(6,2), -- 75th percentile
  boom_probability DECIMAL(5,3) CHECK (boom_probability BETWEEN 0 AND 1),
  bust_probability DECIMAL(5,3) CHECK (bust_probability BETWEEN 0 AND 1),
  
  -- Offensive Projections
  projected_passing_yards DECIMAL(6,2),
  projected_passing_tds DECIMAL(4,2),
  projected_passing_ints DECIMAL(4,2),
  projected_passing_attempts DECIMAL(5,2),
  projected_completions DECIMAL(5,2),
  
  projected_rushing_yards DECIMAL(6,2),
  projected_rushing_tds DECIMAL(4,2),
  projected_rushing_attempts DECIMAL(5,2),
  projected_red_zone_carries DECIMAL(4,2),
  
  projected_receptions DECIMAL(5,2),
  projected_receiving_yards DECIMAL(6,2),
  projected_receiving_tds DECIMAL(4,2),
  projected_targets DECIMAL(5,2),
  projected_air_yards DECIMAL(6,2),
  projected_yac DECIMAL(6,2), -- Yards after catch
  projected_red_zone_targets DECIMAL(4,2),
  
  projected_fumbles_lost DECIMAL(3,2),
  
  -- Kicking Projections
  projected_field_goals_made DECIMAL(4,2),
  projected_field_goals_attempted DECIMAL(4,2),
  projected_extra_points_made DECIMAL(4,2),
  projected_extra_points_attempted DECIMAL(4,2),
  projected_fg_distance_avg DECIMAL(4,1),
  
  -- Defense/Special Teams Projections
  projected_sacks DECIMAL(4,2),
  projected_interceptions DECIMAL(3,2),
  projected_fumble_recoveries DECIMAL(3,2),
  projected_safeties DECIMAL(3,2),
  projected_defensive_tds DECIMAL(3,2),
  projected_points_allowed DECIMAL(4,1),
  projected_yards_allowed DECIMAL(6,1),
  projected_return_tds DECIMAL(3,2),
  
  -- Game Context Factors
  opponent_team nfl_team_type,
  is_home_game BOOLEAN,
  vegas_total_points DECIMAL(4,1),
  vegas_spread DECIMAL(4,1), -- Positive if favored
  implied_team_total DECIMAL(4,1),
  
  -- Environmental Factors
  weather_condition weather_condition_type,
  temperature INTEGER, -- Fahrenheit
  wind_speed INTEGER, -- MPH
  precipitation_chance INTEGER CHECK (precipitation_chance BETWEEN 0 AND 100),
  
  -- Usage Projections
  projected_snap_percentage DECIMAL(5,3),
  projected_touch_share DECIMAL(5,3),
  projected_target_share DECIMAL(5,3),
  projected_red_zone_share DECIMAL(5,3),
  
  -- Injury Impact
  injury_risk_factor DECIMAL(3,2) CHECK (injury_risk_factor BETWEEN 0 AND 1),
  is_playing_injured BOOLEAN DEFAULT false,
  missed_practice_days INTEGER DEFAULT 0,
  
  -- Model Metadata
  model_version VARCHAR(20),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  data_sources TEXT[], -- Array of source names
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(player_id, week, season, projection_type)
);

-- Indexes for projections
CREATE INDEX idx_projections_player_week ON player_projections(player_id, week, season);
CREATE INDEX idx_projections_week ON player_projections(week, season);
CREATE INDEX idx_projections_points ON player_projections(projected_fantasy_points DESC);
CREATE INDEX idx_projections_tier ON player_projections(projection_tier);

-- ============================================================================
-- RISK ANALYSIS TABLE
-- ============================================================================

CREATE TABLE player_risk_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES nfl_players(id) ON DELETE CASCADE,
  week INTEGER NOT NULL CHECK (week BETWEEN 1 AND 18),
  season INTEGER NOT NULL DEFAULT 2025,
  
  -- Overall Risk Metrics
  overall_risk_score DECIMAL(5,2) CHECK (overall_risk_score BETWEEN 0 AND 100),
  risk_level risk_level_type,
  risk_adjusted_points DECIMAL(6,2),
  
  -- Risk Categories
  injury_risk_score DECIMAL(5,2) CHECK (injury_risk_score BETWEEN 0 AND 100),
  usage_risk_score DECIMAL(5,2) CHECK (usage_risk_score BETWEEN 0 AND 100),
  matchup_risk_score DECIMAL(5,2) CHECK (matchup_risk_score BETWEEN 0 AND 100),
  weather_risk_score DECIMAL(5,2) CHECK (weather_risk_score BETWEEN 0 AND 100),
  game_script_risk_score DECIMAL(5,2) CHECK (game_script_risk_score BETWEEN 0 AND 100),
  
  -- Historical Performance Factors
  consistency_score DECIMAL(5,2) CHECK (consistency_score BETWEEN 0 AND 100),
  recent_form_trend form_trend_type,
  home_away_split DECIMAL(6,2), -- Difference in home vs away performance
  vs_position_rank INTEGER, -- Opponent's rank vs this position
  
  -- Advanced Risk Metrics (stored as JSONB for flexibility)
  correlation_factors JSONB,
  
  -- Portfolio Optimization
  optimal_roster_percentage DECIMAL(5,2) CHECK (optimal_roster_percentage BETWEEN 0 AND 100),
  stack_correlation DECIMAL(5,3) CHECK (stack_correlation BETWEEN -1 AND 1),
  contrarian_value DECIMAL(6,2),
  
  -- Salary/Value Metrics (for DFS)
  salary_cap_percentage DECIMAL(5,2),
  points_per_dollar DECIMAL(6,4),
  value_rating value_rating_type,
  
  -- Ceiling/Floor Analysis
  ceiling_probability DECIMAL(5,3) CHECK (ceiling_probability BETWEEN 0 AND 1),
  floor_probability DECIMAL(5,3) CHECK (floor_probability BETWEEN 0 AND 1),
  median_outcome DECIMAL(6,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(player_id, week, season)
);

-- Indexes for risk analysis
CREATE INDEX idx_risk_player_week ON player_risk_analysis(player_id, week, season);
CREATE INDEX idx_risk_level ON player_risk_analysis(risk_level);
CREATE INDEX idx_risk_score ON player_risk_analysis(overall_risk_score);

-- ============================================================================
-- GAME STATS (ACTUAL PERFORMANCE)
-- ============================================================================

CREATE TABLE player_game_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES nfl_players(id) ON DELETE CASCADE,
  game_id UUID, -- FK to nfl_games if available
  week INTEGER NOT NULL CHECK (week BETWEEN 1 AND 18),
  season INTEGER NOT NULL DEFAULT 2025,
  opponent nfl_team_type NOT NULL,
  is_home_game BOOLEAN NOT NULL,
  
  -- Game Result Context
  team_score INTEGER,
  opponent_score INTEGER,
  game_total_points INTEGER,
  
  -- Playing Time
  snaps_played INTEGER,
  snap_percentage DECIMAL(5,3),
  time_of_possession INTEGER, -- Seconds
  
  -- Passing Stats
  passing_attempts INTEGER DEFAULT 0,
  passing_completions INTEGER DEFAULT 0,
  passing_yards INTEGER DEFAULT 0,
  passing_tds INTEGER DEFAULT 0,
  passing_ints INTEGER DEFAULT 0,
  passing_rating DECIMAL(5,2),
  qb_hits INTEGER,
  times_sacked INTEGER,
  sack_yards_lost INTEGER,
  
  -- Rushing Stats
  rushing_attempts INTEGER DEFAULT 0,
  rushing_yards INTEGER DEFAULT 0,
  rushing_tds INTEGER DEFAULT 0,
  rushing_long INTEGER,
  red_zone_carries INTEGER,
  
  -- Receiving Stats
  targets INTEGER DEFAULT 0,
  receptions INTEGER DEFAULT 0,
  receiving_yards INTEGER DEFAULT 0,
  receiving_tds INTEGER DEFAULT 0,
  receiving_long INTEGER,
  air_yards INTEGER,
  yards_after_catch INTEGER,
  red_zone_targets INTEGER,
  end_zone_targets INTEGER,
  
  -- Other Offensive Stats
  fumbles INTEGER DEFAULT 0,
  fumbles_lost INTEGER DEFAULT 0,
  two_point_conversions INTEGER,
  
  -- Kicking Stats
  field_goals_made INTEGER DEFAULT 0,
  field_goals_attempted INTEGER DEFAULT 0,
  field_goal_percentage DECIMAL(5,2),
  longest_field_goal INTEGER,
  extra_points_made INTEGER DEFAULT 0,
  extra_points_attempted INTEGER DEFAULT 0,
  
  -- Defense/Special Teams Stats
  tackles_solo INTEGER,
  tackles_assisted INTEGER,
  tackles_total INTEGER,
  sacks DECIMAL(3,1),
  tackles_for_loss INTEGER,
  qb_hits_def INTEGER,
  interceptions INTEGER,
  passes_defended INTEGER,
  fumbles_forced INTEGER,
  fumble_recoveries INTEGER,
  safeties INTEGER,
  defensive_tds INTEGER,
  return_tds INTEGER,
  blocked_kicks INTEGER,
  
  -- Team Defense (when player represents entire defense)
  points_allowed INTEGER,
  yards_allowed INTEGER,
  rushing_yards_allowed INTEGER,
  passing_yards_allowed INTEGER,
  turnovers_forced INTEGER,
  
  -- Fantasy Points (Multiple Scoring Systems)
  fantasy_points_standard DECIMAL(6,2) NOT NULL,
  fantasy_points_ppr DECIMAL(6,2) NOT NULL,
  fantasy_points_half_ppr DECIMAL(6,2) NOT NULL,
  fantasy_points_custom DECIMAL(6,2),
  
  -- Performance vs Projection
  projected_points_pre_game DECIMAL(6,2),
  points_over_projection DECIMAL(6,2),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(player_id, week, season)
);

-- Indexes for game stats
CREATE INDEX idx_game_stats_player_week ON player_game_stats(player_id, week, season);
CREATE INDEX idx_game_stats_week ON player_game_stats(week, season);
CREATE INDEX idx_game_stats_points ON player_game_stats(fantasy_points_ppr DESC);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER update_nfl_players_updated_at
    BEFORE UPDATE ON nfl_players
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_projections_updated_at
    BEFORE UPDATE ON player_projections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_risk_analysis_updated_at
    BEFORE UPDATE ON player_risk_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_player_game_stats_updated_at
    BEFORE UPDATE ON player_game_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE nfl_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_risk_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_game_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (modify based on your auth requirements)
CREATE POLICY "Public players are viewable by everyone" ON nfl_players
    FOR SELECT USING (true);

CREATE POLICY "Public projections are viewable by everyone" ON player_projections
    FOR SELECT USING (true);

CREATE POLICY "Public risk analysis are viewable by everyone" ON player_risk_analysis
    FOR SELECT USING (true);

CREATE POLICY "Public game stats are viewable by everyone" ON player_game_stats
    FOR SELECT USING (true);

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================================================

-- Insert a few sample players for testing
INSERT INTO nfl_players (
  player_external_id, first_name, last_name, display_name, 
  position, nfl_team, jersey_number, is_active
) VALUES 
  ('mahomes-patrick', 'Patrick', 'Mahomes', 'P. Mahomes', 'QB', 'KC', 15, true),
  ('hill-tyreek', 'Tyreek', 'Hill', 'T. Hill', 'WR', 'MIA', 10, true),
  ('mccaffrey-christian', 'Christian', 'McCaffrey', 'C. McCaffrey', 'RB', 'SF', 23, true);

-- ============================================================================
-- USEFUL VIEWS
-- ============================================================================

-- View combining player data with latest projections
CREATE VIEW players_with_projections AS
SELECT 
    p.*,
    proj.projected_fantasy_points,
    proj.confidence_score,
    proj.projection_tier,
    proj.floor_points,
    proj.ceiling_points,
    risk.overall_risk_score,
    risk.risk_level
FROM nfl_players p
LEFT JOIN player_projections proj ON p.id = proj.player_id 
    AND proj.week = EXTRACT(WEEK FROM CURRENT_DATE)
    AND proj.season = EXTRACT(YEAR FROM CURRENT_DATE)
LEFT JOIN player_risk_analysis risk ON p.id = risk.player_id 
    AND risk.week = EXTRACT(WEEK FROM CURRENT_DATE)
    AND risk.season = EXTRACT(YEAR FROM CURRENT_DATE);

-- View for top performers by position
CREATE VIEW top_performers_by_position AS
SELECT 
    position,
    player_id,
    first_name,
    last_name,
    nfl_team,
    projected_fantasy_points,
    projection_tier,
    overall_risk_score,
    ROW_NUMBER() OVER (PARTITION BY position ORDER BY projected_fantasy_points DESC) as position_rank
FROM players_with_projections
WHERE is_active = true
    AND projected_fantasy_points IS NOT NULL;

-- ============================================================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- Partial indexes for common queries
CREATE INDEX idx_players_active_position ON nfl_players(position) WHERE is_active = true;
CREATE INDEX idx_projections_current_week ON player_projections(player_id, projected_fantasy_points DESC) 
    WHERE week = EXTRACT(WEEK FROM CURRENT_DATE) AND season = EXTRACT(YEAR FROM CURRENT_DATE);

-- Composite indexes for common filter combinations
CREATE INDEX idx_projections_position_week ON player_projections(week, season) 
    INCLUDE (projected_fantasy_points, confidence_score);

-- ============================================================================
-- MAINTENANCE FUNCTIONS
-- ============================================================================

-- Function to cleanup old projections (keep last 4 weeks)
CREATE OR REPLACE FUNCTION cleanup_old_projections()
RETURNS void AS $$
BEGIN
    DELETE FROM player_projections 
    WHERE created_at < NOW() - INTERVAL '4 weeks'
    AND projection_type = 'WEEKLY';
    
    DELETE FROM player_risk_analysis 
    WHERE created_at < NOW() - INTERVAL '4 weeks';
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup (you can set up a cron job or use pg_cron extension)
-- SELECT cron.schedule('cleanup-projections', '0 2 * * 0', 'SELECT cleanup_old_projections();');

-- ===========================================================================
-- AUTHENTICATION TABLES
-- ===========================================================================

-- Users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'PREMIUM')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Insert sample users (password is "password123" hashed with bcrypt)
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@waiverwire.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'ADMIN'),
('demo@waiverwire.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo User', 'USER'); 