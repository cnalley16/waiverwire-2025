import React from 'react';
import { NFLPlayer, PlayerProjection, PlayerRiskAnalysis } from '@/src/types/database';

interface PlayerCardProps {
  player: NFLPlayer;
  projection?: PlayerProjection;
  riskAnalysis?: PlayerRiskAnalysis;
  onClick?: () => void;
  className?: string;
}

export default function PlayerCard({
  player,
  projection,
  riskAnalysis,
  onClick,
  className = ''
}: PlayerCardProps) {
  const getPositionColor = (position: string) => {
    switch (position) {
      case 'QB': return 'bg-red-100 text-red-800';
      case 'RB': return 'bg-green-100 text-green-800';
      case 'WR': return 'bg-blue-100 text-blue-800';
      case 'TE': return 'bg-yellow-100 text-yellow-800';
      case 'K': return 'bg-purple-100 text-purple-800';
      case 'DST': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'HIGH': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const formatProjection = (points?: number) => {
    if (!points) return 'N/A';
    return points.toFixed(1);
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-4 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
              {player.first_name[0]}{player.last_name[0]}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {player.first_name} {player.last_name}
            </h3>
            <p className="text-sm text-gray-500">
              {player.nfl_team} • {player.position}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPositionColor(player.position)}`}>
            {player.position}
          </span>
          {!player.is_active && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-3">
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Age</p>
          <p className="text-lg font-semibold text-gray-900">
            {player.age || 'N/A'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Experience</p>
          <p className="text-lg font-semibold text-gray-900">
            {player.years_pro ? `${player.years_pro}Y` : 'R'}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Height</p>
          <p className="text-lg font-semibold text-gray-900">
            {player.height_inches ? `${Math.floor(player.height_inches / 12)}'${player.height_inches % 12}"` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Projection */}
      {projection && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Projected Points</p>
              <p className="text-xl font-bold text-gray-900">
                {formatProjection(projection.projected_fantasy_points)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Week {projection.week}</p>
              <p className="text-xs text-gray-500">
                Confidence: {projection.confidence_score ? projection.confidence_score.toFixed(0) : 0}%
              </p>
            </div>
          </div>
          
          {projection.ceiling_points && projection.floor_points && (
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>Floor: {formatProjection(projection.floor_points)}</span>
              <span>Ceiling: {formatProjection(projection.ceiling_points)}</span>
            </div>
          )}
        </div>
      )}

      {/* Risk Analysis */}
      {riskAnalysis && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Risk Level:</span>
          <span className={`font-medium ${getRiskColor(riskAnalysis.risk_level)}`}>
            {riskAnalysis.risk_level}
          </span>
        </div>
      )}

      {/* Injury Status */}
      {player.injury_status && player.injury_status !== 'HEALTHY' && (
        <div className="mt-2 flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-xs text-yellow-700 font-medium">
            {player.injury_status}
          </span>
          {player.injury_details && (
            <span className="text-xs text-gray-500">
              ({player.injury_details})
            </span>
          )}
        </div>
      )}
    </div>
  );
} 