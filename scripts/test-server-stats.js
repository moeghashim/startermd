/**
 * Test stats with actual running server
 */

async function testServerStats() {
  console.log('🚀 Testing stats with running server...');
  
  try {
    // Test 1: Get current stats
    console.log('\n1. Testing GET /api/stats...');
    const getResponse = await fetch('http://localhost:3000/api/stats');
    
    if (!getResponse.ok) {
      console.log('❌ GET failed:', getResponse.status, await getResponse.text());
      return;
    }
    
    const currentStats = await getResponse.json();
    console.log('✅ GET /api/stats working:', currentStats);
    
    // Test 2: Update stats via POST
    console.log('\n2. Testing POST /api/stats...');
    const postResponse = await fetch('http://localhost:3000/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agent: 'ServerTest' })
    });
    
    if (!postResponse.ok) {
      console.log('❌ POST failed:', postResponse.status, await postResponse.text());
      return;
    }
    
    const postResult = await postResponse.json();
    console.log('✅ POST /api/stats working:', postResult);
    
    // Test 3: Verify the update
    console.log('\n3. Verifying update...');
    const verifyResponse = await fetch('http://localhost:3000/api/stats');
    
    if (!verifyResponse.ok) {
      console.log('❌ Verification GET failed:', verifyResponse.status);
      return;
    }
    
    const updatedStats = await verifyResponse.json();
    console.log('✅ Updated stats:', updatedStats);
    
    // Check if the test agent was added
    if (updatedStats.agentBreakdown && updatedStats.agentBreakdown.ServerTest) {
      console.log('✅ Stats update successful - ServerTest agent found!');
    } else {
      console.log('❌ Stats update failed - ServerTest agent not found');
    }
    
    console.log('\n🎉 Server stats test completed!');
    
  } catch (error) {
    console.error('❌ Server stats test failed:', error.message);
    console.log('\nMake sure to:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Wait for server to be ready');
    console.log('3. Run this test script');
  }
}

testServerStats();
