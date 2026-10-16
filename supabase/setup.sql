-- MoodJournal: esquema completo (copia de supabase/migrations en orden).
-- Pégalo en Supabase → SQL Editor → New query → Run.

/*
  # Emotional Wellness Journal - Database Schema

  ## Overview
  Creates the database structure for an emotional wellness journal application with AI-powered sentiment analysis.

  ## New Tables
  
  ### `profiles`
  User profile information linked to Supabase auth
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User's email address
  - `full_name` (text) - User's display name
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last profile update

  ### `journal_entries`
  Daily emotional journal entries with AI sentiment analysis
  - `id` (uuid, primary key) - Unique entry identifier
  - `user_id` (uuid, foreign key) - References profiles.id
  - `content` (text) - The journal entry text
  - `sentiment` (text) - AI-detected sentiment: 'positive', 'negative', or 'neutral'
  - `sentiment_score` (numeric) - Confidence score from -1 to 1
  - `ai_summary` (text) - AI-generated summary or insights
  - `created_at` (timestamptz) - Entry creation timestamp
  - `entry_date` (date) - The date this entry represents

  ### `motivational_quotes`
  Collection of motivational quotes shown based on sentiment
  - `id` (uuid, primary key) - Unique quote identifier
  - `quote` (text) - The motivational quote text
  - `author` (text) - Quote author
  - `sentiment_type` (text) - Target sentiment: 'positive', 'negative', 'neutral', or 'all'
  - `created_at` (timestamptz) - Quote creation timestamp

  ## Security
  
  - Enable RLS on all tables
  - Profiles: Users can read/update only their own profile
  - Journal entries: Users can create/read/update/delete only their own entries
  - Motivational quotes: All authenticated users can read quotes
  
  ## Indexes
  
  - Index on journal_entries.user_id for fast user-specific queries
  - Index on journal_entries.entry_date for chronological sorting
  - Index on journal_entries.sentiment for filtering by emotion
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  sentiment text NOT NULL CHECK (sentiment IN ('positive', 'negative', 'neutral')),
  sentiment_score numeric DEFAULT 0 CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  ai_summary text DEFAULT '',
  entry_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
  ON journal_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON journal_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON journal_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON journal_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON journal_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_sentiment ON journal_entries(sentiment);

-- Create motivational_quotes table
CREATE TABLE IF NOT EXISTS motivational_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote text NOT NULL,
  author text DEFAULT 'Unknown',
  sentiment_type text NOT NULL CHECK (sentiment_type IN ('positive', 'negative', 'neutral', 'all')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE motivational_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read quotes"
  ON motivational_quotes FOR SELECT
  TO authenticated
  USING (true);

-- Insert initial motivational quotes
INSERT INTO motivational_quotes (quote, author, sentiment_type) VALUES
  ('Every day is a new beginning. Take a deep breath and start again.', 'Unknown', 'negative'),
  ('You are stronger than you think, braver than you believe, and more loved than you know.', 'A.A. Milne', 'negative'),
  ('The only way out is through. Keep going.', 'Robert Frost', 'negative'),
  ('Your emotions are valid. It''s okay to not be okay sometimes.', 'Unknown', 'negative'),
  ('Keep shining! Your positive energy is contagious.', 'Unknown', 'positive'),
  ('Today''s joy is tomorrow''s strength. Cherish these moments.', 'Unknown', 'positive'),
  ('You''re doing amazing. Keep spreading that light!', 'Unknown', 'positive'),
  ('Balance is key. Take time to reflect and recharge.', 'Unknown', 'neutral'),
  ('Self-awareness is the first step to growth.', 'Unknown', 'neutral'),
  ('One day at a time. You''re making progress.', 'Unknown', 'all')
ON CONFLICT DO NOTHING;/*
  # User Preferences and Streak Tracking

  1. New Tables
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `theme` (text, 'light' or 'dark')
      - `reminder_enabled` (boolean, daily reminder toggle)
      - `reminder_time` (time, preferred time for reminders)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `user_streaks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `current_streak` (integer, current consecutive days)
      - `longest_streak` (integer, longest streak ever)
      - `last_entry_date` (date, last date user wrote)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own data
    
  3. Functions
    - Create trigger to update streak automatically
*/

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  theme text DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  reminder_enabled boolean DEFAULT false,
  reminder_time time DEFAULT '20:00:00',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create user_streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_entry_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own streaks"
  ON user_streaks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streaks"
  ON user_streaks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streaks"
  ON user_streaks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update streaks when a new entry is created
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_last_entry_date date;
  v_current_streak integer;
  v_longest_streak integer;
  v_streak_record record;
BEGIN
  -- Get or create streak record
  SELECT * INTO v_streak_record
  FROM user_streaks
  WHERE user_id = NEW.user_id;

  IF NOT FOUND THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_entry_date)
    VALUES (NEW.user_id, 1, 1, NEW.entry_date);
    RETURN NEW;
  END IF;

  v_last_entry_date := v_streak_record.last_entry_date;
  v_current_streak := v_streak_record.current_streak;
  v_longest_streak := v_streak_record.longest_streak;

  -- If same day, don't update streak
  IF NEW.entry_date = v_last_entry_date THEN
    RETURN NEW;
  END IF;

  -- If consecutive day, increment streak
  IF NEW.entry_date = v_last_entry_date + INTERVAL '1 day' THEN
    v_current_streak := v_current_streak + 1;
  -- If gap of one day (yesterday was missed but today is here), reset to 1
  ELSIF NEW.entry_date > v_last_entry_date + INTERVAL '1 day' THEN
    v_current_streak := 1;
  END IF;

  -- Update longest streak if current is higher
  IF v_current_streak > v_longest_streak THEN
    v_longest_streak := v_current_streak;
  END IF;

  -- Update streak record
  UPDATE user_streaks
  SET 
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    last_entry_date = NEW.entry_date,
    updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for streak updates
DROP TRIGGER IF EXISTS trigger_update_streak ON journal_entries;
CREATE TRIGGER trigger_update_streak
  AFTER INSERT ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_user_streak();

-- Function to initialize user preferences on signup
CREATE OR REPLACE FUNCTION init_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO user_streaks (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize preferences on user creation
DROP TRIGGER IF EXISTS trigger_init_user_preferences ON auth.users;
CREATE TRIGGER trigger_init_user_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION init_user_preferences();