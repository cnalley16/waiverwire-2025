import { NextRequest, NextResponse } from 'next/server';
import { getPlayersWithFilters, createPlayer } from '@/src/lib/database';
import { NFLPlayer, Position, NFLTeam } from '@/src/types/database';
import { GetPlayersRequest, GetPlayersResponse } from '@/src/types/api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const params: GetPlayersRequest = {
      position: searchParams.get('position') as Position || undefined,
      team: searchParams.get('team') as NFLTeam || undefined,
      search: searchParams.get('search') || undefined,
      active: searchParams.get('active') === 'true' ? true : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'display_name',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    // Use our database helper function
    const filters = {
      position: params.position,
      team: params.team,
      isActive: params.active,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      limit: params.limit,
      offset: ((params.page || 1) - 1) * (params.limit || 20)
    };

    const { players, total } = await getPlayersWithFilters(filters);

    // Build response  
    const total_pages = Math.ceil(total / (params.limit || 20));
    const response: GetPlayersResponse = {
      data: players as NFLPlayer[],
      error: null,
      status: 200,
      pagination: {
        page: params.page || 1,
        limit: params.limit || 20,
        total: total,
        total_pages,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching players:', error);
    
    const errorResponse: GetPlayersResponse = {
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
    
    const player = await createPlayer(body);

    const response = {
      success: true,
      data: player,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating player:', error);
    
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
} 