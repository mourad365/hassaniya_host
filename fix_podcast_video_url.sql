-- Fix podcast video URL for the test episode
-- Replace the video ID and podcast title as needed

-- Update the specific podcast record with the Bunny CDN video ID
UPDATE podcasts 
SET video_url = '4ee213cc-5821-4e03-a6be-d382f49afd50'
WHERE title = 'teszt' OR title ILIKE '%test%';

-- Alternative: If you want to update by ID instead
-- UPDATE podcasts 
-- SET video_url = '4ee213cc-5821-4e03-a6be-d382f49afd50'
-- WHERE id = YOUR_PODCAST_ID;

-- Check the result
SELECT id, title, video_url, audio_url, image_url, created_at 
FROM podcasts 
WHERE title = 'teszt' OR title ILIKE '%test%'
ORDER BY created_at DESC;

-- You can also find all podcasts without media to fix them:
SELECT id, title, video_url, audio_url, image_url, created_at 
FROM podcasts 
WHERE (video_url IS NULL OR video_url = '') 
  AND (audio_url IS NULL OR audio_url = '')
ORDER BY created_at DESC;
