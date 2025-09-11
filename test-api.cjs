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

async function testAPI() {
  try {
    console.log('🔍 Testing HealthMind API...\n');
    
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await makeRequest('https://everliv.vercel.app/api/health', {
      method: 'GET'
    });
    console.log(`   Status: ${healthResponse.statusCode}`);
    console.log(`   Response: ${healthResponse.body}\n`);
    
    // Test registration
    console.log('2. Testing user registration...');
    const registerData = JSON.stringify({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      name: 'Test User'
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
    
    // Test login
    console.log('3. Testing user login...');
    const loginData = JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    });
    
    const loginResponse = await makeRequest('https://everliv.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    }, loginData);
    
    console.log(`   Status: ${loginResponse.statusCode}`);
    console.log(`   Response: ${loginResponse.body}\n`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
