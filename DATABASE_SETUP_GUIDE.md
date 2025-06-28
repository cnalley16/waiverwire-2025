# 🗄️ Database Setup Guide

## ✅ Current Status
Your app is now running in **DEMO MODE** - you can sign in and explore the interface without a database!

## 🚀 Choose Your Setup Option

### Option 1: Keep Demo Mode (No Database) ⭐ EASIEST
**Perfect for exploring the app and testing features**

✅ **Already working!** 
- Sign in with any email/password
- Explore the beautiful interface
- Test all the hover effects
- See the complete UI design

**Limitations:**
- No persistent data (leagues reset on restart)
- Can't create real leagues
- No data storage

---

### Option 2: Quick Cloud Database Setup ⭐ RECOMMENDED
**Get full functionality in 5 minutes**

#### Step 1: Get a Free Database
Choose one of these free providers:

**🟢 Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub/Google (free)
4. Create a new project
5. Copy the "DATABASE_URL" from Settings > Database

**🔵 Neon**
1. Go to [neon.tech](https://neon.tech)
2. Sign up (free tier available)
3. Create a database
4. Copy the connection string

**🟡 Railway**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new PostgreSQL database
4. Copy the connection string

#### Step 2: Update Your Environment
1. Open the `.env.local` file in your project
2. Replace the DATABASE_URL line with your real connection string:
   ```env
   DATABASE_URL="your-actual-database-connection-string"
   ```

#### Step 3: Setup the Database
Run these commands in your terminal:
```bash
npx prisma migrate dev --name init
```

#### Step 4: Restart the App
```bash
npm run dev
```

**🎉 Done!** Now you can create real leagues that persist!

---

### Option 3: Local Database Setup ⚙️ ADVANCED
**For developers who want local control**

#### Install PostgreSQL Locally
1. Download and install PostgreSQL
2. Create a database called `waiverwire_dev`
3. Update `.env.local` with local connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/waiverwire_dev"
   ```
4. Run migrations: `npx prisma migrate dev --name init`

---

## 🤔 Which Option Should I Choose?

**Just exploring?** → Stay in Demo Mode  
**Want full features quickly?** → Use Supabase (Option 2)  
**Developer/Advanced user?** → Local setup (Option 3)

## 🆘 Need Help?

If you run into any issues:
1. Check the console for error messages
2. Make sure your DATABASE_URL is correct
3. Try restarting the dev server
4. The app will fallback to demo mode if database connection fails

**Remember:** The app is designed to work gracefully with or without a database! 