import { Suspense } from 'react';
import { getPlayersByPosition } from '@/src/lib/database/players';
import { MasterProjectionEngine } from '@/src/lib/projections';
import { ThreeFactorRisk } from '@/src/lib/risk-models/three-factor-risk';
import ProjectionTestClient from './ProjectionTestClient';
import type { NFLPlayer, PlayerProjection } from '@/src/types';

interface RiskAnalysisResult {
  standardDeviationRisk: number;
  projectionDifferenceRisk: number;
  latentRisk: number;
  combinedRisk: number;
  riskCategory: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  riskPercentage: number;
  confidenceLevel: number;
}

interface PlayerTestResult {
  player: NFLPlayer;
  projection: PlayerProjection;
  riskAnalysis: RiskAnalysisResult;
  riskAdjustedScore: number;
  validation: { valid: boolean; message: string; expected: string };
}

interface ProjectionTestData {
  playerData: {
    qb: NFLPlayer | null;
    rb: NFLPlayer | null;
    wr: NFLPlayer | null;
  };
  projectionResults: {
    qb: PlayerProjection | null;
    rb: PlayerProjection | null;
    wr: PlayerProjection | null;
  };
  riskResults: {
    qb: RiskAnalysisResult | null;
    rb: RiskAnalysisResult | null;
    wr: RiskAnalysisResult | null;
  };
  playerTestResults: PlayerTestResult[];
  riskAdjustedRankings: PlayerTestResult[];
  errors: string[];
  validationResults: {
    qb: { valid: boolean; message: string; expected: string };
    rb: { valid: boolean; message: string; expected: string };
    wr: { valid: boolean; message: string; expected: string };
  };
  riskModelValidation: {
    averageRisk: number;
    riskDistribution: { [key: string]: number };
    modelHealth: 'HEALTHY' | 'CONCERNING' | 'INVALID';
    issues: string[];
  };
}

