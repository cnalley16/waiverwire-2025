import { ProjectionEngine } from './base-projections'
import { NFLPlayer, PlayerProjection, RiskLevel } from '@/src/types/database'

/**
 * TE Projections Engine - Based on 2008 Research
 * Key Findings:
 * - Steady progression through year 6 (longer development than WRs)
 * - Peak years 28-31 (later than other skill positions)
 * - Lower volatility but also lower ceiling than WRs
 * - Red zone usage more predictive than overall targets
 * - Blocking responsibilities affect fantasy usage
 * - Position scarcity creates value concentration
 */
export class TEProjections extends ProjectionEngine {
  
  calculateTEProjection(player: NFLPlayer, gameStats: any[] = []): PlayerProjection {
    const baseProjection = this.calculateExpectedPoints(player, gameStats)
    const playerAge = player.age ?? 26
    const ageAdjustment = this.calculateTEAgeAdjustment(playerAge)
    const experienceAdjustment = this.calculateTEExperienceAdjustment(player.years_pro || 0)
    
    const adjustedPoints = baseProjection * ageAdjustment * experienceAdjustment
    
    const riskAnalysis = this.calculateTERiskFactors(player, gameStats, adjustedPoints, playerAge)
    
    let riskTolerance: 'conservative' | 'moderate' | 'aggressive' = 'moderate'
    if (riskAnalysis.riskLevel === 'HIGH') {
      riskTolerance = 'conservative'
    } else if (riskAnalysis.riskLevel === 'LOW') {
      riskTolerance = 'aggressive'
    }
    
    const baseProjectionResult = this.calculateRiskAdjustedProjection(
      { ...player, position: 'TE' },
      gameStats,
      riskTolerance
    )
    
    return {
      ...baseProjectionResult,
      projected_fantasy_points: adjustedPoints,
      projected_fantasy_points_ppr: adjustedPoints,
      projected_fantasy_points_half_ppr: adjustedPoints * 0.92,
      projected_fantasy_points_standard: adjustedPoints * 0.80,
      confidence_score: riskAnalysis.confidence * 100
    }
  }

  private calculateTEAgeAdjustment(age: number): number {
    if (age <= 25) return 0.80
    if (age <= 31) return 1.04
    if (age <= 37) return 0.95
    return 0.75
  }

  private calculateTEExperienceAdjustment(yearsPro: number): number {
    if (yearsPro === 0) return 0.60
    if (yearsPro <= 6) return 0.90 + (yearsPro * 0.02)
    if (yearsPro <= 10) return 1.02
    return 1.00
  }

  private calculateTERiskFactors(player: NFLPlayer, gameStats: any[], projectedPoints: number, age: number): {
    riskLevel: RiskLevel
    confidence: number
    factors: string[]
  } {
    const riskFactors: string[] = []
    let riskScore = 0
    
    if (age >= 35) {
      riskFactors.push('Advanced age for TE')
      riskScore += 10
    } else if (age <= 24) {
      riskFactors.push('Young TE development uncertainty')
      riskScore += 12
    }
    
    const yearsPro = player.years_pro || 0
    if (yearsPro === 0) {
      riskFactors.push('Rookie TE learning curve')
      riskScore += 15
    }
    
    let riskLevel: RiskLevel
    let confidence: number
    
    if (riskScore >= 22) {
      riskLevel = 'HIGH'
      confidence = 0.68
    } else if (riskScore >= 12) {
      riskLevel = 'MEDIUM'
      confidence = 0.78
    } else {
      riskLevel = 'LOW'
      confidence = 0.88
    }
    
    return { riskLevel, confidence, factors: riskFactors }
  }
} 