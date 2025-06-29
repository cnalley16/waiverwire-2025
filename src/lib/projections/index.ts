// Export base projection engine
export { ProjectionEngine } from './base-projections'
export type { ProjectionOptions, PositionBaselines } from './base-projections'

// Export position-specific projection engines
export { QBProjections } from './qb-projections'
export { RBProjections } from './rb-projections'
export { WRProjections } from './wr-projections'
export { TEProjections } from './te-projections'

// Master projection engine that delegates to position-specific engines
import { ProjectionEngine } from './base-projections'
import { QBProjections } from './qb-projections'
import { RBProjections } from './rb-projections'
import { WRProjections } from './wr-projections'
import { TEProjections } from './te-projections'
import { NFLPlayer, PlayerProjection } from '@/src/types/database'

/**
 * Master Projection Engine - Routes to Position-Specific Engines
 * Implements 2008 Research Methodologies
 */
export class MasterProjectionEngine {
  private qbEngine: QBProjections
  private rbEngine: RBProjections
  private wrEngine: WRProjections
  private teEngine: TEProjections
  private baseEngine: ProjectionEngine

  constructor() {
    this.qbEngine = new QBProjections()
    this.rbEngine = new RBProjections()
    this.wrEngine = new WRProjections()
    this.teEngine = new TEProjections()
    this.baseEngine = new ProjectionEngine()
  }

  /**
   * Generate projection for any player using position-specific engine
   */
  generateProjection(player: NFLPlayer, gameStats: any[] = []): PlayerProjection {
    switch (player.position) {
      case 'QB':
        return this.qbEngine.calculateQBProjection(player, gameStats)
      case 'RB':
        return this.rbEngine.calculateRBProjection(player, gameStats)
      case 'WR':
        return this.wrEngine.calculateWRProjection(player, gameStats)
      case 'TE':
        return this.teEngine.calculateTEProjection(player, gameStats)
      case 'K':
      case 'DEF':
        // Use base engine for K/DEF (less complex positions)
        return this.baseEngine.calculateRiskAdjustedProjection(player, gameStats)
      default:
        throw new Error(`Unsupported position: ${player.position}`)
    }
  }

  /**
   * Generate projections for multiple players
   */
  generateBatchProjections(players: NFLPlayer[], gameStatsMap: Record<string, any[]> = {}): PlayerProjection[] {
    return players.map(player => {
      const playerGameStats = gameStatsMap[player.id] || []
      return this.generateProjection(player, playerGameStats)
    })
  }

  /**
   * Get position-specific insights for a player
   */
  getPositionInsights(player: NFLPlayer, gameStats: any[] = []): {
    ageFactor: string
    experienceFactor: string
    riskFactors: string[]
    keyMetrics: string[]
  } {
    const playerAge = player.age ?? 25
    const yearsPro = player.years_pro || 0

    switch (player.position) {
      case 'QB':
        return {
          ageFactor: this.getQBAgeInsight(playerAge),
          experienceFactor: this.getQBExperienceInsight(yearsPro),
          riskFactors: this.getQBRiskInsights(player, gameStats),
          keyMetrics: ['Passing TDs', 'Target Share', 'Red Zone Efficiency', 'Team Stability']
        }
      case 'RB':
        return {
          ageFactor: this.getRBAgeInsight(playerAge),
          experienceFactor: this.getRBExperienceInsight(yearsPro),
          riskFactors: this.getRBRiskInsights(player, gameStats),
          keyMetrics: ['Workload', 'Goal Line Carries', 'Pass Catching', 'Team Run Blocking']
        }
      case 'WR':
        return {
          ageFactor: this.getWRAgeInsight(playerAge),
          experienceFactor: this.getWRExperienceInsight(yearsPro),
          riskFactors: this.getWRRiskInsights(player, gameStats),
          keyMetrics: ['Target Share', 'Red Zone Targets', 'QB Stability', 'Air Yards']
        }
      case 'TE':
        return {
          ageFactor: this.getTEAgeInsight(playerAge),
          experienceFactor: this.getTEExperienceInsight(yearsPro),
          riskFactors: this.getTERiskInsights(player, gameStats),
          keyMetrics: ['Red Zone Usage', 'Slot vs Inline', 'Blocking Load', 'Team System Fit']
        }
      default:
        return {
          ageFactor: 'Standard aging curve',
          experienceFactor: 'Standard experience progression',
          riskFactors: ['Position-specific analysis not available'],
          keyMetrics: ['Standard fantasy metrics']
        }
    }
  }

