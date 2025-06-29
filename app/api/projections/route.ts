import { NextRequest, NextResponse } from 'next/server';
import { supabaseAPI as supabase } from '@/src/lib/supabase-server';
import { PlayerProjection, Position, NFLTeam } from '@/src/types/database';
import { GetProjectionsRequest, GetProjectionsResponse } from '@/src/types/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const params: GetProjectionsRequest = {
      playerId: searchParams.get('playerId') || undefined,
      position: searchParams.get('position') as Position || undefined,
      team: searchParams.get('team') as NFLTeam || undefined,
      week: searchParams.get('week') ? parseInt(searchParams.get('week')!) : undefined,
      season: searchParams.get('season') ? parseInt(searchParams.get('season')!) : undefined,
      modelType: searchParams.get('modelType') || undefined,
      minConfidence: searchParams.get('minConfidence') ? parseFloat(searchParams.get('minConfidence')!) : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    // Build query with player join
    let query = supabase
      .from('player_projections')
      .select(`
        *,
        nfl_players!inner(
          id,
          first_name,
          last_name,
          position,
          nfl_team
        )
      `);

    // Apply filters
    if (params.playerId) {
      query = query.eq('player_id', params.playerId);
    }
    
    if (params.week) {
      query = query.eq('week', params.week);
    }
    
    if (params.season) {
      query = query.eq('season', params.season);
    }
    
    if (params.modelType) {
      query = query.eq('model_type', params.modelType);
    }
    
    if (params.minConfidence) {
      query = query.gte('confidence', params.minConfidence);
    }

    // Filter by player attributes
    if (params.position) {
      query = query.eq('nfl_players.position', params.position);
    }
    
    if (params.team) {
      query = query.eq('nfl_players.nfl_team', params.team);
    }

    // Apply sorting - most recent projections first
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    const offset = ((params.page || 1) - 1) * (params.limit || 20);
    query = query.range(offset, offset + (params.limit || 20) - 1);

    // Execute query
    const { data: projections, error, count } = await query;

    if (error) {
      throw error;
    }

    // Build response
    const totalPages = Math.ceil((count || 0) / (params.limit || 20));
    const response: GetProjectionsResponse = {
      data: projections as PlayerProjection[],
      error: null,
      status: 200,
      pagination: {
        page: params.page || 1,
        limit: params.limit || 20,
        total: count || 0,
        total_pages: totalPages,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching projections:', error);
    
    const errorResponse: GetProjectionsResponse = {
      data: [],
      error: error instanceof Error ? error.message : 'Internal server error',
      status: 500,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        total_pages: 0,
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['player_id', 'week', 'season', 'points'];
    for (const field of requiredFields) {
      if (!body[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    const { data: projection, error } = await supabase
      .from('player_projections')
      .insert([{
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    const response = {
      success: true,
      data: projection,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating projection:', error);
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
} 