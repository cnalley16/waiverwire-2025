#!/usr/bin/env tsx
// @ts-nocheck
// Player import script - TypeScript checking disabled for utility script

import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Types
interface PlayerImportData {
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

interface ProcessedPlayer extends PlayerImportData {
  id: string;
  created_at: string;
  updated_at: string;
}

interface ImportStats {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: Array<{
    player: string;
    error: string;
  }>;
}

interface ImportOptions {
  batchSize: number;
  mode: 'insert' | 'upsert' | 'update';
  dryRun: boolean;
  skipValidation: boolean;
  updateExisting: boolean;
}

// Configuration
const VALID_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'DL', 'LB', 'DB'];
const VALID_TEAMS = [
  'ARI', 'ATL', 'BAL', 'BUF', 'CAR', 'CHI', 'CIN', 'CLE', 'DAL', 'DEN',
  'DET', 'GB', 'HOU', 'IND', 'JAX', 'KC', 'LV', 'LAC', 'LAR', 'MIA',
  'MIN', 'NE', 'NO', 'NYG', 'NYJ', 'PHI', 'PIT', 'SF', 'SEA', 'TB',
  'TEN', 'WAS'
];
const VALID_INJURY_STATUS = [
  'HEALTHY', 'QUESTIONABLE', 'DOUBTFUL', 'OUT', 'IR', 'PUP', 'DNR', 'SUSPENDED'
];

class PlayerImporter {
  private supabase: ReturnType<typeof createClient>;
  private stats: ImportStats;

  constructor() {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Please check your environment variables.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.stats = {
      total: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      errors: []
    };
  }

  /**
   * Validate a single player record
   */
  private validatePlayer(player: PlayerImportData, index: number): string[] {
    const errors: string[] = [];

    // Required fields
    if (!player.first_name?.trim()) {
      errors.push('Missing first_name');
    }
    if (!player.last_name?.trim()) {
      errors.push('Missing last_name');
    }
    if (!player.display_name?.trim()) {
      errors.push('Missing display_name');
    }
    if (!player.position) {
      errors.push('Missing position');
    }
    if (!player.nfl_team) {
      errors.push('Missing nfl_team');
    }

    // Enum validations
    if (player.position && !VALID_POSITIONS.includes(player.position)) {
      errors.push(`Invalid position: ${player.position}`);
    }
    if (player.nfl_team && !VALID_TEAMS.includes(player.nfl_team)) {
      errors.push(`Invalid team: ${player.nfl_team}`);
    }
    if (player.injury_status && !VALID_INJURY_STATUS.includes(player.injury_status)) {
      errors.push(`Invalid injury_status: ${player.injury_status}`);
    }

    // Range validations
    if (player.jersey_number !== null && (player.jersey_number < 0 || player.jersey_number > 99)) {
      errors.push(`Invalid jersey_number: ${player.jersey_number}`);
    }
    if (player.height_inches !== null && (player.height_inches < 60 || player.height_inches > 84)) {
      errors.push(`Invalid height_inches: ${player.height_inches}`);
    }
    if (player.weight_pounds !== null && (player.weight_pounds < 150 || player.weight_pounds > 400)) {
      errors.push(`Invalid weight_pounds: ${player.weight_pounds}`);
    }
    if (player.age !== null && (player.age < 18 || player.age > 50)) {
      errors.push(`Invalid age: ${player.age}`);
    }
    if (player.bye_week !== null && (player.bye_week < 1 || player.bye_week > 18)) {
      errors.push(`Invalid bye_week: ${player.bye_week}`);
    }
    if (player.depth_chart_position !== null && (player.depth_chart_position < 1 || player.depth_chart_position > 10)) {
      errors.push(`Invalid depth_chart_position: ${player.depth_chart_position}`);
    }

    // Percentage validations
    if (player.target_share !== null && (player.target_share < 0 || player.target_share > 100)) {
      errors.push(`Invalid target_share: ${player.target_share}`);
    }
    if (player.snap_count_percentage !== null && (player.snap_count_percentage < 0 || player.snap_count_percentage > 100)) {
      errors.push(`Invalid snap_count_percentage: ${player.snap_count_percentage}`);
    }
    if (player.red_zone_usage !== null && (player.red_zone_usage < 0 || player.red_zone_usage > 100)) {
      errors.push(`Invalid red_zone_usage: ${player.red_zone_usage}`);
    }

    return errors;
  }

