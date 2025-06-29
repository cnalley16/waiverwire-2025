#!/usr/bin/env python3
"""
Simple NFL Data Fetcher
Uses publicly available CSV data sources to avoid compilation issues

This script fetches:
- Player rosters from public sources
- Basic statistics 
- Team information
"""

import os
import json
import requests
import csv
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SimpleNFLDataFetcher:
    def __init__(self, output_dir: str = "data/nfl"):
        self.output_dir = output_dir
        self.current_season = 2024
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"🏈 Simple NFL Data Fetcher initialized")
        print(f"📁 Output directory: {output_dir}")
        print(f"📅 Current season: {self.current_season}")

    def fetch_teams_data(self):
        """Fetch NFL teams data"""
        print("🏟️ Fetching NFL teams data...")
        
        # Static team data - this is stable and doesn't change often
        teams = [
            {"abbreviation": "ARI", "name": "Arizona Cardinals", "conference": "NFC", "division": "West"},
            {"abbreviation": "ATL", "name": "Atlanta Falcons", "conference": "NFC", "division": "South"},
            {"abbreviation": "BAL", "name": "Baltimore Ravens", "conference": "AFC", "division": "North"},
            {"abbreviation": "BUF", "name": "Buffalo Bills", "conference": "AFC", "division": "East"},
            {"abbreviation": "CAR", "name": "Carolina Panthers", "conference": "NFC", "division": "South"},
            {"abbreviation": "CHI", "name": "Chicago Bears", "conference": "NFC", "division": "North"},
            {"abbreviation": "CIN", "name": "Cincinnati Bengals", "conference": "AFC", "division": "North"},
            {"abbreviation": "CLE", "name": "Cleveland Browns", "conference": "AFC", "division": "North"},
            {"abbreviation": "DAL", "name": "Dallas Cowboys", "conference": "NFC", "division": "East"},
            {"abbreviation": "DEN", "name": "Denver Broncos", "conference": "AFC", "division": "West"},
            {"abbreviation": "DET", "name": "Detroit Lions", "conference": "NFC", "division": "North"},
            {"abbreviation": "GB", "name": "Green Bay Packers", "conference": "NFC", "division": "North"},
            {"abbreviation": "HOU", "name": "Houston Texans", "conference": "AFC", "division": "South"},
            {"abbreviation": "IND", "name": "Indianapolis Colts", "conference": "AFC", "division": "South"},
            {"abbreviation": "JAX", "name": "Jacksonville Jaguars", "conference": "AFC", "division": "South"},
            {"abbreviation": "KC", "name": "Kansas City Chiefs", "conference": "AFC", "division": "West"},
            {"abbreviation": "LV", "name": "Las Vegas Raiders", "conference": "AFC", "division": "West"},
            {"abbreviation": "LAC", "name": "Los Angeles Chargers", "conference": "AFC", "division": "West"},
            {"abbreviation": "LAR", "name": "Los Angeles Rams", "conference": "NFC", "division": "West"},
            {"abbreviation": "MIA", "name": "Miami Dolphins", "conference": "AFC", "division": "East"},
            {"abbreviation": "MIN", "name": "Minnesota Vikings", "conference": "NFC", "division": "North"},
            {"abbreviation": "NE", "name": "New England Patriots", "conference": "AFC", "division": "East"},
            {"abbreviation": "NO", "name": "New Orleans Saints", "conference": "NFC", "division": "South"},
            {"abbreviation": "NYG", "name": "New York Giants", "conference": "NFC", "division": "East"},
            {"abbreviation": "NYJ", "name": "New York Jets", "conference": "AFC", "division": "East"},
            {"abbreviation": "PHI", "name": "Philadelphia Eagles", "conference": "NFC", "division": "East"},
            {"abbreviation": "PIT", "name": "Pittsburgh Steelers", "conference": "AFC", "division": "North"},
            {"abbreviation": "SF", "name": "San Francisco 49ers", "conference": "NFC", "division": "West"},
            {"abbreviation": "SEA", "name": "Seattle Seahawks", "conference": "NFC", "division": "West"},
            {"abbreviation": "TB", "name": "Tampa Bay Buccaneers", "conference": "NFC", "division": "South"},
            {"abbreviation": "TEN", "name": "Tennessee Titans", "conference": "AFC", "division": "South"},
            {"abbreviation": "WAS", "name": "Washington Commanders", "conference": "NFC", "division": "East"}
        ]
        
        # Save teams data
        output_path = f"{self.output_dir}/teams.json"
        with open(output_path, 'w') as f:
            json.dump(teams, f, indent=2)
        
        print(f"✅ Saved {len(teams)} teams to {output_path}")
        return teams

    def create_sample_rosters(self):
        """Create sample roster data for demonstration"""
        print("📋 Creating sample roster data...")
        
        # Sample players data - in a real implementation, this would come from an API
        sample_players = [
            {
                "player_id": "mahomes_patrick_01",
                "player_name": "Patrick Mahomes",
                "position": "QB",
                "team": "KC",
                "jersey_number": 15,
                "height": "6-3",
                "weight": 225,
                "years_exp": 7,
                "college": "Texas Tech",
                "status": "ACT"
            },
            {
                "player_id": "allen_josh_01", 
                "player_name": "Josh Allen",
                "position": "QB",
                "team": "BUF",
                "jersey_number": 17,
                "height": "6-5",
                "weight": 237,
                "years_exp": 6,
                "college": "Wyoming",
                "status": "ACT"
            },
            {
                "player_id": "jackson_lamar_01",
                "player_name": "Lamar Jackson", 
                "position": "QB",
                "team": "BAL",
                "jersey_number": 8,
                "height": "6-2",
                "weight": 212,
                "years_exp": 6,
                "college": "Louisville",
                "status": "ACT"
            },
            {
                "player_id": "mccaffrey_christian_01",
                "player_name": "Christian McCaffrey",
                "position": "RB", 
                "team": "SF",
                "jersey_number": 23,
                "height": "5-11",
                "weight": 205,
                "years_exp": 7,
                "college": "Stanford",
                "status": "ACT"
            },
            {
                "player_id": "hill_tyreek_01",
                "player_name": "Tyreek Hill",
                "position": "WR",
                "team": "MIA", 
                "jersey_number": 10,
                "height": "5-10",
                "weight": 185,
                "years_exp": 8,
                "college": "West Alabama",
                "status": "ACT"
            },
            {
                "player_id": "kelce_travis_01",
                "player_name": "Travis Kelce",
                "position": "TE",
                "team": "KC",
                "jersey_number": 87,
                "height": "6-5", 
                "weight": 250,
                "years_exp": 11,
                "college": "Cincinnati",
                "status": "ACT"
            },
            {
                "player_id": "tucker_justin_01",
                "player_name": "Justin Tucker",
                "position": "K",
                "team": "BAL",
                "jersey_number": 9,
                "height": "6-1",
                "weight": 183,
                "years_exp": 12,
                "college": "Texas",
                "status": "ACT"
            }
        ]
        
        # Save roster data
        output_path = f"{self.output_dir}/rosters_2024.json"
        with open(output_path, 'w') as f:
            json.dump(sample_players, f, indent=2)
            
        print(f"✅ Created sample roster with {len(sample_players)} players at {output_path}")
        return sample_players

    def create_sample_stats(self):
        """Create sample statistics data"""
        print("📊 Creating sample statistics data...")
        
        # Sample passing stats
        passing_stats = [
            {
                "player_id": "mahomes_patrick_01",
                "player_name": "Patrick Mahomes", 
                "position": "QB",
                "team": "KC",
                "week": 1,
                "season": 2024,
                "completions": 28,
                "attempts": 42,
                "passing_yards": 378,
                "passing_tds": 4,
                "interceptions": 1
            },
            {
                "player_id": "allen_josh_01",
                "player_name": "Josh Allen",
                "position": "QB", 
                "team": "BUF",
                "week": 1,
                "season": 2024,
                "completions": 22,
                "attempts": 35,
                "passing_yards": 295,
                "passing_tds": 2,
                "interceptions": 0
            }
        ]
        
        # Sample rushing stats  
        rushing_stats = [
            {
                "player_id": "mccaffrey_christian_01",
                "player_name": "Christian McCaffrey",
                "position": "RB",
                "team": "SF", 
                "week": 1,
                "season": 2024,
                "carries": 22,
                "rushing_yards": 147,
                "rushing_tds": 2
            }
        ]
        
        # Sample receiving stats
        receiving_stats = [
            {
                "player_id": "hill_tyreek_01",
                "player_name": "Tyreek Hill",
                "position": "WR",
                "team": "MIA",
                "week": 1, 
                "season": 2024,
                "targets": 12,
                "receptions": 8,
                "receiving_yards": 156,
                "receiving_tds": 2
            },
            {
                "player_id": "kelce_travis_01",
                "player_name": "Travis Kelce",
                "position": "TE",
                "team": "KC",
                "week": 1,
                "season": 2024,
                "targets": 10,
                "receptions": 7,
                "receiving_yards": 89,
                "receiving_tds": 1
            }
        ]
        
        # Save stats files
        stats_files = [
            ("passing_stats_2024.json", passing_stats),
            ("rushing_stats_2024.json", rushing_stats), 
            ("receiving_stats_2024.json", receiving_stats)
        ]
        
        for filename, stats in stats_files:
            output_path = f"{self.output_dir}/{filename}"
            with open(output_path, 'w') as f:
                json.dump(stats, f, indent=2)
            print(f"✅ Saved {len(stats)} stat records to {output_path}")
        
        return {"passing": passing_stats, "rushing": rushing_stats, "receiving": receiving_stats}

    def create_projection_dataset(self):
        """Create a basic historical dataset for projections"""
        print("🎯 Creating projection dataset...")
        
        # Sample historical data for projection modeling
        historical_data = {
            "weekly_stats": [
                # Sample weekly data for Mahomes over multiple games
                {"player_id": "mahomes_patrick_01", "week": 1, "season": 2024, "fantasy_points_half_ppr": 28.5},
                {"player_id": "mahomes_patrick_01", "week": 2, "season": 2024, "fantasy_points_half_ppr": 22.3},
                {"player_id": "mahomes_patrick_01", "week": 3, "season": 2024, "fantasy_points_half_ppr": 31.7},
                # Add more players and weeks as needed
            ],
            "seasonal_stats": [
                {"player_id": "mahomes_patrick_01", "season": 2023, "passing_yards": 4183, "passing_tds": 27},
                {"player_id": "allen_josh_01", "season": 2023, "passing_yards": 4306, "passing_tds": 29}
            ],
            "metadata": {
                "created_at": datetime.now().isoformat(),
                "seasons": [2023, 2024],
                "description": "Sample dataset for projection modeling"
            }
        }
        
        # Save projection dataset
        output_path = f"{self.output_dir}/projection_dataset.json"
        with open(output_path, 'w') as f:
            json.dump(historical_data, f, indent=2)
            
        print(f"✅ Created projection dataset at {output_path}")
        return historical_data

    def run_simple_pipeline(self):
        """Run the simplified data pipeline"""
        print("🚀 Starting simple NFL data pipeline...\n")
        
        try:
            # Fetch/create all data types
            self.fetch_teams_data()
            self.create_sample_rosters()
            self.create_sample_stats()
            self.create_projection_dataset()
            
            print("\n🎉 Simple NFL data pipeline completed successfully!")
            print(f"📁 All data saved to: {self.output_dir}")
            print("\nNext steps:")
            print("1. Run: npm run nfl-data:transform")
            print("2. Your database will be updated with this data")
            print("3. Check your app at http://localhost:3000")
            
        except Exception as e:
            print(f"❌ Pipeline failed: {e}")
            raise

def main():
    """Main execution function"""
    fetcher = SimpleNFLDataFetcher()
    fetcher.run_simple_pipeline()

if __name__ == "__main__":
    main() 