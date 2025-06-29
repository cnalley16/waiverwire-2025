import { ProjectionEngine } from './base-projections'
import { NFLPlayer, PlayerProjection, RiskLevel } from '@/src/types/database'

/**
 * RB Projections Engine - Based on 2008 Research
 * Key Findings:
 * - Ages 24-25: Explosive growth (+10-13% across all stats)
 * - Age 28+: Beginning of decline phase
 * - Age 29-30 "Wall": Massive decline (-24% rushing TDs, -16% yards)
 * - Workload threshold: 250+ carries significantly increases injury risk
 * - Goal line carries critical for TD production
 */
export class RBProjections extends ProjectionEngine {
  
  /**
   * Calculate RB-specific projection with aging curves and workload analysis
   */
  calculateRBProjection(player: NFLPlayer, gameStats: any[] = []): PlayerProjection {
    const baseProjection = this.calculateExpectedPoints(player, gameStats)
    const playerAge = player.age ?? 25 // Default to 25 if age is null
    const ageAdjustment = this.calculateRBAgeAdjustment(playerAge)
    const experienceAdjustment = this.calculateRBExperienceAdjustment(player.years_pro || 0)
    const workloadAdjustment = this.calculateWorkloadImpact(gameStats)
    const positionAdjustment = this.calculateRBPositionalFactors(player, gameStats)
    
    // Apply all adjustments
    const adjustedPoints = baseProjection * ageAdjustment * experienceAdjustment * workloadAdjustment * positionAdjustment
    
    // Calculate RB-specific risk factors
    const riskAnalysis = this.calculateRBRiskFactors(player, gameStats, adjustedPoints, playerAge)
    
    // Determine risk tolerance based on risk analysis
    let riskTolerance: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
    if (riskAnalysis.riskLevel === 'HIGH') {
      riskTolerance = 'conservative'
    } else if (riskAnalysis.riskLevel === 'LOW') {
      riskTolerance = 'aggressive'
    }
    
    // Generate full projection
    const baseProjectionResult = this.calculateRiskAdjustedProjection(
      { ...player, position: 'RB' },
      gameStats,
      riskTolerance
    )
    
    // Override with our calculated adjusted points
    return {
      ...baseProjectionResult,
      projected_fantasy_points: adjustedPoints,
      projected_fantasy_points_ppr: adjustedPoints,
      projected_fantasy_points_half_ppr: adjustedPoints * 0.95,
      projected_fantasy_points_standard: adjustedPoints * 0.85, // RBs less dependent on receptions
      confidence_score: riskAnalysis.confidence * 100
    }
  }

  /**
   * RB Aging Curve - Critical age thresholds based on 2008 research
   */
  private calculateRBAgeAdjustment(age: number): number {
    if (age <= 22) {
      // Rookie/young RBs - potential but inconsistent
      return 0.85
    } else if (age >= 24 && age <= 25) {
      // EXPLOSIVE GROWTH PHASE - Key research finding
      return 1.10 + (age - 24) * 0.03 // 110% to 113%
    } else if (age <= 27) {
      // Prime years
      return 1.08 - (age - 25) * 0.02 // 113% to 104%
    } else if (age === 28) {
      // Beginning of decline
      return 1.02
    } else if (age >= 29 && age <= 30) {
      // THE WALL - Massive decline per research
      const wallDecline = age === 29 ? 0.84 : 0.76 // -16% to -24%
      return wallDecline
    } else if (age <= 32) {
      // Continued steep decline
      return 0.70 - (age - 30) * 0.05
    } else {
      // Veteran cliff
      return Math.max(0.50, 0.65 - (age - 32) * 0.08)
    }
  }

  /**
   * RB Experience Progression Model
   */
  private calculateRBExperienceAdjustment(yearsPro: number): number {
    if (yearsPro === 0) {
      // Rookie season - typically lower usage
      return 0.75
    } else if (yearsPro === 1) {
      // Second year - often breakout potential
      return 0.95
    } else if (yearsPro === 2) {
      // Third year - peak development
      return 1.05
    } else if (yearsPro <= 5) {
      // Prime years
      return 1.03
    } else if (yearsPro <= 7) {
      // Veteran experience but physical decline
      return 1.00
    } else {
      // Veteran decline
      return 0.95 - (yearsPro - 7) * 0.02
    }
  }

  /**
   * Workload Impact Analysis - Critical for RB projections
   */
  private calculateWorkloadImpact(gameStats: any[]): number {
    if (gameStats.length === 0) return 1.0
    
    // Calculate average carries per game
    const totalCarries = gameStats.reduce((sum, game) => sum + (game.rushing_attempts || 0), 0)
    const avgCarries = totalCarries / gameStats.length
    const projectedSeasonCarries = avgCarries * 17 // 17-game season
    
    // Research shows 250+ carries significantly increases injury risk
    if (projectedSeasonCarries >= 300) {
      return 0.85 // High injury risk
    } else if (projectedSeasonCarries >= 250) {
      return 0.92 // Moderate injury risk
    } else if (projectedSeasonCarries >= 200) {
      return 1.0 // Optimal workload
    } else if (projectedSeasonCarries >= 150) {
      return 0.95 // Light workload
    } else {
      return 0.80 // Very low usage
    }
  }

