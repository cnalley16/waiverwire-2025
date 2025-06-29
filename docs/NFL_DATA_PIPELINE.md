# NFL Data Pipeline Documentation

## Overview

The NFL Data Pipeline system uses `nfl_data_py` to fetch comprehensive, real NFL data and transforms it to match our database schema. This replaces our sample data with actual NFL statistics, rosters, and performance metrics.

## Features

✅ **Real NFL Data**: Comprehensive player rosters, stats, schedules, injuries  
✅ **Historical Analysis**: Multi-year data for projection model training  
✅ **Advanced Metrics**: EPA, CPOE, air yards, and more  
✅ **Automated Processing**: Python fetch + TypeScript transformation pipeline  
✅ **Database Integration**: Direct Supabase updates  
✅ **Fantasy Projections**: Custom projection algorithms based on historical data  

## Quick Start

### 1. Setup Python Environment

```bash
# Install Python dependencies
npm run nfl-data:setup

# Or manually:
pip install nfl-data-py pandas python-dotenv requests
```

### 2. Create Environment File

Create `.env.local` (if it doesn't exist) with your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://muuykkdjswanxszqsdyl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# NextAuth
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Run the Full Pipeline

```bash
# Fetch NFL data + transform + update database
npm run nfl-data:full

# Or run steps individually:
npm run nfl-data:fetch      # Fetch from NFL
npm run nfl-data:transform  # Transform to our schema
```

## Pipeline Components

### 1. Data Fetching (`nfl-data-pipeline.py`)

**Features:**
- Player rosters with detailed information
- Weekly and seasonal statistics  
- Game schedules and results
- Current injury reports
- Team information and logos
- Historical data for projection models

**Commands:**
```bash
python scripts/nfl-data-pipeline.py full         # Complete pipeline
python scripts/nfl-data-pipeline.py rosters      # Player rosters only
python scripts/nfl-data-pipeline.py stats        # Statistics only
python scripts/nfl-data-pipeline.py injuries     # Injury reports only
python scripts/nfl-data-pipeline.py projections  # Historical dataset
```

**Output:** Raw NFL data saved to `data/nfl/` directory

### 2. Data Transformation (`transform-nfl-data.ts`)

**Features:**
- Converts `nfl_data_py` format to our database schema
- Generates fantasy point calculations (Standard, Half-PPR, Full-PPR)
- Creates baseline projections from historical data
- Validates data integrity
- Batch updates Supabase database

**Command:**
```bash
npm run nfl-data:transform
```

**Output:** Database-ready files in `data/transformed/` directory

## Data Schema Mapping

### NFL Data → Our Database

| nfl_data_py Field | Our Schema Field | Notes |
|-------------------|------------------|-------|
| `player_id` | `nfl_player_id` | External NFL ID |
| `player_name` | `first_name`, `last_name`, `display_name` | Parsed names |
| `position` | `position` | Standardized positions |
| `team` | `nfl_team` | Team abbreviations |
| `height` | `height_inches` | Converted to inches |
| `weight` | `weight_lbs` | Weight in pounds |
| `years_exp` | `years_experience` | NFL experience |
| Weekly stats | `player_game_stats` | Game-by-game performance |

### Fantasy Points Calculation

```typescript
// Standard scoring
points = (passing_yards * 0.04) + (passing_tds * 4) - (interceptions * 2) +
         (rushing_yards * 0.1) + (rushing_tds * 6) +
         (receiving_yards * 0.1) + (receiving_tds * 6)

// Half-PPR: + (receptions * 0.5)
// Full-PPR: + (receptions * 1.0)
```

## Generated Data Files

### Raw NFL Data (`data/nfl/`)
- `rosters_2024.json` - Current player rosters
- `passing_stats_2024.json` - QB statistics  
- `rushing_stats_2024.json` - RB statistics
- `receiving_stats_2024.json` - WR/TE statistics
- `schedule_2024.json` - Game schedules
- `injuries_2024.json` - Current injury reports
- `teams.json` - Team information
- `projection_dataset.json` - Historical data for ML models

### Transformed Data (`data/transformed/`)
- `players.json` - Database-ready player records
- `game_stats.json` - Weekly performance data
- `projections.json` - Generated baseline projections

## Database Integration

The pipeline automatically updates these Supabase tables:

1. **`nfl_players`** - Player roster and information
2. **`player_game_stats`** - Weekly performance statistics  
3. **`player_projections`** - Generated fantasy projections

### Batch Processing
- Data is inserted in batches of 100 records
- Uses `upsert` to handle existing records
- Includes error handling and progress tracking

## Building Custom Projection Models

The historical dataset (`projection_dataset.json`) includes:

### Weekly Performance Data
- Individual game statistics
- Fantasy points by scoring system
- Snap counts and usage rates
- Red zone opportunities

### Advanced Metrics
- Expected Points Added (EPA)
- Completion Percentage Over Expected (CPOE)
- Air yards and yards after catch
- Target share and snap percentage

### Sample Model Training

```python
import json
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

# Load historical data
with open('data/nfl/projection_dataset.json', 'r') as f:
    dataset = json.load(f)

weekly_data = pd.DataFrame(dataset['weekly_stats'])

# Example: Predict next week's fantasy points
features = ['targets', 'snap_percentage', 'red_zone_targets', 'air_yards_share']
target = 'fantasy_points_half_ppr'

model = RandomForestRegressor(n_estimators=100)
model.fit(weekly_data[features], weekly_data[target])
```

## Scheduling and Automation

### Weekly Updates

```bash
# Add to cron job for weekly updates
0 8 * * WED npm run nfl-data:full  # Every Wednesday at 8 AM
```

### Error Handling

The pipeline includes comprehensive error handling:
- Network timeouts and retries
- Data validation checks
- Partial failure recovery
- Detailed logging and progress tracking

## Troubleshooting

### Common Issues

**1. Python Dependencies Missing**
```bash
pip install nfl-data-py pandas python-dotenv requests
```

**2. Supabase Connection Errors**
- Verify `.env.local` credentials
- Check Supabase project status
- Confirm API keys have proper permissions

**3. Data Validation Failures**
- Check NFL data source availability
- Verify team/position mappings
- Review transformation logs

**4. Memory Issues with Large Datasets**
- Reduce year range in historical data
- Use batch processing for large imports
- Monitor system resources

### Debug Commands

```bash
# Test NFL data connection
python -c "import nfl_data_py as nfl; print(nfl.import_team_desc())"

# Validate transformed data
node -e "const data = require('./data/transformed/players.json'); console.log(\`\${data.length} players loaded\`)"

# Test Supabase connection
curl -H "apikey: YOUR_KEY" "YOUR_SUPABASE_URL/rest/v1/nfl_players?select=count"
```

## Next Steps

1. **Run the Pipeline**: Start with `npm run nfl-data:full`
2. **Review Data**: Check generated files in `data/transformed/`
3. **Verify Database**: Confirm Supabase tables are populated
4. **Build Models**: Use historical data to create projection algorithms
5. **Automate Updates**: Set up weekly data refresh schedule

## Research Integration

This pipeline provides the foundation for implementing your 2008 research paper's risk-adjusted projections:

- **Historical Performance**: Multi-year weekly statistics
- **Advanced Metrics**: EPA, situational usage, target share
- **Risk Factors**: Injury history, usage volatility, team context
- **Market Data**: ADP, ownership percentages (when available)

The clean, structured data enables sophisticated modeling approaches like:
- Monte Carlo simulations for projection distributions
- Correlation analysis for portfolio optimization  
- Risk-adjusted expected value calculations
- Bayesian updating with new information 