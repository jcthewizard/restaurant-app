/*
  # Create profiles table

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `email` (text, not null, unique)
      - `role` (text, not null, default 'user')
      - `spins_remaining` (integer, not null, default 3)
      - `created_at` (timestamptz, not null, default now())
      - `avatar_url` (text, optional)
  
  2. Security
    - Enable RLS on `profiles` table
    - Add policy for users to read/update their own profile data
    - Add policy for authenticated users to read basic profile info of other users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'restaurant')),
  spins_remaining INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  avatar_url TEXT
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Users can read basic info of other users (for lobbies, etc.)
CREATE POLICY "Users can read other profiles basic info"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);