  /**
   * Process raw player data and add required fields
   */
  private processPlayer(player: PlayerImportData): ProcessedPlayer {
    const now = new Date().toISOString();
    
    return {
      ...player,
      id: randomUUID(),
      created_at: now,
      updated_at: now
    };
  }

  /**
   * Check if player already exists in database
   */
  private async playerExists(externalId: string | null, firstName: string, lastName: string): Promise<boolean> {
    if (externalId) {
      const { data } = await this.supabase
        .from('nfl_players')
        .select('id')
        .eq('player_external_id', externalId)
        .limit(1);
      
      if (data && data.length > 0) return true;
    }

    // Fallback to name matching
    const { data } = await this.supabase
      .from('nfl_players')
      .select('id')
      .eq('first_name', firstName)
      .eq('last_name', lastName)
      .limit(1);

    return Boolean(data && data.length > 0);
  }

     /**
    * Import players in batches
    */
  private async importBatch(players: ProcessedPlayer[], options: ImportOptions): Promise<void> {
    if (options.dryRun) {
      console.log(`[DRY RUN] Would import ${players.length} players`);
      this.stats.successful += players.length;
      return;
    }

    try {
      if (options.mode === 'upsert') {
        const { data, error } = await this.supabase
          .from('nfl_players')
          .upsert(players as any, { 
            onConflict: 'player_external_id',
            ignoreDuplicates: false 
          })
          .select('id');

        if (error) throw error;
        this.stats.successful += data?.length || 0;
      } else {
        // Insert mode
        const { data, error } = await this.supabase
          .from('nfl_players')
          .insert(players as any)
          .select('id');

        if (error) throw error;
        this.stats.successful += data?.length || 0;
      }
    } catch (error) {
      console.error(`Batch import failed:`, error);
      this.stats.failed += players.length;
      
      // Try individual imports for better error reporting
      for (const player of players) {
        try {
          await this.supabase
            .from('nfl_players')
            .insert(player as any);
          this.stats.successful++;
        } catch (individualError) {
          this.stats.failed++;
          this.stats.errors.push({
            player: `${player.first_name} ${player.last_name}`,
            error: individualError instanceof Error ? individualError.message : 'Unknown error'
          });
        }
      }
    }
  }

