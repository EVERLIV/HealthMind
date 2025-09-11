const https = require('https');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
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
    
    if (options.data) {
      req.write(options.data);
    }
    
    req.end();
  });
}

async function testNewAPI() {
  try {
    console.log('🔍 Testing new Vercel serverless functions...\n');
    
    // Test hello endpoint
    console.log('1. Testing hello endpoint...');
    const helloResponse = await makeRequest('https://everliv.vercel.app/api/hello');
    console.log(`   Status: ${helloResponse.statusCode}`);
    console.log(`   Response: ${helloResponse.body}\n`);
    
    // Test auth registration
    console.log('2. Testing auth registration...');
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
      },
      data: registerData
    });
    
    console.log(`   Status: ${registerResponse.statusCode}`);
    console.log(`   Response: ${registerResponse.body}\n`);
    
    // Test auth login
    console.log('3. Testing auth login...');
    const loginData = JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    });
    
    const loginResponse = await makeRequest('https://everliv.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      },
      data: loginData
    });
    
    console.log(`   Status: ${loginResponse.statusCode}`);
    console.log(`   Response: ${loginResponse.body}\n`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNewAPI();
