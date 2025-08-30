-- Hassaniya Content Management Database Schema
-- This file contains the SQL schema for all content types

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_fr VARCHAR(100),
    name_en VARCHAR(100),
    slug VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'news', 'article', 'media', 'culture', etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, name_fr, name_en, slug, type) VALUES
('سياسة', 'Politique', 'Politics', 'politics', 'news'),
('ثقافة', 'Culture', 'Culture', 'culture', 'news'),
('رياضة', 'Sport', 'Sports', 'sports', 'news'),
('اقتصاد', 'Économie', 'Economy', 'economy', 'news'),
('عاجل', 'Urgent', 'Breaking', 'breaking', 'news'),
('تقاليد وعادات', 'Traditions et coutumes', 'Traditions and Customs', 'traditions', 'culture'),
('موسيقى تراثية', 'Musique traditionnelle', 'Traditional Music', 'music', 'culture'),
('فنون شعبية', 'Arts populaires', 'Folk Arts', 'arts', 'culture'),
('توثيق بصري', 'Documentation visuelle', 'Visual Documentation', 'documentation', 'culture')
ON CONFLICT (slug) DO NOTHING;

-- Media table
CREATE TABLE IF NOT EXISTS media (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    media_type VARCHAR(50) NOT NULL, -- 'video', 'audio', 'image', 'document'
    category_id INTEGER REFERENCES categories(id),
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration VARCHAR(20),
    file_size BIGINT,
    author_id UUID REFERENCES auth.users(id),
    author_name VARCHAR(200),
    publish_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'published',
    views INTEGER DEFAULT 0,
    trending BOOLEAN DEFAULT false,
    region VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles table (update to use category_id)
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category_id INTEGER REFERENCES categories(id),
    author_id UUID REFERENCES auth.users(id),
    author_name VARCHAR(200),
    image_url TEXT,
    publish_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'published',
    featured BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    trending BOOLEAN DEFAULT false,
    region VARCHAR(100),
    read_time VARCHAR(20),
    page_slug VARCHAR(500) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News table
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    category_id INTEGER REFERENCES categories(id),
    priority VARCHAR(20) DEFAULT 'medium',
    location VARCHAR(200),
    author_id UUID REFERENCES auth.users(id),
    author_name VARCHAR(200),
    image_url TEXT,
    publish_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'published',
    page_slug VARCHAR(500) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coverage table (التغطيات)
CREATE TABLE IF NOT EXISTS coverage (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    coverage_type VARCHAR(100) NOT NULL,
    event_location VARCHAR(300) NOT NULL,
    event_date DATE NOT NULL,
    reporter_name VARCHAR(200) NOT NULL,
    author_id UUID REFERENCES auth.users(id),
    author_name VARCHAR(200),
    image_url TEXT,
    video_url TEXT,
    publish_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'published',
    page_slug VARCHAR(500) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Podcasts table (البودكاست)
CREATE TABLE IF NOT EXISTS podcasts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    episode_number INTEGER,
    season VARCHAR(50) DEFAULT '1',
    duration VARCHAR(20),
    host_name VARCHAR(200) NOT NULL,
    guest_name VARCHAR(200),
    author_id UUID REFERENCES auth.users(id),
    author_name VARCHAR(200),
    audio_url TEXT,
    image_url TEXT,
    publish_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'published',
    page_slug VARCHAR(500) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Programs table (البرامج - خطوة، المقال، أعيان)
CREATE TABLE IF NOT EXISTS programs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    program_type VARCHAR(100) NOT NULL, -- 'khutwa', 'maqal', 'ayan', 'interview', 'documentary', 'cultural'
    episode_number INTEGER,
    season VARCHAR(50) DEFAULT '1',
    duration VARCHAR(20),
    host_name VARCHAR(200) NOT NULL,
    guest_name VARCHAR(200),
    air_date DATE,
    author_id UUID REFERENCES auth.users(id),
    author_name VARCHAR(200),
    video_url TEXT,
    audio_url TEXT, -- Support for audio-only episodes
    image_url TEXT,
    publish_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'published',
    page_slug VARCHAR(500) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Podcasts table (البودكاست) - add video support
ALTER TABLE podcasts ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Update existing tables to use category_id
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS page_slug VARCHAR(500) UNIQUE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE news ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id);

-- Migrate existing category data (update these based on your actual data)
UPDATE articles SET category_id = (SELECT id FROM categories WHERE slug = 'politics') WHERE category = 'politics';
UPDATE articles SET category_id = (SELECT id FROM categories WHERE slug = 'culture') WHERE category = 'culture';
UPDATE articles SET category_id = (SELECT id FROM categories WHERE slug = 'sports') WHERE category = 'sports';
UPDATE articles SET category_id = (SELECT id FROM categories WHERE slug = 'economy') WHERE category = 'economy';

UPDATE news SET category_id = (SELECT id FROM categories WHERE slug = 'politics') WHERE category = 'politics';
UPDATE news SET category_id = (SELECT id FROM categories WHERE slug = 'culture') WHERE category = 'culture';
UPDATE news SET category_id = (SELECT id FROM categories WHERE slug = 'sports') WHERE category = 'sports';
UPDATE news SET category_id = (SELECT id FROM categories WHERE slug = 'economy') WHERE category = 'economy';
UPDATE news SET category_id = (SELECT id FROM categories WHERE slug = 'breaking') WHERE category = 'breaking';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_category_id ON news(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_category_id ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_media_category_id ON media(category_id);
CREATE INDEX IF NOT EXISTS idx_news_publish_date ON news(publish_date);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at);

CREATE INDEX IF NOT EXISTS idx_coverage_status ON coverage(status);
CREATE INDEX IF NOT EXISTS idx_coverage_type ON coverage(coverage_type);
CREATE INDEX IF NOT EXISTS idx_coverage_event_date ON coverage(event_date);
CREATE INDEX IF NOT EXISTS idx_coverage_created_at ON coverage(created_at);

CREATE INDEX IF NOT EXISTS idx_podcasts_status ON podcasts(status);
CREATE INDEX IF NOT EXISTS idx_podcasts_episode ON podcasts(episode_number);
CREATE INDEX IF NOT EXISTS idx_podcasts_season ON podcasts(season);
CREATE INDEX IF NOT EXISTS idx_podcasts_created_at ON podcasts(created_at);

CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_type ON programs(program_type);
CREATE INDEX IF NOT EXISTS idx_programs_episode ON programs(episode_number);
CREATE INDEX IF NOT EXISTS idx_programs_air_date ON programs(air_date);
CREATE INDEX IF NOT EXISTS idx_programs_created_at ON programs(created_at);

CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);

