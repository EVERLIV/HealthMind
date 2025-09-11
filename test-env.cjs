const https = require('https');

function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function testEnvironment() {
  try {
    console.log('🔍 Testing environment variables in production...\n');
    
    // Test health endpoint to see database status
    console.log('1. Checking database connection status...');
    const healthResponse = await makeRequest('https://everliv.vercel.app/api/health', {
      method: 'GET'
    });
    console.log(`   Status: ${healthResponse.statusCode}`);
    console.log(`   Response: ${healthResponse.body}\n`);
    
    // Test a simple registration to see what error we get
    console.log('2. Testing registration with detailed error...');
    const registerData = JSON.stringify({
      email: 'envtest@example.com',
      username: 'envtestuser',
      password: 'password123',
      name: 'Env Test User'
    });
    
    const registerResponse = await makeRequest('https://everliv.vercel.app/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(registerData)
      }
    }, registerData);
    
    console.log(`   Status: ${registerResponse.statusCode}`);
    console.log(`   Response: ${registerResponse.body}\n`);
    
    // Check if we can access the database health endpoint
    console.log('3. Testing database health endpoint...');
    try {
      const dbHealthResponse = await makeRequest('https://everliv.vercel.app/api/health/database', {
        method: 'GET'
      });
      console.log(`   Status: ${dbHealthResponse.statusCode}`);
      console.log(`   Response: ${dbHealthResponse.body.substring(0, 200)}...\n`);
    } catch (error) {
      console.log(`   Error: ${error.message}\n`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testEnvironment();
