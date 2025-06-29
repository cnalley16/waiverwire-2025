// Projection Models and Risk Assessment Types
// Advanced analytics for fantasy football projections

import { 
  Position, 
  NFLTeam, 
  RiskLevel, 
  ProjectionTier, 
  WeatherCondition 
} from './database';

import type { NFLPosition } from './fantasy'

// ============================================================================
// PROJECTION MODEL INTERFACES
// ============================================================================

export interface ProjectionModel {
  id: string;
  name: string;
  type: 'REGRESSION' | 'MONTE_CARLO' | 'ENSEMBLE' | 'MACHINE_LEARNING' | 'HYBRID';
  
  // Model Parameters
  lookbackPeriod: number; // weeks of historical data
  weightingScheme: 'EQUAL' | 'EXPONENTIAL' | 'LINEAR' | 'ADAPTIVE';
  factorWeights: Record<string, number>; // feature importance weights
  regularization: number; // overfitting prevention parameter
  
  // Performance Metrics
  backtestedAccuracy: number;
  meanAbsoluteError: number;
  rootMeanSquareError: number;
  correlationWithActuals: number;
  informationCoefficient: number;
  hitRate: number; // percentage of correct directional calls
  
  // Risk Model Integration
  riskModel: RiskModel;
  correlationModel: CorrelationModel;
  
  // Validation Framework
  crossValidationFolds: number;
  outOfSamplePeriod: number;
  walkForwardValidation: boolean;
  
  createdAt: Date;
  lastTrainedAt: Date;
}

export interface ProjectionInput {
  player_id: string;
  week: number;
  season: number;
  
  // Historical Performance Data
  recent_games: {
    fantasy_points: number[];
    usage_metrics: number[];
    injury_history: boolean[];
  };
  
  // Matchup Data
  opponent: NFLTeam;
  opponent_defense_rank: number; // vs position
  home_field_advantage: boolean;
  
  // Team Context
  team_implied_total: number;
  game_total: number;
  spread: number;
  
  // Environmental
  weather: WeatherCondition;
  temperature?: number;
  wind_speed?: number;
  
  // Player Status
  injury_status: string;
  practice_participation: number; // 0-1
  snap_share_trend: number[]; // Last 4 games
  target_share_trend?: number[]; // Last 4 games (skill positions)
}

export interface ProjectionOutput {
  player_id: string;
  week: number;
  model_id: string;
  
  // Point Projections
  points_projection: number;
  points_floor: number; // 25th percentile
  points_ceiling: number; // 75th percentile
  points_median: number; // 50th percentile
  
  // Confidence Metrics
  confidence_interval: [number, number]; // 90% confidence interval
  prediction_variance: number;
  model_confidence: number; // 0-100
  
  // Distribution Metrics
  probability_distribution: {
    ranges: Array<{
      min: number;
      max: number;
      probability: number;
    }>;
  };
  
  // Outcome Probabilities
  boom_probability: number; // Top 10% outcome for position
  bust_probability: number; // Bottom 10% outcome for position
  safe_floor_probability: number; // Probability of hitting safe floor
  
  created_at: string;
}

// ============================================================================
// ENSEMBLE PROJECTION SYSTEM
// ============================================================================

export interface EnsembleProjection {
  playerId: string;
  week: number;
  season: number;
  
  // Component Models
  individualProjections: ProjectionComponent[];
  modelWeights: Record<string, number>; // modelId -> weight
  
  // Ensemble Results
  weightedProjection: number;
  weightedStandardDeviation: number;
  ensembleVariance: number;
  modelDispersion: number; // disagreement between models
  
  // Confidence Metrics
  consensusStrength: number; // how much models agree
  outlierModels: string[]; // models significantly different from consensus
  reliabilityScore: number; // historical ensemble accuracy
  
  // Risk Aggregation
  aggregatedRisk: number;
  riskContributions: Record<string, number>; // risk contribution by model
  diversificationBenefit: number; // risk reduction from ensemble
  
  createdAt: Date;
  models: string[]; // list of contributing model IDs
}

// ============================================================================
// RISK MODELS
// ============================================================================

