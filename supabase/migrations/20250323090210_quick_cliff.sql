/*
  # Create cats table with proper column names

  1. New Tables
    - `cats`
      - `id` (uuid, primary key)
      - `name` (text)
      - `imageUrl` (text)
      - `birthday` (date)
      - `favoriteToy` (text)
      - `breed` (text)
      - `furColor` (text)
      - `ownerName` (text)
      - `description` (text)
      - `personalityTraits` (text[])
      - `funFacts` (text[])
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `cats` table
    - Add policies for public access (temporary until auth is implemented)
*/

-- Create the table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cats') THEN
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
  END IF;
END $$;

-- Create policies if they don't exist
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