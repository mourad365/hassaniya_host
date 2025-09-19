# Database and Video Player Fix Instructions

## Current Issues
1. **Missing Database Tables**: `likes`, `comments`, `bookmarks`, `shares`, `newsletter_subscriptions`
2. **Missing Database Function**: `increment_view_count`
3. **Invalid PostgREST Syntax**: Trying to join with `auth.users` table
4. **Video Player**: Need to use HTML5 video tags instead of HLS streams

## Quick Fix Steps

### 1. Database Setup (REQUIRED)
```sql
-- Run this in your Supabase SQL Editor:
-- Copy and paste the entire content of: database_complete_fix.sql
```

This will:
- ✅ Create all missing tables (`likes`, `comments`, `bookmarks`, etc.)
- ✅ Add missing columns (`view_count`, podcast enhancements)
- ✅ Create the `increment_view_count` function
- ✅ Set up proper Row Level Security policies
- ✅ Grant necessary permissions

### 2. Environment Variables
Make sure your `.env` file contains:
```env
VITE_SUPABASE_URL=https://guehvgnuwgzusxssmdsc.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

VITE_BUNNY_VIDEO_LIBRARY_ID=493708
VITE_BUNNY_VIDEO_CDN_HOSTNAME=vz-a9578edc-805.b-cdn.net
VITE_BUNNY_VIDEO_API_KEY=4e19874d-4ee6-4f16-a29864485e6d-7a39-481e

VITE_BUNNY_STORAGE_API_KEY=your-storage-key
VITE_BUNNY_STORAGE_ZONE=your-zone-name
VITE_BUNNY_CDN_URL=https://your-zone.b-cdn.net
```

### 3. Video Player Updates
- ✅ Updated `BunnyVideoPlayer.jsx` to use HTML5 video with MP4 sources
- ✅ Fixed video URLs to use direct MP4 format instead of HLS
- ✅ Added multiple quality fallbacks (1080p, 720p, 480p)

### 4. Fixed Issues
- ✅ Removed invalid `auth.users` joins from PostgREST queries
- ✅ Fixed `supabase.raw()` usage (not available in browser)
- ✅ Updated view count increment to use proper fallback method
- ✅ Created comprehensive database schema

## Expected Results After Fix
1. ❌ No more "table not found" errors
2. ❌ No more "function not found" errors  
3. ❌ No more PostgREST syntax errors
4. ✅ Video player works with HTML5 video tags
5. ✅ Like/comment/bookmark functionality works
6. ✅ View counting works properly
7. ✅ Podcast uploads work with program types

## Test These Features
1. Visit `/opinion` page - should load without errors
2. Play videos using HTML5 player
3. Try liking/commenting (after user auth)
4. Upload podcasts with program types
5. View count should increment properly

## Files Modified
- `src/services/interactionService.js` - Fixed PostgREST syntax
- `src/components/BunnyVideoPlayer.jsx` - Updated to use HTML5 video
- `database_complete_fix.sql` - Complete database schema
- `database_interactions_schema.sql` - Interaction tables only
- `database_podcast_enhancements.sql` - Podcast enhancements

## Next Steps
1. **Run the SQL script first** - This is the most important step
2. **Fill in your environment variables**
3. **Test the application**
4. **Let me know if any errors persist**

The main issue was missing database tables and functions. Once you run the SQL script, all the 404 and 400 errors should disappear.
