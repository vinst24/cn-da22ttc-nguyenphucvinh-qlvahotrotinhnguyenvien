import axios from 'axios';

async function testBackendAPI() {
  try {
    console.log('\n🌐 Testing actual API endpoints\n');
    
    // Create axios instance
    const api = axios.create({
      baseURL: 'http://localhost:3000/api',
      timeout: 5000
    });
    
    // Test 1: Statistics (không cần auth)
    console.log('📊 Test 1: /admin/statistics');
    try {
      const statsRes = await api.get('/admin/statistics');
      console.log('✅ Response:', statsRes.data);
    } catch (err) {
      console.log('❌ Error:', err.response?.data || err.message);
    }
    
    // Test 2: Events by month (không cần auth)
    console.log('\n📊 Test 2: /admin/events-by-month');
    try {
      const eventsRes = await api.get('/admin/events-by-month');
      console.log('✅ Response:', eventsRes.data);
      console.log('✅ Array length:', eventsRes.data?.length);
    } catch (err) {
      console.log('❌ Error:', err.response?.data || err.message);
    }
    
    // Test 3: Debug endpoint
    console.log('\n📊 Test 3: /admin/debug/events-by-month');
    try {
      const debugRes = await api.get('/admin/debug/events-by-month');
      console.log('✅ Response:', debugRes.data);
    } catch (err) {
      console.log('❌ Error:', err.response?.data || err.message);
    }
    
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
  }
}

testBackendAPI();