  /**
   * RB-Specific Positional Factors
   */
  private calculateRBPositionalFactors(player: NFLPlayer, gameStats: any[]): number {
    let adjustment = 1.0
    
    // Goal line usage factor
    const goalLineUsage = this.calculateGoalLineUsage(gameStats)
    adjustment *= (0.85 + goalLineUsage * 0.3) // 85% to 115%
    
    // Pass-catching ability
    const passCatchingRole = this.calculatePassCatchingRole(gameStats)
    adjustment *= (0.9 + passCatchingRole * 0.2) // 90% to 110%
    
    // Team run-blocking strength (simplified)
    const teamStrength = this.estimateRunBlockingStrength(player.nfl_team)
    adjustment *= teamStrength
    
    // Backfield competition
    const competitionFactor = this.assessBackfieldCompetition(player.nfl_team)
    adjustment *= competitionFactor
    
    return Math.max(0.7, Math.min(1.4, adjustment)) // Cap between 70% and 140%
  }

  /**
   * RB Risk Factor Analysis
   */
  private calculateRBRiskFactors(player: NFLPlayer, gameStats: any[], projectedPoints: number, age: number): {
    riskLevel: RiskLevel
    confidence: number
    factors: string[]
  } {
    const riskFactors: string[] = []
    let riskScore = 0
    
    // Age-based risk (most critical for RBs)
    if (age >= 29) {
      riskFactors.push('Age 29+ cliff risk')
      riskScore += 20
    } else if (age >= 28) {
      riskFactors.push('Entering decline phase')
      riskScore += 12
    } else if (age <= 22) {
      riskFactors.push('Young RB inconsistency')
      riskScore += 8
    }
    
    // Workload risk
    if (gameStats.length > 0) {
      const avgCarries = gameStats.reduce((sum, game) => sum + (game.rushing_attempts || 0), 0) / gameStats.length
      if (avgCarries * 17 >= 300) {
        riskFactors.push('Excessive workload injury risk')
        riskScore += 15
      } else if (avgCarries * 17 <= 100) {
        riskFactors.push('Limited usage uncertainty')
        riskScore += 10
      }
    }
    
    // Injury status
    if (player.injury_status !== 'HEALTHY') {
      riskFactors.push('Current injury concerns')
      riskScore += 12
    }
    
    // Touch volatility
    const touchVolatility = this.calculateTouchVolatility(gameStats)
    if (touchVolatility > 0.3) {
      riskFactors.push('Inconsistent usage patterns')
      riskScore += 8
    }
    
    // Backfield competition
    const competition = this.assessBackfieldCompetition(player.nfl_team)
    if (competition < 0.8) {
      riskFactors.push('Significant backfield competition')
      riskScore += 10
    }
    
    // Experience risk
    const yearsPro = player.years_pro || 0
    if (yearsPro === 0) {
      riskFactors.push('Rookie season volatility')
      riskScore += 10
    }
    
    // Determine risk level and confidence
    let riskLevel: RiskLevel
    let confidence: number
    
    if (riskScore >= 30) {
      riskLevel = 'HIGH'
      confidence = 0.60
    } else if (riskScore >= 18) {
      riskLevel = 'MEDIUM'
      confidence = 0.72
    } else {
      riskLevel = 'LOW'
      confidence = 0.85
    }
    
    return { riskLevel, confidence, factors: riskFactors }
  }

  /**
   * Calculate goal line usage percentage
   */
  private calculateGoalLineUsage(gameStats: any[]): number {
    if (gameStats.length === 0) return 0.5
    
    const goalLineCarries = gameStats.reduce((sum, game) => sum + (game.goal_line_carries || 0), 0)
    const totalTDs = gameStats.reduce((sum, game) => sum + (game.rushing_tds || 0), 0)
    
    if (totalTDs === 0) return 0.3
    
    return Math.min(1, goalLineCarries / (totalTDs * 1.5)) // Estimate
  }

  /**
   * Calculate pass-catching role
   */
  private calculatePassCatchingRole(gameStats: any[]): number {
    if (gameStats.length === 0) return 0.3
    
    const avgReceptions = gameStats.reduce((sum, game) => sum + (game.receptions || 0), 0) / gameStats.length
    const avgTargets = gameStats.reduce((sum, game) => sum + (game.targets || 0), 0) / gameStats.length
    
    // Normalize to 0-1 scale
    return Math.min(1, (avgReceptions + avgTargets * 0.8) / 10)
  }

  /**
   * Calculate touch volatility (carries + targets)
   */
  private calculateTouchVolatility(gameStats: any[]): number {
    if (gameStats.length < 4) return 0.4
    
    const touches = gameStats.map(game => (game.rushing_attempts || 0) + (game.targets || 0))
    const mean = touches.reduce((sum, t) => sum + t, 0) / touches.length
    
    if (mean === 0) return 0.5
    
    const variance = touches.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / touches.length
    return Math.sqrt(variance) / mean
  }

  /**
   * Estimate run blocking strength
   */
  private estimateRunBlockingStrength(team: string): number {
    // Placeholder - would use real offensive line rankings
    const strongRunBlockers = ['SF', 'PHI', 'CLE', 'DAL', 'BUF', 'MIA', 'GB']
    const weakRunBlockers = ['CHI', 'CAR', 'HOU', 'NYG', 'LV', 'ARI', 'SEA']
    
    if (strongRunBlockers.includes(team)) return 1.10
    if (weakRunBlockers.includes(team)) return 0.90
    return 1.0
  }

  /**
   * Assess backfield competition
   */
  private assessBackfieldCompetition(team: string): number {
    // Placeholder - would use real depth chart analysis
    const heavyCompetition = ['SF', 'DET', 'LAR', 'NE', 'BAL', 'TB']
    const clearStarters = ['CMC', 'Henry', 'Chubb', 'Cook'] // Player-specific would be better
    
    if (heavyCompetition.includes(team)) return 0.75
    return 0.95
  }
} 