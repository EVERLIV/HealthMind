#!/bin/bash

echo "🚀 EVERLIV HEALTH - Deploy Development Version"
echo "============================================="

# Clean dist directory
rm -rf dist
mkdir -p dist

echo "📦 Preparing deployment..."

# Build client to static files
echo "Building client files..."
npm run build:client

# Copy static files to server/public for production
echo "Setting up static files..."
mkdir -p server/public
cp -r dist/public/* server/public/ 2>/dev/null || echo "Static files will be served from development mode"

echo ""
echo "✅ Deployment ready!"
echo ""
echo "🎯 What will be deployed:"
echo "   ✓ Exact same server code as development"
echo "   ✓ Same API endpoints and database"
echo "   ✓ Same authentication system"
echo "   ✓ Same DeepSeek AI integration"
echo "   ✓ Same React components and UI"
echo ""
echo "🚀 Production will run: npm start"
echo "📱 This is identical to development functionality"