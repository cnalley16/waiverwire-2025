# Database Setup Instructions

## Current Status
✅ **WaiverWire app fully functional in demo mode**  
⏳ **Database connection pending**

## Supabase Connection Details

### Environment Variables
Copy these to your `.env` file when ready to connect:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=your-super-secret-key-here-change-in-production
NEXTAUTH_URL=http://localhost:3007

# Database Connection (choose one that works)
DATABASE_URL="postgresql://postgres.muuykkdjswanxszqsdyl:yfr.quw6mug6njh8TMY@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

### Connection Options (in order of preference)

**Option 1: Transaction Pooler (Port 6543)** ⭐ RECOMMENDED
```
DATABASE_URL="postgresql://postgres.muuykkdjswanxszqsdyl:yfr.quw6mug6njh8TMY@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

**Option 2: Session Pooler (Port 5432)**
```
DATABASE_URL="postgresql://postgres.muuykkdjswanxszqsdyl:yfr.quw6mug6njh8TMY@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

**Option 3: Direct Connection (Port 5432)**
```
DATABASE_URL="postgresql://postgres:yfr.quw6mug6njh8TMY@db.muuykkdjswanxszqsdyl.supabase.co:5432/postgres"
```

## Setup Steps

### 1. Update Environment File
Replace the contents of `.env` with one of the connection options above.

### 2. Create Database Tables
```bash
npx prisma db push
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Restart Development Server
```bash
npm run dev
```

## Troubleshooting

### Network Issues
- **Port 5432 blocked**: Use Transaction Pooler (Option 1)
- **Connection timeout**: Try different network or VPN
- **Authentication failed**: Verify password in Supabase dashboard

### Alternative: Reset Database Password
1. Go to Supabase Dashboard → Settings → Database
2. Click "Reset database password"
3. Update connection string with new password

### Verify Database is Active
1. Supabase Dashboard → SQL Editor
2. Run: `SELECT version();`
3. Should return: `PostgreSQL 17.4...`

## Demo Mode vs Live Database

**Demo Mode** (current):
- ✅ All features work
- ⚠️ Data resets on restart
- 🔄 Mock data for testing

**Live Database** (after setup):
- ✅ All features work
- ✅ Data persists permanently
- 🚀 Ready for production

## Database Schema

The following 17 tables will be created:
- User, League, Team, Player, Draft, Game
- Transaction, TradeOffer, Message, GameStats
- And 7 supporting relationship tables

Total: **Complete fantasy football platform database** 🏈 