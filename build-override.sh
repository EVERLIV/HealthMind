#!/bin/bash

# Backup original package.json
cp package.json package.json.bak

# Create temporary package.json with fixed build script
cat package.json | sed 's|"build:server": "tsx server/index.ts"|"build:server": "echo \\"Server build skipped - tsx handles TypeScript at runtime\\""|' > package.json.tmp

# Replace package.json temporarily
mv package.json.tmp package.json

echo "📦 Fixed package.json build scripts"
echo "🏗️ Running build..."

# Run the build
npm run build

# Restore original package.json
mv package.json.bak package.json

echo "✅ Build completed and package.json restored"