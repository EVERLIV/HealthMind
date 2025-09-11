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

async function testSimple() {
  try {
    console.log('🔍 Testing simple API endpoint...\n');
    
    const response = await makeRequest('https://everliv.vercel.app/api/test');
    console.log(`Status: ${response.statusCode}`);
    console.log(`Response: ${response.body}\n`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSimple();
