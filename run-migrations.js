#!/usr/bin/env node

const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

console.log('🔧 HealthMind Database Migration Runner\n');

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in environment variables');
  console.log('Please set DATABASE_URL in your .env file or environment');
  process.exit(1);
}

console.log('✅ Database URL found');
console.log('📊 Connecting to Neon database...\n');

const pool = new Pool({ connectionString: databaseUrl });

async function runMigrations() {
  try {
    // Read migration files
    const schemaPath = path.join(__dirname, 'supabase', 'migrations', '001_initial_schema.sql');
    const biomarkersPath = path.join(__dirname, 'supabase', 'migrations', '002_seed_biomarkers.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Schema migration file not found:', schemaPath);
      process.exit(1);
    }
    
    if (!fs.existsSync(biomarkersPath)) {
      console.error('❌ Biomarkers migration file not found:', biomarkersPath);
      process.exit(1);
    }
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    const biomarkersSQL = fs.readFileSync(biomarkersPath, 'utf8');
    
    console.log('📋 Running initial schema migration...');
    await pool.query(schemaSQL);
    console.log('✅ Schema migration completed');
    
    console.log('📋 Running biomarkers seed data...');
    await pool.query(biomarkersSQL);
    console.log('✅ Biomarkers seed data completed');
    
    // Test the connection
    console.log('🧪 Testing database connection...');
    const result = await pool.query('SELECT COUNT(*) as user_count FROM users');
    console.log(`✅ Database test successful. Users in database: ${result.rows[0].user_count}`);
    
    console.log('\n🎉 All migrations completed successfully!');
    console.log('🚀 Your HealthMind application should now work properly.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
