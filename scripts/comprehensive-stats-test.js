/**
 * Comprehensive test to identify exactly what's wrong with stats
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
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[key] = value;
      }
    }
  });
} catch (err) {
  console.log('No .env.local file found');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runComprehensiveTest() {
  console.log('🔄 COMPREHENSIVE STATS TEST');
  console.log('=' .repeat(50));
  
  let allTestsPassed = true;

  // TEST 1: Environment Check
  console.log('\n📋 TEST 1: Environment Variables');
  console.log('-'.repeat(30));
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing environment variables');
    allTestsPassed = false;
  } else {
    console.log('✅ Environment variables present');
  }

  // TEST 2: Database Connection
  console.log('\n📋 TEST 2: Database Connection');
  console.log('-'.repeat(30));
  
  try {
    const { error } = await supabase.from('key_value_store').select('count', { count: 'exact', head: true });
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      allTestsPassed = false;
    } else {
      console.log('✅ Database connection successful');
    }
  } catch (error) {
    console.log('❌ Database connection error:', error.message);
    allTestsPassed = false;
  }

  // TEST 3: Stats Entry Existence
  console.log('\n📋 TEST 3: Stats Entry Existence');
  console.log('-'.repeat(30));
  
  let currentStats = null;
  try {
    const { data, error } = await supabase
      .from('key_value_store')
      .select('value')
      .eq('key', 'startermd_stats')
      .single();
    
    if (error) {
      console.log('❌ Stats entry not found:', error.message);
      allTestsPassed = false;
    } else {
      currentStats = JSON.parse(data.value);
      console.log('✅ Stats entry found');
      console.log(`   Total: ${currentStats.totalGenerated}`);
      console.log(`   Agents: ${Object.keys(currentStats.agentBreakdown).length}`);
    }
  } catch (error) {
    console.log('❌ Error checking stats entry:', error.message);
    allTestsPassed = false;
  }

  // TEST 4: Database Operations
  console.log('\n📋 TEST 4: Database Write Operations');
  console.log('-'.repeat(30));
  
  if (currentStats) {
    try {
      const testStats = { ...currentStats };
      testStats.totalGenerated += 1;
      testStats.agentBreakdown['ComprehensiveTest'] = 1;
      testStats.lastUpdated = new Date().toISOString();

      const { error } = await supabase
        .from('key_value_store')
        .update({ 
          value: JSON.stringify(testStats),
          updated_at: new Date().toISOString()
        })
        .eq('key', 'startermd_stats');

      if (error) {
        console.log('❌ Database write failed:', error.message);
        allTestsPassed = false;
      } else {
        console.log('✅ Database write successful');
      }
    } catch (error) {
      console.log('❌ Database write error:', error.message);
      allTestsPassed = false;
    }
  }

  // TEST 5: Server API Endpoints (if server is running)
  console.log('\n📋 TEST 5: API Endpoints (requires running server)');
  console.log('-'.repeat(30));
  
  try {
    // Test GET endpoint
    const getResponse = await fetch('http://localhost:3000/api/stats', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ GET /api/stats working');
      console.log(`   Returned: ${JSON.stringify(getData, null, 2)}`);
    } else {
      console.log('⚠️  GET /api/stats failed:', getResponse.status);
      console.log('   This is expected if server is not running');
    }

    // Test POST endpoint
    const postResponse = await fetch('http://localhost:3000/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: 'ComprehensiveTestAPI' })
    });
    
    if (postResponse.ok) {
      console.log('✅ POST /api/stats working');
    } else {
      console.log('⚠️  POST /api/stats failed:', postResponse.status);
      console.log('   This is expected if server is not running');
    }

  } catch (error) {
    console.log('⚠️  API tests failed (server likely not running)');
    console.log('   Error:', error.message);
  }

  // TEST 6: Check if issue is frontend vs backend
  console.log('\n📋 TEST 6: Frontend vs Backend Issue Analysis');
  console.log('-'.repeat(30));
  
  // Check current database state after all tests
  try {
    const { data } = await supabase
      .from('key_value_store')
      .select('value')
      .eq('key', 'startermd_stats')
      .single();
    
    const finalStats = JSON.parse(data.value);
    console.log('📊 Final database state:');
    console.log(`   Total Generated: ${finalStats.totalGenerated}`);
    console.log(`   Agents: ${JSON.stringify(finalStats.agentBreakdown, null, 2)}`);
    console.log(`   Daily: ${JSON.stringify(finalStats.dailyStats, null, 2)}`);
    
    if (finalStats.totalGenerated > 0) {
      console.log('✅ Database has stats data - issue likely in frontend');
    } else {
      console.log('❌ Database has no stats - issue in backend tracking');
    }

  } catch (error) {
    console.log('❌ Could not check final state:', error.message);
  }

  // SUMMARY
  console.log('\n🎯 TEST SUMMARY');
  console.log('=' .repeat(50));
  
  if (allTestsPassed) {
    console.log('✅ All backend tests passed');
    console.log('🔍 Issue is likely in:');
    console.log('   1. React component state management');
    console.log('   2. Frontend API calls');
    console.log('   3. Browser console errors');
    console.log('   4. Network/CORS issues');
    console.log('\n💡 Next steps:');
    console.log('   1. Start server: npm run dev');
    console.log('   2. Open browser to localhost:3000');
    console.log('   3. Open developer tools');
    console.log('   4. Check console for errors');
    console.log('   5. Try downloading a file');
    console.log('   6. Check network tab for API calls');
    console.log('   7. Visit /stats page');
  } else {
    console.log('❌ Some backend tests failed');
    console.log('🔧 Fix backend issues first before testing frontend');
  }
}

runComprehensiveTest();
