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

async function debugStats() {
  console.log('🔍 Checking current stats in Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('key_value_store')
      .select('*')
      .eq('key', 'startermd_stats')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (data?.value) {
      const stats = JSON.parse(data.value);
      console.log('📊 Current stats:');
      console.log(`   Total generated: ${stats.totalGenerated}`);
      console.log(`   Agent breakdown:`, stats.agentBreakdown);
      console.log(`   Daily stats:`, stats.dailyStats);
      console.log(`   Last updated: ${stats.lastUpdated}`);
    } else {
      console.log('❌ No stats found in database');
    }

    // Test write permission
    console.log('\n🧪 Testing write access...');
    const testStats = {
      totalGenerated: 999,
      agentBreakdown: { test: 1 },
      dailyStats: { '2025-09-16': 1 },
      lastUpdated: new Date().toISOString()
    };

    const { error: writeError } = await supabase
      .from('key_value_store')
      .upsert({ 
        key: 'test_stats', 
        value: JSON.stringify(testStats) 
      });

    if (writeError) {
      console.log('❌ Write test failed:', writeError);
    } else {
      console.log('✅ Write test successful');
      
      // Clean up test
      await supabase
        .from('key_value_store')
        .delete()
        .eq('key', 'test_stats');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugStats();
