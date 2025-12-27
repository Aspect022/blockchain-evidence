-- Supabase Database Schema for Evidence Management System

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role INTEGER NOT NULL,
    department TEXT,
    badge_number TEXT,
    jurisdiction TEXT,
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Evidence table
CREATE TABLE evidence (
    id SERIAL PRIMARY KEY,
    case_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    file_data TEXT, -- Base64 encoded file
    file_name TEXT,
    file_size BIGINT,
    hash TEXT,
    submitted_by TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending'
);

-- Cases table
CREATE TABLE cases (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT,
    created_by TEXT NOT NULL,
    assigned_to TEXT,
    status TEXT DEFAULT 'open',
    created_date TIMESTAMPTZ DEFAULT NOW(),
    last_modified TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed)
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON evidence FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON cases FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON activity_logs FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_evidence_case ON evidence(case_id);
CREATE INDEX idx_evidence_submitted ON evidence(submitted_by);
CREATE INDEX idx_cases_created ON cases(created_by);
CREATE INDEX idx_logs_user ON activity_logs(user_id);
CREATE INDEX idx_logs_timestamp ON activity_logs(timestamp);