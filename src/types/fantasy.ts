// Fantasy Football Types - Based on Academic Research and Portfolio Theory
// Comprehensive interfaces for projection systems with risk analysis

export type NFLPosition = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DST'

export type NFLTeam = 
  | 'ARI' | 'ATL' | 'BAL' | 'BUF' | 'CAR' | 'CHI' | 'CIN' | 'CLE' | 'DAL' | 'DEN'
  | 'DET' | 'GB' | 'HOU' | 'IND' | 'JAX' | 'KC' | 'LV' | 'LAC' | 'LAR' | 'MIA'
  | 'MIN' | 'NE' | 'NO' | 'NYG' | 'NYJ' | 'PHI' | 'PIT' | 'SF' | 'SEA' | 'TB'
  | 'TEN' | 'WAS'

export type InjuryStatus = 'HEALTHY' | 'QUESTIONABLE' | 'DOUBTFUL' | 'OUT' | 'IR' | 'PUP' | 'DNR' | 'SUSPENDED'

export type ProjectionTier = 'ELITE' | 'HIGH' | 'MEDIUM' | 'LOW' | 'VOLATILE'

export type RiskLevel = 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'

// Core NFLPlayer interface with all projection fields
export interface NFLPlayer {
  id: string
  playerExternalId: string
  firstName: string
  lastName: string
  displayName: string
  position: NFLPosition
  nflTeam: string
  jerseyNumber?: number
  
  // Physical Attributes
  heightInches?: number
  weightPounds?: number
  age?: number
  yearsPro?: number
  college?: string
  
  // Status Information
  isActive: boolean
  isRookie: boolean
  injuryStatus: InjuryStatus
  injuryDetails?: string
  depthChartPosition?: number
  
  // Team Usage Metrics
  targetShare?: number
  snapCountPercentage?: number
  redZoneUsage?: number
  byeWeek?: number
  
  // Fantasy Projections - All projection fields
  projectedFantasyPoints?: number
  projectedFantasyPointsPPR?: number
  projectedFantasyPointsHalfPPR?: number
  projectedFantasyPointsStandard?: number
  
  // Projection Confidence & Risk
  confidenceScore?: number
  projectionTier?: ProjectionTier
  riskLevel?: RiskLevel
  volatilityScore?: number
  floorPoints?: number
  ceilingPoints?: number
  boomProbability?: number
  bustProbability?: number
  
  // Offensive Projections
  projectedPassingYards?: number
  projectedPassingTDs?: number
  projectedPassingInts?: number
  projectedPassingAttempts?: number
  projectedCompletions?: number
  
  projectedRushingYards?: number
  projectedRushingTDs?: number
  projectedRushingAttempts?: number
  projectedRedZoneCarries?: number
  
  projectedReceptions?: number
  projectedReceivingYards?: number
  projectedReceivingTDs?: number
  projectedTargets?: number
  projectedAirYards?: number
  projectedYAC?: number
  projectedRedZoneTargets?: number
  
  projectedFumblesLost?: number
  
  // Kicking Projections
  projectedFieldGoalsMade?: number
  projectedFieldGoalsAttempted?: number
  projectedExtraPointsMade?: number
  projectedExtraPointsAttempted?: number
  projectedFGDistanceAvg?: number
  
  // Defense/Special Teams Projections
  projectedSacks?: number
  projectedInterceptions?: number
  projectedFumbleRecoveries?: number
  projectedSafeties?: number
  projectedDefensiveTDs?: number
  projectedPointsAllowed?: number
  projectedYardsAllowed?: number
  projectedReturnTDs?: number
  
  // Game Context
  opponentTeam?: string
  isHomeGame?: boolean
  vegasTotalPoints?: number
  vegasSpread?: number
  impliedTeamTotal?: number
  
  // Advanced Metrics
  projectedSnapPercentage?: number
  projectedTouchShare?: number
  projectedTargetShare?: number
  projectedRedZoneShare?: number
  
  // Meta Information
  imageUrl?: string
  createdAt: Date
  updatedAt: Date
}

// Portfolio Optimization Types (Based on Academic Research)
export interface PlayerCorrelationMatrix {
  playerId: string
  correlations: Record<string, number> // playerId -> correlation coefficient
  gameStackCorrelations: Record<string, number> // teammate correlations
  opponentStackCorrelations: Record<string, number> // opposing team correlations
  weatherCorrelations?: Record<string, number> // weather impact correlations
}

// Market Efficiency & Contest Theory
export interface ContestMetrics {
  playerId: string
  ownership: number // projected ownership percentage
  leverageScore: number // low ownership + high projection
  gppValue: number // tournament-specific value
  cashGameValue: number // cash game specific value
  contrarian: boolean // below average ownership with above average projection
}

// Lineup Construction Types
export interface LineupConstraints {
  salarycap: number
  maxPlayersPerTeam: number
  maxPlayersPerGame: number
  stackRequirements?: StackRequirement[]
  bannedPlayers?: string[]
  lockedPlayers?: string[]
}

