// Simple Player Import Script
// Usage: npm run import-players

import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Types
interface RawPlayerData {
  player_external_id: string | null;
  first_name: string;
  last_name: string;
  display_name: string;
  position: string;
  nfl_team: string;
  jersey_number: number | null;
  height_inches: number | null;
  weight_pounds: number | null;
  age: number | null;
  years_pro: number | null;
  college: string | null;
  bye_week: number | null;
  is_active: boolean;
  is_rookie: boolean;
  injury_status: string;
  injury_details: string | null;
  depth_chart_position: number | null;
  target_share: number | null;
  snap_count_percentage: number | null;
  red_zone_usage: number | null;
  image_url: string | null;
}

interface ProcessedPlayerData extends RawPlayerData {
  id: string;
  created_at: string;
  updated_at: string;
}

// Configuration
const VALID_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'DL', 'LB', 'DB'];
const VALID_TEAMS = [
  'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN',
  'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'LAR', 'MIA',
  'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB',
  'TEN', 'WAS'
];

async function main() {
  console.log('🚀 Starting NFL Players Import...\n');

  // Initialize Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration');
    console.error('Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Test connection
  console.log('🔌 Testing database connection...');
  try {
    const { data, error, count } = await supabase
      .from('nfl_players')
      .select('id', { count: 'exact' })
      .limit(1);
    if (error) throw error;
    console.log(`✅ Database connection successful (${count || 0} players currently in database)\n`);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  // Load player data
  const dataPath = 'data/sample-players.json';
  console.log(`📁 Loading player data from ${dataPath}...`);

  let rawPlayers: RawPlayerData[];
  try {
    const jsonData = fs.readFileSync(dataPath, 'utf-8');
    rawPlayers = JSON.parse(jsonData);
    console.log(`📊 Found ${rawPlayers.length} players to import\n`);
  } catch (error) {
    console.error('❌ Failed to load player data:', error);
    process.exit(1);
  }

  // Process and validate players
  const processedPlayers: ProcessedPlayerData[] = [];
  const errors: string[] = [];

  for (let i = 0; i < rawPlayers.length; i++) {
    const player = rawPlayers[i];
    const playerName = `${player.first_name} ${player.last_name}`;
    
    console.log(`Processing ${i + 1}/${rawPlayers.length}: ${playerName}`);

    // Basic validation
    const validationErrors: string[] = [];
    
    if (!player.first_name?.trim()) validationErrors.push('Missing first_name');
    if (!player.last_name?.trim()) validationErrors.push('Missing last_name');
    if (!player.position) validationErrors.push('Missing position');
    if (!player.nfl_team) validationErrors.push('Missing nfl_team');
    
    if (player.position && !VALID_POSITIONS.includes(player.position)) {
      validationErrors.push(`Invalid position: ${player.position}`);
    }
    
    if (player.nfl_team && !VALID_TEAMS.includes(player.nfl_team)) {
      validationErrors.push(`Invalid team: ${player.nfl_team}`);
    }

    if (validationErrors.length > 0) {
      console.log(`❌ Validation failed: ${validationErrors.join(', ')}`);
      errors.push(`${playerName}: ${validationErrors.join(', ')}`);
      continue;
    }

    // Check if player already exists
    const { data: existingPlayer } = await supabase
      .from('nfl_players')
      .select('id')
      .or(`player_external_id.eq.${player.player_external_id},and(first_name.eq.${player.first_name},last_name.eq.${player.last_name})`)
      .limit(1);

    if (existingPlayer && existingPlayer.length > 0) {
      console.log(`⏭️  Player already exists, skipping...`);
      continue;
    }

    // Process player data
    const processedPlayer: ProcessedPlayerData = {
      ...player,
      id: randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    processedPlayers.push(processedPlayer);
    console.log(`✅ Validated and processed`);
  }

  console.log(`\n📦 Ready to import ${processedPlayers.length} players`);
  
  if (processedPlayers.length === 0) {
    console.log('ℹ️  No players to import');
    return;
  }

  // Import players in batches
  const batchSize = 5;
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < processedPlayers.length; i += batchSize) {
    const batch = processedPlayers.slice(i, i + batchSize);
    
    console.log(`\n📤 Importing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(processedPlayers.length / batchSize)}...`);
    
    try {
      const { data, error } = await supabase
        .from('nfl_players')
        .insert(batch.map(player => ({
          id: player.id,
          player_external_id: player.player_external_id,
          first_name: player.first_name,
          last_name: player.last_name,
          display_name: player.display_name,
          position: player.position,
          nfl_team: player.nfl_team,
          jersey_number: player.jersey_number,
          height_inches: player.height_inches,
          weight_pounds: player.weight_pounds,
          age: player.age,
          years_pro: player.years_pro,
          college: player.college,
          bye_week: player.bye_week,
          is_active: player.is_active,
          is_rookie: player.is_rookie,
          injury_status: player.injury_status,
          injury_details: player.injury_details,
          depth_chart_position: player.depth_chart_position,
          target_share: player.target_share,
          snap_count_percentage: player.snap_count_percentage,
          red_zone_usage: player.red_zone_usage,
          image_url: player.image_url,
          created_at: player.created_at,
          updated_at: player.updated_at
        })));

      if (error) throw error;
      
      imported += batch.length;
      console.log(`✅ Successfully imported ${batch.length} players`);
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Batch import failed:`, error);
      failed += batch.length;
      
      // Try individual imports for this batch
      for (const player of batch) {
        try {
          await supabase.from('nfl_players').insert({
            id: player.id,
            player_external_id: player.player_external_id,
            first_name: player.first_name,
            last_name: player.last_name,
            display_name: player.display_name,
            position: player.position,
            nfl_team: player.nfl_team,
            jersey_number: player.jersey_number,
            height_inches: player.height_inches,
            weight_pounds: player.weight_pounds,
            age: player.age,
            years_pro: player.years_pro,
            college: player.college,
            bye_week: player.bye_week,
            is_active: player.is_active,
            is_rookie: player.is_rookie,
            injury_status: player.injury_status,
            injury_details: player.injury_details,
            depth_chart_position: player.depth_chart_position,
            target_share: player.target_share,
            snap_count_percentage: player.snap_count_percentage,
            red_zone_usage: player.red_zone_usage,
            image_url: player.image_url,
            created_at: player.created_at,
            updated_at: player.updated_at
          });
          
          imported++;
          failed--;
          console.log(`✅ Individual import successful: ${player.first_name} ${player.last_name}`);
        } catch (individualError) {
          console.error(`❌ Failed to import ${player.first_name} ${player.last_name}:`, individualError);
        }
      }
    }
  }

  // Final results
  console.log('\n🎉 Import completed!');
  console.log('📊 Summary:');
  console.log(`   ✅ Successfully imported: ${imported} players`);
  console.log(`   ❌ Failed imports: ${failed} players`);
  console.log(`   📋 Total processed: ${processedPlayers.length} players`);
  
  if (errors.length > 0) {
    console.log('\n❌ Validation Errors:');
    errors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  }

  console.log('\n✨ Import script completed successfully!');
}

// Run the script
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
}); 