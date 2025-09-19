-- Complete database fix for all issues
-- Run this in your Supabase SQL Editor to resolve all errors

-- First, create all missing tables and functions
DO $$ 
BEGIN

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('article', 'news', 'podcast', 'program', 'coverage', 'media')),
  target_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(target_type, target_id, user_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('article', 'news', 'podcast', 'program', 'coverage', 'media')),
  target_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('published', 'pending', 'hidden')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('article', 'news', 'podcast', 'program', 'coverage', 'media')),
  target_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(target_type, target_id, user_id)
);

-- Shares table
CREATE TABLE IF NOT EXISTS shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('article', 'news', 'podcast', 'program', 'coverage', 'media')),
  target_id UUID NOT NULL,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('facebook', 'twitter', 'whatsapp', 'telegram', 'email', 'copy')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter subscriptions table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  locale VARCHAR(5) DEFAULT 'ar',
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add view_count column to all content tables if not exists
ALTER TABLE articles ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE news ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE coverage ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE media ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Add podcast enhancements
ALTER TABLE podcasts 
ADD COLUMN IF NOT EXISTS program_type VARCHAR(20) DEFAULT 'khutwa',
ADD COLUMN IF NOT EXISTS custom_program_type TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add check constraint for program_type values
DO $constraint$ BEGIN
    ALTER TABLE podcasts 
    ADD CONSTRAINT check_program_type 
    CHECK (program_type IN ('khutwa', 'maqal', 'ayan', 'other'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $constraint$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_target ON bookmarks(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_target ON shares(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_program_type ON podcasts(program_type);

END $$;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(table_name TEXT, row_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF table_name = 'articles' THEN
    UPDATE articles SET view_count = COALESCE(view_count, 0) + 1 WHERE id = row_id;
  ELSIF table_name = 'news' THEN
    UPDATE news SET view_count = COALESCE(view_count, 0) + 1 WHERE id = row_id;
  ELSIF table_name = 'podcasts' THEN
    UPDATE podcasts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = row_id;
  ELSIF table_name = 'programs' THEN
    UPDATE programs SET view_count = COALESCE(view_count, 0) + 1 WHERE id = row_id;
  ELSIF table_name = 'coverage' THEN
    UPDATE coverage SET view_count = COALESCE(view_count, 0) + 1 WHERE id = row_id;
  ELSIF table_name = 'media' THEN
    UPDATE media SET view_count = COALESCE(view_count, 0) + 1 WHERE id = row_id;
  ELSE
    RAISE EXCEPTION 'Invalid table name: %', table_name;
  END IF;
END;
$$;

-- Create or replace podcast programs view
CREATE OR REPLACE VIEW podcast_programs AS
SELECT 
  *,
  CASE 
    WHEN program_type = 'khutwa' THEN 'برنامج خطوة'
    WHEN program_type = 'maqal' THEN 'برنامج المقال'
    WHEN program_type = 'ayan' THEN 'برنامج أعيان'
    WHEN program_type = 'other' THEN COALESCE(custom_program_type, 'برنامج آخر')
    ELSE 'برنامج خطوة'
  END as program_display_name
FROM podcasts;

-- Enable RLS on all tables
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;

DROP POLICY IF EXISTS "Users can view published comments" ON comments;
DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

DROP POLICY IF EXISTS "Users can view their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON bookmarks;

DROP POLICY IF EXISTS "Anyone can insert shares" ON shares;
DROP POLICY IF EXISTS "Anyone can view shares" ON shares;

DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Anyone can view subscription status" ON newsletter_subscriptions;
DROP POLICY IF EXISTS "Users can unsubscribe" ON newsletter_subscriptions;

-- Create RLS policies
-- Likes policies
CREATE POLICY "Users can view all likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Users can view published comments" ON comments FOR SELECT USING (status = 'published');
CREATE POLICY "Users can insert their own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view their own bookmarks" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookmarks" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Shares policies (no restrictions, for analytics)
CREATE POLICY "Anyone can insert shares" ON shares FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view shares" ON shares FOR SELECT USING (true);

-- Newsletter policies
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view subscription status" ON newsletter_subscriptions FOR SELECT USING (true);
CREATE POLICY "Users can unsubscribe" ON newsletter_subscriptions FOR DELETE USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_view_count TO anon, authenticated;
GRANT SELECT ON podcast_programs TO anon, authenticated;

-- Update any existing podcasts to have default program type
UPDATE podcasts 
SET program_type = 'khutwa' 
WHERE program_type IS NULL;

-- Add comments to tables for documentation
COMMENT ON TABLE likes IS 'User likes for content';
COMMENT ON TABLE comments IS 'User comments on content';
COMMENT ON TABLE bookmarks IS 'User bookmarks for content';
COMMENT ON TABLE shares IS 'Social sharing tracking';
COMMENT ON TABLE newsletter_subscriptions IS 'Newsletter email subscriptions';
COMMENT ON FUNCTION increment_view_count IS 'Safely increment view count for any content table';
COMMENT ON VIEW podcast_programs IS 'View with display names for podcast program types';

-- Final message
DO $$ BEGIN
    RAISE NOTICE 'Database schema update completed successfully!';
    RAISE NOTICE 'All missing tables, functions, and policies have been created.';
    RAISE NOTICE 'Run this script in your Supabase SQL Editor to fix all database errors.';
END $$;
