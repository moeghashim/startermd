/**
 * Script to clean and reset the Supabase database for fresh start
 * This will:
 * 1. Drop the key_value_store table if it exists
 * 2. Create a fresh key_value_store table
 * 3. Initialize with empty stats
 */

const fsSync = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local manually
try {
  const envFile = fsSync.readFileSync('.env.local', 'utf8');
  envFile.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex > 0) {
        const key = trimmedLine.substring(0, equalIndex);
        let value = trimmedLine.substring(equalIndex + 1);
        // Remove surrounding quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }
  });
} catch (err) {
  console.log('No .env.local file found or error reading it');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Try to get the service role key for admin operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Debug - Supabase URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined');
console.log('🔍 Debug - Supabase Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'undefined');
console.log('🔍 Debug - Service Key:', supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'undefined');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables not found');
  console.error('Make sure .env.local contains:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

// Use service key if available, otherwise use anon key
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

const STATS_KEY = 'startermd_stats';

async function cleanDatabase() {
  console.log('🧹 Cleaning database and starting fresh...');
  
  try {
    // Step 1: Delete existing stats entry
    console.log('1. Deleting existing stats data...');
    const { error: deleteError } = await supabase
      .from('key_value_store')
      .delete()
      .eq('key', STATS_KEY);
    
    if (deleteError) {
      console.log('⚠️  Could not delete existing data (table might not exist):', deleteError.message);
    } else {
      console.log('✅ Existing stats data deleted');
    }

    // Step 2: Initialize with fresh empty stats
    console.log('2. Initializing with fresh empty stats...');
    const freshStats = {
      totalGenerated: 0,
      agentBreakdown: {},
      dailyStats: {},
      lastUpdated: new Date().toISOString()
    };

    const { error: insertError } = await supabase
      .from('key_value_store')
      .insert({ 
        key: STATS_KEY, 
        value: JSON.stringify(freshStats) 
      });

    if (insertError) {
      if (insertError.message.includes('relation "key_value_store" does not exist')) {
        console.log('❌ Table key_value_store does not exist. Creating it...');
        console.log('Please run this SQL in your Supabase SQL Editor:');
        console.log(`
CREATE TABLE key_value_store (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
        `);
        console.log('\nThen run this script again.');
        process.exit(1);
      }
      throw insertError;
    }

    console.log('✅ Fresh empty stats initialized');

    // Step 3: Verify the reset worked
    console.log('3. Verifying database reset...');
    const { data, error: fetchError } = await supabase
      .from('key_value_store')
      .select('value')
      .eq('key', STATS_KEY)
      .single();

    if (fetchError) throw fetchError;

    const verificationStats = JSON.parse(data.value);
    console.log('📊 Verified fresh stats:');
    console.log(`   Total generated: ${verificationStats.totalGenerated}`);
    console.log(`   Agent breakdown: ${JSON.stringify(verificationStats.agentBreakdown)}`);
    console.log(`   Daily stats: ${JSON.stringify(verificationStats.dailyStats)}`);
    console.log(`   Last updated: ${verificationStats.lastUpdated}`);

    console.log('🎉 Database successfully cleaned and reset!');
    console.log('💡 The stats tracking should now work properly.');

  } catch (error) {
    console.error('❌ Database cleaning failed:', error);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure your Supabase project is set up correctly');
    console.log('2. Ensure the key_value_store table exists (SQL provided above)');
    console.log('3. Check that your environment variables are correct');
    console.log('4. Verify your Supabase permissions allow table operations');
  }
}

cleanDatabase();
