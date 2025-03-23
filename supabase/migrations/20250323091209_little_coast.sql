/*
  # Fix column names in cats table

  1. Changes
    - Use snake_case for all column names to follow PostgreSQL conventions
    - Drop and recreate table with correct column names
    - Add proper policies with existence checks

  2. Security
    - Enable RLS
    - Add public access policies
*/

-- Drop existing table and recreate with correct column names
DROP TABLE IF EXISTS cats;

CREATE TABLE cats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  birthday date NOT NULL,
  favorite_toy text NOT NULL,
  breed text NOT NULL,
  fur_color text NOT NULL,
  owner_name text NOT NULL,
  description text NOT NULL,
  personality_traits text[] NOT NULL DEFAULT '{}',
  fun_facts text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE cats ENABLE ROW LEVEL SECURITY;

-- Create policies with existence checks
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