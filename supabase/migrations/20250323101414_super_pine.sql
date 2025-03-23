/*
  # Update cats table schema

  1. Changes
    - Add user_id column for authentication
    - Update image_url to store Supabase Storage URLs
    - Remove unused columns (personality_traits, fun_facts)
    - Add updated_at column

  2. Security
    - Add RLS policies for authenticated users
    - Remove public access policies
*/

-- Add new columns and constraints
ALTER TABLE cats
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Drop unused columns
ALTER TABLE cats
DROP COLUMN IF EXISTS personality_traits,
DROP COLUMN IF EXISTS fun_facts;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cats_updated_at
    BEFORE UPDATE ON cats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Remove existing policies
DROP POLICY IF EXISTS "Allow public read access" ON cats;
DROP POLICY IF EXISTS "Allow public insert access" ON cats;
DROP POLICY IF EXISTS "Allow public delete access" ON cats;

-- Add new RLS policies for authenticated users
CREATE POLICY "Users can read own cats"
ON cats FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cats"
ON cats FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cats"
ON cats FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cats"
ON cats FOR DELETE
TO authenticated
USING (auth.uid() = user_id);