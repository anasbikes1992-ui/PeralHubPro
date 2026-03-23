-- Phase 0: Foundations - Security & Admin Control

-- 1. Create enum for listing status if not exists
DO $$ BEGIN
    CREATE TYPE listing_status AS ENUM ('active', 'paused', 'off', 'pending', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Create User Reports Table
CREATE TABLE IF NOT EXISTS user_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reported_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    listing_id UUID,
    listing_type TEXT,
    report_type TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for User Reports
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create reports" ON user_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins can view all reports" ON user_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update reports" ON user_reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 3. Add Moderation Columns to Listings
-- We use a function to safely add columns
CREATE OR REPLACE FUNCTION add_admin_columns(table_name TEXT) RETURNS VOID AS $$
BEGIN
    EXECUTE 'ALTER TABLE ' || table_name || ' ADD COLUMN IF NOT EXISTS moderation_status listing_status DEFAULT ''pending''';
    EXECUTE 'ALTER TABLE ' || table_name || ' ADD COLUMN IF NOT EXISTS admin_status_reason TEXT';
    EXECUTE 'ALTER TABLE ' || table_name || ' ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE';
END;
$$ LANGUAGE plpgsql;

SELECT add_admin_columns('stays_listings');
SELECT add_admin_columns('vehicles_listings');
SELECT add_admin_columns('events_listings');
SELECT add_admin_columns('properties_listings');
SELECT add_admin_columns('social_listings');

-- 4. Add Verification Badges to Profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_badges TEXT[] DEFAULT '{}';

-- 5. Admin Actions Audit Table
CREATE TABLE IF NOT EXISTS admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id),
    action_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view and create admin actions" ON admin_actions FOR ALL USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