-- Row Level Security (RLS) policies for Supabase
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE coverage ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all content
DROP POLICY IF EXISTS "Allow authenticated users to read news" ON news;
CREATE POLICY "Allow authenticated users to read news" ON news FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to read coverage" ON coverage;
CREATE POLICY "Allow authenticated users to read coverage" ON coverage FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to read podcasts" ON podcasts;
CREATE POLICY "Allow authenticated users to read podcasts" ON podcasts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to read programs" ON programs;
CREATE POLICY "Allow authenticated users to read programs" ON programs FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert their own content
DROP POLICY IF EXISTS "Allow authenticated users to insert news" ON news;
CREATE POLICY "Allow authenticated users to insert news" ON news FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Allow authenticated users to insert coverage" ON coverage;
CREATE POLICY "Allow authenticated users to insert coverage" ON coverage FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Allow authenticated users to insert podcasts" ON podcasts;
CREATE POLICY "Allow authenticated users to insert podcasts" ON podcasts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS "Allow authenticated users to insert programs" ON programs;
CREATE POLICY "Allow authenticated users to insert programs" ON programs FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- Allow users to update their own content
DROP POLICY IF EXISTS "Allow users to update own news" ON news;
CREATE POLICY "Allow users to update own news" ON news FOR UPDATE TO authenticated USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Allow users to update own coverage" ON coverage;
CREATE POLICY "Allow users to update own coverage" ON coverage FOR UPDATE TO authenticated USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Allow users to update own podcasts" ON podcasts;
CREATE POLICY "Allow users to update own podcasts" ON podcasts FOR UPDATE TO authenticated USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Allow users to update own programs" ON programs;
CREATE POLICY "Allow users to update own programs" ON programs FOR UPDATE TO authenticated USING (auth.uid() = author_id);

-- Allow users to delete their own content
DROP POLICY IF EXISTS "Allow users to delete own news" ON news;
CREATE POLICY "Allow users to delete own news" ON news FOR DELETE TO authenticated USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Allow users to delete own coverage" ON coverage;
CREATE POLICY "Allow users to delete own coverage" ON coverage FOR DELETE TO authenticated USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Allow users to delete own podcasts" ON podcasts;
CREATE POLICY "Allow users to delete own podcasts" ON podcasts FOR DELETE TO authenticated USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "Allow users to delete own programs" ON programs;
CREATE POLICY "Allow users to delete own programs" ON programs FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Allow public read access for published content
DROP POLICY IF EXISTS "Allow public to read published news" ON news;
CREATE POLICY "Allow public to read published news" ON news FOR SELECT TO anon USING (status = 'published');
DROP POLICY IF EXISTS "Allow public to read published coverage" ON coverage;
CREATE POLICY "Allow public to read published coverage" ON coverage FOR SELECT TO anon USING (status = 'published');
DROP POLICY IF EXISTS "Allow public to read published podcasts" ON podcasts;
CREATE POLICY "Allow public to read published podcasts" ON podcasts FOR SELECT TO anon USING (status = 'published');
DROP POLICY IF EXISTS "Allow public to read published programs" ON programs;
CREATE POLICY "Allow public to read published programs" ON programs FOR SELECT TO anon USING (status = 'published');

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coverage_updated_at BEFORE UPDATE ON coverage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_podcasts_updated_at BEFORE UPDATE ON podcasts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
