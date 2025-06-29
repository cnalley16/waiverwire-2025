import { ProjectionEngine } from './base-projections'
import { NFLPlayer, PlayerProjection, RiskLevel } from '@/src/types/database'

/**
 * WR Projections Engine - Based on 2008 Research
 * Key Findings:
 * - Peak performance around age 27
 * - Two-season basis required for reliable projections
 * - Quarterback changes significantly impact production
 * - Target share is the most predictive metric
 * - Red zone targets critical for TD production
 * - Rookie WRs typically struggle in Year 1
 */
export class WRProjections extends ProjectionEngine {
  
  /**
   * Calculate WR-specific projection with aging curves and target analysis
   */
  calculateWRProjection(player: NFLPlayer, gameStats: any[] = []): PlayerProjection {
    const baseProjection = this.calculateExpectedPoints(player, gameStats)
    const playerAge = player.age ?? 25 // Default to 25 if age is null
    const ageAdjustment = this.calculateWRAgeAdjustment(playerAge)
    const experienceAdjustment = this.calculateWRExperienceAdjustment(player.years_pro || 0)
    const targetShareAdjustment = this.calculateTargetShareImpact(gameStats)
    const qbStabilityAdjustment = this.calculateQBStabilityImpact(player.nfl_team)
    const positionAdjustment = this.calculateWRPositionalFactors(player, gameStats)
    
    // Apply all adjustments
    const adjustedPoints = baseProjection * ageAdjustment * experienceAdjustment * 
                          targetShareAdjustment * qbStabilityAdjustment * positionAdjustment
    
    // Calculate WR-specific risk factors
    const riskAnalysis = this.calculateWRRiskFactors(player, gameStats, adjustedPoints, playerAge)
    
    // Determine risk tolerance based on risk analysis
    let riskTolerance: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
    if (riskAnalysis.riskLevel === 'HIGH') {
      riskTolerance = 'conservative'
    } else if (riskAnalysis.riskLevel === 'LOW') {
      riskTolerance = 'aggressive'
    }
    
    // Generate full projection
    const baseProjectionResult = this.calculateRiskAdjustedProjection(
      { ...player, position: 'WR' },
      gameStats,
      riskTolerance
    )
    
    // Override with our calculated adjusted points (WRs heavily benefit from PPR)
    return {
      ...baseProjectionResult,
      projected_fantasy_points: adjustedPoints,
      projected_fantasy_points_ppr: adjustedPoints,
      projected_fantasy_points_half_ppr: adjustedPoints * 0.9,
      projected_fantasy_points_standard: adjustedPoints * 0.75, // WRs very dependent on receptions
      confidence_score: riskAnalysis.confidence * 100
    }
  }

  /**
   * WR Aging Curve - Peak around age 27
   */
  private calculateWRAgeAdjustment(age: number): number {
    if (age <= 22) {
      // Young WRs - learning curve and inconsistent targets
      return 0.78 + (age - 21) * 0.06 // 78% to 84%
    } else if (age <= 24) {
      // Development phase
      return 0.84 + (age - 22) * 0.05 // 84% to 94%
    } else if (age <= 27) {
      // Approaching and at peak
      return 0.94 + (age - 24) * 0.04 // 94% to 106%
    } else if (age <= 29) {
      // Peak years - research shows age 27 optimal
      return 1.06 - (age - 27) * 0.02 // 106% to 102%
    } else if (age <= 32) {
      // Gradual decline
      return 1.02 - (age - 29) * 0.03 // 102% to 93%
    } else if (age <= 35) {
      // Steeper decline
      return 0.93 - (age - 32) * 0.05 // 93% to 78%
    } else {
      // Veteran cliff
      return Math.max(0.60, 0.78 - (age - 35) * 0.08)
    }
  }

  /**
   * WR Experience Progression Model
   */
  private calculateWRExperienceAdjustment(yearsPro: number): number {
    if (yearsPro === 0) {
      // Rookie year - notoriously difficult for WRs
      return 0.65
    } else if (yearsPro === 1) {
      // Sophomore year - often breakout potential
      return 0.85
    } else if (yearsPro === 2) {
      // Third year - typically when WRs hit stride
      return 1.05
    } else if (yearsPro <= 6) {
      // Prime years
      return 1.08 - (yearsPro - 2) * 0.01 // 105% to 104%
    } else if (yearsPro <= 10) {
      // Veteran experience plateau
      return 1.02
    } else {
      // Veteran decline
      return 1.02 - (yearsPro - 10) * 0.02
    }
  }

