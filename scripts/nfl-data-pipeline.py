#!/usr/bin/env python3
"""
NFL Data Pipeline for Waiver Wire Fantasy Football App
Uses nfl_data_py to fetch comprehensive NFL data and prepare it for our Next.js app

Features:
- Player stats and information
- Game schedules and results
- Team data and standings
- Historical performance data
- Injury reports
- Advanced metrics

Requirements:
pip install nfl-data-py pandas python-dotenv requests
"""

import nfl_data_py as nfl
import pandas as pd
import json
import os
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class NFLDataPipeline:
    def __init__(self, output_dir: str = "data/nfl"):
        self.output_dir = output_dir
        self.current_season = 2024  # Update as needed
        self.supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        self.supabase_key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"🏈 NFL Data Pipeline initialized")
        print(f"📁 Output directory: {output_dir}")
        print(f"📅 Current season: {self.current_season}")

    def fetch_roster_data(self, years: List[int] = None) -> pd.DataFrame:
        """Fetch comprehensive player roster data"""
        if years is None:
            years = [self.current_season]
        
        print(f"📋 Fetching roster data for {years}...")
        
        try:
            # Get roster data with player information
            rosters = nfl.import_rosters(years)
            print(f"✅ Retrieved {len(rosters)} roster entries")
            
            # Save to JSON for our app
            output_path = f"{self.output_dir}/rosters_{'-'.join(map(str, years))}.json"
            rosters.to_json(output_path, orient='records', indent=2)
            print(f"💾 Saved roster data to {output_path}")
            
            return rosters
            
        except Exception as e:
            print(f"❌ Error fetching roster data: {e}")
            return pd.DataFrame()

    def fetch_player_stats(self, years: List[int] = None, stat_type: str = 'passing') -> pd.DataFrame:
        """
        Fetch player statistics
        stat_type options: 'passing', 'rushing', 'receiving', 'kicking', 'defense'
        """
        if years is None:
            years = [self.current_season]
        
        print(f"📊 Fetching {stat_type} stats for {years}...")
        
        try:
            if stat_type == 'passing':
                stats = nfl.import_weekly_data(years, columns=['player_id', 'player_name', 'position', 'team', 
                                                             'week', 'season', 'completions', 'attempts', 
                                                             'passing_yards', 'passing_tds', 'interceptions',
                                                             'passing_epa', 'passing_first_downs'])
            elif stat_type == 'rushing':
                stats = nfl.import_weekly_data(years, columns=['player_id', 'player_name', 'position', 'team',
                                                             'week', 'season', 'carries', 'rushing_yards', 
                                                             'rushing_tds', 'rushing_epa', 'rushing_first_downs'])
            elif stat_type == 'receiving':
                stats = nfl.import_weekly_data(years, columns=['player_id', 'player_name', 'position', 'team',
                                                             'week', 'season', 'targets', 'receptions', 
                                                             'receiving_yards', 'receiving_tds', 'receiving_epa',
                                                             'receiving_first_downs'])
            else:
                # General stats
                stats = nfl.import_weekly_data(years)
            
            print(f"✅ Retrieved {len(stats)} {stat_type} stat entries")
            
            # Save to JSON
            output_path = f"{self.output_dir}/{stat_type}_stats_{'-'.join(map(str, years))}.json"
            stats.to_json(output_path, orient='records', indent=2)
            print(f"💾 Saved {stat_type} stats to {output_path}")
            
            return stats
            
        except Exception as e:
            print(f"❌ Error fetching {stat_type} stats: {e}")
            return pd.DataFrame()

    def fetch_schedule_data(self, years: List[int] = None) -> pd.DataFrame:
        """Fetch NFL schedule and game results"""
        if years is None:
            years = [self.current_season]
        
        print(f"📅 Fetching schedule data for {years}...")
        
        try:
            schedule = nfl.import_schedules(years)
            print(f"✅ Retrieved {len(schedule)} games")
            
            # Save to JSON
            output_path = f"{self.output_dir}/schedule_{'-'.join(map(str, years))}.json"
            schedule.to_json(output_path, orient='records', indent=2)
            print(f"💾 Saved schedule to {output_path}")
            
            return schedule
            
        except Exception as e:
            print(f"❌ Error fetching schedule: {e}")
            return pd.DataFrame()

    def fetch_injury_reports(self) -> pd.DataFrame:
        """Fetch current injury reports"""
        print("🏥 Fetching injury reports...")
        
        try:
            injuries = nfl.import_injuries([self.current_season])
            print(f"✅ Retrieved {len(injuries)} injury reports")
            
            # Save to JSON
            output_path = f"{self.output_dir}/injuries_{self.current_season}.json"
            injuries.to_json(output_path, orient='records', indent=2)
            print(f"💾 Saved injuries to {output_path}")
            
            return injuries
            
        except Exception as e:
            print(f"❌ Error fetching injuries: {e}")
            return pd.DataFrame()

    def fetch_team_data(self, years: List[int] = None) -> pd.DataFrame:
        """Fetch team information and logos"""
        print("🏟️ Fetching team data...")
        
        try:
            teams = nfl.import_team_desc()
            print(f"✅ Retrieved {len(teams)} teams")
            
            # Save to JSON
            output_path = f"{self.output_dir}/teams.json"
            teams.to_json(output_path, orient='records', indent=2)
            print(f"💾 Saved teams to {output_path}")
            
            return teams
            
        except Exception as e:
            print(f"❌ Error fetching team data: {e}")
            return pd.DataFrame()

    def create_player_projections_dataset(self, historical_years: List[int] = None) -> Dict:
        """
        Create comprehensive dataset for building projection models
        This will be the foundation for our custom projection algorithms
        """
        if historical_years is None:
            historical_years = list(range(2018, self.current_season + 1))
        
        print(f"🎯 Creating projection dataset for years {historical_years}...")
        
        dataset = {}
        
        try:
            # Get historical weekly data for pattern analysis
            print("📊 Fetching historical weekly performance...")
            weekly_data = nfl.import_weekly_data(historical_years)
            
            # Get seasonal stats for trend analysis
            print("📈 Fetching seasonal stats...")
            seasonal_data = nfl.import_seasonal_data(historical_years)
            
            # Get advanced stats (EPA, CPOE, etc.)
            print("🧮 Fetching advanced metrics...")
            pbp_data = nfl.import_pbp_data(historical_years, columns=[
                'player_id', 'passer_player_name', 'rusher_player_name', 'receiver_player_name',
                'week', 'season', 'epa', 'cpoe', 'air_yards', 'yards_after_catch'
            ])
            
            dataset = {
                'weekly_stats': weekly_data.to_dict('records'),
                'seasonal_stats': seasonal_data.to_dict('records'),
                'advanced_metrics': pbp_data.to_dict('records'),
                'metadata': {
                    'created_at': datetime.now().isoformat(),
                    'seasons': historical_years,
                    'records_count': {
                        'weekly': len(weekly_data),
                        'seasonal': len(seasonal_data),
                        'pbp': len(pbp_data)
                    }
                }
            }
            
            # Save comprehensive dataset
            output_path = f"{self.output_dir}/projection_dataset.json"
            with open(output_path, 'w') as f:
                json.dump(dataset, f, indent=2)
            
            print(f"✅ Created projection dataset with {len(weekly_data)} weekly records")
            print(f"💾 Saved dataset to {output_path}")
            
            return dataset
            
        except Exception as e:
            print(f"❌ Error creating projection dataset: {e}")
            return {}

    def update_supabase_database(self, data_type: str, data: List[Dict]) -> bool:
        """
        Update our Supabase database with fresh NFL data
        This replaces our sample data with real NFL data
        """
        if not self.supabase_url or not self.supabase_key:
            print("⚠️ Supabase credentials not found, skipping database update")
            return False
        
        print(f"🔄 Updating Supabase with {data_type} data ({len(data)} records)...")
        
        try:
            headers = {
                'apikey': self.supabase_key,
                'Authorization': f'Bearer {self.supabase_key}',
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            }
            
            # Map data types to Supabase table names
            table_mapping = {
                'players': 'nfl_players',
                'stats': 'player_game_stats',
                'projections': 'player_projections'
            }
            
            table_name = table_mapping.get(data_type, data_type)
            url = f"{self.supabase_url}/rest/v1/{table_name}"
            
            # Batch insert data
            batch_size = 100
            for i in range(0, len(data), batch_size):
                batch = data[i:i + batch_size]
                response = requests.post(url, headers=headers, json=batch)
                
                if response.status_code not in [200, 201]:
                    print(f"❌ Error updating batch {i//batch_size + 1}: {response.text}")
                    return False
                else:
                    print(f"✅ Updated batch {i//batch_size + 1}/{(len(data) + batch_size - 1)//batch_size}")
            
            print(f"🎉 Successfully updated {len(data)} {data_type} records in Supabase")
            return True
            
        except Exception as e:
            print(f"❌ Error updating Supabase: {e}")
            return False

    def run_full_pipeline(self):
        """Run the complete data pipeline"""
        print("🚀 Starting full NFL data pipeline...\n")
        
        # Fetch all data types
        self.fetch_team_data()
        self.fetch_roster_data([self.current_season])
        self.fetch_schedule_data([self.current_season])
        self.fetch_injury_reports()
        
        # Fetch stats for different positions
        self.fetch_player_stats([self.current_season], 'passing')
        self.fetch_player_stats([self.current_season], 'rushing')
        self.fetch_player_stats([self.current_season], 'receiving')
        
        # Create projection dataset
        self.create_player_projections_dataset()
        
        print("\n🎉 NFL data pipeline completed successfully!")
        print(f"📁 All data saved to: {self.output_dir}")
        print("\nNext steps:")
        print("1. Review the generated data files")
        print("2. Run data transformation to match our database schema")
        print("3. Import into Supabase database")
        print("4. Build projection models using historical data")

def main():
    """Main execution function"""
    if len(sys.argv) > 1:
        command = sys.argv[1]
    else:
        command = 'full'
    
    pipeline = NFLDataPipeline()
    
    if command == 'full':
        pipeline.run_full_pipeline()
    elif command == 'rosters':
        pipeline.fetch_roster_data()
    elif command == 'stats':
        pipeline.fetch_player_stats()
    elif command == 'schedule':
        pipeline.fetch_schedule_data()
    elif command == 'injuries':
        pipeline.fetch_injury_reports()
    elif command == 'projections':
        pipeline.create_player_projections_dataset()
    else:
        print("Usage: python nfl-data-pipeline.py [full|rosters|stats|schedule|injuries|projections]")

if __name__ == "__main__":
    main() 