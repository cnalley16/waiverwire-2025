'use client';

import { useState } from 'react';
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

type Tab = 'overview' | 'detailed' | 'risk' | 'rankings' | 'validation';

interface ProjectionTestClientProps {
  testData: ProjectionTestData;
}

export default function ProjectionTestClient({ testData }: ProjectionTestClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs = [
    { id: 'overview' as Tab, name: 'Overview', icon: '📊' },
    { id: 'detailed' as Tab, name: 'Detailed Analysis', icon: '🔍' },
    { id: 'risk' as Tab, name: 'Risk Components', icon: '⚠️' },
    { id: 'rankings' as Tab, name: 'Risk-Adjusted Rankings', icon: '🏆' },
    { id: 'validation' as Tab, name: 'Model Validation', icon: '✅' }
  ];

  const getRiskColor = (risk: number) => {
    if (risk < 0.2) return 'text-green-600 bg-green-50';
    if (risk < 0.4) return 'text-yellow-600 bg-yellow-50';
    if (risk < 0.6) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskCategoryColor = (category: string) => {
    switch (category) {
      case 'VERY_LOW': return 'text-green-700 bg-green-100 border-green-200';
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'VERY_HIGH': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatRiskCategory = (category: string) => {
    return category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (testData.errors.length > 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 mb-4">⚠️ Test Errors</h2>
        <ul className="space-y-2">
          {testData.errors.map((error, index) => (
            <li key={index} className="text-red-700">• {error}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Projection Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['qb', 'rb', 'wr'].map((position) => {
                const positionKey = position as keyof typeof testData.playerData;
                const player = testData.playerData[positionKey];
                const projection = testData.projectionResults[positionKey];
                const risk = testData.riskResults[positionKey];
                const validation = testData.validationResults[positionKey];

                if (!player || !projection || !risk) {
                  return (
                    <div key={position} className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-400 mb-4">
                        {position.toUpperCase()} - No Data
                      </h3>
                    </div>
                  );
                }

                const seasonPoints = projection.projected_fantasy_points * 17;

                return (
                  <div key={position} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {position.toUpperCase()} - {player.display_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">{player.nfl_team}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Per Game Points</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {projection.projected_fantasy_points.toFixed(1)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-600">Season Projection</p>
                        <p className="text-xl font-semibold text-gray-800">
                          {seasonPoints.toFixed(1)} points
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Combined Risk</p>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(risk.combinedRisk)}`}>
                          {(risk.combinedRisk * 100).toFixed(1)}%
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Risk Category</p>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskCategoryColor(risk.riskCategory)}`}>
                          {formatRiskCategory(risk.riskCategory)}
                        </div>
                      </div>
                      
                      <div className="pt-2 border-t border-blue-200">
                        <p className="text-sm">{validation.message}</p>
                        <p className="text-xs text-gray-500">Expected: {validation.expected}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'detailed' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Detailed Analysis</h2>
            
            {testData.playerTestResults.map((result) => (
              <div key={result.player.id} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {result.player.display_name} ({result.player.position}) - {result.player.nfl_team}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Projection Details</h4>
                    <div className="space-y-2 text-sm">
                      <p>Per Game: <span className="font-medium">{result.projection.projected_fantasy_points.toFixed(2)} pts</span></p>
                      <p>Season Total: <span className="font-medium">{(result.projection.projected_fantasy_points * 17).toFixed(1)} pts</span></p>
                      <p>Volatility Score: <span className="font-medium">{(result.projection.volatility_score || 0).toFixed(1)}</span></p>
                      <p>Confidence: <span className="font-medium">{(result.projection.confidence_score || 0).toFixed(1)}%</span></p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Risk Breakdown</h4>
                    <div className="space-y-2 text-sm">
                      <p>Std Dev Risk: <span className={`font-medium ${getRiskColor(result.riskAnalysis.standardDeviationRisk).split(' ')[0]}`}>
                        {(result.riskAnalysis.standardDeviationRisk * 100).toFixed(1)}%
                      </span></p>
                      <p>Projection Diff Risk: <span className={`font-medium ${getRiskColor(result.riskAnalysis.projectionDifferenceRisk).split(' ')[0]}`}>
                        {(result.riskAnalysis.projectionDifferenceRisk * 100).toFixed(1)}%
                      </span></p>
                      <p>Latent Risk: <span className={`font-medium ${getRiskColor(result.riskAnalysis.latentRisk).split(' ')[0]}`}>
                        {(result.riskAnalysis.latentRisk * 100).toFixed(1)}%
                      </span></p>
                      <p>Combined Risk: <span className={`font-medium ${getRiskColor(result.riskAnalysis.combinedRisk).split(' ')[0]}`}>
                        {(result.riskAnalysis.combinedRisk * 100).toFixed(1)}%
                      </span></p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Risk Assessment</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <p>Category:</p>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskCategoryColor(result.riskAnalysis.riskCategory)}`}>
                          {formatRiskCategory(result.riskAnalysis.riskCategory)}
                        </div>
                      </div>
                      <p>Risk-Adjusted Score: <span className="font-medium">{result.riskAdjustedScore.toFixed(1)}</span></p>
                      <p>Confidence Level: <span className="font-medium">{(result.riskAnalysis.confidenceLevel * 100).toFixed(1)}%</span></p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-700">Validation Result:</p>
                  <p className="text-sm">{result.validation.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Risk Components Analysis</h2>
            <p className="text-gray-600">Individual risk factor breakdown showing how each component contributes to overall player risk assessment.</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Std Dev Risk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projection Diff Risk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Latent Risk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Combined Risk</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Category</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {testData.playerTestResults.map((result) => (
                    <tr key={result.player.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{result.player.display_name}</div>
                          <div className="text-sm text-gray-500">{result.player.nfl_team}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.player.position}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(result.riskAnalysis.standardDeviationRisk)}`}>
                          {(result.riskAnalysis.standardDeviationRisk * 100).toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(result.riskAnalysis.projectionDifferenceRisk)}`}>
                          {(result.riskAnalysis.projectionDifferenceRisk * 100).toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(result.riskAnalysis.latentRisk)}`}>
                          {(result.riskAnalysis.latentRisk * 100).toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(result.riskAnalysis.combinedRisk)}`}>
                          {(result.riskAnalysis.combinedRisk * 100).toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskCategoryColor(result.riskAnalysis.riskCategory)}`}>
                          {formatRiskCategory(result.riskAnalysis.riskCategory)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Risk Component Definitions</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><span className="font-medium">Standard Deviation Risk:</span> Measures projection volatility based on historical performance variance</p>
                <p><span className="font-medium">Projection Difference Risk:</span> Assesses disagreement between different projection methods</p>
                <p><span className="font-medium">Latent Risk:</span> Captures hidden risk factors from injury history, age, and situational variables</p>
                <p><span className="font-medium">Combined Risk:</span> Weighted combination of all three factors using our proprietary algorithm</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rankings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Risk-Adjusted Rankings</h2>
            <p className="text-gray-600">Players ranked by risk-adjusted fantasy points, which factors in both projected performance and risk assessment.</p>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {testData.riskAdjustedRankings.map((result, index) => (
                  <li key={result.player.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-800">{index + 1}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{result.player.display_name}</div>
                          <div className="text-sm text-gray-500">{result.player.position} - {result.player.nfl_team}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {result.riskAdjustedScore.toFixed(1)} pts
                          </div>
                          <div className="text-sm text-gray-500">Risk-Adjusted</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {(result.projection.projected_fantasy_points * 17).toFixed(1)} pts
                          </div>
                          <div className="text-sm text-gray-500">Raw Projection</div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(result.riskAnalysis.combinedRisk)}`}>
                            {(result.riskAnalysis.combinedRisk * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-gray-500 mt-1">Risk</div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskCategoryColor(result.riskAnalysis.riskCategory)}`}>
                            {formatRiskCategory(result.riskAnalysis.riskCategory)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3">📊 Risk-Adjusted Scoring Formula</h3>
              <div className="space-y-2 text-sm text-yellow-800">
                <p><span className="font-medium">Risk-Adjusted Score =</span> Season Points × (1 - Risk Penalty + Confidence Bonus)</p>
                <p><span className="font-medium">Risk Penalty:</span> Combined Risk × 30% (maximum penalty)</p>
                <p><span className="font-medium">Confidence Bonus:</span> (Confidence Level - 50%) × 10%</p>
                <p className="mt-3 text-xs">This approach rewards both high projections and low risk, helping identify safer fantasy plays.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'validation' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Risk Model Validation</h2>
            <p className="text-gray-600">Comprehensive validation of the three-factor risk model to ensure it's working correctly.</p>
            
            {/* Model Health Status */}
            <div className={`rounded-lg p-6 ${
              testData.riskModelValidation.modelHealth === 'HEALTHY' ? 'bg-green-50 border border-green-200' :
              testData.riskModelValidation.modelHealth === 'CONCERNING' ? 'bg-yellow-50 border border-yellow-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {testData.riskModelValidation.modelHealth === 'HEALTHY' ? '✅' :
                   testData.riskModelValidation.modelHealth === 'CONCERNING' ? '⚠️' : '❌'}
                </div>
                <div className="ml-3">
                  <h3 className={`text-lg font-medium ${
                    testData.riskModelValidation.modelHealth === 'HEALTHY' ? 'text-green-900' :
                    testData.riskModelValidation.modelHealth === 'CONCERNING' ? 'text-yellow-900' :
                    'text-red-900'
                  }`}>
                    Model Status: {testData.riskModelValidation.modelHealth}
                  </h3>
                  <p className={`mt-1 text-sm ${
                    testData.riskModelValidation.modelHealth === 'HEALTHY' ? 'text-green-700' :
                    testData.riskModelValidation.modelHealth === 'CONCERNING' ? 'text-yellow-700' :
                    'text-red-700'
                  }`}>
                    {testData.riskModelValidation.modelHealth === 'HEALTHY' ? 
                      'All risk calculations are within expected ranges and working properly.' :
                      'Some risk calculations may need attention. Review issues below.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Risk Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Statistics</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Average Risk Level</p>
                    <div className="flex items-center">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(testData.riskModelValidation.averageRisk)}`}>
                        {(testData.riskModelValidation.averageRisk * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Risk Distribution</p>
                    <div className="space-y-1">
                      {Object.entries(testData.riskModelValidation.riskDistribution).map(([category, count]) => (
                        <div key={category} className="flex justify-between items-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getRiskCategoryColor(category)}`}>
                            {formatRiskCategory(category)}
                          </span>
                          <span className="text-sm text-gray-600">{count} player{count !== 1 ? 's' : ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Validation Issues</h3>
                {testData.riskModelValidation.issues.length === 0 ? (
                  <p className="text-sm text-green-600">✅ No validation issues detected</p>
                ) : (
                  <ul className="space-y-2">
                    {testData.riskModelValidation.issues.map((issue, index) => (
                      <li key={index} className="text-sm text-red-600">• {issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Individual Validation Results */}
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Individual Player Validation</h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {testData.playerTestResults.map((result) => (
                    <div key={result.player.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{result.player.display_name}</p>
                        <p className="text-sm text-gray-600">{result.player.position} - {result.player.nfl_team}</p>
                      </div>
                      
                      <div className="text-right">
                        <p className={`text-sm ${result.validation.valid ? 'text-green-600' : 'text-yellow-600'}`}>
                          {result.validation.valid ? '✅' : '⚠️'} {result.validation.message}
                        </p>
                        <p className="text-xs text-gray-500">{result.validation.expected}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Validation Guidelines */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">🔍 Validation Criteria</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p><span className="font-medium">Model Health:</span> Checks for invalid risk values, concerning patterns, and component validity</p>
                <p><span className="font-medium">Risk Range:</span> All risk values should be between 0-100%, with reasonable distribution</p>
                <p><span className="font-medium">Projection Range:</span> QB (250-350), RB (200-300), WR (150-250) season points</p>
                <p><span className="font-medium">Risk Distribution:</span> Should show variety across risk categories, not clustered in one range</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 