export interface RiskModel {
  id: string;
  name: string;
  methodology: 'FACTOR_MODEL' | 'SCENARIO_ANALYSIS' | 'MONTE_CARLO' | 'VAR_COVAR';
  
  // Risk Factors
  systematicFactors: SystematicRiskFactor[];
  idiosyncraticFactors: IdiosyncraticRiskFactor[];
  
  // Factor Loadings
  factorLoadings: Record<string, Record<string, number>>; // playerId -> factor -> loading
  factorReturns: Record<string, number[]>; // factor -> historical returns
  factorVolatilities: Record<string, number>; // factor -> volatility
  
  // Correlation Structure
  factorCorrelationMatrix: number[][]; // factor-to-factor correlations
  residualCorrelations: Record<string, Record<string, number>>; // player residual correlations
  
  // Model Statistics
  explanatoryPower: number; // R-squared equivalent
  factorSignificance: Record<string, number>; // t-statistics for factors
  stabilityTest: number; // factor loading stability over time
  
  calibrationDate: Date;
  validationPeriod: [Date, Date];
}

// Systematic Risk Factors (Market-Wide)
export interface SystematicRiskFactor {
  id: string
  name: string
  type: 'WEATHER' | 'GAME_SCRIPT' | 'MARKET_SENTIMENT' | 'MACROECONOMIC' | 'LEAGUE_WIDE'
  
  description: string
  calculation: string // how factor is computed
  historicalValues: number[] // time series of factor values
  currentValue: number
  
  // Factor Properties
  persistence: number // autocorrelation
  volatility: number
  trend: number // long-term drift
  seasonality: boolean
  
  // Impact Analysis
  positionSensitivity: Record<NFLPosition, number> // how each position responds
  teamSensitivity?: Record<string, number> // team-specific sensitivities
  gameTypeSensitivity?: Record<string, number> // dome vs outdoor, primetime vs afternoon
}

// Idiosyncratic Risk Factors (Player-Specific)
export interface IdiosyncraticRiskFactor {
  playerId: string
  factorType: 'INJURY_HISTORY' | 'USAGE_VOLATILITY' | 'SKILL_REGRESSION' | 'ROLE_CHANGE' | 'CONTRACT_SITUATION'
  
  magnitude: number // size of risk factor
  probability: number // likelihood of factor activation
  persistency: number // how long factor remains relevant
  correlation: number // correlation with other player factors
  
  // Historical Analysis
  historicalImpact: number[] // past realizations
  triggerEvents: string[] // what causes this factor to activate
  mitigatingFactors: string[] // what reduces this risk
  
  lastUpdated: Date
  confidence: number // confidence in factor estimation
}

export interface RiskAssessment {
  player_id: string;
  week: number;
  model_id: string;
  
  // Overall Risk
  overall_risk_score: number; // 0-100
  risk_level: RiskLevel;
  risk_tier: ProjectionTier;
  
  // Risk Factor Breakdown
  injury_risk: {
    score: number;
    factors: string[];
    injury_probability: number;
    games_missed_expected: number;
  };
  
  usage_risk: {
    score: number;
    snap_volatility: number;
    target_volatility?: number;
    coaching_change_impact?: number;
  };
  
  matchup_risk: {
    score: number;
    opponent_strength: number;
    historical_performance_vs_opponent: number;
    game_script_risk: number;
  };
  
  environmental_risk: {
    score: number;
    weather_impact: number;
    travel_fatigue: number;
    rest_advantage: number;
  };
  
  // Portfolio Risk (for lineup construction)
  correlation_risk: {
    teammate_correlations: Array<{
      player_id: string;
      correlation: number;
      joint_bust_probability: number;
    }>;
    opponent_correlations: Array<{
      player_id: string;
      correlation: number;
    }>;
  };
  
  created_at: string;
}

// ============================================================================
// OPTIMIZATION TYPES
// ============================================================================

export interface OptimizationConstraints {
  salaryCap: number;
  positionRequirements: Record<NFLPosition, number>;
  maxPlayersPerTeam: number;
  maxPlayersPerGame: number;
  
  // Risk Constraints
  maxPortfolioRisk: number;
  maxConcentrationRisk: number;
  minDiversification: number;
  
