/**
 * Base Projection Engine - 2008 Research Implementation
 * 
 * This implements the core projection algorithms from the 2008 research paper,
 * focusing on expected points and standard deviation calculations with 
 * position-specific adjustments and risk modeling.
 */

import type { NFLPlayer, PlayerGameStats, PlayerProjection } from '@/src/types/database'
import type { WeeklyPerformance, ProjectionInput, RiskFactors } from '@/src/types/projections'

export interface ProjectionOptions {
  weeks?: number // Number of weeks to project forward
  adjustForInjury?: boolean
  adjustForSchedule?: boolean
  useAdvancedMetrics?: boolean
  riskModel?: 'conservative' | 'moderate' | 'aggressive'
}

export interface PositionBaselines {
  QB: { passingYards: number; passingTDs: number; rushingYards: number; interceptions: number }
  RB: { rushingYards: number; rushingTDs: number; receptions: number; receivingYards: number }
  WR: { receptions: number; receivingYards: number; receivingTDs: number; targets: number }
  TE: { receptions: number; receivingYards: number; receivingTDs: number; targets: number }
  K: { fieldGoals: number; extraPoints: number; fieldGoalAttempts: number }
  DEF: { sacks: number; interceptions: number; fumbleRecoveries: number; safeties: number }
}

export class ProjectionEngine {
  private readonly positionBaselines: PositionBaselines
  private readonly scoringSystem: Record<string, number>

  constructor() {
    // Initialize position baselines (league averages)
    this.positionBaselines = {
      QB: { passingYards: 250, passingTDs: 1.5, rushingYards: 20, interceptions: 0.8 },
      RB: { rushingYards: 80, rushingTDs: 0.6, receptions: 3, receivingYards: 25 },
      WR: { receptions: 5, receivingYards: 70, receivingTDs: 0.5, targets: 8 },
      TE: { receptions: 4, receivingYards: 45, receivingTDs: 0.4, targets: 6 },
      K: { fieldGoals: 1.5, extraPoints: 2, fieldGoalAttempts: 2.5 },
      DEF: { sacks: 2.5, interceptions: 0.8, fumbleRecoveries: 0.6, safeties: 0.1 }
    }

    // Standard PPR scoring system
    this.scoringSystem = {
      passingYards: 0.04,     // 1 point per 25 yards
      passingTDs: 4,
      interceptions: -2,
      rushingYards: 0.1,      // 1 point per 10 yards
      rushingTDs: 6,
      receptions: 1,          // PPR
      receivingYards: 0.1,    // 1 point per 10 yards
      receivingTDs: 6,
      fumbles: -2,
      fieldGoals: 3,
      extraPoints: 1,
      defensePoints: 1        // Variable based on points allowed
    }
  }

  /**
   * Calculate expected fantasy points based on historical performance
   * Implements the 2008 research methodology with position-specific adjustments
   */
  calculateExpectedPoints(
    player: NFLPlayer, 
    historicalData: PlayerGameStats[], 
    options: ProjectionOptions = {}
  ): number {
    if (!historicalData || historicalData.length === 0) {
      return this.getPositionBaseline(player.position)
    }

    // Weight recent performances more heavily (exponential decay)
    const weightedPerformances = this.applyTemporalWeighting(historicalData)
    
    // Calculate position-specific expected points
    const baseExpectedPoints = this.calculatePositionExpectedPoints(
      player.position as keyof PositionBaselines, 
      weightedPerformances
    )

    // Apply adjustments based on options and player factors
    let adjustedPoints = baseExpectedPoints

    if (options.adjustForInjury && player.injury_status !== 'HEALTHY') {
      adjustedPoints *= this.getInjuryAdjustment(player.injury_status)
    }

    if (options.useAdvancedMetrics) {
      adjustedPoints = this.applyAdvancedMetricAdjustments(adjustedPoints, player, historicalData)
    }

    return Math.round(adjustedPoints * 10) / 10 // Round to 1 decimal place
  }

  /**
   * Calculate standard deviation of fantasy points
   * Core component of 2008 research risk modeling
   */
  calculateStandardDeviation(performances: number[]): number {
    if (performances.length < 2) return 0

    const mean = performances.reduce((sum, val) => sum + val, 0) / performances.length
    const squaredDifferences = performances.map(val => Math.pow(val - mean, 2))
    const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / (performances.length - 1)
    
    return Math.sqrt(variance)
  }