  /**
   * Target Share Impact - Most critical WR metric per research
   */
  private calculateTargetShareImpact(gameStats: any[]): number {
    if (gameStats.length === 0) return 0.9 // Conservative without data
    
    const avgTargets = gameStats.reduce((sum, game) => sum + (game.targets || 0), 0) / gameStats.length
    const avgTeamPassAttempts = 35 // League average assumption
    const targetShare = avgTargets / avgTeamPassAttempts
    
    // Target share thresholds based on research
    if (targetShare >= 0.25) {
      return 1.15 // Elite target share (25%+)
    } else if (targetShare >= 0.20) {
      return 1.08 // High target share (20-25%)
    } else if (targetShare >= 0.15) {
      return 1.0 // Solid target share (15-20%)
    } else if (targetShare >= 0.10) {
      return 0.90 // Low target share (10-15%)
    } else {
      return 0.75 // Very low usage (<10%)
    }
  }

  /**
   * QB Stability Impact - Major factor per research
   */
  private calculateQBStabilityImpact(team: string): number {
    // Assess QB situation stability
    const stableQBSituations = ['KC', 'BUF', 'BAL', 'LAR', 'GB', 'SEA', 'DAL', 'PHI']
    const unstableQBSituations = ['CHI', 'WAS', 'CAR', 'NYJ', 'LV', 'DEN', 'NE']
    const newQBSituations = ['MIN', 'ATL', 'PIT'] // New starter or questions
    
    if (stableQBSituations.includes(team)) {
      return 1.05 // Benefit from stable QB play
    } else if (unstableQBSituations.includes(team)) {
      return 0.85 // Penalty for QB uncertainty
    } else if (newQBSituations.includes(team)) {
      return 0.90 // Moderate penalty for new QB
    } else {
      return 0.95 // Slight penalty for average stability
    }
  }

  /**
   * WR-Specific Positional Factors
   */
  private calculateWRPositionalFactors(player: NFLPlayer, gameStats: any[]): number {
    let adjustment = 1.0
    
    // Red zone target share
    const redZoneTargets = this.calculateRedZoneTargetShare(gameStats)
    adjustment *= (0.85 + redZoneTargets * 0.25) // 85% to 110%
    
    // Air yards and depth of target
    const averageDepthOfTarget = this.calculateAverageDepthOfTarget(gameStats)
    adjustment *= this.getDepthOfTargetAdjustment(averageDepthOfTarget)
    
    // Slot vs outside usage
    const slotUsage = this.estimateSlotUsage(gameStats)
    adjustment *= this.getSlotUsageAdjustment(slotUsage)
    
    // Team passing volume
    const passingVolume = this.estimateTeamPassingVolume(player.nfl_team)
    adjustment *= passingVolume
    
    return Math.max(0.75, Math.min(1.35, adjustment)) // Cap between 75% and 135%
  }