  // Player Constraints
  mandatoryPlayers: string[]; // must include
  excludedPlayers: string[]; // must exclude
  playerLimits: Record<string, number>; // max exposure per player
}

export interface LineupOptimization {
  lineup_id: string;
  objective: 'MAX_POINTS' | 'MAX_SHARPE' | 'MAX_KELLY' | 'MIN_RISK';
  
  players: Array<{
    player_id: string;
    position: Position;
    salary?: number;
    projected_points: number;
    risk_score: number;
    ownership_projection?: number;
  }>;
  
  lineup_metrics: {
    total_projected_points: number;
    total_risk_score: number;
    lineup_correlation: number;
    leverage_score?: number; // DFS contrarian value
    ceiling_probability: number;
    floor_probability: number;
  };
  
  confidence_metrics: {
    win_probability: number;
    top_10_probability: number;
    cash_probability?: number; // DFS cash games
  };
  
  created_at: string;
}

// ============================================================================
// MARKET & CONSENSUS DATA
// ============================================================================

export interface MarketData {
  playerId: string;
  week: number;
  season: number;
  
  // Pricing Information
  draftKingsPrice: number;
  fanDuelPrice: number;
  superdraftPrice: number;
  averagePrice: number;
  priceDispersion: number;
  
  // Ownership Projections
  projectedOwnership: number;
  ownershipRange: [number, number]; // min/max ownership estimates
  ownershipVolatility: number;
  
  // Market Efficiency Metrics
  marketImpliedProjection: number; // what market pricing suggests
  valueGap: number; // difference between model and market
  marketBeta: number; // correlation with consensus
  arbitrageOpportunity: number; // cross-site pricing differences
  
  // Sentiment Indicators
  lineMovement: number; // how prices have changed
  volumeWeightedPrice: number;
  marketSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  
  lastUpdated: Date;
  dataQuality: number;
}

// ============================================================================
// BACKTESTING & VALIDATION
// ============================================================================

export interface BacktestResult {
  modelId: string;
  testPeriod: [Date, Date];
  frequency: 'WEEKLY' | 'DAILY';
  
  // Performance Metrics
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maximumDrawdown: number;
  calmarRatio: number; // return / max drawdown
  
  // Accuracy Metrics
  meanAbsoluteError: number;
  rootMeanSquareError: number;
  correlationWithActuals: number;
  hitRate: number;
  informationCoefficient: number;
  
  // Risk-Adjusted Performance
  informationRatio: number;
  treynorRatio: number;
  jensenAlpha: number;
  battingAverage: number;
  
  // Detailed Results
  weeklyReturns: number[];
  cumulativeReturns: number[];
  drawdownSeries: number[];
  rollingCorrelations: number[];
  
  // Attribution Analysis
  factorReturns: Record<string, number>;
  positionReturns: Record<NFLPosition, number>;
  selectionEffect: number;
  allocationEffect: number;
  
  generatedAt: Date;
}

// ============================================================================
// UTILITY FUNCTIONS TYPES
// ============================================================================

export type ProjectionComparison = {
  player1_id: string;
  player2_id: string;
  week: number;
  
  projection_diff: number;
  risk_diff: number;
  ceiling_diff: number;
  floor_diff: number;
  
  recommendation: 'STRONGLY_PREFER_1' | 'PREFER_1' | 'SIMILAR' | 'PREFER_2' | 'STRONGLY_PREFER_2';
  confidence: number;
};

export type TierBreak = {
  player_id: string;
  current_tier: ProjectionTier;
  potential_tier: ProjectionTier;
  break_probability: number;
  upside_points: number;
  risk_increase: number;
};

export type StackRecommendation = {
  primary_player_id: string;
  stack_type: 'QB_WR' | 'QB_TE' | 'RB_DST_CONTRARIAN' | 'GAME_STACK';
  recommended_players: Array<{
    player_id: string;
    correlation: number;
    expected_combined_points: number;
    combined_ceiling: number;
    combined_floor: number;
  }>;
  stack_confidence: number;
};

// ============================================================================
// Fantasy Football Projections - Based on 2008 Academic Research
// Portfolio Theory, Risk Analysis, and Correlation Models for Fantasy Sports
// ============================================================================