export interface StackRequirement {
  type: 'QB_WR' | 'QB_TE' | 'RB_DST' | 'GAME_STACK' | 'TEAM_STACK'
  minPlayers: number
  maxPlayers: number
  teams?: string[]
}

// Weather and Environmental Impact
export interface WeatherImpact {
  gameId: string
  temperature: number
  windSpeed: number
  precipitation: number
  domeGame: boolean
  
  // Position-specific weather impacts
  passingImpact: number // negative = worse conditions
  kickingImpact: number
  receivingImpact: number
  rushingImpact: number
}

// Injury and Availability Risk
export interface InjuryRisk {
  playerId: string
  injuryProbability: number // 0-1 probability of missing game
  earlyExitProbability: number // probability of leaving game early
  limitedSnapsProbability: number // probability of reduced usage
  historicalInjuryPattern: string[] // past injury types
  recencyBias: number // recent injury impact on current risk
}

// Market Data and Pricing
export interface MarketData {
  playerId: string
  dfsPrice: number
  impliedOwnership: number
  priceChange: number
  volumeTraded?: number
  lastUpdated: Date
  
  // Price efficiency metrics
  valueScore: number // points per dollar
  priceMovement: 'UP' | 'DOWN' | 'STABLE'
  marketSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
}

// Game Theory and Opponent Modeling
export interface OpponentModel {
  contestId: string
  opponentType: 'CASUAL' | 'SEMI_PRO' | 'PROFESSIONAL' | 'TOURNAMENT_SPECIALIST'
  
  // Behavioral patterns
  chalkiness: number // tendency to play high-owned players
  contrarianism: number // tendency to avoid popular plays
  stackingFrequency: number // how often they use stacks
  positionBias: Record<NFLPosition, number> // position spending preferences
  
  // Historical performance
  roi: number
  averageScore: number
  winRate: number
  consistencyScore: number
}

// Simulation and Monte Carlo Results
export interface SimulationResult {
  playerId: string
  simulations: number
  
  // Distribution metrics
  mean: number
  median: number
  standardDeviation: number
  skewness: number
  kurtosis: number
  
  // Percentile outcomes
  percentile10: number
  percentile25: number
  percentile75: number
  percentile90: number
  
  // Probability distributions
  bustProbability: number // < 5th percentile
  boomProbability: number // > 80th percentile
  consistencyScore: number // inverse of coefficient of variation
}

// Meta-Game and Tournament Theory
export interface TournamentStrategy {
  contestSize: number
  payoutStructure: 'TOP_HEAVY' | 'FLAT' | 'WINNER_TAKE_ALL'
  field: 'SHARP' | 'CASUAL' | 'MIXED'
  
  // Optimal strategies
  optimalOwnership: Record<string, number> // playerId -> target ownership
  stackingStrategy: StackRequirement[]
  riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE'
  contrarian: boolean
}

// Advanced Analytics
export interface PlayerMetrics {
  playerId: string
  
  // Efficiency metrics
  pointsPerDollar: number
  pointsPerTarget: number
  pointsPerCarry: number
  pointsPerSnap: number
  
  // Consistency metrics
  weeklyVariance: number
  floorCeiling: number // ceiling - floor
  hitRate: number // percentage of games above projection
  
  // Context metrics
  homeAwayDifference: number
  divisionalDifference: number
  primtimeDifference: number
  weatherSensitivity: number
}

// Weekly Projections Interface
export interface WeeklyProjection {
  id: string
  playerId: string
  week: number
  season: number
  projectionType: 'WEEKLY' | 'SEASON' | 'PLAYOFF'
  
  // All the projection fields from NFLPlayer
  projectedFantasyPoints: number
  projectedFantasyPointsPPR: number
  projectedFantasyPointsHalfPPR: number
  projectedFantasyPointsStandard: number
  
  confidenceScore: number
  projectionTier: ProjectionTier
  riskLevel: RiskLevel
  volatilityScore: number
  floorPoints: number
  ceilingPoints: number
  
  // Game Context for this specific week
  opponentTeam: NFLTeam
  isHomeGame: boolean
  vegasTotalPoints?: number
  vegasSpread?: number
  impliedTeamTotal?: number
  
  // Weather and Environmental Factors
  weatherCondition?: 'CLEAR' | 'RAIN' | 'SNOW' | 'WIND' | 'DOME'
  temperature?: number
  windSpeed?: number
  precipitationChance?: number
  
  // Model Metadata
  modelVersion: string
  lastUpdated: Date
  dataSources: string[]
  
  createdAt: Date
  updatedAt: Date
}

// Player Risk Analysis
export interface PlayerRiskAnalysis {
  id: string
  playerId: string
  week: number
  season: number
  
  // Overall Risk Metrics
  overallRiskScore: number
  riskLevel: RiskLevel
  riskAdjustedPoints: number
  
