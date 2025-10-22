/*
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