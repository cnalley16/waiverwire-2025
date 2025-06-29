'use client';

import { useState } from 'react';
import { supabase } from '@/src/lib/supabase';
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

interface TestResults {
  createTest: { success: boolean; message: string; playerId?: string };
  readTest: { success: boolean; message: string; player?: NFLPlayer };
  updateTest: { success: boolean; message: string };
  deleteTest: { success: boolean; message: string };
  searchTest: { success: boolean; message: string; results?: NFLPlayer[] };
}

interface DatabaseTestClientProps {
  initialData: InitialData;
}

export default function DatabaseTestClient({ initialData }: DatabaseTestClientProps) {
  const [testResults, setTestResults] = useState<TestResults>({
    createTest: { success: false, message: 'Not tested' },
    readTest: { success: false, message: 'Not tested' },
    updateTest: { success: false, message: 'Not tested' },
    deleteTest: { success: false, message: 'Not tested' },
    searchTest: { success: false, message: 'Not tested' }
  });
  const [runningTests, setRunningTests] = useState(false);

  // Helper function to format error messages
  function formatError(error: any): string {
    if (error?.code) {
      return `${error.message} (Code: ${error.code})`;
    }
    return error instanceof Error ? error.message : 'Unknown error';
  }

  // Client-side database functions using the client Supabase instance
  async function createPlayer(player: Omit<NFLPlayer, 'id' | 'created_at' | 'updated_at'>): Promise<NFLPlayer> {
    const { data, error } = await supabase
      .from('nfl_players')
      .insert(player)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async function getPlayerById(id: string): Promise<NFLPlayer | null> {
    const { data, error } = await supabase
      .from('nfl_players')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  }

  async function updatePlayer(id: string, updates: Partial<Omit<NFLPlayer, 'id' | 'created_at'>>): Promise<NFLPlayer> {
    const { data, error } = await supabase
      .from('nfl_players')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async function deletePlayer(id: string): Promise<void> {
    const { error } = await supabase
      .from('nfl_players')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  async function searchPlayersByName(searchTerm: string): Promise<NFLPlayer[]> {
    const { data, error } = await supabase
      .from('nfl_players')
      .select('*')
      .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%`)
      .order('first_name')
      .limit(10);
    
    if (error) throw error;
    return data || [];
  }

  // Run comprehensive CRUD tests
  async function runCRUDTests() {
    setRunningTests(true);
    let testPlayerId: string | undefined;

    try {
      // Test CREATE
      const createResult = await testCreatePlayer();
      testPlayerId = createResult.playerId;
      
      // Test READ
      const readResult = await testReadPlayer(testPlayerId);
      
      // Test UPDATE
      const updateResult = await testUpdatePlayer(testPlayerId);
      
      // Test SEARCH
      const searchResult = await testSearchPlayers();
      
      // Test DELETE (always run this to clean up)
      const deleteResult = await testDeletePlayer(testPlayerId);

      setTestResults({
        createTest: createResult,
        readTest: readResult,
        updateTest: updateResult,
        searchTest: searchResult,
        deleteTest: deleteResult
      });
    } catch (error) {
      console.error('CRUD test error:', error);
      // Clean up if something went wrong
      if (testPlayerId) {
        try {
          await deletePlayer(testPlayerId);
        } catch (cleanupError) {
          console.error('Failed to clean up test player:', cleanupError);
        }
      }
    } finally {
      setRunningTests(false);
    }
  }

  async function testCreatePlayer() {
    try {
      const testPlayer: Omit<NFLPlayer, 'id' | 'created_at' | 'updated_at'> = {
        player_external_id: 'test-' + Date.now(),
        first_name: 'Test',
        last_name: 'Player',
        display_name: 'Test Player',
        position: 'QB',
        nfl_team: 'KC',
        jersey_number: 99,
        height_inches: 72,
        weight_pounds: 200,
        age: 25,
        years_pro: 2,
        college: 'Test University',
        bye_week: 14,
        is_active: true,
        is_rookie: false,
        injury_status: 'HEALTHY',
        injury_details: null,
        depth_chart_position: 3,
        target_share: null,
        snap_count_percentage: null,
        red_zone_usage: null,
        image_url: null
      };

      const created = await createPlayer(testPlayer);
      return { 
        success: true, 
        message: '✅ Player created successfully', 
        playerId: created.id 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `❌ Failed to create player: ${formatError(error)}` 
      };
    }
  }

  async function testReadPlayer(playerId?: string) {
    if (!playerId) {
      return { 
        success: false, 
        message: '❌ No player ID available for read test' 
      };
    }

    try {
      const player = await getPlayerById(playerId);
      if (player) {
        return { 
          success: true, 
          message: '✅ Player read successfully', 
          player 
        };
      } else {
        return { 
          success: false, 
          message: '❌ Player not found' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `❌ Failed to read player: ${formatError(error)}` 
      };
    }
  }

  async function testUpdatePlayer(playerId?: string) {
    if (!playerId) {
      return { 
        success: false, 
        message: '❌ No player ID available for update test' 
      };
    }

    try {
      await updatePlayer(playerId, { 
        display_name: 'Updated Test Player',
        age: 26 
      });
      return { 
        success: true, 
        message: '✅ Player updated successfully' 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `❌ Failed to update player: ${formatError(error)}` 
      };
    }
  }

  async function testSearchPlayers() {
    try {
      const results = await searchPlayersByName('Test');
      return { 
        success: true, 
        message: `✅ Search completed: found ${results.length} players`, 
        results 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `❌ Search failed: ${formatError(error)}` 
      };
    }
  }

  async function testDeletePlayer(playerId?: string) {
    if (!playerId) {
      return { 
        success: false, 
        message: '❌ No player ID available for delete test' 
      };
    }

    try {
      await deletePlayer(playerId);
      return { 
        success: true, 
        message: '✅ Player deleted successfully' 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `❌ Failed to delete player: ${formatError(error)}` 
      };
    }
  }

  return (
    <>
      {/* Connection Status */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        <div className={`p-4 rounded-md ${initialData.connectionStatus.connected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-3 ${initialData.connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`font-medium ${initialData.connectionStatus.connected ? 'text-green-800' : 'text-red-800'}`}>
              {initialData.connectionStatus.connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {initialData.connectionStatus.error && (
            <p className="mt-2 text-red-700 text-sm">{initialData.connectionStatus.error}</p>
          )}
        </div>
      </div>

      {/* Basic Database Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Database Statistics</h3>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-medium">Total Players:</span> {initialData.playerCount.toLocaleString()}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Sample Data:</span> {initialData.samplePlayers.length} players retrieved
            </p>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Initial Test Results</h3>
          <div className="space-y-1">
            <div className={`text-sm ${initialData.connectionStatus.connected ? 'text-green-600' : 'text-red-600'}`}>
              {initialData.connectionStatus.connected ? '✅ Database connection successful' : '❌ Connection failed'}
            </div>
            <div className="text-sm text-green-600">
              ✅ Player count retrieved: {initialData.playerCount} players
            </div>
            <div className="text-sm text-green-600">
              ✅ Retrieved {initialData.samplePlayers.length} sample players
            </div>
          </div>
        </div>
      </div>

      {/* Sample Players */}
      {initialData.samplePlayers.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Sample Player Data</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {initialData.samplePlayers.map((player) => (
                  <tr key={player.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {player.display_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {player.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {player.nfl_team}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        player.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {player.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRUD Tests */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">CRUD Operation Tests</h3>
          <button
            onClick={runCRUDTests}
            disabled={runningTests || !initialData.connectionStatus.connected}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              runningTests || !initialData.connectionStatus.connected
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {runningTests ? 'Running Tests...' : 'Run CRUD Tests'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className={`p-3 rounded-md text-sm ${
              testResults.createTest.success ? 'bg-green-50 text-green-800' : 
              testResults.createTest.message === 'Not tested' ? 'bg-gray-50 text-gray-600' :
              'bg-red-50 text-red-800'
            }`}>
              <strong>Create Test:</strong> {testResults.createTest.message}
            </div>

            <div className={`p-3 rounded-md text-sm ${
              testResults.readTest.success ? 'bg-green-50 text-green-800' : 
              testResults.readTest.message === 'Not tested' ? 'bg-gray-50 text-gray-600' :
              'bg-red-50 text-red-800'
            }`}>
              <strong>Read Test:</strong> {testResults.readTest.message}
            </div>

            <div className={`p-3 rounded-md text-sm ${
              testResults.updateTest.success ? 'bg-green-50 text-green-800' : 
              testResults.updateTest.message === 'Not tested' ? 'bg-gray-50 text-gray-600' :
              'bg-red-50 text-red-800'
            }`}>
              <strong>Update Test:</strong> {testResults.updateTest.message}
            </div>

            <div className={`p-3 rounded-md text-sm ${
              testResults.deleteTest.success ? 'bg-green-50 text-green-800' : 
              testResults.deleteTest.message === 'Not tested' ? 'bg-gray-50 text-gray-600' :
              'bg-red-50 text-red-800'
            }`}>
              <strong>Delete Test:</strong> {testResults.deleteTest.message}
            </div>
          </div>

          <div className="space-y-3">
            <div className={`p-3 rounded-md text-sm ${
              testResults.searchTest.success ? 'bg-green-50 text-green-800' : 
              testResults.searchTest.message === 'Not tested' ? 'bg-gray-50 text-gray-600' :
              'bg-red-50 text-red-800'
            }`}>
              <strong>Search Test:</strong> {testResults.searchTest.message}
            </div>

            {testResults.readTest.player && (
              <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                <strong>Test Player Data:</strong>
                <br />
                ID: {testResults.readTest.player.id.slice(0, 8)}...
                <br />
                Name: {testResults.readTest.player.display_name}
                <br />
                Position: {testResults.readTest.player.position}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Environment Info */}
      <div className="mt-6 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Environment Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p><strong>Supabase URL:</strong> {initialData.environmentInfo.hasSupabaseUrl ? '✅ Set' : '❌ Missing'}</p>
            <p><strong>Supabase Anon Key:</strong> {initialData.environmentInfo.hasSupabaseKey ? '✅ Set' : '❌ Missing'}</p>
          </div>
          <div>
            <p><strong>Node Environment:</strong> {initialData.environmentInfo.nodeEnv}</p>
            <p><strong>Client Component:</strong> ✅ Using client-side Supabase</p>
          </div>
        </div>
      </div>
    </>
  );
}