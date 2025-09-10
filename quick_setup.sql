-- Quick Setup for HealthMind Database
-- Copy and paste this entire script into Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    subscription_type TEXT NOT NULL DEFAULT 'basic',
    subscription_expires_at TIMESTAMP,
    is_email_verified INTEGER DEFAULT 0,
    email_verification_token TEXT,
    reset_password_token TEXT,
    reset_password_expires TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create health_profiles table
CREATE TABLE IF NOT EXISTS health_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER,
    weight TEXT,
    height TEXT,
    medical_conditions JSONB,
    medications JSONB,
    profile_data JSONB,
    completion_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create blood_analyses table
CREATE TABLE IF NOT EXISTS blood_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT,
    results JSONB,
    status TEXT NOT NULL DEFAULT 'pending',
    analyzed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create biomarkers table
CREATE TABLE IF NOT EXISTS biomarkers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    normal_range JSONB,
    category TEXT NOT NULL,
    importance TEXT NOT NULL,
    recommendations JSONB
);

-- Create biomarker_results table
CREATE TABLE IF NOT EXISTS biomarker_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES blood_analyses(id) ON DELETE CASCADE,
    biomarker_id UUID NOT NULL REFERENCES biomarkers(id) ON DELETE CASCADE,
    value DECIMAL(10,3) NOT NULL,
    unit TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create health_metrics table
CREATE TABLE IF NOT EXISTS health_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    heart_rate INTEGER,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    temperature TEXT,
    recorded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create sessions table for auth
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_activity_logs table
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    metadata JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_health_profiles_user_id ON health_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_blood_analyses_user_id ON blood_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_blood_analyses_status ON blood_analyses(status);
CREATE INDEX IF NOT EXISTS idx_biomarker_results_analysis_id ON biomarker_results(analysis_id);
CREATE INDEX IF NOT EXISTS idx_biomarker_results_biomarker_id ON biomarker_results(biomarker_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_id ON health_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action ON user_activity_logs(action);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_health_profiles_updated_at ON health_profiles;
CREATE TRIGGER update_health_profiles_updated_at BEFORE UPDATE ON health_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample biomarkers
INSERT INTO biomarkers (name, description, normal_range, category, importance, recommendations) VALUES
('Glucose', 'Blood sugar level', '{"min": 70, "max": 100, "unit": "mg/dL"}', 'blood', 'high', '["Maintain balanced diet", "Regular exercise", "Monitor regularly if diabetic"]'),
('Total Cholesterol', 'Total cholesterol in blood', '{"min": 0, "max": 200, "unit": "mg/dL"}', 'cardiovascular', 'high', '["Heart-healthy diet", "Regular exercise", "Limit saturated fats"]'),
('HDL Cholesterol', 'Good cholesterol', '{"min": 40, "max": 100, "unit": "mg/dL"}', 'cardiovascular', 'high', '["Regular exercise", "Healthy fats", "Moderate alcohol consumption"]'),
('LDL Cholesterol', 'Bad cholesterol', '{"min": 0, "max": 100, "unit": "mg/dL"}', 'cardiovascular', 'high', '["Low-fat diet", "Statins if needed", "Regular monitoring"]'),
('Triglycerides', 'Fat in blood', '{"min": 0, "max": 150, "unit": "mg/dL"}', 'cardiovascular', 'high', '["Limit sugar and carbs", "Regular exercise", "Weight management"]'),
('Hemoglobin', 'Oxygen-carrying protein', '{"min": 12.0, "max": 15.5, "unit": "g/dL"}', 'blood', 'high', '["Iron supplementation", "Vitamin C for absorption", "Regular monitoring"]'),
('Creatinine', 'Kidney function marker', '{"min": 0.6, "max": 1.2, "unit": "mg/dL"}', 'kidney', 'high', '["Stay hydrated", "Limit protein if high", "Regular monitoring"]'),
('ALT', 'Liver enzyme', '{"min": 7, "max": 56, "unit": "U/L"}', 'liver', 'high', '["Limit alcohol", "Healthy diet", "Regular exercise"]'),
('TSH', 'Thyroid function', '{"min": 0.4, "max": 4.0, "unit": "mIU/L"}', 'thyroid', 'high', '["Regular monitoring", "Medication compliance", "Stress management"]'),
('Vitamin D', 'Vitamin D status', '{"min": 30, "max": 100, "unit": "ng/mL"}', 'vitamin', 'high', '["Sun exposure", "Vitamin D supplements", "Fatty fish consumption"]')
ON CONFLICT (name) DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully! All tables created and sample data inserted.' as message;