// Core Player Projection Interface (as requested)
export interface PlayerProjection {
  playerId: string;
  expectedPoints: number;
  standardDeviation: number;
  projectionDifferences: number;
  latentRisk: number;
  sharpeRatio: number;
}

// Extended Player Projection with Academic Research Components
export interface ExtendedPlayerProjection extends PlayerProjection {
  // Basic Identifiers
  week: number;
  season: number;
  position: NFLPosition;
  team: string;
  opponent: string;
  
  // Portfolio Theory Metrics
  expectedReturn: number; // fantasy points expected
  variance: number; // square of standardDeviation
  beta: number; // correlation with market (position average)
  alpha: number; // excess return over position benchmark
  informationRatio: number; // alpha / tracking error
  
  // Risk Decomposition (2008 Research Framework)
  systematicRisk: number; // market-wide risk factors
  unsystematicRisk: number; // player-specific risk
  gameScriptRisk: number; // dependence on game flow
  injuryRisk: number; // health-related uncertainty
  usageRisk: number; // snap count/target volatility
  matchupRisk: number; // opponent-specific factors
  
  // Correlation Analysis
  positionCorrelation: number; // correlation with position average
  teamCorrelation: number; // correlation with teammates
  opponentCorrelation: number; // correlation with opposing players
  weatherCorrelation: number; // weather impact sensitivity
  
  // Projection Quality Metrics
  projectionAccuracy: number; // historical accuracy of model
  projectionBias: number; // systematic over/under estimation
  projectionStability: number; // consistency across updates
  dataQuality: number; // completeness and reliability of inputs
  
  // Market Efficiency Indicators
  marketPrice: number; // DFS salary or ADP
  impliedValue: number; // market's implied point projection
  valueGap: number; // difference between projection and market
  marketBeta: number; // correlation with consensus projections
  
  // Monte Carlo Simulation Results
  simulationRuns: number;
  confidenceInterval95: [number, number]; // 95% CI bounds
  valueAtRisk5: number; // 5th percentile outcome
  conditionalValueAtRisk: number; // expected value below VaR
  maximumDrawdown: number; // worst-case scenario impact
  
  // Meta Information
  modelVersion: string;
  lastUpdated: Date;
  dataSource: string[];
  projectionMethod: 'REGRESSION' | 'MONTE_CARLO' | 'ENSEMBLE' | 'MACHINE_LEARNING';
}

// Correlation Model (Academic Research Framework)
export interface CorrelationModel {
  id: string;
  modelType: 'EMPIRICAL' | 'FACTOR_BASED' | 'SHRINKAGE' | 'DYNAMIC';
  
  // Correlation Matrices
  unconditionalCorrelations: number[][]; // base correlation matrix
  conditionalCorrelations: Record<string, number[][]>; // state-dependent correlations
  
  // Dynamic Components
  halfLife: number; // correlation decay rate
  adaptationSpeed: number; // how quickly correlations adjust
  regimeDetection: boolean; // whether model detects correlation regime changes
  
  // Correlation Drivers
  teamStackCorrelations: Record<string, Record<string, number>>; // same team correlations
  gameStackCorrelations: Record<string, Record<string, number>>; // same game correlations
  positionCorrelations: Record<NFLPosition, Record<NFLPosition, number>>;
  opponentCorrelations: Record<string, Record<string, number>>; // opposing team correlations
  
  // Weather and Environmental Correlations
  weatherCorrelations: WeatherCorrelationMatrix;
  homeFieldCorrelations: Record<string, number>; // home field advantage correlations
  primtimeCorrelations: Record<string, number>; // primetime game correlations
  
  // Model Validation
  correlationStability: number; // how stable correlations are over time
  empiricalFit: number; // how well model matches observed correlations
  forecastAccuracy: number; // accuracy of correlation predictions
  
  calibrationWindow: number; // weeks used for calibration
  lastCalibrated: Date;
}

// Weather Correlation Matrix
export interface WeatherCorrelationMatrix {
  temperature: Record<NFLPosition, number>; // position sensitivity to temperature
  windSpeed: Record<NFLPosition, number>; // position sensitivity to wind
  precipitation: Record<NFLPosition, number>; // position sensitivity to rain/snow
  
