/**
 * Migration script to transfer existing file-based stats to Supabase
 * Run this once after setting up Supabase database
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
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

console.log('🔍 Debug - Supabase URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined');
console.log('🔍 Debug - Supabase Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'undefined');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase environment variables not found');
  console.error('Make sure .env.local contains:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const STATS_FILE = path.join(process.cwd(), 'data', 'stats.json');
const STATS_KEY = 'startermd_stats';

async function migrateStats() {
  console.log('🔄 Migrating stats from file to Supabase...');
  
  try {
    // Check if stats file exists
    try {
      await fs.access(STATS_FILE);
    } catch {
      console.log('❌ No stats.json file found. Nothing to migrate.');
      return;
    }

    // Read existing stats
    const data = await fs.readFile(STATS_FILE, 'utf8');
    const existingStats = JSON.parse(data);
    
    console.log('📊 Found existing stats:');
    console.log(`   Total generated: ${existingStats.totalGenerated}`);
    console.log(`   Agents: ${Object.keys(existingStats.agentBreakdown).length}`);
    console.log(`   Days tracked: ${Object.keys(existingStats.dailyStats).length}`);
    
    // Check if stats already exist in Supabase
    const { data: existingData, error: fetchError } = await supabase
      .from('key_value_store')
      .select('value')
      .eq('key', STATS_KEY)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingData?.value) {
      console.log('⚠️  Stats already exist in Supabase. Merging data...');
      
      const existingSupabaseStats = JSON.parse(existingData.value);
      
      // Merge the data
      const mergedStats = {
        totalGenerated: existingSupabaseStats.totalGenerated + existingStats.totalGenerated,
        agentBreakdown: { ...existingSupabaseStats.agentBreakdown },
        dailyStats: { ...existingSupabaseStats.dailyStats },
        lastUpdated: new Date().toISOString()
      };
      
      // Merge agent breakdown
      for (const [agent, count] of Object.entries(existingStats.agentBreakdown)) {
        mergedStats.agentBreakdown[agent] = (mergedStats.agentBreakdown[agent] || 0) + count;
      }
      
      // Merge daily stats
      for (const [date, count] of Object.entries(existingStats.dailyStats)) {
        mergedStats.dailyStats[date] = (mergedStats.dailyStats[date] || 0) + count;
      }
      
      const { error: updateError } = await supabase
        .from('key_value_store')
        .upsert({ key: STATS_KEY, value: JSON.stringify(mergedStats) });

      if (updateError) throw updateError;
      
      console.log('✅ Stats merged successfully!');
    } else {
      // No existing Supabase stats, just copy
      const { error: insertError } = await supabase
        .from('key_value_store')
        .insert({ key: STATS_KEY, value: JSON.stringify(existingStats) });

      if (insertError) throw insertError;
      
      console.log('✅ Stats migrated successfully!');
    }
    
    // Verify the migration
    const { data: newData, error: verifyError } = await supabase
      .from('key_value_store')
      .select('value')
      .eq('key', STATS_KEY)
      .single();

    if (verifyError) throw verifyError;

    const newStats = JSON.parse(newData.value);
    console.log('📊 Final stats in Supabase:');
    console.log(`   Total generated: ${newStats.totalGenerated}`);
    console.log(`   Agents: ${Object.keys(newStats.agentBreakdown).length}`);
    console.log(`   Days tracked: ${Object.keys(newStats.dailyStats).length}`);
    
    console.log('🎉 Migration completed!');
    console.log('💡 You can now deploy with Supabase-based stats logging.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('Make sure you have:');
    console.log('1. Set up Supabase project');
    console.log('2. Created key_value_store table');
    console.log('3. Environment variables are available');
    console.log('\nTo create the key_value_store table, run this SQL in Supabase:');
    console.log(`
CREATE TABLE key_value_store (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
    `);
  }
}

migrateStats();
