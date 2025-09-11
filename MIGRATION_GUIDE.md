# Database Migration Guide for HealthMind

## Current Status
✅ `.env` file created with Supabase configuration
❌ Database migrations need to be run
❌ Database password needs to be updated

## Step 1: Get Your Supabase Database Password

1. Go to [supabase.com](https://supabase.com) and sign in
2. Open your project: `healthmind`
3. Go to **Settings** → **Database**
4. Find the **Connection string** section
5. Copy the password from the connection string (it will look like: `postgresql://postgres.dajowxmdmnsvckdkugmd:YOUR_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`)

## Step 2: Update .env File

Replace `your_password` in your `.env` file with the actual password from Supabase:

```env
DATABASE_URL=postgresql://postgres.dajowxmdmnsvckdkugmd:YOUR_ACTUAL_PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

## Step 3: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste it into the SQL Editor
5. Click **Run** to execute the migration
6. Copy the contents of `supabase/migrations/002_seed_biomarkers.sql`
7. Paste it into the SQL Editor and run it

### Option B: Install PostgreSQL Client

If you prefer to use command line:

1. **Install PostgreSQL** (includes psql client):
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - Or install via Chocolatey: `choco install postgresql`

2. **Run migrations**:
   ```bash
   # Set your password as environment variable
   $env:PGPASSWORD="your_actual_password"
   
   # Run the initial schema
   psql -h aws-0-eu-central-1.pooler.supabase.com -p 6543 -U postgres.dajowxmdmnsvckdkugmd -d postgres -f supabase/migrations/001_initial_schema.sql
   
   # Run the biomarkers seed data
   psql -h aws-0-eu-central-1.pooler.supabase.com -p 6543 -U postgres.dajowxmdmnsvckdkugmd -d postgres -f supabase/migrations/002_seed_biomarkers.sql
   ```

### Option C: Install Supabase CLI

1. **Install Supabase CLI**:
   ```bash
   # Using npm
   npm install -g supabase
   
   # Or using Chocolatey (Windows)
   choco install supabase
   ```

2. **Login and link project**:
   ```bash
   supabase login
   supabase link --project-ref dajowxmdmnsvckdkugmd
   ```

3. **Run migrations**:
   ```bash
   supabase db push
   ```

## Step 4: Test the Connection

After running migrations, test your setup:

```bash
# Start the development server
npm run dev

# In another terminal, test database connection
npm run test-db
```

You should see:
```json
{
  "status": "ok",
  "message": "Database connection successful",
  "database": "connected",
  "userCount": 0
}
```

## Step 5: Test User Registration

Test creating a user with the email that was failing:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "hoaandrey@gmail.com",
    "username": "hoaandrey",
    "password": "password123",
    "name": "Hoa Andrey"
  }'
```

## Troubleshooting

### If you get "Database not configured" error:
- Check that `DATABASE_URL` is set correctly in `.env`
- Verify the password is correct
- Make sure the database is accessible

### If you get "relation does not exist" error:
- The migrations haven't been run yet
- Run the SQL scripts in Supabase Dashboard

### If you get "permission denied" error:
- Check that you're using the correct database password
- Verify the connection string format

## Next Steps

Once the database is set up and working:

1. **Deploy to production** with the same environment variables
2. **Test all endpoints** to ensure they work correctly
3. **Monitor logs** for any remaining issues

## Files Created/Modified

- ✅ `.env` - Environment configuration
- ✅ `PRODUCTION_SETUP.md` - Comprehensive setup guide
- ✅ `MIGRATION_GUIDE.md` - This migration guide
- ✅ `setup-production.js` - Setup helper script
- ✅ Fixed authentication system in `server/routes.ts`
