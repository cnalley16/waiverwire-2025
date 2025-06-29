import { ProjectionEngine } from './base-projections'
import { NFLPlayer, PlayerProjection, RiskLevel } from '@/src/types/database'

/**
 * QB Projections Engine - Based on 2008 Research
 * Key Findings:
 * - Peak performance years: 27-32
 * - Rapid decline after age 33
 * - Rookie QBs typically underperform in Year 1
 * - Significant improvement in Years 2-3
 * - Passing TD variability is highest risk factor
 */
export class QBProjections extends ProjectionEngine {
  
  /**
   * Calculate QB-specific projection with aging curves
   */
  calculateQBProjection(player: NFLPlayer, gameStats: any[] = []): PlayerProjection {
    const baseProjection = this.calculateExpectedPoints(player, gameStats)
    const playerAge = player.age ?? 25 // Default to 25 if age is null
    const ageAdjustment = this.calculateQBAgeAdjustment(playerAge)
    const experienceAdjustment = this.calculateQBExperienceAdjustment(player.years_pro || 0)
    const positionAdjustment = this.calculateQBPositionalFactors(player, gameStats)
    
    // Apply all adjustments
    const adjustedPoints = baseProjection * ageAdjustment * experienceAdjustment * positionAdjustment
    
    // Calculate QB-specific risk factors
    const riskAnalysis = this.calculateQBRiskFactors(player, gameStats, adjustedPoints, playerAge)
    
    // Determine risk tolerance based on risk analysis
    let riskTolerance: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
    if (riskAnalysis.riskLevel === 'HIGH') {
      riskTolerance = 'conservative'
    } else if (riskAnalysis.riskLevel === 'LOW') {
      riskTolerance = 'aggressive'
    }
    
    // Generate full projection
    const baseProjectionResult = this.calculateRiskAdjustedProjection(
      { ...player, position: 'QB' },
      gameStats,
      riskTolerance
    )
    
    // Override with our calculated adjusted points
    return {
      ...baseProjectionResult,
      projected_fantasy_points: adjustedPoints,
      projected_fantasy_points_ppr: adjustedPoints,
      projected_fantasy_points_half_ppr: adjustedPoints * 0.95,
      projected_fantasy_points_standard: adjustedPoints * 0.90,
      confidence_score: riskAnalysis.confidence * 100
    }
  }

  /**
   * QB Aging Curve - Peak years 27-32
   */
  private calculateQBAgeAdjustment(age: number): number {
    if (age <= 23) {
      // Young QBs - steep learning curve
      return 0.75 + (age - 21) * 0.08 // 75% to 91%
    } else if (age <= 26) {
      // Pre-peak development
      return 0.91 + (age - 23) * 0.03 // 91% to 100%
    } else if (age <= 32) {
      // Peak years - research shows consistent performance
      return 1.0 + Math.sin((age - 27) * Math.PI / 10) * 0.05 // 100% to 105%
    } else if (age <= 35) {
      // Gradual decline
      return 1.05 - (age - 32) * 0.04 // 105% to 93%
    } else {
      // Steep decline after 35
      return 0.93 - (age - 35) * 0.08 // 93% down
    }
  }

  /**
   * QB Experience Progression Model
   */
  private calculateQBExperienceAdjustment(yearsPro: number): number {
    if (yearsPro === 0) {
      // Rookie year - typically struggle
      return 0.70
    } else if (yearsPro === 1) {
      // Sophomore improvement
      return 0.85
    } else if (yearsPro === 2) {
      // Year 3 breakout potential
      return 0.95
    } else if (yearsPro <= 5) {
      // Continued development
      return 0.95 + (yearsPro - 2) * 0.02 // 95% to 101%
    } else if (yearsPro <= 10) {
      // Prime years
      return 1.01
    } else {
      // Veteran decline
      return 1.01 - (yearsPro - 10) * 0.015 // Gradual decline
    }
  }

  /**
   * QB-Specific Positional Factors
   */
  private calculateQBPositionalFactors(player: NFLPlayer, gameStats: any[]): number {
    let adjustment = 1.0
    
    // Team offensive strength (placeholder - would use real data)
    const teamStrength = this.estimateTeamOffensiveStrength(player.nfl_team)
    adjustment *= teamStrength
    
    // Red zone efficiency factor
    const redZoneEfficiency = this.calculateRedZoneEfficiency(gameStats)
    adjustment *= (0.9 + redZoneEfficiency * 0.2) // 90% to 110%
    
    // Passing volume adjustment
    const passingVolume = this.calculatePassingVolume(gameStats)
    adjustment *= (0.95 + passingVolume * 0.1) // 95% to 105%
    
    return Math.max(0.8, Math.min(1.3, adjustment)) // Cap between 80% and 130%
  }

