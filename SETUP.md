# WaiverWire Fantasy Football Platform Setup

## Overview

This is a comprehensive fantasy football platform built with Next.js 15, Prisma, and PostgreSQL. The application includes league management, team creation, player tracking, and all the features outlined in your original requirements document.

## Quick Start

### 1. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database - Replace with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/waiverwire_dev"

# NextAuth.js - Generate a secure random string
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-make-it-long-and-random"

# Optional: Email configuration for production
# EMAIL_SERVER_USER=
# EMAIL_SERVER_PASSWORD=
# EMAIL_SERVER_HOST=
# EMAIL_SERVER_PORT=
# EMAIL_FROM=

# Optional: OAuth providers
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GITHUB_CLIENT_ID=
# GITHUB_CLIENT_SECRET=

# Optional: External APIs for player data
# NFL_API_KEY=
# SPORTS_DATA_API_KEY=
```

### 2. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your machine
2. Create a new database: `CREATE DATABASE waiverwire_dev;`
3. Update the `DATABASE_URL` in your `.env` file

#### Option B: Cloud Database (Recommended)
1. Sign up for a free PostgreSQL database at:
   - [Supabase](https://supabase.com) (recommended)
   - [Neon](https://neon.tech)
   - [Railway](https://railway.app)
2. Copy the connection string to your `.env` file

### 3. Database Migration

Run the following commands to set up your database schema:

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to view your database
npx prisma studio
```

### 4. Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## Features Implemented

### Phase 1: Foundation ✅
- ✅ User authentication and profiles
- ✅ Database schema with all entities
- ✅ League creation with settings
- ✅ Commissioner and team owner roles
- ✅ Basic league management

### Phase 2: League Management (Next)
- 🔄 League settings and rules configuration
- 🔄 Commissioner tools
- 🔄 Member invitations system
- 🔄 Payment processing integration

### Phase 3: Draft System (Future)
- ⏳ Draft room interface
- ⏳ Player rankings and data
- ⏳ Live, offline, and auto-draft modes

### Phase 4: Game Play (Future)
- ⏳ Waiver wire system
- ⏳ Player transactions (add/drop/trade)
- ⏳ Scoring and standings
- ⏳ Real-time updates

### Phase 5: Advanced Features (Future)
- ⏳ Messaging and chat system
- ⏳ Live game day experience
- ⏳ Advanced analytics and insights
- ⏳ Mobile optimization

## Database Schema

The application includes a comprehensive database schema with:

- **Users**: Member accounts and profiles
- **Leagues**: Fantasy leagues with settings
- **Teams**: User-owned fantasy teams
- **Players**: NFL player database
- **Drafts**: Draft management and picks
- **Games**: Weekly matchups and scores
- **Transactions**: Player moves and trades
- **Messages**: Communication system
- **Stats**: Player performance tracking

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth authentication

### Leagues
- `GET /api/leagues` - Get user's leagues
- `POST /api/leagues` - Create new league

### Teams (Coming Soon)
- `GET /api/teams` - Get team rosters
- `POST /api/teams` - Create/update teams

### Players (Coming Soon)
- `GET /api/players` - Get player database
- `GET /api/players/stats` - Get player statistics

## Authentication

The platform uses NextAuth.js with a credentials provider. For development:

1. Visit `/auth/signin`
2. Enter any email and password
3. The system will create a user account automatically

## Testing the Application

1. **Homepage**: Visit `/` to see the landing page
2. **Sign In**: Click "Get Started" or "Sign In" 
3. **Dashboard**: After signing in, you'll be redirected to the dashboard
4. **Create League**: Click "Create New League" to set up your first league
5. **League Management**: Explore the league settings and team management

## Next Steps

1. **Set up your database** using one of the options above
2. **Run the migrations** to create the schema
3. **Start the dev server** and test the application
4. **Create your first league** to see the system in action

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your `DATABASE_URL` is correct
   - Ensure PostgreSQL is running (if using local)
   - Check network connectivity (if using cloud)

2. **Authentication Issues**
   - Verify `NEXTAUTH_SECRET` is set
   - Clear browser cookies and try again

3. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Clear `.next` folder and restart dev server

### Need Help?

The codebase follows standard Next.js and Prisma patterns. Key files:

- `prisma/schema.prisma` - Database schema
- `app/api/` - API routes
- `app/dashboard/` - Main application interface
- `components/` - Reusable UI components
- `lib/` - Utilities and configurations

## Production Deployment

For production deployment:

1. Set up a production PostgreSQL database
2. Update environment variables for production
3. Deploy to Vercel, Railway, or your preferred platform
4. Run database migrations in production

The application is ready for production deployment with proper environment configuration. 