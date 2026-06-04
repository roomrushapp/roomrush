-- ============================================================
-- RoomRush: Room Seeker Profiles
-- Paste this into the Supabase SQL Editor and run it.
-- ============================================================

-- 1. Table
CREATE TABLE public.room_seeker_profiles (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text        NOT NULL CHECK (char_length(name) <= 100),
  photo_url       text        NULL,
  budget          text        NOT NULL CHECK (char_length(budget) <= 100),
  move_in_date    text        NOT NULL CHECK (char_length(move_in_date) <= 50),
  preferred_area  text        NOT NULL CHECK (char_length(preferred_area) <= 200),
  short_intro     text        NOT NULL CHECK (char_length(short_intro) <= 500),
  contact_method  text        NOT NULL CHECK (contact_method IN ('whatsapp', 'email', 'instagram', 'facebook')),
  contact_value   text        NOT NULL CHECK (char_length(contact_value) <= 200),
  is_active       boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT room_seeker_profiles_user_id_key UNIQUE (user_id)
);

-- 2. updated_at trigger function (create only if it doesn't already exist)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER room_seeker_profiles_updated_at
  BEFORE UPDATE ON public.room_seeker_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Enable Row Level Security
ALTER TABLE public.room_seeker_profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Public can read active profiles
CREATE POLICY "Public read active room seeker profiles"
  ON public.room_seeker_profiles
  FOR SELECT
  USING (is_active = true);

-- Authenticated users can read their own profile (including inactive)
CREATE POLICY "Users read own profile"
  ON public.room_seeker_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can insert only their own profile
CREATE POLICY "Users insert own profile"
  ON public.room_seeker_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update only their own profile
CREATE POLICY "Users update own profile"
  ON public.room_seeker_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can delete only their own profile
CREATE POLICY "Users delete own profile"
  ON public.room_seeker_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