  /**
   * QB Risk Factor Analysis
   */
  private calculateQBRiskFactors(player: NFLPlayer, gameStats: any[], projectedPoints: number, age: number): {
    riskLevel: RiskLevel
    confidence: number
    factors: string[]
  } {
    const riskFactors: string[] = []
    let riskScore = 0
    
    // Age-based risk
    if (age >= 35) {
      riskFactors.push('Advanced age decline risk')
      riskScore += 15
    } else if (age <= 23) {
      riskFactors.push('Rookie/young QB volatility')
      riskScore += 10
    }
    
    // Experience risk
    const yearsPro = player.years_pro || 0
    if (yearsPro <= 1) {
      riskFactors.push('Limited NFL experience')
      riskScore += 12
    }
    
    // Historical performance volatility
    if (gameStats.length > 0) {
      const volatility = this.calculatePassingVolatility(gameStats)
      if (volatility > 0.25) {
        riskFactors.push('High passing TD variance')
        riskScore += 8
      }
    }
    
    // Injury history
    if (player.injury_status !== 'HEALTHY') {
      riskFactors.push('Current injury concerns')
      riskScore += 10
    }
    
    // Team stability (simplified)
    const teamRisk = this.assessTeamStability(player.nfl_team)
    if (teamRisk > 0.5) {
      riskFactors.push('Team/coaching instability')
      riskScore += 7
    }
    
    // Determine risk level and confidence
    let riskLevel: RiskLevel
    let confidence: number
    
    if (riskScore >= 25) {
      riskLevel = 'HIGH'
      confidence = 0.65
    } else if (riskScore >= 15) {
      riskLevel = 'MEDIUM'
      confidence = 0.75
    } else {
      riskLevel = 'LOW'
      confidence = 0.85
    }
    
    return { riskLevel, confidence, factors: riskFactors }
  }

  /**
   * Calculate passing touchdown volatility - key QB risk metric
   */
  private calculatePassingVolatility(gameStats: any[]): number {
    if (gameStats.length < 4) return 0.3 // High uncertainty with limited data
    
    const passingTDs = gameStats.map(game => game.passing_tds || 0)
    const mean = passingTDs.reduce((sum, tds) => sum + tds, 0) / passingTDs.length
    
    if (mean === 0) return 0.4 // High volatility if no TDs
    
    const variance = passingTDs.reduce((sum, tds) => sum + Math.pow(tds - mean, 2), 0) / passingTDs.length
    return Math.sqrt(variance) / mean // Coefficient of variation
  }

  /**
   * Estimate team offensive strength impact
   */
  private estimateTeamOffensiveStrength(team: string): number {
    // Placeholder - in production, use real offensive rankings
    const strongOffenses = ['KC', 'BUF', 'CIN', 'PHI', 'DAL', 'SF', 'MIA']
    const weakOffenses = ['CHI', 'WAS', 'CAR', 'NE', 'NYJ', 'LV', 'DEN']
    
    if (strongOffenses.includes(team)) return 1.08
    if (weakOffenses.includes(team)) return 0.92
    return 1.0
  }

  /**
   * Calculate red zone efficiency factor
   */
  private calculateRedZoneEfficiency(gameStats: any[]): number {
    if (gameStats.length === 0) return 0.5 // Average
    
    // Simplified red zone efficiency calculation
    const redZoneOpportunities = gameStats.reduce((sum, game) => {
      return sum + (game.red_zone_attempts || 0)
    }, 0)
    
    const redZoneTDs = gameStats.reduce((sum, game) => {
      return sum + (game.red_zone_tds || 0)
    }, 0)
    
    if (redZoneOpportunities === 0) return 0.5
    
    const efficiency = redZoneTDs / redZoneOpportunities
    return Math.max(0, Math.min(1, efficiency))
  }

  /**
   * Calculate passing volume factor
   */
  private calculatePassingVolume(gameStats: any[]): number {
    if (gameStats.length === 0) return 0.5
    
    const avgAttempts = gameStats.reduce((sum, game) => {
      return sum + (game.passing_attempts || 0)
    }, 0) / gameStats.length
    
    // Normalize around 35 attempts per game
    return Math.max(0, Math.min(1, (avgAttempts - 20) / 30))
  }

  /**
   * Assess team stability risk
   */
  private assessTeamStability(team: string): number {
    // Placeholder - would use real coaching/system stability data
    const unstableTeams = ['CHI', 'WAS', 'CAR', 'LV', 'NYJ']
    return unstableTeams.includes(team) ? 0.7 : 0.3
  }
} 