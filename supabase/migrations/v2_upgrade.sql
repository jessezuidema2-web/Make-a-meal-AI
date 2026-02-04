-- V2 Upgrade: Water tracking, Streak, Community

-- Water tracking
CREATE TABLE IF NOT EXISTS water_intake (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  glasses INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
CREATE POLICY water_policy ON water_intake FOR ALL USING (user_id = auth.uid());

-- Streak tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_scan_date DATE;

-- Community posts
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  recipe_name TEXT NOT NULL,
  recipe_image TEXT,
  calories INTEGER DEFAULT 0,
  caption TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY community_read ON community_posts FOR SELECT USING (true);
CREATE POLICY community_insert ON community_posts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY community_delete ON community_posts FOR DELETE USING (user_id = auth.uid());

-- Community likes
CREATE TABLE IF NOT EXISTS community_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY likes_read ON community_likes FOR SELECT USING (true);
CREATE POLICY likes_insert ON community_likes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY likes_delete ON community_likes FOR DELETE USING (user_id = auth.uid());
