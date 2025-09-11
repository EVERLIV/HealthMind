# Production Setup Guide for HealthMind

## Current Issues Identified

1. **500 Error - Failed to create user**: Database connection not configured
2. **401 Error - Invalid credentials**: Authentication system conflicts
3. **Missing Environment Variables**: Required for production deployment

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration (REQUIRED)
DATABASE_URL=postgresql://username:password@host:port/database_name

# JWT Secret (REQUIRED - Change in production!)
JWT_SECRET=your-super-secure-jwt-secret-key-here

# Supabase Configuration (Optional - if using Supabase)
SUPABASE_URL=https://dajowxmdmnsvckdkugmd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRham93eG1kbW5zdmNrZGt1Z21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMDk4MjIsImV4cCI6MjA2Mjg4NTgyMn0.G5VeyG16dUwl5IU98WEIxjWTSmlbPLoLuq6ZOiZxjeM

# API Keys (Optional)
OPENAI_API_KEY=your_openai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Server Configuration
NODE_ENV=production
PORT=5000
```

## Database Setup

### Option 1: Using Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your database URL from Settings > Database
4. Run the migration scripts from `supabase/migrations/`

### Option 2: Using PostgreSQL directly

1. Install PostgreSQL
2. Create a database named `healthmind`
3. Run the migration script from `supabase/migrations/001_initial_schema.sql`

## Quick Fix for Current Issues

### 1. Create .env file
```bash
# Copy the environment variables above into a .env file
```

### 2. Test database connection
```bash
npm run dev
# Check if you see "Database: Connected" in the logs
```

### 3. Test user registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "name": "Test User"
  }'
```

## Deployment Notes

- Make sure to set all environment variables in your deployment platform
- The JWT_SECRET should be a long, random string
- Database URL should point to your production database
- Test the `/api/health` endpoint after deployment

## Troubleshooting

### 500 Error - Failed to create user
- Check if DATABASE_URL is set correctly
- Verify database is accessible
- Check if migration scripts have been run

### 401 Error - Invalid credentials
- Verify JWT_SECRET is set
- Check if user exists in database
- Ensure password hashing is working correctly

### Database connection issues
- Verify DATABASE_URL format
- Check database server is running
- Ensure network connectivity
