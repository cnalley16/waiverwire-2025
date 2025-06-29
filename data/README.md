# NFL Player Data Import

This directory contains sample NFL player data and documentation for the import process.

## Files

- `sample-players.json` - Sample NFL player data for 2024 season (20 players)
- `README.md` - This documentation file

## Sample Data Structure

The JSON file contains an array of player objects with the following structure:

```json
{
  "player_external_id": "espn_4040715",
  "first_name": "Patrick",
  "last_name": "Mahomes",
  "display_name": "P. Mahomes",
  "position": "QB",
  "nfl_team": "KC",
  "jersey_number": 15,
  "height_inches": 75,
  "weight_pounds": 230,
  "age": 29,
  "years_pro": 7,
  "college": "Texas Tech",
  "bye_week": 6,
  "is_active": true,
  "is_rookie": false,
  "injury_status": "HEALTHY",
  "injury_details": null,
  "depth_chart_position": 1,
  "target_share": null,
  "snap_count_percentage": 98.5,
  "red_zone_usage": 85.2,
  "image_url": "https://a.espncdn.com/i/headshots/nfl/players/full/3139477.png"
}
```

## Field Descriptions

### Required Fields
- `first_name` - Player's first name
- `last_name` - Player's last name  
- `display_name` - Display format name (e.g., "P. Mahomes")
- `position` - Player position (QB, RB, WR, TE, K, DEF)
- `nfl_team` - NFL team abbreviation (32 teams)
- `is_active` - Whether player is currently active
- `is_rookie` - Whether player is a rookie
- `injury_status` - Current injury status

### Optional Fields
- `player_external_id` - External API identifier (ESPN, Yahoo, etc.)
- `jersey_number` - Jersey number (0-99)
- `height_inches` - Height in inches (60-84)
- `weight_pounds` - Weight in pounds (150-400)
- `age` - Player age (18-50)
- `years_pro` - Years in the NFL
- `college` - College attended
- `bye_week` - Bye week number (1-18)
- `injury_details` - Injury description
- `depth_chart_position` - Position on depth chart (1=starter)
- `target_share` - Percentage of team targets (WR/TE only, 0-100)
- `snap_count_percentage` - Percentage of snaps played (0-100)
- `red_zone_usage` - Red zone usage percentage (0-100)
- `image_url` - Player headshot URL

## Valid Values

### Positions
- `QB` - Quarterback
- `RB` - Running Back
- `WR` - Wide Receiver
- `TE` - Tight End
- `K` - Kicker
- `DEF` - Defense/Special Teams

### Teams
All 32 NFL teams: ARI, ATL, BAL, BUF, CAR, CHI, CIN, CLE, DAL, DEN, DET, GB, HOU, IND, JAX, KC, LV, LAC, LAR, MIA, MIN, NE, NO, NYG, NYJ, PHI, PIT, SF, SEA, TB, TEN, WAS

### Injury Status
- `HEALTHY` - No injury concerns
- `QUESTIONABLE` - Questionable for next game
- `DOUBTFUL` - Doubtful for next game
- `OUT` - Out for next game
- `IR` - Injured Reserve
- `PUP` - Physically Unable to Perform
- `DNR` - Did Not Return
- `SUSPENDED` - Suspended

## Sample Data Included

The `sample-players.json` file includes 20 top NFL players from the 2024 season:

### Quarterbacks (4)
- Patrick Mahomes (KC)
- Josh Allen (BUF) 
- Lamar Jackson (BAL)
- Jayden Daniels (WAS) - Rookie
- Aaron Rodgers (NYJ)

### Running Backs (3)
- Christian McCaffrey (SF)
- Austin Ekeler (WAS)
- Saquon Barkley (PHI)
- Derrick Henry (BAL)

### Wide Receivers (6)
- Tyreek Hill (MIA)
- Stefon Diggs (HOU)
- CeeDee Lamb (DAL)
- A.J. Brown (PHI)
- Marvin Harrison Jr. (ARI) - Rookie
- Cooper Kupp (LAR)

### Tight Ends (3)
- Travis Kelce (KC)
- Mark Andrews (BAL)
- Sam LaPorta (DET)

### Kicker (1)
- Justin Tucker (BAL)

### Defense (1)
- San Francisco 49ers (SF)

## Import Process

To import the sample data into your Supabase database:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Ensure environment variables are set in `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the import script:**
   ```bash
   npm run import-players
   ```

## Import Script Features

- ✅ **Validation** - Validates all required fields and data types
- ✅ **Duplicate Detection** - Skips players that already exist
- ✅ **Batch Processing** - Imports players in small batches (5 at a time)
- ✅ **Error Handling** - Graceful error handling with detailed reporting
- ✅ **Progress Tracking** - Real-time progress updates
- ✅ **UUID Generation** - Automatically generates unique IDs
- ✅ **Timestamps** - Adds created_at and updated_at timestamps

## Adding Your Own Data

To add your own player data:

1. Create a new JSON file in this directory
2. Follow the same structure as `sample-players.json`
3. Update the `dataPath` variable in `scripts/simple-import.ts`
4. Run the import script

## Data Sources

The sample data is based on 2024 NFL season information and includes:
- Real player statistics and information
- Current team affiliations as of 2024
- Realistic fantasy football projections
- Proper injury status updates

This data can be used for development and testing of your fantasy football application. 