  // Risk Categories
  injuryRiskScore: number
  usageRiskScore: number
  matchupRiskScore: number
  weatherRiskScore: number
  gameScriptRiskScore: number
  
  // Historical Performance Factors
  consistencyScore: number
  recentFormTrend: 'IMPROVING' | 'DECLINING' | 'STABLE'
  homeAwaySplit: number
  vsPositionRank: number
  
  // Portfolio Optimization
  optimalRosterPercentage: number
  stackCorrelation: number
  contrarianValue: number
  
  // Salary/Value Metrics (for DFS)
  salaryCapPercentage?: number
  pointsPerDollar?: number
  valueRating?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'TERRIBLE'
  
  // Ceiling/Floor Analysis
  ceilingProbability: number
  floorProbability: number
  medianOutcome: number
  
  createdAt: Date
  updatedAt: Date
}

// Game Statistics (Actual Performance)
export interface PlayerGameStats {
  id: string
  playerId: string
  gameId?: string
  week: number
  season: number
  opponent: NFLTeam
  isHomeGame: boolean
  
  // Game Result Context
  teamScore?: number
  opponentScore?: number
  gameTotalPoints?: number
  
  // Playing Time
  snapsPlayed?: number
  snapPercentage?: number
  timeOfPossession?: number
  
  // Passing Stats
  passingAttempts: number
  passingCompletions: number
  passingYards: number
  passingTDs: number
  passingInts: number
  passingRating?: number
  qbHits?: number
  timesSacked?: number
  sackYardsLost?: number
  
  // Rushing Stats
  rushingAttempts: number
  rushingYards: number
  rushingTDs: number
  rushingLong?: number
  redZoneCarries?: number
  
  // Receiving Stats
  targets: number
  receptions: number
  receivingYards: number
  receivingTDs: number
  receivingLong?: number
  airYards?: number
  yardsAfterCatch?: number
  redZoneTargets?: number
  endZoneTargets?: number
  
  // Other Offensive Stats
  fumbles: number
  fumblesLost: number
  twoPointConversions?: number
  
  // Kicking Stats
  fieldGoalsMade: number
  fieldGoalsAttempted: number
  fieldGoalPercentage?: number
  longestFieldGoal?: number
  extraPointsMade: number
  extraPointsAttempted: number
  
  // Defense/Special Teams Stats
  tacklesSolo?: number
  tacklesAssisted?: number
  tacklesTotal?: number
  sacks?: number
  tacklesForLoss?: number
  qbHitsDef?: number
  interceptions?: number
  passesDefended?: number
  fumblesForced?: number
  fumbleRecoveries?: number
  safeties?: number
  defensiveTDs?: number
  returnTDs?: number
  blockedKicks?: number
  
  // Team Defense (when player represents entire defense)
  pointsAllowed?: number
  yardsAllowed?: number
  rushingYardsAllowed?: number
  passingYardsAllowed?: number
  turnoversForced?: number
  
  // Fantasy Points (Multiple Scoring Systems)
  fantasyPointsStandard: number
  fantasyPointsPPR: number
  fantasyPointsHalfPPR: number
  fantasyPointsCustom?: number
  
  // Performance vs Projection
  projectedPointsPreGame?: number
  pointsOverProjection?: number
  
  createdAt: Date
  updatedAt: Date
}

// League Settings Interface
export interface LeagueSettings {
  id: string
  name: string
  scoringType: 'STANDARD' | 'PPR' | 'HALF_PPR' | 'CUSTOM'
  
  // Scoring Settings
  passingYardPoints: number
  passingTDPoints: number
  passingIntPoints: number
  
  rushingYardPoints: number
  rushingTDPoints: number
  
  receivingYardPoints: number
  receivingTDPoints: number
  receptionPoints: number
  
  fumblesLostPoints: number
  
  // Roster Settings
  qbSlots: number
  rbSlots: number
  wrSlots: number
  teSlots: number
  flexSlots: number
  kSlots: number
  dstSlots: number
  benchSlots: number
  
  // League Rules
  maxTeams: number
  draftType: 'SNAKE' | 'AUCTION' | 'LINEAR'
  waiverType: 'ROLLING' | 'RESET' | 'FAAB'
  tradeDeadline?: Date
  playoffWeeks: number[]
  
  createdAt: Date
  updatedAt: Date
}

// Fantasy Team Interface
export interface FantasyTeam {
  id: string
  leagueId: string
  ownerId: string
  name: string
  
  // Team Performance
  wins: number
  losses: number
  ties: number
  pointsFor: number
  pointsAgainst: number
  
  // Roster
  roster: {
    playerId: string
    position: 'QB' | 'RB' | 'WR' | 'TE' | 'FLEX' | 'K' | 'DST' | 'BENCH'
    isStarter: boolean
  }[]
  
  // Waiver/Trade Settings
  waiverPriority?: number
  faabBudget?: number
  faabSpent?: number
  
  createdAt: Date
  updatedAt: Date
}

// All types are exported above for easy importing 