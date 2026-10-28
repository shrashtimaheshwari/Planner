-- Migration: Apply Secure RLS Policies and Ownership Control
-- Safe to run on existing production or development database

-- 1. Ensure uuid extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Add user_id column if not already present
ALTER TABLE trips ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Ensure Row Level Security (RLS) is strictly enabled
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;

-- 4. Drop any insecure or open public policies
DROP POLICY IF EXISTS "Allow public all access on trips" ON trips;
DROP POLICY IF EXISTS "Allow public all access on itinerary_days" ON itinerary_days;
DROP POLICY IF EXISTS "Users can view their own trips" ON trips;
DROP POLICY IF EXISTS "Users can insert their own trips" ON trips;
DROP POLICY IF EXISTS "Users can update their own trips" ON trips;
DROP POLICY IF EXISTS "Users can delete their own trips" ON trips;
DROP POLICY IF EXISTS "Users can view their own itinerary days" ON itinerary_days;
DROP POLICY IF EXISTS "Users can modify their own itinerary days" ON itinerary_days;

-- 5. Create secure ownership-based access policies for authenticated users
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

-- 6. Add indexes
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_itinerary_days_trip_id ON itinerary_days(trip_id);
