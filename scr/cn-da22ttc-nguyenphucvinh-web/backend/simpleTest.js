import axios from 'axios';

async function testAPI() {
  console.log('\n🧪 Testing using Axios directly\n');
  
  try {
    console.log('Calling /admin/events-by-month...');
    const res = await axios.get('http://localhost:5000/api/admin/events-by-month', {
      timeout: 5000
    });
    console.log('✅ SUCCESS');
    console.log('Status:', res.status);
    console.log('Data:', JSON.stringify(res.data));
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Error Code:', error.code);
    console.log('Error Message:', error.message);
    console.log('Response Status:', error.response?.status);
    console.log('Response Data:', error.response?.data);
  }
}

testAPI();
