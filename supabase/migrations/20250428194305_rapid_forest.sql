/*
  # Friendship System

  1. New Tables
    - `friends`
      - `user_id` (uuid, references profiles)
      - `friend_id` (uuid, references profiles)
      - `created_at` (timestamptz, not null, default now())
      - Primary key (user_id, friend_id)

    - `friend_requests`
      - `sender_id` (uuid, references profiles)
      - `receiver_id` (uuid, references profiles)
      - `status` (text, not null)
      - `created_at` (timestamptz, not null, default now())
      - `updated_at` (timestamptz, not null, default now())
      - Primary key (sender_id, receiver_id)

    - `lobby_invitations`
      - `id` (uuid, primary key)
      - `lobby_id` (uuid, references lobbies)
      - `sender_id` (uuid, references profiles)
      - `receiver_id` (uuid, references profiles)
      - `status` (text, not null)
      - `created_at` (timestamptz, not null, default now())
      - `updated_at` (timestamptz, not null, default now())

  2. Security
    - Enable RLS on all tables
    - Create policies for friends and invitations management
*/

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, friend_id)
);

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (sender_id, receiver_id)
);

-- Create lobby_invitations table
CREATE TABLE IF NOT EXISTS lobby_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lobby_id UUID REFERENCES lobbies(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add online_status column to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'online_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN online_status TEXT NOT NULL DEFAULT 'offline' CHECK (online_status IN ('online', 'offline', 'away'));
    ALTER TABLE profiles ADD COLUMN last_seen TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE lobby_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for friends table
CREATE POLICY "Users can see their own friends"
  ON friends
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can add friends"
  ON friends
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove friends"
  ON friends
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- RLS Policies for friend_requests table
CREATE POLICY "Users can see their own sent and received friend requests"
  ON friend_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests"
  ON friend_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received friend requests"
  ON friend_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id);

-- RLS Policies for lobby_invitations table
CREATE POLICY "Users can see their own sent and received lobby invitations"
  ON lobby_invitations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send lobby invitations"
  ON lobby_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received lobby invitations"
  ON lobby_invitations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id);

-- Add function to update friend_requests when a friend is added
CREATE OR REPLACE FUNCTION update_friend_request_on_friend_added()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE friend_requests
  SET status = 'accepted', updated_at = now()
  WHERE (sender_id = NEW.user_id AND receiver_id = NEW.friend_id)
     OR (sender_id = NEW.friend_id AND receiver_id = NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update friend_requests
CREATE TRIGGER update_friend_request_trigger
AFTER INSERT ON friends
FOR EACH ROW
EXECUTE FUNCTION update_friend_request_on_friend_added();

-- Add reverse friendship automatically when a friendship is created
CREATE OR REPLACE FUNCTION create_reverse_friendship()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the reverse friendship already exists
  IF NOT EXISTS (
    SELECT 1 FROM friends WHERE user_id = NEW.friend_id AND friend_id = NEW.user_id
  ) THEN
    -- If not, create it
    INSERT INTO friends (user_id, friend_id)
    VALUES (NEW.friend_id, NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to create reverse friendships
CREATE TRIGGER create_reverse_friendship_trigger
AFTER INSERT ON friends
FOR EACH ROW
EXECUTE FUNCTION create_reverse_friendship();