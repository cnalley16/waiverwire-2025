# 🏈 NFL Data Pipeline - Quick Setup Guide

## ✅ Current Status
- App is running on port 3008 
- Database configuration issues resolved
- API endpoints are working (200 status codes)
- Ready for real NFL data integration

## 🚀 Next Steps (5 minutes)

### 1. Fix Environment Variables
Create `.env.local` in your project root with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://muuykkdjswanxszqsdyl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11dXlra2Rqc3dhbnhzenFzZHlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMjAwMDIsImV4cCI6MjA2NjY5NjAwMn0.R_e23Q02Hq_U1cAWvicGbGEezMcOmuhcXSktrxbpq2U

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3008
```

### 2. Install Python Dependencies

```bash
npm run nfl-data:setup
```

### 3. Test the Pipeline

```bash
# Fetch real NFL data and update your database
npm run nfl-data:full
```

This will:
- Fetch 2024 NFL rosters, stats, schedules, injuries
- Transform data to match your database schema  
- Calculate fantasy points (Standard, Half-PPR, Full-PPR)
- Generate baseline projections
- Update your Supabase database

## 📊 What You'll Get

- **~2,500 active NFL players** with complete roster info
- **Weekly stats** for all positions (QB, RB, WR, TE, K, DEF)
- **Historical data** back to 2018 for projection models
- **Advanced metrics** (EPA, CPOE, air yards, target share)
- **Injury reports** and player availability
- **Team schedules** and game results

## 🎯 Building Projection Models

The pipeline creates `data/nfl/projection_dataset.json` with comprehensive historical data perfect for your 2008 research implementation:

- Multi-year weekly performance patterns
- Risk factors (injury history, usage volatility)  
- Market efficiency indicators
- Portfolio correlation data

## 🔄 Ongoing Updates

```bash
# Weekly updates (run every Wednesday)
npm run nfl-data:full

# Individual components
npm run nfl-data:rosters     # Player updates
npm run nfl-data:injuries    # Injury reports  
npm run nfl-data:stats       # Latest stats
```

## 🛠️ Troubleshooting

**If Python fails:**
```bash
pip install nfl-data-py pandas python-dotenv requests
```

**If database update fails:**
- Check `.env.local` file exists with correct Supabase credentials
- Verify Supabase project is active
- Try running just the fetch: `npm run nfl-data:fetch`

## 📁 Generated Files

After running the pipeline, you'll have:

```
data/
├── nfl/                    # Raw NFL data  
│   ├── rosters_2024.json   # Player rosters
│   ├── *_stats_2024.json   # Position stats
│   ├── injuries_2024.json  # Injury reports
│   └── projection_dataset.json # Historical data
└── transformed/            # Database-ready data
    ├── players.json        # Transformed players
    ├── game_stats.json     # Weekly performance  
    └── projections.json    # Generated projections
```

## 🎉 Ready for Research Implementation

Once the data pipeline runs successfully, you'll have:

1. **Clean NFL dataset** replacing sample data
2. **Historical performance** for model training
3. **Risk assessment foundation** for your 2008 research
4. **Real-time updates** for in-season coaching

Your app will transform from demo mode to a fully functional fantasy football analytics platform with real NFL data! 