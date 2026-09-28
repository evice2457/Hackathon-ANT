-- ========================================================
-- VirtualDouble (ANT) — Production Database Schema for Supabase
-- Covers: User Profiles, Focus Sessions, and Isolated Telemetry
-- ========================================================

-- 1. Profiles Table (Extended user metadata)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say')),
  date_of_birth DATE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Focus Sessions Table (Tracks individual focused work sprints)
CREATE TABLE IF NOT EXISTS public.focus_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  task TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  tag TEXT DEFAULT 'General',
  focus_score INTEGER DEFAULT 90,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on Focus Sessions
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own focus sessions"
  ON public.focus_sessions FOR ALL
  USING (auth.uid() = user_id);

-- 3. User Telemetry Table (Aggregated performance and streaks)
CREATE TABLE IF NOT EXISTS public.user_telemetry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE NOT NULL,
  total_focus_seconds BIGINT DEFAULT 0,
  completed_sessions_count INTEGER DEFAULT 0,
  distraction_rescues_count INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 1,
  daily_goal_minutes INTEGER DEFAULT 240,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on User Telemetry
ALTER TABLE public.user_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own telemetry"
  ON public.user_telemetry FOR ALL
  USING (auth.uid() = user_id);

-- 4. Trigger to handle profile creation on Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, gender, date_of_birth)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'VirtualDouble Member'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'gender',
    (NEW.raw_user_meta_data->>'date_of_birth')::DATE
  );

  INSERT INTO public.user_telemetry (user_id, total_focus_seconds, completed_sessions_count, streak_days)
  VALUES (NEW.id, 0, 0, 1);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