  // Age insight helpers
  private getQBAgeInsight(age: number): string {
    if (age <= 23) return 'Young QB - steep learning curve'
    if (age <= 32) return 'Peak QB years (27-32)'
    if (age <= 35) return 'Gradual decline phase'
    return 'Steep decline after 35'
  }

  private getRBAgeInsight(age: number): string {
    if (age >= 24 && age <= 25) return 'EXPLOSIVE GROWTH PHASE'
    if (age >= 29) return 'Age 29+ cliff risk'
    if (age === 28) return 'Beginning decline phase'
    return 'Prime RB years'
  }

  private getWRAgeInsight(age: number): string {
    if (age <= 22) return 'Young WR development phase'
    if (age === 27) return 'Peak WR age'
    if (age >= 33) return 'Advanced age decline'
    return 'Prime WR years'
  }

  private getTEAgeInsight(age: number): string {
    if (age <= 24) return 'Young TE - long learning curve'
    if (age >= 28 && age <= 31) return 'Peak TE years'
    if (age >= 35) return 'Advanced age for TE'
    return 'TE development/prime years'
  }

  // Experience insight helpers
  private getQBExperienceInsight(yearsPro: number): string {
    if (yearsPro === 0) return 'Rookie struggles expected'
    if (yearsPro === 2) return 'Year 3 breakout potential'
    if (yearsPro <= 10) return 'Prime experience level'
    return 'Veteran experience'
  }

  private getRBExperienceInsight(yearsPro: number): string {
    if (yearsPro === 0) return 'Rookie season - lower usage'
    if (yearsPro === 2) return 'Third year peak development'
    if (yearsPro <= 5) return 'Prime RB experience'
    return 'Veteran RB'
  }

  private getWRExperienceInsight(yearsPro: number): string {
    if (yearsPro === 0) return 'Rookie WR difficulty'
    if (yearsPro === 1) return 'Sophomore breakout potential'
    if (yearsPro === 2) return 'Third year typically when WRs hit stride'
    if (yearsPro <= 6) return 'Prime WR experience'
    return 'Veteran WR'
  }

  private getTEExperienceInsight(yearsPro: number): string {
    if (yearsPro <= 2) return 'Early TE development'
    if (yearsPro <= 6) return 'Steady progression phase'
    if (yearsPro <= 10) return 'Prime TE experience'
    return 'Veteran TE'
  }

  // Risk insight helpers (simplified)
  private getQBRiskInsights(player: NFLPlayer, gameStats: any[]): string[] {
    const risks = []
    if ((player.age ?? 25) >= 35) risks.push('Advanced age')
    if ((player.years_pro || 0) <= 1) risks.push('Limited experience')
    return risks
  }

  private getRBRiskInsights(player: NFLPlayer, gameStats: any[]): string[] {
    const risks = []
    if ((player.age ?? 25) >= 29) risks.push('Age cliff risk')
    if (gameStats.length > 0) {
      const avgCarries = gameStats.reduce((sum, game) => sum + (game.rushing_attempts || 0), 0) / gameStats.length
      if (avgCarries * 17 >= 300) risks.push('Excessive workload')
    }
    return risks
  }

  private getWRRiskInsights(player: NFLPlayer, gameStats: any[]): string[] {
    const risks = []
    if ((player.years_pro || 0) === 0) risks.push('Rookie WR volatility')
    if ((player.age ?? 25) >= 33) risks.push('Advanced age decline')
    return risks
  }

  private getTERiskInsights(player: NFLPlayer, gameStats: any[]): string[] {
    const risks = []
    if ((player.years_pro || 0) <= 1) risks.push('TE learning curve')
    if ((player.age ?? 25) >= 35) risks.push('Advanced TE age')
    return risks
  }
} 