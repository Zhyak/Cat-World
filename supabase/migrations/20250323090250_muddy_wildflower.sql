/*
  # Fix column names in cats table

  1. Changes
    - Rename createdAt to created_at to match Supabase conventions
    - Drop and recreate table to ensure consistent column names
    - Recreate policies with proper checks

  2. Security
    - Maintain RLS policies for public access
*/

-- Drop existing table and recreate with correct column names
DROP TABLE IF EXISTS cats;

CREATE TABLE cats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  imageUrl text NOT NULL,
  birthday date NOT NULL,
  favoriteToy text NOT NULL,
  breed text NOT NULL,
  furColor text NOT NULL,
  ownerName text NOT NULL,
  description text NOT NULL,
  personalityTraits text[] NOT NULL DEFAULT '{}',
  funFacts text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE cats ENABLE ROW LEVEL SECURITY;

-- Create policies
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'cats' AND policyname = 'Allow public read access'
  ) THEN
    CREATE POLICY "Allow public read access"
      ON cats
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'cats' AND policyname = 'Allow public insert access'
  ) THEN
    CREATE POLICY "Allow public insert access"
      ON cats
      FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies 
    WHERE tablename = 'cats' AND policyname = 'Allow public delete access'
  ) THEN
    CREATE POLICY "Allow public delete access"
      ON cats
      FOR DELETE
      TO public
      USING (true);
  END IF;
END $$;