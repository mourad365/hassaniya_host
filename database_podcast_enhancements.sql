-- SQL script to add podcast enhancements to existing database
-- Run this in your Supabase SQL Editor to add support for program types and video URLs

-- Add new columns to podcasts table if they don't exist
ALTER TABLE podcasts 
ADD COLUMN IF NOT EXISTS program_type VARCHAR(20) DEFAULT 'khutwa',
ADD COLUMN IF NOT EXISTS custom_program_type TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add check constraint for program_type values
ALTER TABLE podcasts 
ADD CONSTRAINT IF NOT EXISTS check_program_type 
CHECK (program_type IN ('khutwa', 'maqal', 'ayan', 'other'));

-- Create index for faster program type queries
CREATE INDEX IF NOT EXISTS idx_podcasts_program_type ON podcasts(program_type);

-- Update any existing podcasts to have default program type
UPDATE podcasts 
SET program_type = 'khutwa' 
WHERE program_type IS NULL;

-- Optional: Create a view to get program type display names
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

-- Grant permissions for the view (adjust role as needed)
GRANT SELECT ON podcast_programs TO anon, authenticated;

COMMENT ON COLUMN podcasts.program_type IS 'Type of program: khutwa, maqal, ayan, or other';
COMMENT ON COLUMN podcasts.custom_program_type IS 'Custom program type name when program_type is other';
COMMENT ON COLUMN podcasts.video_url IS 'Optional video URL from Bunny Stream if podcast was also uploaded as video';
