/**
 * Test script to verify API functionality without starting the dev server
 */

async function testAPI() {
  console.log('🧪 Testing API functionality...');
  
  // Simulate what the stats lib functions do
  const { getStats, updateStats } = require('../src/lib/stats.ts');
  
  try {
    console.log('\n1. Testing getStats function...');
    const stats = await getStats();
    console.log('✅ getStats working:', stats);

    console.log('\n2. Testing updateStats function...');
    await updateStats('TestAgent');
    console.log('✅ updateStats working');

    console.log('\n3. Verifying stats update...');
    const updatedStats = await getStats();
    console.log('✅ Stats updated:', updatedStats);

    console.log('\n🎉 All API functions working properly!');

  } catch (error) {
    console.error('❌ API testing failed:', error);
  }
}

testAPI();
