-- ============================================================
-- RoomRush: Room Seeker Profiles — v2 migration
-- Run this in Supabase SQL Editor.
-- Safe to run on an existing table — uses ADD COLUMN IF NOT EXISTS.
-- ============================================================

-- 1. Add age column (nullable integer, 16–80)
ALTER TABLE public.room_seeker_profiles
  ADD COLUMN IF NOT EXISTS age integer NULL;

ALTER TABLE public.room_seeker_profiles
  DROP CONSTRAINT IF EXISTS room_seeker_profiles_age_check;

ALTER TABLE public.room_seeker_profiles
  ADD CONSTRAINT room_seeker_profiles_age_check
  CHECK (age IS NULL OR (age >= 16 AND age <= 80));

-- 2. Add photo_urls column (text array, default empty)
ALTER TABLE public.room_seeker_profiles
  ADD COLUMN IF NOT EXISTS photo_urls text[] NOT NULL DEFAULT '{}';

-- Existing rows get an empty array automatically — no data loss.
-- Existing photo_url column is kept for backwards compatibility.
