# 🚨 URGENT: Facebook API CSP Fix

## Problem Identified
Your Content Security Policy (CSP) was blocking Facebook Graph API requests. The error showed:
- CSP denied connection to `https://graph.facebook.com`
- Facebook access token showing as placeholder `your_production_facebook_page_access_token`

## ✅ Fixes Applied

### 1. Updated CSP Configuration
**Files Updated:**
- `public/_headers` (for Netlify)
- `vercel.json` (for Vercel)

**Change Made:**
Added `https://graph.facebook.com https://*.facebook.com` to the `connect-src` directive.

**Before:**
```
connect-src 'self' https://api.supabase.co https://*.supabase.co https://*.b-cdn.net https://vercel.live
```

**After:**
```
connect-src 'self' https://api.supabase.co https://*.supabase.co https://*.b-cdn.net https://vercel.live https://graph.facebook.com https://*.facebook.com
```

## 🚀 Immediate Action Required

### Step 1: Update Vercel Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `VITE_FACEBOOK_PAGE_ACCESS_TOKEN`
3. Replace `your_production_facebook_page_access_token` with your **actual** long-lived Facebook token
4. Format should be: `EAABwzLixnjYBAOzAc7N2AwQzSEKhZBrGLZA8o7eSZCqr...` (example)
5. **No quotes, no "Bearer " prefix, just the raw token**

### Step 2: Generate New Facebook Token (if needed)
1. Visit: https://developers.facebook.com/tools/explorer/
2. Select your app
3. Generate Page Access Token for page `101470072189930`
4. Add permissions: `pages_show_list`, `pages_read_engagement`
5. Convert to long-lived token: https://developers.facebook.com/tools/debug/accesstoken/

### Step 3: Deploy Changes
After updating the environment variable:
1. Commit and push the CSP changes (`_headers` and `vercel.json`)
2. Deploy to production
3. Test at your production URL + `/culture` page

## 🧪 Testing
1. Visit your production URL + `/culture`
2. Check browser console - CSP errors should be gone
3. Facebook posts should load properly
4. Use `/debug/facebook` route to verify API connection

## 📋 Environment Variable Checklist
In Vercel, you should have:
```
VITE_FACEBOOK_PAGE_ID=101470072189930
VITE_FACEBOOK_PAGE_ACCESS_TOKEN=[your-actual-long-lived-token]
```

**Not:**
```
❌ VITE_FACEBOOK_PAGE_ACCESS_TOKEN=your_production_facebook_page_access_token
❌ VITE_FACEBOOK_PAGE_ACCESS_TOKEN="EAABwzLixnjYBAO..."
❌ VITE_FACEBOOK_PAGE_ACCESS_TOKEN=Bearer EAABwzLixnjYBAO...
```

## 🎯 Expected Result
After these fixes:
- ✅ No more CSP blocking errors
- ✅ Facebook Graph API requests allowed
- ✅ Culture page loads Facebook posts
- ✅ Production matches localhost behavior

The CSP was the main blocker - once Facebook Graph API is allowed and the token is properly set, everything should work!
