-- Supabase Schema for Personalized Travel Itinerary Planner
-- Secure Row Level Security (RLS) Configuration

-- Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: trips
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Optional owner when Supabase Auth is enabled
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    budget NUMERIC NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    travelers_count INTEGER NOT NULL DEFAULT 1,
    traveler_type TEXT NOT NULL DEFAULT 'solo',
    preferences JSONB DEFAULT '{}'::jsonb,
    vibe TEXT DEFAULT 'balanced',
    itinerary JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: itinerary_days
CREATE TABLE IF NOT EXISTS itinerary_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    trip_date DATE NOT NULL,
    activities JSONB DEFAULT '[]'::jsonb,
    estimated_daily_cost NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;

-- Drop any legacy insecure public policies
DROP POLICY IF EXISTS "Allow public all access on trips" ON trips;
DROP POLICY IF EXISTS "Allow public all access on itinerary_days" ON itinerary_days;

-- =========================================================================
-- SECURE ACCESS POLICIES
-- =========================================================================
-- 1. Authenticated User Policies (Ownership-based access):
-- Users can only read, insert, update, and delete their own trip records.
CREATE POLICY "Users can view their own trips"
ON trips FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trips"
ON trips FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips"
ON trips FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips"
ON trips FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Itinerary days access tied to trip ownership
CREATE POLICY "Users can view their own itinerary days"
ON itinerary_days FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM trips 
        WHERE trips.id = itinerary_days.trip_id 
        AND trips.user_id = auth.uid()
    )
);

CREATE POLICY "Users can modify their own itinerary days"
ON itinerary_days FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM trips 
        WHERE trips.id = itinerary_days.trip_id 
        AND trips.user_id = auth.uid()
    )
);

-- 2. Trusted Backend Service Access:
-- Note: The trusted backend uses the Supabase service_role key to manage
-- data, which safely bypasses RLS and enforces authorization at the application layer.
-- Anonymous public clients (anon key) have NO direct mutation or read access,
-- preventing unauthorized scrapers or malicious direct database writes.

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_trip_id ON itinerary_days(trip_id);
