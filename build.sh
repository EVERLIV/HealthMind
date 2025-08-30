#!/bin/bash
echo "🏗️  Building EVERLIV HEALTH application..."

# Build client
echo "📦 Building client..."
npm run build:client

if [ $? -ne 0 ]; then
  echo "❌ Client build failed"
  exit 1
fi

echo "✅ Client build completed"

# For Node.js with tsx, no server build needed - tsx compiles TypeScript on-the-fly
echo "🔧 Server preparation..."
echo "✅ Server is ready (tsx handles TypeScript compilation)"

echo "🎉 Build completed successfully!"
echo "🚀 Ready for deployment!"