  /**
   * Calculate risk-adjusted projection incorporating both expected points and uncertainty
   * This is the key innovation from the 2008 research
   */
  calculateRiskAdjustedProjection(
    player: NFLPlayer,
    historicalData: PlayerGameStats[],
    riskTolerance: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
  ): PlayerProjection {
    const fantasyPoints = historicalData.map(game => 
      this.calculateGameFantasyPoints(game)
    )

    const expectedPoints = this.calculateExpectedPoints(player, historicalData)
    const standardDeviation = this.calculateStandardDeviation(fantasyPoints)
    
    // Risk adjustment factors based on 2008 research
    const riskMultipliers = {
      conservative: 0.85,  // Prefer low-variance players
      moderate: 1.0,       // Standard projection
      aggressive: 1.15     // Prefer high-upside players
    }

    const riskAdjustedPoints = expectedPoints * riskMultipliers[riskTolerance]
    
    // Calculate confidence intervals
    const confidenceInterval = {
      lower: riskAdjustedPoints - (1.96 * standardDeviation), // 95% CI
      upper: riskAdjustedPoints + (1.96 * standardDeviation)
    }

    // Calculate Sharpe ratio (reward-to-risk ratio)
    const sharpeRatio = standardDeviation > 0 ? expectedPoints / standardDeviation : 0

    return {
      id: `proj_${player.id}`,
      player_id: player.id,
      season: new Date().getFullYear(),
      week: 0, // Season-long projection
      projection_type: 'SEASON' as const,
      projected_fantasy_points: riskAdjustedPoints,
      projected_fantasy_points_ppr: riskAdjustedPoints,
      projected_fantasy_points_half_ppr: riskAdjustedPoints * 0.9,
      projected_fantasy_points_standard: riskAdjustedPoints * 0.8,
      confidence_score: this.calculateProjectionAccuracy(historicalData) * 100,
      projection_tier: this.getProjectionTier(riskAdjustedPoints, player.position),
      risk_level: this.calculateRiskLevel(standardDeviation),
      volatility_score: Math.min(100, standardDeviation * 10),
      floor_points: confidenceInterval.lower,
      ceiling_points: confidenceInterval.upper,
      boom_probability: this.calculateBoomBustRatio(fantasyPoints, expectedPoints) / 10,
      bust_probability: 1 - (this.calculateBoomBustRatio(fantasyPoints, expectedPoints) / 10),
      projected_passing_yards: this.extractProjectedStat(historicalData, 'passing_yards'),
      projected_passing_tds: this.extractProjectedStat(historicalData, 'passing_tds'),
      projected_passing_ints: this.extractProjectedStat(historicalData, 'passing_ints'),
      projected_passing_attempts: this.extractProjectedStat(historicalData, 'passing_attempts'),
      projected_completions: this.extractProjectedStat(historicalData, 'passing_completions'),
      projected_rushing_yards: this.extractProjectedStat(historicalData, 'rushing_yards'),
      projected_rushing_tds: this.extractProjectedStat(historicalData, 'rushing_tds'),
      projected_rushing_attempts: this.extractProjectedStat(historicalData, 'rushing_attempts'),
      projected_red_zone_carries: null,
      projected_receptions: this.extractProjectedStat(historicalData, 'receptions'),
      projected_receiving_yards: this.extractProjectedStat(historicalData, 'receiving_yards'),
      projected_receiving_tds: this.extractProjectedStat(historicalData, 'receiving_tds'),
      projected_targets: this.extractProjectedStat(historicalData, 'targets'),
      projected_air_yards: null,
      projected_yac: null,
      projected_red_zone_targets: null,
      projected_fumbles_lost: this.extractProjectedStat(historicalData, 'fumbles_lost'),
      projected_field_goals_made: null,
      projected_field_goals_attempted: null,
      projected_extra_points_made: null,
      projected_extra_points_attempted: null,
      projected_fg_distance_avg: null,
      projected_sacks: null,
      projected_interceptions: null,
      projected_fumble_recoveries: null,
      projected_safeties: null,
      projected_defensive_tds: null,
      projected_points_allowed: null,
      projected_yards_allowed: null,
      projected_return_tds: null,
      opponent_team: null,
      is_home_game: null,
      vegas_total_points: null,
      vegas_spread: null,
      implied_team_total: null,
      weather_condition: null,
      temperature: null,
      wind_speed: null,
      precipitation_chance: null,
      projected_snap_percentage: null,
      projected_touch_share: null,
      projected_target_share: null,
      projected_red_zone_share: null,
      injury_risk_factor: null,
      is_playing_injured: false,
      missed_practice_days: null,
      model_version: '1.0.0',
      last_updated: new Date().toISOString(),
      data_sources: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  /**
   * Apply temporal weighting to give more importance to recent games
   * More recent games get higher weights (exponential decay)
   */
  private applyTemporalWeighting(data: PlayerGameStats[]): PlayerGameStats[] {
    const decayRate = 0.95 // 5% decay per game back
    
    return data
      .sort((a, b) => (b.week + b.season * 100) - (a.week + a.season * 100))
      .map((game, index) => ({
        ...game,
        weight: Math.pow(decayRate, index)
      }))
  }

  /**
   * Calculate position-specific expected points
   */
  private calculatePositionExpectedPoints(
    position: keyof PositionBaselines,
    weightedData: PlayerGameStats[]
  ): number {
    let totalPoints = 0
    let totalWeight = 0

    weightedData.forEach(game => {
      const gamePoints = this.calculateGameFantasyPoints(game)
      const weight = (game as any).weight || 1
      
      totalPoints += gamePoints * weight
      totalWeight += weight
    })

    return totalWeight > 0 ? totalPoints / totalWeight : this.getPositionBaseline(position)
  }

  /**
   * Calculate fantasy points for a single game
   */
  private calculateGameFantasyPoints(game: PlayerGameStats): number {
    let points = 0

    // Passing stats
    points += (game.passing_yards || 0) * this.scoringSystem.passingYards
    points += (game.passing_tds || 0) * this.scoringSystem.passingTDs
    points += (game.passing_ints || 0) * this.scoringSystem.interceptions

    // Rushing stats
    points += (game.rushing_yards || 0) * this.scoringSystem.rushingYards
    points += (game.rushing_tds || 0) * this.scoringSystem.rushingTDs

    // Receiving stats
    points += (game.receptions || 0) * this.scoringSystem.receptions
    points += (game.receiving_yards || 0) * this.scoringSystem.receivingYards
    points += (game.receiving_tds || 0) * this.scoringSystem.receivingTDs

    // Fumbles
    points += (game.fumbles_lost || 0) * this.scoringSystem.fumbles

    return Math.max(0, points) // Can't have negative total points
  }

  /**
   * Get baseline fantasy points for a position (league average)
   */
  private getPositionBaseline(position: string): number {
    const baselines = {
      QB: 18.5,
      RB: 12.3,
      WR: 11.8,
      TE: 8.9,
      K: 7.2,
      DEF: 9.1
    }
    
    return baselines[position as keyof typeof baselines] || 8.0
  }

  /**
   * Apply injury status adjustments
   */
  private getInjuryAdjustment(injuryStatus: string): number {
    const adjustments = {
      HEALTHY: 1.0,
      QUESTIONABLE: 0.85,
      DOUBTFUL: 0.6,
      OUT: 0.0,
      IR: 0.0,
      PUP: 0.0
    }
    
    return adjustments[injuryStatus as keyof typeof adjustments] || 0.9
  }

  /**
   * Apply advanced metric adjustments (EPA, target share, etc.)
   */
  private applyAdvancedMetricAdjustments(
    basePoints: number,
    player: NFLPlayer,
    historicalData: PlayerGameStats[]
  ): number {
    let adjustment = 1.0

    // Target share adjustment for receivers
    if (['WR', 'TE'].includes(player.position)) {
      const avgTargetShare = this.calculateAverageTargetShare(historicalData)
      if (avgTargetShare > 0.25) adjustment *= 1.1  // High target share boost
      if (avgTargetShare < 0.15) adjustment *= 0.9  // Low target share penalty
    }

    // Red zone usage adjustment
    const redZoneOpportunities = this.calculateRedZoneUsage(historicalData)
    if (redZoneOpportunities > 0.2) adjustment *= 1.05

    return basePoints * adjustment
  }

  /**
   * Extract projected stats from historical data
   */
  private extractProjectedStat(data: PlayerGameStats[], statName: string): number | null {
    if (data.length === 0) return null
    
    const values = data.map(game => (game as any)[statName] || 0)
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  /**
   * Calculate projection accuracy based on historical variance
   */
  private calculateProjectionAccuracy(data: PlayerGameStats[]): number {
    if (data.length < 3) return 0.5
    
    const points = data.map(game => this.calculateGameFantasyPoints(game))
    const stdDev = this.calculateStandardDeviation(points)
    const mean = points.reduce((sum, val) => sum + val, 0) / points.length
    
    // Lower coefficient of variation = higher accuracy
    const coefficientOfVariation = mean > 0 ? stdDev / mean : 1
    return Math.max(0, Math.min(1, 1 - coefficientOfVariation))
  }

  /**
   * Calculate risk level based on standard deviation
   */
  private calculateRiskLevel(standardDeviation: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (standardDeviation < 5) return 'LOW'
    if (standardDeviation < 10) return 'MEDIUM'
    return 'HIGH'
  }

  /**
   * Calculate consistency score (inverse of coefficient of variation)
   */
  private calculateConsistencyScore(performances: number[]): number {
    if (performances.length < 2) return 0.5
    
    const mean = performances.reduce((sum, val) => sum + val, 0) / performances.length
    const stdDev = this.calculateStandardDeviation(performances)
    
    if (mean === 0) return 0
    return Math.max(0, Math.min(1, 1 - (stdDev / mean)))
  }

  /**
   * Calculate boom/bust ratio
   */
  private calculateBoomBustRatio(performances: number[], expectedPoints: number): number {
    if (performances.length === 0) return 1
    
    const boomThreshold = expectedPoints * 1.5  // 50% above expectation
    const bustThreshold = expectedPoints * 0.5  // 50% below expectation
    
    const booms = performances.filter(p => p >= boomThreshold).length
    const busts = performances.filter(p => p <= bustThreshold).length
    
    return busts > 0 ? booms / busts : booms
  }

  /**
   * Calculate average target share for receivers
   */
  private calculateAverageTargetShare(data: PlayerGameStats[]): number {
    if (data.length === 0) return 0
    
    // Estimate target share based on targets vs assumed team total
    const avgTargets = data.reduce((sum, game) => sum + (game.targets || 0), 0) / data.length
    const estimatedTeamPassAttempts = 35 // Average team pass attempts per game
    
    return avgTargets / estimatedTeamPassAttempts
  }

  /**
   * Calculate red zone usage percentage
   */
  private calculateRedZoneUsage(data: PlayerGameStats[]): number {
    if (data.length === 0) return 0
    
    const redZoneOpportunities = data.reduce((sum, game) => {
      return sum + (game.red_zone_carries || 0) + (game.red_zone_targets || 0)
    }, 0)
    
    const totalOpportunities = data.reduce((sum, game) => {
      return sum + (game.rushing_attempts || 0) + (game.targets || 0)
    }, 0)
    
    return totalOpportunities > 0 ? redZoneOpportunities / totalOpportunities : 0
  }

  /**
   * Get projection tier based on projected points and position
   */
  private getProjectionTier(projectedPoints: number, position: string): 'ELITE' | 'HIGH' | 'MEDIUM' | 'LOW' | 'VOLATILE' {
    // Position-specific tier thresholds
    const thresholds = {
      QB: { elite: 22, high: 18, medium: 14, low: 10 },
      RB: { elite: 18, high: 14, medium: 10, low: 7 },
      WR: { elite: 16, high: 12, medium: 9, low: 6 },
      TE: { elite: 12, high: 9, medium: 7, low: 5 },
      K: { elite: 10, high: 8, medium: 6, low: 4 },
      DEF: { elite: 12, high: 9, medium: 7, low: 5 }
    }
    
    const posThresholds = thresholds[position as keyof typeof thresholds] || thresholds.WR
    
    if (projectedPoints >= posThresholds.elite) return 'ELITE'
    if (projectedPoints >= posThresholds.high) return 'HIGH'
    if (projectedPoints >= posThresholds.medium) return 'MEDIUM'
    if (projectedPoints >= posThresholds.low) return 'LOW'
    return 'VOLATILE'
  }
}

// Export singleton instance
export const projectionEngine = new ProjectionEngine() 