/**
 * Test the exact lib functions that the API routes use
 */

// Set up environment like the web framework would
const fs = require('fs');
const path = require('path');

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  });
}

async function testLibFunctions() {
  console.log('🧪 Testing lib functions in Node.js context...');
  
  try {
    // Import the stats functions
    const { getStats, updateStats } = require('../src/lib/stats.ts');
    
    console.log('\n1. Testing getStats function...');
    const stats = await getStats();
    console.log('Stats result:', stats);
    
    console.log('\n2. Testing updateStats function...');
    await updateStats('LibFunctionTest');
    console.log('Update successful');
    
    console.log('\n3. Verifying update...');
    const updatedStats = await getStats();
    console.log('Updated stats:', updatedStats);
    
    if (updatedStats.agentBreakdown && updatedStats.agentBreakdown.LibFunctionTest) {
      console.log('✅ Lib functions working correctly!');
    } else {
      console.log('❌ Update not reflected in stats');
    }

  } catch (error) {
    console.error('❌ Error testing lib functions:', error);
  }
}

testLibFunctions();
