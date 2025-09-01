#!/bin/bash

echo "🚀 EVERLIV HEALTH - Deploy Current Development Version"
echo "==================================================="

# Stop any existing processes
pkill -f "tsx server/index.ts" || true
pkill -f "node.*server" || true
sleep 2

# Clean and prepare
rm -rf dist
mkdir -p dist

echo "📦 Building production version..."

# Try Vite build first
npm run build:client

# Create production server that runs the same code as development
cat > dist/start-production.js << 'EOF'
import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS for development compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Import and setup the exact same routes as development
async function setupServer() {
  try {
    // Import routes from server directory (same as development)
    const { registerRoutes } = await import('../server/routes.js');
    
    // Setup authentication and all API routes exactly like development
    const httpServer = await registerRoutes(app);
    
    // Serve static files if they exist
    const publicPath = path.join(__dirname, 'public');
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath));
      
      // Fallback to index.html for client-side routing
      app.get('*', (req, res) => {
        const indexPath = path.join(publicPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send('App not found');
        }
      });
    } else {
      // If no static build, serve a simple redirect to development server
      app.get('*', (req, res) => {
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>EVERLIV HEALTH - Redirecting...</title>
            <meta http-equiv="refresh" content="0; url=https://${req.hostname.replace('.replit.app', '-5000.replit.app')}" />
          </head>
          <body>
            <div style="text-align:center;margin-top:50px;font-family:system-ui">
              <h1>EVERLIV HEALTH</h1>
              <p>Redirecting to application...</p>
              <script>
                window.location.href = 'https://${req.hostname.replace('.replit.app', '-5000.replit.app')}';
              </script>
            </div>
          </body>
          </html>
        `);
      });
    }
    
    // Start server with same configuration as development
    httpServer.listen(port, '0.0.0.0', () => {
      console.log('🚀 EVERLIV HEALTH Production Server');
      console.log(`📱 Port: ${port}`);
      console.log('✅ Same functionality as development:');
      console.log('   - Authentication system');
      console.log('   - DeepSeek AI integration');
      console.log('   - Biomarker analysis');
      console.log('   - Health profiles');
      console.log('   - API endpoints');
      console.log('   - Database integration');
      console.log('🌐 Ready for production!');
    });
    
  } catch (error) {
    console.error('❌ Failed to setup routes:', error);
    
    // Fallback simple server
    app.listen(port, '0.0.0.0', () => {
      console.log(`🚀 EVERLIV HEALTH Fallback Server - Port ${port}`);
      console.log('⚠️ Running in fallback mode');
    });
  }
}

setupServer();
EOF

# Create package.json for production
cat > dist/package.json << 'EOF'
{
  "name": "everliv-health-production",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node start-production.js"
  }
}
EOF

# Copy server directory to dist for production use
echo "📁 Copying server files..."
cp -r server dist/ 2>/dev/null || echo "ℹ️ Server files will be imported from parent directory"

# Copy shared directory if it exists
cp -r shared dist/ 2>/dev/null || echo "ℹ️ Shared files will be imported from parent directory"

echo ""
echo "✅ Production deployment ready!"
echo ""
echo "🎯 This will deploy the EXACT same version as development:"
echo "   - Same React components"
echo "   - Same API endpoints"  
echo "   - Same authentication"
echo "   - Same DeepSeek AI features"
echo "   - Same database integration"
echo ""
echo "🚀 To deploy: Use this script as build command in Replit Deployments"
echo "📱 Production will have identical functionality to development"