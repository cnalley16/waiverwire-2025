import { Suspense } from 'react';
import { getPlayersWithFilters } from '@/src/lib/database/players';
import { supabaseAPI } from '@/src/lib/supabase-server';
import DatabaseTestClient from './DatabaseTestClient';
import type { NFLPlayer } from '@/src/types';

interface InitialData {
  connectionStatus: {
    connected: boolean;
    error?: string;
  };
  playerCount: number;
  samplePlayers: NFLPlayer[];
  environmentInfo: {
    hasSupabaseUrl: boolean;
    hasSupabaseKey: boolean;
    nodeEnv: string;
  };
}

async function getInitialData(): Promise<InitialData> {
  let connectionStatus: { connected: boolean; error?: string } = { connected: false };
  let playerCount = 0;
  let samplePlayers: NFLPlayer[] = [];

  try {
    // Test basic connection with proper PostgREST syntax
    const { data: connectionData, error: connectionError, count } = await supabaseAPI
      .from('nfl_players')
      .select('*', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('Connection test failed:', connectionError);
      throw connectionError;
    }
    
    connectionStatus.connected = true;
    playerCount = count || 0;

    // Get sample data using the database function (which works)
    const { players } = await getPlayersWithFilters({ 
      limit: 3, 
      sortBy: 'display_name' 
    });
    
    samplePlayers = players;
  } catch (error) {
    console.error('Database connection failed:', error);
    connectionStatus.error = error instanceof Error ? error.message : 'Unknown error';
    
    // Try to get more specific error information
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      const errorObj = error as { code: string; message: string };
      connectionStatus.error = `${errorObj.message} (Code: ${errorObj.code})`;
    }
  }

  return {
    connectionStatus,
    playerCount,
    samplePlayers,
    environmentInfo: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV || 'not set'
    }
  };
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading database test...</p>
      </div>
    </div>
  );
}

export default async function DatabaseTestPage() {
  const initialData = await getInitialData();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Database Connection Test</h1>
          <p className="mt-2 text-gray-600">
            Test Supabase connection and database operations for the WaiverWire application.
          </p>
        </div>

        <Suspense fallback={<LoadingSpinner />}>
          <DatabaseTestClient initialData={initialData} />
        </Suspense>
      </div>
    </div>
  );
} 