import { NextRequest, NextResponse } from 'next/server';
import { supabaseAPI as supabase } from '@/src/lib/supabase-server';
import { NFLPlayer, PlayerProjection, PlayerGameStats, PlayerRiskAnalysis } from '@/src/types/database';
import { GetPlayerRequest, GetPlayerResponse } from '@/src/types/api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const resolvedParams = await params;
    const playerId = resolvedParams.id;
    
    // Parse query parameters
    const queryParams: GetPlayerRequest = {
      playerId,
      includeProjections: searchParams.get('includeProjections') === 'true',
      includeStats: searchParams.get('includeStats') === 'true',
      includeRisk: searchParams.get('includeRisk') === 'true',
      season: searchParams.get('season') ? parseInt(searchParams.get('season')!) : undefined,
      week: searchParams.get('week') ? parseInt(searchParams.get('week')!) : undefined,
    };

    // Fetch player data
    const { data: player, error: playerError } = await supabase
      .from('nfl_players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (playerError) {
      throw new Error(`Player not found: ${playerError.message}`);
    }

    // Initialize response data
    const responseData: {
      player: NFLPlayer;
      projections?: PlayerProjection[];
      stats?: PlayerGameStats[];
      riskAnalysis?: PlayerRiskAnalysis;
    } = {
      player: player as NFLPlayer,
    };

    // Fetch projections if requested
    if (queryParams.includeProjections) {
      let projectionsQuery = supabase
        .from('player_projections')
        .select('*')
        .eq('player_id', playerId);

      if (queryParams.season) {
        projectionsQuery = projectionsQuery.eq('season', queryParams.season);
      }
      
      if (queryParams.week) {
        projectionsQuery = projectionsQuery.eq('week', queryParams.week);
      }

      const { data: projections, error: projectionsError } = await projectionsQuery;
      
      if (!projectionsError) {
        responseData.projections = projections as PlayerProjection[];
      }
    }

    // Fetch stats if requested
    if (queryParams.includeStats) {
      let statsQuery = supabase
        .from('player_game_stats')
        .select('*')
        .eq('player_id', playerId);

      if (queryParams.season) {
        statsQuery = statsQuery.eq('season', queryParams.season);
      }
      
      if (queryParams.week) {
        statsQuery = statsQuery.eq('week', queryParams.week);
      }

      const { data: stats, error: statsError } = await statsQuery;
      
      if (!statsError) {
        responseData.stats = stats as PlayerGameStats[];
      }
    }

    // Fetch risk analysis if requested
    if (queryParams.includeRisk) {
      const { data: riskAnalysis, error: riskError } = await supabase
        .from('player_risk_analysis')
        .select('*')
        .eq('player_id', playerId)
        .single();

      if (!riskError) {
        responseData.riskAnalysis = riskAnalysis as PlayerRiskAnalysis;
      }
    }

    const response: GetPlayerResponse = {
      success: true,
      data: responseData,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching player:', error);
    
    const errorResponse: GetPlayerResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const playerId = resolvedParams.id;
    const updates = await request.json();
    
    const { data: player, error } = await supabase
      .from('nfl_players')
      .update(updates)
      .eq('id', playerId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    const response = {
      success: true,
      data: player,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating player:', error);
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const playerId = resolvedParams.id;
    
    const { error } = await supabase
      .from('nfl_players')
      .delete()
      .eq('id', playerId);

    if (error) {
      throw error;
    }

    const response = {
      success: true,
      message: 'Player deleted successfully',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting player:', error);
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
} 