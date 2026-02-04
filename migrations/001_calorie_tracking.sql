-- Migration: Calorie Tracking, Meals Consumed, User Health Details
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Extend users table with health detail columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS activity_level TEXT CHECK (activity_level IN ('sedentary','lightly_active','moderately_active','very_active','extremely_active'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS target_weight NUMERIC;
ALTER TABLE users ADD COLUMN IF NOT EXISTS target_weeks INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_calorie_goal INTEGER;

-- 2. Create meals_consumed table
CREATE TABLE IF NOT EXISTS meals_consumed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  recipe_name TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein INTEGER NOT NULL DEFAULT 0,
  carbs INTEGER NOT NULL DEFAULT 0,
  fat INTEGER NOT NULL DEFAULT 0,
  servings FLOAT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE meals_consumed ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy - users can only access their own meals
CREATE POLICY meals_consumed_policy ON meals_consumed
  FOR ALL USING (user_id = auth.uid());

-- 5. Index for faster queries
CREATE INDEX IF NOT EXISTS idx_meals_consumed_user_date
  ON meals_consumed (user_id, created_at DESC);
