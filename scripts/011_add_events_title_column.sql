-- Migration: Add events.title for deployments using the older schema (events.name only)
-- Run this in the Supabase SQL Editor on your DEPLOYED project if you get:
--   "column events.title does not exist"
--
-- This adds title and backfills from name so the app works without changing code.

-- Add title column if missing
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS title TEXT;

-- Backfill title from name where title is null
UPDATE public.events
  SET title = name
  WHERE title IS NULL AND name IS NOT NULL;
