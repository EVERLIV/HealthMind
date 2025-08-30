#!/bin/bash

echo "🏗️ EVERLIV HEALTH - Production Build"
echo "===================================="

# Use emergency fix for problematic filesystem
echo "📦 Creating production deployment..."
node deploy-fix.js

if [ $? -eq 0 ]; then
    echo "✅ Emergency deployment fix applied successfully"
    echo "🚀 Production ready!"
else
    echo "❌ Emergency fix failed"
    exit 1
fi