-- Database Extensions for Production Features
-- Add tables for likes, comments, newsletter subscriptions, and social interactions

-- Likes table for articles, news, programs, podcasts, coverage
CREATE TABLE IF NOT EXISTS likes (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL, -- 'article', 'news', 'program', 'podcast', 'coverage'
    target_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

-- Comments table for all content types
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL, -- 'article', 'news', 'program', 'podcast', 'coverage'
    target_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'published', -- 'published', 'pending', 'hidden'
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE, -- for replies
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter subscriptions
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    locale VARCHAR(10) DEFAULT 'ar',
    verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookmarks/saved items for users
CREATE TABLE IF NOT EXISTS bookmarks (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL,
    target_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, target_type, target_id)
);

-- Social shares tracking (optional analytics)
CREATE TABLE IF NOT EXISTS shares (
    id SERIAL PRIMARY KEY,
    target_type VARCHAR(50) NOT NULL,
    target_id INTEGER NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'facebook', 'twitter', 'whatsapp', 'email'
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_likes_target ON likes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_target ON comments(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_target ON bookmarks(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_shares_target ON shares(target_type, target_id);

-- Enable RLS
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for likes
DROP POLICY IF EXISTS "Users can view all likes" ON likes;
CREATE POLICY "Users can view all likes" ON likes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Users can manage their own likes" ON likes;
CREATE POLICY "Users can manage their own likes" ON likes FOR ALL TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Anonymous can view like counts" ON likes;
CREATE POLICY "Anonymous can view like counts" ON likes FOR SELECT TO anon USING (true);

-- RLS Policies for comments
DROP POLICY IF EXISTS "Users can view published comments" ON comments;
CREATE POLICY "Users can view published comments" ON comments FOR SELECT TO authenticated USING (status = 'published');
DROP POLICY IF EXISTS "Anonymous can view published comments" ON comments;
CREATE POLICY "Anonymous can view published comments" ON comments FOR SELECT TO anon USING (status = 'published');
DROP POLICY IF EXISTS "Users can insert their own comments" ON comments;
CREATE POLICY "Users can insert their own comments" ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for newsletter
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscriptions;
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscriptions FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Users can manage their newsletter subscription" ON newsletter_subscriptions;
CREATE POLICY "Users can manage their newsletter subscription" ON newsletter_subscriptions FOR ALL TO authenticated USING (true);

-- RLS Policies for bookmarks
DROP POLICY IF EXISTS "Users can manage their own bookmarks" ON bookmarks;
CREATE POLICY "Users can manage their own bookmarks" ON bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for shares
DROP POLICY IF EXISTS "Anyone can create shares" ON shares;
CREATE POLICY "Anyone can create shares" ON shares FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "Users can view share counts" ON shares;
CREATE POLICY "Users can view share counts" ON shares FOR SELECT TO authenticated USING (true);

-- Add updated_at trigger for comments
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_newsletter_updated_at BEFORE UPDATE ON newsletter_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add view counts to existing tables if not present
ALTER TABLE articles ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE news ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE programs ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE coverage ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_like_count(content_type TEXT, content_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM likes WHERE target_type = content_type AND target_id = content_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_comment_count(content_type TEXT, content_id INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM comments WHERE target_type = content_type AND target_id = content_id AND status = 'published');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_liked_by_user(content_type TEXT, content_id INTEGER, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(SELECT 1 FROM likes WHERE target_type = content_type AND target_id = content_id AND user_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
