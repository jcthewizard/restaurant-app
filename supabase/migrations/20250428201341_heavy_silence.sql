/*
  # Add username field to profiles table

  1. Changes:
    - Add username column to `profiles` table
      - TEXT datatype
      - UNIQUE constraint
      - NOT NULL constraint
      - Check constraint to ensure usernames are lowercase alphanumeric with underscore and dot
    - Create trigger to generate a default username from name when not provided

  2. Security:
    - Existing RLS policies will apply to the new field
*/

-- Add username column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;
    
    -- Update existing profiles with a default username based on email
    UPDATE profiles
    SET username = LOWER(
      REGEXP_REPLACE(
        SPLIT_PART(email, '@', 1) || '_' || SUBSTRING(id::text, 1, 8),
        '[^a-z0-9_\.]', '_'
      )
    );
    
    -- Make username required for all new profiles
    ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;
    
    -- Ensure usernames are properly formatted
    ALTER TABLE profiles ADD CONSTRAINT username_format CHECK (
      username ~ '^[a-z0-9][a-z0-9_\.]{2,29}$'
    );
  END IF;
END $$;

-- Function to generate a default username if not provided
CREATE OR REPLACE FUNCTION generate_username()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  temp_username TEXT;
  counter INTEGER := 0;
  username_exists BOOLEAN;
BEGIN
  -- If username is already set, use it
  IF NEW.username IS NOT NULL THEN
    -- Convert to lowercase and replace invalid characters
    NEW.username := LOWER(REGEXP_REPLACE(NEW.username, '[^a-z0-9_\.]', '_'));
    RETURN NEW;
  END IF;

  -- Generate base username from name
  base_username := LOWER(REGEXP_REPLACE(SPLIT_PART(NEW.name, ' ', 1), '[^a-z0-9_\.]', '_'));
  
  -- If base_username is too short, append part of the user id
  IF LENGTH(base_username) < 3 THEN
    base_username := base_username || '_' || SUBSTRING(NEW.id::text, 1, 5);
  END IF;
  
  -- Try the base username first
  temp_username := base_username;
  
  -- Check if username exists
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM profiles WHERE username = temp_username
    ) INTO username_exists;
    
    EXIT WHEN NOT username_exists;
    
    -- Increment counter and try again
    counter := counter + 1;
    temp_username := base_username || counter;
  END LOOP;
  
  NEW.username := temp_username;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger for username generation
DROP TRIGGER IF EXISTS generate_username_trigger ON profiles;
CREATE TRIGGER generate_username_trigger
BEFORE INSERT ON profiles
FOR EACH ROW
WHEN (NEW.username IS NULL)
EXECUTE FUNCTION generate_username();