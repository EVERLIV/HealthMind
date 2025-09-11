#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 HealthMind Production Setup Helper\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env file not found!');
  console.log('\n📝 Creating .env file template...');
  
  const envTemplate = `# Database Configuration (REQUIRED)
DATABASE_URL=postgresql://username:password@host:port/database_name

# JWT Secret (REQUIRED - Change in production!)
JWT_SECRET=everliv-health-secret-2024-production-key-change-me

# Supabase Configuration (Optional - if using Supabase)
SUPABASE_URL=https://dajowxmdmnsvckdkugmd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRham93eG1kbW5zdmNrZGt1Z21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMDk4MjIsImV4cCI6MjA2Mjg4NTgyMn0.G5VeyG16dUwl5IU98WEIxjWTSmlbPLoLuq6ZOiZxjeM

# API Keys (Optional)
OPENAI_API_KEY=your_openai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Server Configuration
NODE_ENV=production
PORT=5000`;

  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created!');
  console.log('\n⚠️  IMPORTANT: Update the DATABASE_URL with your actual database connection string!');
} else {
  console.log('✅ .env file found');
}

// Check environment variables
console.log('\n🔍 Checking environment variables...');

try {
  require('dotenv').config();
  
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\n📝 Please update your .env file with the missing variables.');
  } else {
    console.log('✅ All required environment variables are set');
  }
  
  // Check if DATABASE_URL looks like a placeholder
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('username:password@host:port')) {
    console.log('⚠️  DATABASE_URL appears to be a placeholder. Please update it with your actual database connection string.');
  }
  
} catch (error) {
  console.log('❌ Error loading environment variables:', error.message);
}

console.log('\n🚀 Next steps:');
console.log('1. Update your .env file with the correct DATABASE_URL');
console.log('2. Run the database migrations:');
console.log('   - For Supabase: Copy the SQL from supabase/migrations/001_initial_schema.sql');
console.log('   - For PostgreSQL: psql -d your_database -f supabase/migrations/001_initial_schema.sql');
console.log('3. Test the connection: npm run dev');
console.log('4. Check the health endpoint: curl http://localhost:5000/api/health/database');

console.log('\n📚 For detailed instructions, see PRODUCTION_SETUP.md');
