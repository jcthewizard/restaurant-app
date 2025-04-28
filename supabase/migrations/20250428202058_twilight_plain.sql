/*
  # Fix infinite recursion in lobby_members RLS policy

  1. Changes
    - Fix the "Lobby members can read other members" policy for lobby_members table
    - Replace with a corrected version that avoids recursive lookup

  2. Security
    - Maintains same security intent: users can read lobby members if they are either
      a member of the lobby or the host of the lobby
*/

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Lobby members can read other members" ON lobby_members;

-- Create a corrected version of the policy
CREATE POLICY "Lobby members can read other members"
  ON lobby_members
  FOR SELECT
  TO authenticated
  USING (
    -- The user is a member of the same lobby
    lobby_id IN (
      SELECT lm.lobby_id 
      FROM lobby_members lm 
      WHERE lm.user_id = auth.uid()
    )
    OR
    -- The user is the host of the lobby
    lobby_id IN (
      SELECT l.id
      FROM lobbies l
      WHERE l.host_user_id = auth.uid()
    )
  );