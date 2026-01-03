/**
 * Test stats with actual running server
 * This script assumes the server is running on localhost:3000
 */

async function testWithServer() {
  console.log('🌐 Testing stats with running server...');
  console.log('Make sure to run "npm run dev" first!\n');

  try {
    // Test 1: GET /api/stats
    console.log('1. Testing GET /api/stats...');
    const getResponse = await fetch('http://localhost:3000/api/stats', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('   Response status:', getResponse.status);
    console.log('   Response headers:', Object.fromEntries(getResponse.headers.entries()));

    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log('✅ GET successful, data:', data);
    } else {
      const errorText = await getResponse.text();
      console.log('❌ GET failed, error:', errorText);
    }

    // Test 2: POST /api/stats
    console.log('\n2. Testing POST /api/stats...');
    const postResponse = await fetch('http://localhost:3000/api/stats', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ agent: 'ServerTestAgent' })
    });

    console.log('   Response status:', postResponse.status);

    if (postResponse.ok) {
      const result = await postResponse.json();
      console.log('✅ POST successful, result:', result);
    } else {
      const errorText = await postResponse.text();
      console.log('❌ POST failed, error:', errorText);
    }

    // Test 3: Verify the POST worked
    console.log('\n3. Verifying POST worked...');
    const verifyResponse = await fetch('http://localhost:3000/api/stats');
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log('📊 Current stats:', verifyData);
      
      if (verifyData.agentBreakdown && verifyData.agentBreakdown.ServerTestAgent) {
        console.log('✅ Stats update verified - ServerTestAgent found!');
      } else {
        console.log('❌ Stats update not found in response');
      }
    }

    console.log('\n🎉 Server API tests completed!');

  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    console.log('\nMake sure:');
    console.log('1. Start the dev server: npm run dev');
    console.log('2. Wait for the server to be ready');
    console.log('3. Run this test again');
  }
}

// Add a delay helper for retries
async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main execution with retries
async function main() {
  for (let i = 0; i < 3; i++) {
    try {
      await testWithServer();
      break; // Success, exit loop
    } catch (error) {
      if (i === 2) {
        console.error('All retries failed. Server might not be running.');
      } else {
        console.log(`Attempt ${i + 1} failed, retrying in 2 seconds...`);
        await delay(2000);
      }
    }
  }
}

main();
