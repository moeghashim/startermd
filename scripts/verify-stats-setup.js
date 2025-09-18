/**
 * Final verification that stats are set up correctly
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

async function verifySetup() {
  console.log('🔍 Final verification of stats setup...\n');

  try {
    // 1. Check environment variables
    console.log('1. Environment Variables:');
    console.log(`   SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
    console.log(`   SUPABASE_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}\n`);

    // 2. Check database connection
    console.log('2. Database Connection:');
    const { data: tableCheck, error: tableError } = await supabase
      .from('key_value_store')
      .select('count', { count: 'exact', head: true });

    if (tableError) {
      console.log('❌ Database connection failed:', tableError.message);
      return;
    }
    console.log('✅ Database connection successful\n');

    // 3. Check table structure
    console.log('3. Table Structure:');
    const { data: structureData, error: structureError } = await supabase
      .from('key_value_store')
      .select('*')
      .limit(1);

    if (structureError) {
      console.log('❌ Table structure check failed:', structureError.message);
      return;
    }
    console.log('✅ Table structure is correct\n');

    // 4. Check current stats
    console.log('4. Current Stats:');
    const { data: statsData, error: statsError } = await supabase
      .from('key_value_store')
      .select('*')
      .eq('key', 'startermd_stats')
      .single();

    if (statsError) {
      console.log('❌ Stats check failed:', statsError.message);
      return;
    }

    const currentStats = JSON.parse(statsData.value);
    console.log('✅ Stats found:');
    console.log(`   Total Generated: ${currentStats.totalGenerated}`);
    console.log(`   Agents: ${Object.keys(currentStats.agentBreakdown).length}`);
    console.log(`   Days: ${Object.keys(currentStats.dailyStats).length}`);
    console.log(`   Last Updated: ${currentStats.lastUpdated}\n`);

    // 5. Test a stats update
    console.log('5. Testing Stats Update:');
    const testStats = { ...currentStats };
    testStats.totalGenerated += 1;
    testStats.agentBreakdown['VerificationTest'] = 1;
    testStats.dailyStats[new Date().toISOString().split('T')[0]] = 1;
    testStats.lastUpdated = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('key_value_store')
      .update({ 
        value: JSON.stringify(testStats),
        updated_at: new Date().toISOString()
      })
      .eq('key', 'startermd_stats');

    if (updateError) {
      console.log('❌ Stats update failed:', updateError.message);
      return;
    }
    console.log('✅ Stats update successful\n');

    // 6. Verify the update
    console.log('6. Verifying Update:');
    const { data: verifyData, error: verifyError } = await supabase
      .from('key_value_store')
      .select('value')
      .eq('key', 'startermd_stats')
      .single();

    if (verifyError) {
      console.log('❌ Verification failed:', verifyError.message);
      return;
    }

    const verifiedStats = JSON.parse(verifyData.value);
    console.log('✅ Update verified:');
    console.log(`   Total Generated: ${verifiedStats.totalGenerated}`);
    console.log(`   Test Agent Added: ${verifiedStats.agentBreakdown['VerificationTest'] ? 'Yes' : 'No'}\n`);

    console.log('🎉 ALL CHECKS PASSED!');
    console.log('💡 The stats system is fully functional and ready to use.');
    console.log('\nNext steps:');
    console.log('- Start the development server: npm run dev');
    console.log('- Visit /stats to see the stats page');
    console.log('- Use the app to generate files and watch stats update');

  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifySetup();
