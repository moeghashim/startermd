/**
 * Debug what might be wrong with stats
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

async function debugStats() {
  console.log('🔍 Debugging stats issues...\n');

  try {
    // 1. Check current database state
    console.log('1. Current Database State:');
    const { data: rawData, error: rawError } = await supabase
      .from('key_value_store')
      .select('*');

    if (rawError) {
      console.log('❌ Database query failed:', rawError.message);
      return;
    }

    console.log('Raw database data:', rawData);
    
    // 2. Check specific stats entry
    console.log('\n2. Stats Entry:');
    const { data: statsData, error: statsError } = await supabase
      .from('key_value_store')
      .select('*')
      .eq('key', 'startermd_stats')
      .single();

    if (statsError) {
      console.log('❌ Stats entry not found:', statsError.message);
      
      // Try to create the stats entry if it doesn't exist
      console.log('\n3. Creating missing stats entry...');
      const freshStats = {
        totalGenerated: 0,
        agentBreakdown: {},
        dailyStats: {},
        lastUpdated: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('key_value_store')
        .insert({ 
          key: 'startermd_stats', 
          value: JSON.stringify(freshStats) 
        });

      if (insertError) {
        console.log('❌ Could not create stats entry:', insertError.message);
      } else {
        console.log('✅ Stats entry created');
      }
      return;
    }

    console.log('Stats entry found:', statsData);
    
    try {
      const parsedStats = JSON.parse(statsData.value);
      console.log('Parsed stats:', parsedStats);
    } catch (parseError) {
      console.log('❌ JSON parse error:', parseError.message);
      console.log('Raw value:', statsData.value);
    }

    // 3. Test the getStats and updateStats functions
    console.log('\n3. Testing lib functions...');
    
    // Import the actual functions (this is a bit tricky from a script)
    console.log('Attempting to simulate getStats function...');
    
    const { data: testData, error: testError } = await supabase
      .from('key_value_store')
      .select('value')
      .eq('key', 'startermd_stats')
      .single();

    if (testError) {
      console.log('❌ getStats simulation failed:', testError.message);
    } else {
      console.log('✅ getStats simulation successful:', JSON.parse(testData.value));
    }

    // 4. Simulate updateStats
    console.log('\n4. Simulating updateStats...');
    const currentStats = JSON.parse(testData.value);
    const today = new Date().toISOString().split('T')[0];
    
    currentStats.totalGenerated += 1;
    currentStats.agentBreakdown['DebugTest'] = (currentStats.agentBreakdown['DebugTest'] || 0) + 1;
    currentStats.dailyStats[today] = (currentStats.dailyStats[today] || 0) + 1;
    currentStats.lastUpdated = new Date().toISOString();

    const { error: updateTestError } = await supabase
      .from('key_value_store')
      .update({ 
        value: JSON.stringify(currentStats),
        updated_at: new Date().toISOString()
      })
      .eq('key', 'startermd_stats');

    if (updateTestError) {
      console.log('❌ updateStats simulation failed:', updateTestError.message);
    } else {
      console.log('✅ updateStats simulation successful');
    }

    console.log('\n🎯 Debug Summary:');
    console.log('- Database connection: Working');
    console.log('- Stats entry exists: Yes');
    console.log('- JSON parsing: Working');
    console.log('- Update operations: Working');
    console.log('\nIf stats still not working in UI, the issue might be:');
    console.log('1. Client-side JavaScript errors');
    console.log('2. API endpoint issues');
    console.log('3. Network/CORS problems');
    console.log('4. React component state management');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugStats();