  // Cross-positional weather effects
  qbWrWeatherCorrelation: number; // how weather affects QB-WR correlations
  kickerWeatherSensitivity: number; // kicker performance in weather
  defenseWeatherBonus: number; // defensive scoring in bad weather
}

// Projection Component (Individual Model in Ensemble)
export interface ProjectionComponent {
  modelId: string;
  modelName: string;
  projection: number;
  confidence: number;
  weight: number;
  
  // Model-Specific Risk
  modelRisk: number;
  modelBias: number;
  trackingError: number;
  
  // Performance Attribution
  historicalAccuracy: number;
  recentPerformance: number;
  factorExposure: Record<string, number>;
}

// Optimization Input (Portfolio Construction)
export interface OptimizationInput {
  players: PlayerProjection[];
  correlationMatrix: number[][];
  constraints: OptimizationConstraints;
  objective: ObjectiveFunction;
  
  // Risk Parameters
  riskAversion: number; // investor risk preference
  maxPositionRisk: number; // maximum risk from single player
  diversificationRequirement: number; // minimum diversification
  
  // Market Context
  marketData: MarketData[];
  ownershipConstraints?: OwnershipConstraints;
  stackingPreferences?: StackingConstraints;
  
  optimizationMethod: 'MEAN_VARIANCE' | 'BLACK_LITTERMAN' | 'RISK_PARITY' | 'MAX_SHARPE';
}

// Ownership Constraints
export interface OwnershipConstraints {
  maxHighOwnedPlayers: number; // limit highly owned players
  minLowOwnedPlayers: number; // require contrarian plays
  ownershipThresholds: {
    high: number;
    medium: number;
    low: number;
  };
}

// Stacking Constraints
export interface StackingConstraints {
  qbStackRequired: boolean;
  maxTeamStack: number;
  gameStackBonus: number; // bonus for correlating game stacks
  opposingStackPenalty: number; // penalty for opposing stacks
}

// Objective Function
export interface ObjectiveFunction {
  type: 'MAXIMIZE_EXPECTED_RETURN' | 'MAXIMIZE_SHARPE' | 'MINIMIZE_RISK' | 'MAXIMIZE_UTILITY';
  
  // Utility Function Parameters
  riskAversion: number;
  lossAversion?: number; // behavioral finance component
  satisficing?: boolean; // target satisficing vs optimization
  
  // Multi-Objective Weights
  returnWeight: number;
  riskWeight: number;
  diversificationWeight: number;
  contrarianWeight: number;
}

// Model Performance Tracking
export interface ModelPerformance {
  modelId: string;
  evaluationPeriod: [Date, Date];
  
  // Accuracy Tracking
  projectionAccuracy: TimeSeries;
  biasTracking: TimeSeries;
  calibrationScore: TimeSeries; // how well probabilities match outcomes
  
  // Risk Model Performance
  riskModelAccuracy: TimeSeries;
  correlationForecastAccuracy: TimeSeries;
  volatilityForecastAccuracy: TimeSeries;
  
  // Relative Performance
  benchmarkComparison: Record<string, number>; // vs other models
  marketComparison: number; // vs consensus
  improvementOverNaive: number; // vs naive forecasts
  
  // Stability Metrics
  parameterStability: TimeSeries;
  performanceConsistency: number;
  adaptationRate: number;
}

// Time Series Data Structure
export interface TimeSeries {
  dates: Date[];
  values: number[];
  
  // Statistical Properties
  mean: number;
  standardDeviation: number;
  autocorrelation: number;
  trend: number;
  
  // Recent Performance
  recent30Day: number;
  recent7Day: number;
  momentum: number;
}

export interface WeeklyPerformance {
  week: number
  fantasyPoints: number
  opponent: string
  gameScript: 'positive' | 'negative' | 'neutral'
  weather?: WeatherCondition
}

export interface ProjectionInput {
  player: any // Using any for now to avoid circular imports
  historicalGames: any[]
  upcomingOpponents: string[]
  injuryStatus: string
  weatherForecasts?: WeatherCondition[]
}

export interface RiskFactors {
  injuryRisk: number
  suspensionRisk: number
  benchRisk: number
  weatherRisk: number
  matchupRisk: number
}

// All types are exported above for easy importing 