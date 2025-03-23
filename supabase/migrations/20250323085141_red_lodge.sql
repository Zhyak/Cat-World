/*
  # Create cats table

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
      - `createdAt` (timestamp)

  2. Security
    - Enable RLS on `cats` table
    - Add policy for public read access
    - Add policy for public insert/delete access (temporary until auth is added)
*/

CREATE TABLE IF NOT EXISTS cats (
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
  createdAt timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE cats ENABLE ROW LEVEL SECURITY;

-- Create policies (temporary public access until auth is implemented)
CREATE POLICY "Allow public read access"
  ON cats
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access"
  ON cats
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public delete access"
  ON cats
  FOR DELETE
  TO public
  USING (true);