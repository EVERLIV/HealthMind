const https = require('https');

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: body
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

async function testEnvironment() {
  try {
    console.log('🔍 Checking production environment variables...\n');
    
    const response = await makeRequest('https://everliv.vercel.app/api/debug/env');
    console.log(`Status: ${response.statusCode}`);
    console.log(`Response: ${response.body}\n`);
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      console.log('Environment Variables Status:');
      console.log('================================');
      console.log(`NODE_ENV: ${data.NODE_ENV}`);
      console.log(`Has DATABASE_URL: ${data.HAS_DATABASE_URL}`);
      console.log(`Has JWT_SECRET: ${data.HAS_JWT_SECRET}`);
      console.log(`Has SUPABASE_URL: ${data.HAS_SUPABASE_URL}`);
      console.log(`Has SUPABASE_ANON_KEY: ${data.HAS_SUPABASE_ANON_KEY}`);
      if (data.DATABASE_URL_PREFIX) {
        console.log(`DATABASE_URL prefix: ${data.DATABASE_URL_PREFIX}`);
      }
      console.log(`Timestamp: ${data.timestamp}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEnvironment();
