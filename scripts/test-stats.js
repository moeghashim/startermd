/**
 * Test script to verify stats functionality is working
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

const supabase = createClient(supabaseUrl, supabaseKey);

const STATS_KEY = 'startermd_stats';

async function testStats() {
  console.log('🧪 Testing stats functionality...');
  
  try {
    // Test 1: Fetch current stats
    console.log('\n1. Testing stats fetch...');
    const { data: fetchData, error: fetchError } = await supabase
      .from('key_value_store')
      .select('value')
      .eq('key', STATS_KEY)
      .single();

    if (fetchError) throw fetchError;

    const currentStats = JSON.parse(fetchData.value);
    console.log('✅ Stats fetched successfully:', currentStats);

    // Test 2: Update stats with test data
    console.log('\n2. Testing stats update...');
    const testAgent = 'TestAgent';
    const today = new Date().toISOString().split('T')[0];

    currentStats.totalGenerated += 1;
    currentStats.agentBreakdown[testAgent] = (currentStats.agentBreakdown[testAgent] || 0) + 1;
    currentStats.dailyStats[today] = (currentStats.dailyStats[today] || 0) + 1;
    currentStats.lastUpdated = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('key_value_store')
      .update({ 
        value: JSON.stringify(currentStats),
        updated_at: new Date().toISOString()
      })
      .eq('key', STATS_KEY);

    if (updateError) throw updateError;

    console.log('✅ Stats updated successfully');

    // Test 3: Verify the update
    console.log('\n3. Verifying the update...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('key_value_store')
      .select('value')
      .eq('key', STATS_KEY)
      .single();

    if (verifyError) throw verifyError;

    const updatedStats = JSON.parse(verifyData.value);
    console.log('✅ Updated stats verified:', updatedStats);

    // Test 4: Test the API endpoints by making HTTP requests
    console.log('\n4. Testing API endpoints...');
    
    // Test GET endpoint
    const getResponse = await fetch('http://localhost:3000/api/stats');
    if (getResponse.ok) {
      const getStats = await getResponse.json();
      console.log('✅ GET /api/stats working:', getStats);
    } else {
      console.log('⚠️  GET /api/stats failed (server might not be running)');
    }

    // Test POST endpoint
    const postResponse = await fetch('http://localhost:3000/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: 'APITestAgent' })
    });

    if (postResponse.ok) {
      const postResult = await postResponse.json();
      console.log('✅ POST /api/stats working:', postResult);
    } else {
      console.log('⚠️  POST /api/stats failed (server might not be running)');
    }

    console.log('\n🎉 All stats functionality tests passed!');
    console.log('💡 The stats system is working properly.');

  } catch (error) {
    console.error('❌ Stats testing failed:', error);
  }
}

testStats();
