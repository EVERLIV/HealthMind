const { Pool } = require('@neondatabase/serverless');

const databaseUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_JdZwmI1kgW0H@ep-shy-band-aguz5b3n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({ connectionString: databaseUrl });

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Database connected:', result.rows[0].current_time);
    
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    console.log('✅ Users table exists:', tableCheck.rows[0].exists);
    
    // Check user count
    const userCount = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('👥 Users in database:', userCount.rows[0].count);
    
    // Try to create a test user
    console.log('🧪 Testing user creation...');
    const testUser = await pool.query(`
      INSERT INTO users (email, username, password_hash, name, role, subscription_type)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, username, name
    `, [
      'test@example.com',
      'testuser',
      '$2a$10$test.hash.here',
      'Test User',
      'user',
      'basic'
    ]);
    
    console.log('✅ Test user created:', testUser.rows[0]);
    
    // Clean up test user
    await pool.query('DELETE FROM users WHERE email = $1', ['test@example.com']);
    console.log('🧹 Test user cleaned up');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
