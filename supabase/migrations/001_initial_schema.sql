-- Grip Club Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUM TYPES
-- =============================================================================

CREATE TYPE engine_capacity AS ENUM ('125cc_4t', '50cc_2t');
CREATE TYPE driving_level AS ENUM ('amateur', 'intermediate', 'advanced', 'expert');
CREATE TYPE registration_status AS ENUM ('draft', 'pending', 'confirmed', 'cancelled');
CREATE TYPE staff_role AS ENUM ('mechanic', 'coordinator', 'support');

-- =============================================================================
-- TEAMS TABLE
-- =============================================================================

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Netlify Identity user ID (representative)
    representative_user_id TEXT NOT NULL UNIQUE,

    -- Team Info
    name VARCHAR(100) NOT NULL,
    number_of_pilots INTEGER NOT NULL CHECK (number_of_pilots >= 4 AND number_of_pilots <= 8),

    -- Representative Contact
    representative_name VARCHAR(100) NOT NULL,
    representative_surname VARCHAR(100) NOT NULL,
    representative_dni VARCHAR(20) NOT NULL,
    representative_phone VARCHAR(20) NOT NULL,
    representative_email VARCHAR(255) NOT NULL,

    -- Address
    address TEXT,
    municipality VARCHAR(100),
    postal_code VARCHAR(10),
    province VARCHAR(100),

    -- Motorcycle Info
    motorcycle_brand VARCHAR(100),
    motorcycle_model VARCHAR(100),
    engine_capacity engine_capacity DEFAULT '125cc_4t',
    registration_date DATE,
    modifications TEXT,

    -- Comments
    comments TEXT,
    gdpr_consent BOOLEAN NOT NULL DEFAULT false,
    gdpr_consent_date TIMESTAMPTZ,

    -- Status & Metadata
    status registration_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_teams_representative ON teams(representative_user_id);
CREATE INDEX idx_teams_status ON teams(status);

-- =============================================================================
-- PILOTS TABLE
-- =============================================================================

CREATE TABLE pilots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

    -- Personal Info
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,

    -- Emergency Contact
    emergency_contact_name VARCHAR(200) NOT NULL,
    emergency_contact_phone VARCHAR(20) NOT NULL,

    -- Experience
    driving_level driving_level DEFAULT 'amateur',
    track_experience TEXT,

    -- Role
    is_representative BOOLEAN DEFAULT false,
    pilot_number INTEGER,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(team_id, dni),
    UNIQUE(team_id, pilot_number)
);

-- Indexes
CREATE INDEX idx_pilots_team ON pilots(team_id);
CREATE INDEX idx_pilots_email ON pilots(email);

-- =============================================================================
-- TEAM STAFF TABLE
-- =============================================================================

CREATE TABLE team_staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

    -- Personal Info
    name VARCHAR(200) NOT NULL,
    dni VARCHAR(20),
    phone VARCHAR(20),

    -- Role
    role staff_role NOT NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_staff_team ON team_staff(team_id);

-- =============================================================================
-- REGISTRATION SETTINGS TABLE
-- =============================================================================

CREATE TABLE registration_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    registration_open BOOLEAN DEFAULT true,
    registration_deadline TIMESTAMPTZ,
    pilot_modification_deadline TIMESTAMPTZ,
    max_teams INTEGER DEFAULT 35,
    event_date DATE,
    event_location VARCHAR(255),

    -- Metadata
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure only one row
    CONSTRAINT single_settings CHECK (id = 1)
);

-- Insert default settings
INSERT INTO registration_settings (id, registration_open, max_teams)
VALUES (1, true, 35)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- AUTO-UPDATE TIMESTAMPS
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER pilots_updated_at
    BEFORE UPDATE ON pilots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER staff_updated_at
    BEFORE UPDATE ON team_staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER settings_updated_at
    BEFORE UPDATE ON registration_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- VIEWS
-- =============================================================================

CREATE VIEW team_summary AS
SELECT
    t.id,
    t.name,
    t.representative_email,
    t.status,
    t.motorcycle_brand,
    t.motorcycle_model,
    t.number_of_pilots AS max_pilots,
    COUNT(DISTINCT p.id) AS current_pilots,
    COUNT(DISTINCT s.id) AS current_staff,
    t.created_at,
    t.updated_at
FROM teams t
LEFT JOIN pilots p ON t.id = p.team_id
LEFT JOIN team_staff s ON t.id = s.team_id
GROUP BY t.id;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE pilots ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_settings ENABLE ROW LEVEL SECURITY;

-- Service role (used by Netlify Functions) has full access
-- These policies allow the service role to bypass RLS

CREATE POLICY "Service role full access on teams" ON teams
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on pilots" ON pilots
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on staff" ON team_staff
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Everyone can read settings" ON registration_settings
    FOR SELECT
    TO anon, authenticated, service_role
    USING (true);

CREATE POLICY "Only service role can update settings" ON registration_settings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