  /**
   * Main import function
   */
  async importPlayers(filePath: string, options?: Partial<ImportOptions>): Promise<ImportStats> {
    const defaultOptions: ImportOptions = {
      batchSize: 10,
      mode: 'insert',
      dryRun: false,
      skipValidation: false,
      updateExisting: false
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    console.log('🚀 Starting player import...');
    console.log(`📁 File: ${filePath}`);
    console.log(`⚙️  Mode: ${finalOptions.mode}`);
    console.log(`📦 Batch size: ${finalOptions.batchSize}`);
    console.log(`🔍 Dry run: ${finalOptions.dryRun ? 'Yes' : 'No'}`);
    console.log('');

    try {
      // Load and parse JSON data
      const jsonData = fs.readFileSync(filePath, 'utf-8');
      const rawPlayers: PlayerImportData[] = JSON.parse(jsonData);
      
      this.stats.total = rawPlayers.length;
      console.log(`📊 Found ${this.stats.total} players to import`);

      const validPlayers: ProcessedPlayer[] = [];
      const batch: ProcessedPlayer[] = [];

      // Process each player
      for (let i = 0; i < rawPlayers.length; i++) {
        const rawPlayer = rawPlayers[i];
        const playerName = `${rawPlayer.first_name} ${rawPlayer.last_name}`;

        console.log(`Processing ${i + 1}/${rawPlayers.length}: ${playerName}`);

        // Validation
        if (!finalOptions.skipValidation) {
          const validationErrors = this.validatePlayer(rawPlayer, i);
          if (validationErrors.length > 0) {
            console.log(`❌ Validation failed: ${validationErrors.join(', ')}`);
            this.stats.failed++;
            this.stats.errors.push({
              player: playerName,
              error: `Validation failed: ${validationErrors.join(', ')}`
            });
            continue;
          }
        }

        // Check for existing player
        if (!finalOptions.updateExisting && finalOptions.mode !== 'upsert') {
          const exists = await this.playerExists(
            rawPlayer.player_external_id,
            rawPlayer.first_name,
            rawPlayer.last_name
          );
          
          if (exists) {
            console.log(`⏭️  Skipping existing player: ${playerName}`);
            this.stats.skipped++;
            continue;
          }
        }

        // Process and add to batch
        const processedPlayer = this.processPlayer(rawPlayer);
        batch.push(processedPlayer);

        // Import batch when full
        if (batch.length >= finalOptions.batchSize) {
          console.log(`📤 Importing batch of ${batch.length} players...`);
          await this.importBatch([...batch], finalOptions);
          batch.length = 0; // Clear batch
        }
      }

      // Import remaining players
      if (batch.length > 0) {
        console.log(`📤 Importing final batch of ${batch.length} players...`);
        await this.importBatch(batch, finalOptions);
      }

      console.log('\n✅ Import completed!');
      this.printStats();

    } catch (error) {
      console.error('💥 Import failed:', error);
      throw error;
    }

    return this.stats;
  }

  /**
   * Print import statistics
   */
  private printStats(): void {
    console.log('\n📊 Import Statistics:');
    console.log(`   Total players: ${this.stats.total}`);
    console.log(`   ✅ Successful: ${this.stats.successful}`);
    console.log(`   ❌ Failed: ${this.stats.failed}`);
    console.log(`   ⏭️  Skipped: ${this.stats.skipped}`);
    
    if (this.stats.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.stats.errors.forEach(({ player, error }, index) => {
        console.log(`   ${index + 1}. ${player}: ${error}`);
      });
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('nfl_players')
        .select('count(*)')
        .limit(1);
      
      if (error) throw error;
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }
}

// CLI Script
async function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  const options: ImportOptions = {
    batchSize: 10,
    mode: 'insert',
    dryRun: false,
    skipValidation: false,
    updateExisting: false
  };

  let filePath = 'data/sample-players.json';

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--file':
        filePath = args[i + 1];
        i++;
        break;
      case '--batch-size':
        options.batchSize = parseInt(args[i + 1]);
        i++;
        break;
      case '--mode':
        options.mode = args[i + 1] as 'insert' | 'upsert' | 'update';
        i++;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--skip-validation':
        options.skipValidation = true;
        break;
      case '--update-existing':
        options.updateExisting = true;
        break;
      case '--help':
        console.log(`
Usage: npm run import-players [options]

Options:
  --file <path>           JSON file to import (default: data/sample-players.json)
  --batch-size <number>   Number of players per batch (default: 10)
  --mode <mode>           Import mode: insert, upsert, update (default: insert)
  --dry-run              Test run without actually importing
  --skip-validation      Skip data validation
  --update-existing      Update existing players
  --help                 Show this help message

Examples:
  npm run import-players
  npm run import-players -- --file data/my-players.json --batch-size 20
  npm run import-players -- --mode upsert --dry-run
        `);
        process.exit(0);
    }
  }

  try {
    // Load environment variables
    require('dotenv').config({ path: '.env.local' });

    const importer = new PlayerImporter();
    
    // Test connection first
    const connected = await importer.testConnection();
    if (!connected) {
      console.error('❌ Cannot connect to database. Please check your configuration.');
      process.exit(1);
    }

    // Run import
    const stats = await importer.importPlayers(filePath, options);
    
    // Exit with appropriate code
    process.exit(stats.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { PlayerImporter, type PlayerImportData, type ImportOptions, type ImportStats }; 
