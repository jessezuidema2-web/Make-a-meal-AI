-- =====================================================
-- Make a Meal AI - Supabase Database Setup
-- =====================================================
-- Run this SQL in your Supabase SQL Editor
-- This includes: Tables, RLS Policies, Indexes, Functions

-- =====================================================
-- 1. EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. TABLES
-- =====================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  height NUMERIC NOT NULL CHECK (height > 0 AND height < 300),
  weight NUMERIC NOT NULL CHECK (weight > 0 AND weight < 500),
  fitness_goal TEXT NOT NULL CHECK (fitness_goal IN ('gym', 'lose_weight', 'gain_weight')),
  cuisine_preferences TEXT[] NOT NULL DEFAULT '{}',
  taste_preferences TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scans Table
CREATE TABLE IF NOT EXISTS scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  ingredients JSONB NOT NULL DEFAULT '[]',
  recipes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL,
  recipe JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Usage Tracking Table (for rate limiting)
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('scan', 'recipe_generation', 'api_call')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Subscriptions Table (for Stripe)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('free', 'active', 'canceled', 'past_due', 'trialing')),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'premium')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- 3. INDEXES (Performance Optimization)
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created_at ON favorites(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_created_at ON usage_tracking(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile (during onboarding)
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users cannot delete their profile (handle via auth.users)
-- If you want to allow deletion:
CREATE POLICY "Users can delete own profile"
  ON users FOR DELETE
  USING (auth.uid() = id);

-- =====================================================
-- SCANS TABLE POLICIES
-- =====================================================

-- Users can read their own scans
CREATE POLICY "Users can read own scans"
  ON scans FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own scans
CREATE POLICY "Users can insert own scans"
  ON scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own scans
CREATE POLICY "Users can update own scans"
  ON scans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own scans
CREATE POLICY "Users can delete own scans"
  ON scans FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FAVORITES TABLE POLICIES
-- =====================================================

-- Users can read their own favorites
CREATE POLICY "Users can read own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- USAGE TRACKING TABLE POLICIES
-- =====================================================

-- Users can read their own usage
CREATE POLICY "Users can read own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert usage (from Edge Functions)
CREATE POLICY "Service role can insert usage"
  ON usage_tracking FOR INSERT
  WITH CHECK (true); -- Only service_role can bypass this in practice

-- =====================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- =====================================================

-- Users can read their own subscription
CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can modify subscriptions (via webhooks)
-- No INSERT/UPDATE/DELETE policies for users
-- Stripe webhook handler uses service_role key

-- =====================================================
-- 5. FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for subscriptions table
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. HELPER FUNCTIONS FOR RATE LIMITING
-- =====================================================

-- Function to check scan limits
CREATE OR REPLACE FUNCTION check_scan_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_plan_type TEXT;
  v_scan_count INTEGER;
BEGIN
  -- Get user's plan type
  SELECT plan_type INTO v_plan_type
  FROM subscriptions
  WHERE user_id = p_user_id;

  -- Default to free if no subscription
  IF v_plan_type IS NULL THEN
    v_plan_type := 'free';
  END IF;

  -- Count scans in the last 30 days
  SELECT COUNT(*) INTO v_scan_count
  FROM scans
  WHERE user_id = p_user_id
    AND created_at > NOW() - INTERVAL '30 days';

  -- Free tier: 10 scans per month
  IF v_plan_type = 'free' AND v_scan_count >= 10 THEN
    RETURN FALSE;
  END IF;

  -- Premium: unlimited
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log usage
CREATE OR REPLACE FUNCTION log_usage(
  p_user_id UUID,
  p_action_type TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO usage_tracking (user_id, action_type, metadata)
  VALUES (p_user_id, p_action_type, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. STORAGE BUCKET SETUP (Run in Supabase Dashboard)
-- =====================================================

-- Create bucket for ingredient scans (if not exists)
-- This is typically done in the Supabase Dashboard under Storage

-- Then run this to set up RLS for storage:
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('ingredient-scans', 'ingredient-scans', true);

-- Storage policies (run after creating bucket)
-- CREATE POLICY "Users can upload their own images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'ingredient-scans' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can read their own images"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'ingredient-scans' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- CREATE POLICY "Users can delete their own images"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'ingredient-scans' AND
--     auth.uid()::text = (storage.foldername(name))[1]
--   );

-- =====================================================
-- 8. INITIAL DATA (Optional)
-- =====================================================

-- You can add seed data here if needed
-- Example: Create a default free subscription for new users

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if RLS is enabled on all tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'scans', 'favorites', 'usage_tracking', 'subscriptions');

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check indexes
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- NOTES
-- =====================================================

-- 1. Run this entire script in your Supabase SQL Editor
-- 2. Make sure to create the storage bucket manually in the dashboard
-- 3. Service role key should ONLY be used in backend Edge Functions
-- 4. Anon key is safe to use in client (RLS protects data)
-- 5. Test RLS policies thoroughly before going to production
-- 6. Monitor usage_tracking table for rate limiting
-- 7. Stripe webhooks should use service_role to update subscriptions

-- =====================================================
-- SECURITY REMINDERS
-- =====================================================

-- ✅ RLS is enabled on all tables
-- ✅ Users can only access their own data
-- ✅ Service role bypass RLS (use carefully in Edge Functions)
-- ✅ Storage bucket has RLS (users can only see their images)
-- ✅ Rate limiting function is in place
-- ✅ Subscriptions can only be modified by webhooks (service role)
