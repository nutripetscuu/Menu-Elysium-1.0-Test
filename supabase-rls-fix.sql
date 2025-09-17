-- Fix RLS policies for Header Images table
-- Run this in your Supabase SQL Editor

-- First, let's check if RLS is enabled (optional, just for info)
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'Header Images';

-- Enable RLS on the table (if not already enabled)
ALTER TABLE "Header Images" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read on Header Images" ON "Header Images";

-- Create a policy that allows anyone to read (SELECT) from Header Images
CREATE POLICY "Allow public read on Header Images"
ON "Header Images"
FOR SELECT
USING (true);

-- Optional: If you want to be more restrictive and only show active images
-- CREATE POLICY "Allow public read on Header Images"
-- ON "Header Images"
-- FOR SELECT
-- USING (is_active = true);

-- Verify the policy was created
-- SELECT * FROM pg_policies WHERE tablename = 'Header Images';