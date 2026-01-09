import axios from 'axios';

async function testAPI() {
  console.log('\n🧪 Testing backend API endpoints\n');
  
  // Test 1: Debug endpoint (no auth needed)
  console.log('1️⃣  Testing /admin/debug/events-by-month');
  try {
    const res = await axios.get('http://localhost:5000/api/admin/debug/events-by-month');
    console.log('✅ Status:', res.status);
    console.log('✅ Data length:', res.data?.length);
    console.log('✅ Data:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log('❌ Error:', err.message);
    if (err.response) {
      console.log('❌ Status:', err.response.status);
      console.log('❌ Data:', err.response.data);
    }
  }
  
  // Test 2: Statistics endpoint
  console.log('\n2️⃣  Testing /admin/debug/statistics');
  try {
    const res = await axios.get('http://localhost:5000/api/admin/debug/statistics');
    console.log('✅ Status:', res.status);
    console.log('✅ Data:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log('❌ Error:', err.message);
    if (err.response) {
      console.log('❌ Status:', err.response.status);
      console.log('❌ Data:', err.response.data);
    }
  }
}

testAPI().catch(console.error);