  /**
   * WR Risk Factor Analysis
   */
  private calculateWRRiskFactors(player: NFLPlayer, gameStats: any[], projectedPoints: number, age: number): {
    riskLevel: RiskLevel
    confidence: number
    factors: string[]
  } {
    const riskFactors: string[] = []
    let riskScore = 0
    
    // Age-based risk
    if (age >= 33) {
      riskFactors.push('Advanced age decline risk')
      riskScore += 12
    } else if (age <= 22) {
      riskFactors.push('Young WR development risk')
      riskScore += 15
    }
    
    // Experience risk - critical for WRs
    const yearsPro = player.years_pro || 0
    if (yearsPro === 0) {
      riskFactors.push('Rookie WR volatility')
      riskScore += 18 // Higher than other positions
    } else if (yearsPro === 1) {
      riskFactors.push('Sophomore WR uncertainty')
      riskScore += 8
    }
    
    // Target volatility
    if (gameStats.length > 0) {
      const targetVolatility = this.calculateTargetVolatility(gameStats)
      if (targetVolatility > 0.35) {
        riskFactors.push('Inconsistent target allocation')
        riskScore += 10
      }
    }
    
    // QB situation risk
    const qbRisk = this.assessQBSituationRisk(player.nfl_team)
    if (qbRisk > 0.5) {
      riskFactors.push('QB situation uncertainty')
      riskScore += 12
    }
    
    // Injury status
    if (player.injury_status !== 'HEALTHY') {
      riskFactors.push('Current injury concerns')
      riskScore += 8
    }
    
    // Competition risk
    const competitionLevel = this.assessWRRoomCompetition(player.nfl_team)
    if (competitionLevel > 0.7) {
      riskFactors.push('High WR room competition')
      riskScore += 7
    }
    
    // Data quality risk (2-season requirement per research)
    if (gameStats.length < 16) {
      riskFactors.push('Limited historical data')
      riskScore += 8
    }
    
    // TD dependency risk
    const tdDependency = this.calculateTDDependency(gameStats)
    if (tdDependency > 0.4) {
      riskFactors.push('High TD dependency')
      riskScore += 6
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
   * Calculate target volatility
   */
  private calculateTargetVolatility(gameStats: any[]): number {
    if (gameStats.length < 4) return 0.4
    
    const targets = gameStats.map(game => game.targets || 0)
    const mean = targets.reduce((sum, t) => sum + t, 0) / targets.length
    
    if (mean === 0) return 0.5
    
    const variance = targets.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / targets.length
    return Math.sqrt(variance) / mean
  }

  /**
   * Calculate red zone target share
   */
  private calculateRedZoneTargetShare(gameStats: any[]): number {
    if (gameStats.length === 0) return 0.3
    
    const redZoneTargets = gameStats.reduce((sum, game) => sum + (game.red_zone_targets || 0), 0)
    const totalTargets = gameStats.reduce((sum, game) => sum + (game.targets || 0), 0)
    
    if (totalTargets === 0) return 0.2
    
    return Math.min(1, redZoneTargets / totalTargets)
  }

  /**
   * Calculate average depth of target
   */
  private calculateAverageDepthOfTarget(gameStats: any[]): number {
    if (gameStats.length === 0) return 8.0 // League average
    
    const totalAirYards = gameStats.reduce((sum, game) => sum + (game.air_yards || 0), 0)
    const totalTargets = gameStats.reduce((sum, game) => sum + (game.targets || 0), 0)
    
    if (totalTargets === 0) return 8.0
    
    return totalAirYards / totalTargets
  }

  /**
   * Get depth of target adjustment
   */
  private getDepthOfTargetAdjustment(averageDepth: number): number {
    if (averageDepth >= 12) {
      return 1.05 // Deep threat bonus
    } else if (averageDepth >= 8) {
      return 1.0 // Average depth
    } else if (averageDepth >= 5) {
      return 0.95 // Short routes
    } else {
      return 0.90 // Very short targets
    }
  }

  /**
   * Estimate slot usage percentage
   */
  private estimateSlotUsage(gameStats: any[]): number {
    // Placeholder - would use real snap data
    // For now, estimate based on reception patterns
    if (gameStats.length === 0) return 0.5
    
    const avgReceptions = gameStats.reduce((sum, game) => sum + (game.receptions || 0), 0) / gameStats.length
    const avgTargets = gameStats.reduce((sum, game) => sum + (game.targets || 0), 0) / gameStats.length
    
    const catchRate = avgTargets > 0 ? avgReceptions / avgTargets : 0.6
    
    // Higher catch rates often indicate more slot usage
    return Math.min(1, catchRate + 0.2)
  }

  /**
   * Get slot usage adjustment
   */
  private getSlotUsageAdjustment(slotPercentage: number): number {
    // Slot receivers often have higher floor but lower ceiling
    if (slotPercentage >= 0.7) {
      return 0.98 // High slot usage - consistent but limited upside
    } else if (slotPercentage >= 0.4) {
      return 1.02 // Mixed usage - ideal
    } else {
      return 1.0 // Outside receiver
    }
  }

  /**
   * Estimate team passing volume
   */
  private estimateTeamPassingVolume(team: string): number {
    const highPassingTeams = ['KC', 'BUF', 'CIN', 'LAC', 'MIA', 'TB', 'LV']
    const lowPassingTeams = ['SF', 'BAL', 'CHI', 'NYG', 'CAR', 'TEN', 'HOU']
    
    if (highPassingTeams.includes(team)) return 1.08
    if (lowPassingTeams.includes(team)) return 0.92
    return 1.0
  }

  /**
   * Assess QB situation risk
   */
  private assessQBSituationRisk(team: string): number {
    const unstableQBSituations = ['CHI', 'WAS', 'CAR', 'NYJ', 'LV', 'DEN', 'NE']
    const questionableQBSituations = ['MIN', 'ATL', 'PIT', 'IND']
    
    if (unstableQBSituations.includes(team)) return 0.8
    if (questionableQBSituations.includes(team)) return 0.6
    return 0.3
  }

  /**
   * Assess WR room competition
   */
  private assessWRRoomCompetition(team: string): number {
    const heavyCompetition = ['SF', 'MIA', 'TB', 'CIN', 'LAR', 'DET']
    const moderateCompetition = ['KC', 'BUF', 'DAL', 'PHI', 'GB']
    
    if (heavyCompetition.includes(team)) return 0.8
    if (moderateCompetition.includes(team)) return 0.6
    return 0.4
  }

  /**
   * Calculate TD dependency
   */
  private calculateTDDependency(gameStats: any[]): number {
    if (gameStats.length === 0) return 0.3
    
    const totalTDs = gameStats.reduce((sum, game) => sum + (game.receiving_tds || 0), 0)
    const totalReceptions = gameStats.reduce((sum, game) => sum + (game.receptions || 0), 0)
    
    if (totalReceptions === 0) return 0.5
    
    // Higher TD rate = higher dependency
    return Math.min(1, (totalTDs / totalReceptions) * 10)
  }
} 