async function getProjectionTestData(): Promise<ProjectionTestData> {
  const errors: string[] = [];
  const projectionEngine = new MasterProjectionEngine();
  const riskEngine = new ThreeFactorRisk();
  
  let qbPlayer: NFLPlayer | null = null;
  let rbPlayer: NFLPlayer | null = null;
  let wrPlayer: NFLPlayer | null = null;
  
  let qbProjection: PlayerProjection | null = null;
  let rbProjection: PlayerProjection | null = null;
  let wrProjection: PlayerProjection | null = null;
  
  let qbRisk: RiskAnalysisResult | null = null;
  let rbRisk: RiskAnalysisResult | null = null;
  let wrRisk: RiskAnalysisResult | null = null;

  try {
    // Get sample players from each position
    console.log('Fetching test players...');
    
    const [qbs, rbs, wrs] = await Promise.all([
      getPlayersByPosition('QB'),
      getPlayersByPosition('RB'),
      getPlayersByPosition('WR')
    ]);

    // Select active players preferably, or first available
    qbPlayer = qbs.find(p => p.is_active) || qbs[0] || null;
    rbPlayer = rbs.find(p => p.is_active) || rbs[0] || null;
    wrPlayer = wrs.find(p => p.is_active) || wrs[0] || null;

    console.log('Selected players:', {
      qb: qbPlayer?.display_name,
      rb: rbPlayer?.display_name, 
      wr: wrPlayer?.display_name
    });

  } catch (error) {
    console.error('Error fetching players:', error);
    errors.push(`Failed to fetch players: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Generate projections and risk analysis
  try {
    if (qbPlayer) {
      console.log('Generating QB projection and risk analysis...');
      qbProjection = projectionEngine.generateProjection(qbPlayer, []);
      qbRisk = riskEngine.calculatePlayerRisk(qbPlayer, [], []);
    }

    if (rbPlayer) {
      console.log('Generating RB projection and risk analysis...');
      rbProjection = projectionEngine.generateProjection(rbPlayer, []);
      rbRisk = riskEngine.calculatePlayerRisk(rbPlayer, [], []);
    }

    if (wrPlayer) {
      console.log('Generating WR projection and risk analysis...');
      wrProjection = projectionEngine.generateProjection(wrPlayer, []);
      wrRisk = riskEngine.calculatePlayerRisk(wrPlayer, [], []);
    }

  } catch (error) {
    console.error('Error generating projections:', error);
    errors.push(`Failed to generate projections: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Validate results against expected ranges
  const validationResults = {
    qb: validateProjection(qbProjection, 'QB'),
    rb: validateProjection(rbProjection, 'RB'),
    wr: validateProjection(wrProjection, 'WR')
  };

  // Create player test results for comprehensive analysis
  const playerTestResults: PlayerTestResult[] = [];
  
  if (qbPlayer && qbProjection && qbRisk) {
    playerTestResults.push({
      player: qbPlayer,
      projection: qbProjection,
      riskAnalysis: qbRisk,
      riskAdjustedScore: calculateRiskAdjustedScore(qbProjection, qbRisk),
      validation: validationResults.qb
    });
  }

  if (rbPlayer && rbProjection && rbRisk) {
    playerTestResults.push({
      player: rbPlayer,
      projection: rbProjection,
      riskAnalysis: rbRisk,
      riskAdjustedScore: calculateRiskAdjustedScore(rbProjection, rbRisk),
      validation: validationResults.rb
    });
  }

  if (wrPlayer && wrProjection && wrRisk) {
    playerTestResults.push({
      player: wrPlayer,
      projection: wrProjection,
      riskAnalysis: wrRisk,
      riskAdjustedScore: calculateRiskAdjustedScore(wrProjection, wrRisk),
      validation: validationResults.wr
    });
  }

  // Calculate risk-adjusted rankings
  const riskAdjustedRankings = [...playerTestResults]
    .sort((a, b) => b.riskAdjustedScore - a.riskAdjustedScore);

  // Validate risk model health
  const riskModelValidation = validateRiskModel(playerTestResults);

  return {
    playerData: {
      qb: qbPlayer,
      rb: rbPlayer,
      wr: wrPlayer
    },
    projectionResults: {
      qb: qbProjection,
      rb: rbProjection,
      wr: wrProjection
    },
    riskResults: {
      qb: qbRisk,
      rb: rbRisk,
      wr: wrRisk
    },
    playerTestResults,
    riskAdjustedRankings,
    errors,
    validationResults,
    riskModelValidation
  };
}

function calculateRiskAdjustedScore(projection: PlayerProjection, riskAnalysis: RiskAnalysisResult): number {
  // Risk-adjusted score = Expected Points × (1 - Risk Penalty)
  // Lower risk = higher score, higher risk = lower score
  const expectedPoints = projection.projected_fantasy_points * 17; // Season total
  const riskPenalty = riskAnalysis.combinedRisk * 0.3; // Risk penalty factor (max 30%)
  const confidenceBonus = (riskAnalysis.confidenceLevel - 0.5) * 0.1; // Confidence bonus/penalty
  
  return expectedPoints * (1 - riskPenalty + confidenceBonus);
}

function validateRiskModel(playerResults: PlayerTestResult[]): {
  averageRisk: number;
  riskDistribution: { [key: string]: number };
  modelHealth: 'HEALTHY' | 'CONCERNING' | 'INVALID';
  issues: string[];
} {
  if (playerResults.length === 0) {
    return {
      averageRisk: 0,
      riskDistribution: {},
      modelHealth: 'INVALID',
      issues: ['No player results to validate']
    };
  }

  const issues: string[] = [];
  
  // Calculate average risk
  const totalRisk = playerResults.reduce((sum, result) => sum + result.riskAnalysis.combinedRisk, 0);
  const averageRisk = totalRisk / playerResults.length;

  // Risk distribution
  const riskDistribution: { [key: string]: number } = {};
  playerResults.forEach(result => {
    const category = result.riskAnalysis.riskCategory;
    riskDistribution[category] = (riskDistribution[category] || 0) + 1;
  });

  // Validate model health
  let modelHealth: 'HEALTHY' | 'CONCERNING' | 'INVALID' = 'HEALTHY';

  // Check for concerning patterns
  if (averageRisk > 0.8) {
    issues.push('Average risk unusually high (>80%)');
    modelHealth = 'CONCERNING';
  }

  if (averageRisk < 0.1) {
    issues.push('Average risk unusually low (<10%)');
    modelHealth = 'CONCERNING';
  }

  // Check for invalid risk values
  const invalidRisks = playerResults.filter(result => 
    result.riskAnalysis.combinedRisk < 0 || 
    result.riskAnalysis.combinedRisk > 1 ||
    isNaN(result.riskAnalysis.combinedRisk)
  );

  if (invalidRisks.length > 0) {
    issues.push(`${invalidRisks.length} players have invalid risk values`);
    modelHealth = 'INVALID';
  }

  // Check individual risk component validity
  playerResults.forEach(result => {
    const { standardDeviationRisk, projectionDifferenceRisk, latentRisk } = result.riskAnalysis;
    
    if ([standardDeviationRisk, projectionDifferenceRisk, latentRisk].some(risk => 
      risk < 0 || risk > 1 || isNaN(risk)
    )) {
      issues.push(`${result.player.display_name} has invalid individual risk components`);
      modelHealth = 'INVALID';
    }
  });

  return {
    averageRisk,
    riskDistribution,
    modelHealth,
    issues
  };
}

function validateProjection(
  projection: PlayerProjection | null, 
  position: 'QB' | 'RB' | 'WR'
): { valid: boolean; message: string; expected: string } {
  if (!projection) {
    return {
      valid: false,
      message: 'No projection generated',
      expected: getExpectedRange(position)
    };
  }

  const points = projection.projected_fantasy_points;
  const ranges = {
    QB: { min: 250, max: 350, name: 'QB' },
    RB: { min: 200, max: 300, name: 'RB' },
    WR: { min: 150, max: 250, name: 'WR' }
  };

  const range = ranges[position];
  const annualizedPoints = points * 17; // Convert per-game to full season

  if (annualizedPoints >= range.min && annualizedPoints <= range.max) {
    return {
      valid: true,
      message: `✅ Projection (${annualizedPoints.toFixed(1)} points) within expected range`,
      expected: `${range.min}-${range.max} season points`
    };
  } else if (annualizedPoints < range.min) {
    return {
      valid: false,
      message: `⚠️ Projection (${annualizedPoints.toFixed(1)} points) below expected range`,
      expected: `${range.min}-${range.max} season points`
    };
  } else {
    return {
      valid: false,
      message: `⚠️ Projection (${annualizedPoints.toFixed(1)} points) above expected range`,
      expected: `${range.min}-${range.max} season points`
    };
  }
}

function getExpectedRange(position: 'QB' | 'RB' | 'WR'): string {
  const ranges = {
    QB: '250-350 season points',
    RB: '200-300 season points',
    WR: '150-250 season points'
  };
  return ranges[position];
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Generating projection calculations and risk analysis...</p>
      </div>
    </div>
  );
}

export default async function ProjectionTestPage() {
  const testData = await getProjectionTestData();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Projection Engine & Risk Analysis Test</h1>
          <p className="mt-2 text-gray-600">
            Testing our 2008 research-based projection calculations with comprehensive three-factor risk analysis. 
            Validates QB, RB, and WR projections with individual risk components and risk-adjusted rankings.
          </p>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <ProjectionTestClient testData={testData} />
        </Suspense>
      </div>
    </div>
  );
} 