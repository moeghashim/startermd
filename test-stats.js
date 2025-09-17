// Test the actual stats functions that the app uses
import { getStats, updateStats } from './src/lib/stats.js';

async function testStatsFlow() {
  console.log('🧪 Testing stats flow...');
  
  try {
    // Get current stats
    const currentStats = await getStats();
    console.log('📊 Current stats:', currentStats);
    
    // Test update
    console.log('🔄 Testing stats update...');
    await updateStats('Test Update');
    
    // Get updated stats
    const updatedStats = await getStats();
    console.log('📊 Updated stats:', updatedStats);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testStatsFlow();
