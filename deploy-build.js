#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🏗️  EVERLIV HEALTH - Production Build');
console.log('====================================');

try {
  console.log('📦 Building client application...');
  execSync('npm run build:client', { stdio: 'inherit' });
  
  console.log('✅ Client build completed successfully');
  console.log('🔧 Server preparation...');
  console.log('✅ Server ready (TypeScript handled by tsx at runtime)');
  console.log('🎉 Build completed successfully!');
  
  process.exit(0);
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}