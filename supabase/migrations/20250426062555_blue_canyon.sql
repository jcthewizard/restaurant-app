/*
  # Create lobbies and related tables

  1. New Tables
    - `lobbies`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `host_user_id` (uuid, foreign key to profiles)
      - `max_participants` (integer, not null)
      - `status` (text, not null)
      - `meeting_time` (timestamptz, nullable)
      - `created_at` (timestamptz, not null, default now())
    
    - `lobby_members`
      - `lobby_id` (uuid, foreign key to lobbies)
      - `user_id` (uuid, foreign key to profiles)
      - `status` (text, not null)
      - `joined_at` (timestamptz, not null, default now())
      - Primary key (lobby_id, user_id)
    
    - `lobby_messages`
      - `id` (uuid, primary key)
      - `lobby_id` (uuid, foreign key to lobbies)
      - `user_id` (uuid, foreign key to profiles)
      - `message` (text, not null)
      - `created_at` (timestamptz, not null, default now())
    
    - `lobby_selected_offers`
      - `lobby_id` (uuid, primary key, foreign key to lobbies)
      - `offer_id` (uuid, foreign key to offers)
      - `selected_at` (timestamptz, not null, default now())
  
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for lobbies and related tables
*/

-- Create lobbies table
CREATE TABLE IF NOT EXISTS lobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  host_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  max_participants INTEGER NOT NULL CHECK (max_participants BETWEEN 2 AND 20),
  status TEXT NOT NULL CHECK (status IN ('pending', 'spinning', 'selected', 'completed')),
  meeting_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create lobby_members table
CREATE TABLE IF NOT EXISTS lobby_members (
  lobby_id UUID REFERENCES lobbies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('ready', 'not-ready')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (lobby_id, user_id)
);

-- Create lobby_messages table
CREATE TABLE IF NOT EXISTS lobby_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID REFERENCES lobbies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create lobby_selected_offers table
CREATE TABLE IF NOT EXISTS lobby_selected_offers (
  lobby_id UUID PRIMARY KEY REFERENCES lobbies(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  selected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_selected_offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lobbies
CREATE POLICY "Users can create lobbies"
  ON lobbies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Lobby hosts can update their lobbies"
  ON lobbies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_user_id)
  WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Lobby hosts can delete their lobbies"
  ON lobbies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = host_user_id);

CREATE POLICY "Lobby members can read lobbies"
  ON lobbies
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM lobby_members
    WHERE lobby_members.lobby_id = id
    AND lobby_members.user_id = auth.uid()
  ) OR host_user_id = auth.uid() OR status = 'pending');

-- RLS Policies for lobby_members
CREATE POLICY "Users can join lobbies as members"
  ON lobby_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their lobby member status"
  ON lobby_members
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave lobbies"
  ON lobby_members
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Lobby hosts can manage member status"
  ON lobby_members
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM lobbies
    WHERE lobbies.id = lobby_id
    AND lobbies.host_user_id = auth.uid()
  ));

CREATE POLICY "Lobby members can read other members"
  ON lobby_members
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM lobby_members AS self
    WHERE self.lobby_id = lobby_id
    AND self.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM lobbies
    WHERE lobbies.id = lobby_id
    AND lobbies.host_user_id = auth.uid()
  ));

-- RLS Policies for lobby_messages
CREATE POLICY "Lobby members can send messages"
  ON lobby_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM lobby_members
      WHERE lobby_members.lobby_id = lobby_id
      AND lobby_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Lobby members can read messages"
  ON lobby_messages
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM lobby_members
    WHERE lobby_members.lobby_id = lobby_id
    AND lobby_members.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM lobbies
    WHERE lobbies.id = lobby_id
    AND lobbies.host_user_id = auth.uid()
  ));

-- RLS Policies for lobby_selected_offers
CREATE POLICY "Lobby hosts can select offers"
  ON lobby_selected_offers
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM lobbies
    WHERE lobbies.id = lobby_id
    AND lobbies.host_user_id = auth.uid()
  ));

CREATE POLICY "Lobby members can read selected offers"
  ON lobby_selected_offers
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM lobby_members
    WHERE lobby_members.lobby_id = lobby_id
    AND lobby_members.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM lobbies
    WHERE lobbies.id = lobby_id
    AND lobbies.host_user_id = auth.uid()
  ));