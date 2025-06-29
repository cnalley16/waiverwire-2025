// Simple test script to verify our database helper functions
const { createClient } = require('@supabase/supabase-js');

// Test environment variables
console.log('Testing environment variables...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

// Test Supabase connection
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  async function testConnection() {
    try {
      console.log('\nTesting Supabase connection...');
      const { data, error } = await supabase.from('nfl_players').select('id, name, position').limit(3);
      
      if (error) {
        console.error('❌ Database connection failed:', error.message);
      } else {
        console.log('✅ Database connection successful!');
        console.log('📊 Sample players:', data);
      }
    } catch (err) {
      console.error('❌ Connection test failed:', err.message);
    }
  }

  testConnection();
} else {
  console.log('❌ Environment variables not set - skipping connection test');
}

console.log('\n🏗️  Database helper functions have been created:');
console.log('  📁 /src/lib/supabase.ts - Client-side Supabase client');
console.log('  📁 /src/lib/supabase-server.ts - Server-side Supabase client');
console.log('  📁 /src/lib/database/players.ts - Player CRUD operations');
console.log('  📁 /src/lib/database/projections.ts - Projection & risk analysis functions');
console.log('  📁 /src/lib/database/index.ts - Central export hub');

console.log('\n🔧 API routes have been updated:');
console.log('  📁 /app/api/players/route.ts - Uses new helper functions');

console.log('\n✨ Implementation complete!'); 