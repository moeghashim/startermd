/**
 * Migration script to transfer existing file-based stats to Vercel KV
 * Run this once after setting up KV database in Vercel
 */

const fs = require('fs').promises;
const path = require('path');

// This will use your KV environment variables from .env.local
const { kv } = require('@vercel/kv');

const STATS_FILE = path.join(process.cwd(), 'data', 'stats.json');
const STATS_KEY = 'startermd:stats';

async function migrateStats() {
  console.log('🔄 Migrating stats from file to Vercel KV...');
  
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
    
    // Check if stats already exist in KV
    const existingKVStats = await kv.get(STATS_KEY);
    if (existingKVStats) {
      console.log('⚠️  Stats already exist in KV. Merging data...');
      
      // Merge the data
      const mergedStats = {
        totalGenerated: existingKVStats.totalGenerated + existingStats.totalGenerated,
        agentBreakdown: { ...existingKVStats.agentBreakdown },
        dailyStats: { ...existingKVStats.dailyStats },
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
      
      await kv.set(STATS_KEY, mergedStats);
      console.log('✅ Stats merged successfully!');
    } else {
      // No existing KV stats, just copy
      await kv.set(STATS_KEY, existingStats);
      console.log('✅ Stats migrated successfully!');
    }
    
    // Verify the migration
    const newStats = await kv.get(STATS_KEY);
    console.log('📊 Final stats in KV:');
    console.log(`   Total generated: ${newStats.totalGenerated}`);
    console.log(`   Agents: ${Object.keys(newStats.agentBreakdown).length}`);
    console.log(`   Days tracked: ${Object.keys(newStats.dailyStats).length}`);
    
    console.log('🎉 Migration completed!');
    console.log('💡 You can now deploy with KV-based stats logging.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('Make sure you have:');
    console.log('1. Set up Vercel KV database');
    console.log('2. Linked it to your project');
    console.log('3. Environment variables are available');
  }
}

migrateStats();
