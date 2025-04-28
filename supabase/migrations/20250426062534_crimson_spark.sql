/*
  # Create restaurants and related tables

  1. New Tables
    - `restaurants`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `name` (text, not null)
      - `address` (text, not null)
      - `price_range` (text, not null)
      - `description` (text, not null)
      - `cuisine` (text, not null)
      - `rating` (numeric, default 0)
      - `created_at` (timestamptz, not null, default now())
    
    - `offers`
      - `id` (uuid, primary key)
      - `restaurant_id` (uuid, foreign key to restaurants)
      - `discount_percent` (integer, not null)
      - `valid_from` (date, not null)
      - `valid_to` (date, not null)
      - `max_redemptions` (integer, not null)
      - `current_redemptions` (integer, not null, default 0)
      - `created_at` (timestamptz, not null, default now())
    
    - `spins`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `offer_id` (uuid, foreign key to offers)
      - `price_range` (text, not null)
      - `created_at` (timestamptz, not null, default now())
    
    - `redemptions`
      - `id` (uuid, primary key)
      - `offer_id` (uuid, foreign key to offers)
      - `user_id` (uuid, foreign key to profiles)
      - `lobby_id` (uuid, nullable, foreign key to lobbies)
      - `qr_code` (text, not null)
      - `redeemed_at` (timestamptz, nullable)
      - `created_at` (timestamptz, not null, default now())
  
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for restaurants, offers, spins, and redemptions
*/

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  price_range TEXT NOT NULL CHECK (price_range IN ('$', '$$', '$$$')),
  description TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  rating NUMERIC DEFAULT 0,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  discount_percent INTEGER NOT NULL CHECK (discount_percent BETWEEN 5 AND 50),
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  max_redemptions INTEGER NOT NULL,
  current_redemptions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (valid_to >= valid_from)
);

-- Create spins table
CREATE TABLE IF NOT EXISTS spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  price_range TEXT NOT NULL CHECK (price_range IN ('$', '$$', '$$$')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create redemptions table
CREATE TABLE IF NOT EXISTS redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lobby_id UUID,
  qr_code TEXT NOT NULL,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for restaurants
CREATE POLICY "Restaurant owners can create their own restaurants"
  ON restaurants
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Restaurant owners can update their own restaurants"
  ON restaurants
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Restaurant owners can delete their own restaurants"
  ON restaurants
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read restaurants"
  ON restaurants
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for offers
CREATE POLICY "Restaurant owners can manage their own offers"
  ON offers
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM restaurants
    WHERE restaurants.id = restaurant_id
    AND restaurants.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can read offers"
  ON offers
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for spins
CREATE POLICY "Users can create their own spins"
  ON spins
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own spins"
  ON spins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for redemptions
CREATE POLICY "Users can create redemptions"
  ON redemptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own redemptions"
  ON redemptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Restaurant owners can read redemptions for their restaurant"
  ON redemptions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM offers
    JOIN restaurants ON offers.restaurant_id = restaurants.id
    WHERE redemptions.offer_id = offers.id
    AND restaurants.user_id = auth.uid()
  ));