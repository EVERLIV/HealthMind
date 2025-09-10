// Test Supabase connection
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dajowxmdmnsvckdkugmd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRham93eG1kbW5zdmNrZGt1Z21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMDk4MjIsImV4cCI6MjA2Mjg4NTgyMn0.G5VeyG16dUwl5IU98WEIxjWTSmlbPLoLuq6ZOiZxjeM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('biomarkers')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Database is accessible');
    
    // Test biomarkers table
    const { data: biomarkers, error: biomarkersError } = await supabase
      .from('biomarkers')
      .select('name, category')
      .limit(5);
    
    if (biomarkersError) {
      console.log('⚠️  Biomarkers table not found or empty');
      console.log('💡 You need to run the database migrations');
    } else {
      console.log('✅ Biomarkers table found with', biomarkers.length, 'records');
      console.log('📋 Sample biomarkers:', biomarkers.map(b => b.name).join(', '));
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConnection();
