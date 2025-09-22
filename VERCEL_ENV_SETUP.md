# Vercel Environment Setup for hassaniya.info

## 🚀 Quick Setup Commands

### 1. Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

### 2. Set All Required Environment Variables
Copy and paste these commands one by one:

```bash
# Essential Supabase Configuration
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Essential Bunny CDN Configuration  
vercel env add VITE_BUNNY_STORAGE_API_KEY production
vercel env add VITE_BUNNY_STORAGE_ZONE production
vercel env add VITE_BUNNY_CDN_URL production

# Pre-configured Bunny Video (use these exact values)
vercel env add VITE_BUNNY_VIDEO_LIBRARY_ID production
# Enter: 493708

vercel env add VITE_BUNNY_VIDEO_CDN_HOSTNAME production  
# Enter: vz-a9578edc-805.b-cdn.net

vercel env add VITE_BUNNY_VIDEO_API_KEY production
# Enter: 4e19874d-4ee6-4f16-a29864485e6d-7a39-481e

# Optional: Facebook Integration
vercel env add VITE_FACEBOOK_PAGE_ID production
# Enter: 101470072189930

vercel env add VITE_FACEBOOK_PAGE_TOKEN production
# Enter: your-facebook-page-token

# Production Settings
vercel env add NODE_ENV production
# Enter: production

vercel env add VITE_APP_ENV production  
# Enter: production
```

### 3. Deploy to hassaniya.info
```bash
# Deploy to production
npm run deploy:hassaniya

# Or use the deployment script
node deploy.js
```

## 📋 Environment Variables Checklist

### ✅ Required Variables
- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- [ ] `VITE_BUNNY_STORAGE_API_KEY` - Your Bunny storage API key
- [ ] `VITE_BUNNY_STORAGE_ZONE` - Your Bunny storage zone name
- [ ] `VITE_BUNNY_CDN_URL` - Your Bunny CDN URL (https://your-zone.b-cdn.net)

### ✅ Pre-configured Variables (use exact values)
- [ ] `VITE_BUNNY_VIDEO_LIBRARY_ID` = `493708`
- [ ] `VITE_BUNNY_VIDEO_CDN_HOSTNAME` = `vz-a9578edc-805.b-cdn.net`
- [ ] `VITE_BUNNY_VIDEO_API_KEY` = `4e19874d-4ee6-4f16-a29864485e6d-7a39-481e`

### 🔧 Optional Variables
- [ ] `VITE_FACEBOOK_PAGE_ID` = `101470072189930`
- [ ] `VITE_FACEBOOK_PAGE_TOKEN` - Your Facebook page access token
- [ ] `VITE_SOCIAL_FACEBOOK_URL` - Your Facebook page URL
- [ ] `VITE_SOCIAL_TWITTER_URL` - Your Twitter URL
- [ ] `VITE_SOCIAL_INSTAGRAM_URL` - Your Instagram URL
- [ ] `VITE_SOCIAL_YOUTUBE_URL` - Your YouTube URL

## 🌐 Domain Configuration

### Custom Domain Setup
```bash
# Add custom domain
vercel domains add hassaniya.info

# Link to your project
vercel domains link hassaniya.info [your-project-name]
```

### DNS Configuration
Set these DNS records at your domain registrar:

```
Type: A
Name: @
Value: 76.76.19.19

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

## 🔍 Verification Commands

### Check Environment Variables
```bash
# List all environment variables
vercel env ls

# Pull environment variables to local .env.local
vercel env pull .env.local
```

### Test Deployment
```bash
# Test build locally
npm run build:prod
npm run preview:prod

# Deploy preview (for testing)
vercel

# Deploy to production
vercel --prod
```

## 🛡️ Security Notes

1. **Never commit actual values** - Use Vercel CLI or dashboard to set variables
2. **VITE_ prefix exposure** - All VITE_ variables are exposed to client-side
3. **Rotate keys regularly** - Update API keys periodically for security
4. **Monitor usage** - Keep track of CDN and API usage

## 🎯 hassaniya.info Specific Settings

### Optimized for Cultural Content
- Arabic RTL text rendering
- MENA region CDN optimization  
- Cultural date/time formatting
- Arabic error messages

### Bunny CDN Configuration
- **Images**: Served from `hassaniya.b-cdn.net`
- **Videos**: Streamed from `vz-a9578edc-805.b-cdn.net`
- **Library ID**: 493708 (pre-configured for Hassaniya content)

## 🚀 Quick Deployment

After setting up environment variables:

```bash
# One-command deployment
npm run deploy:hassaniya
```

This will:
1. Run security audit
2. Build production bundle
3. Deploy to Vercel production
4. Make your site live at https://hassaniya.info

## 🎉 Success!

Your Hassaniya cultural heritage platform will be live at:
- **https://hassaniya.info** (primary domain)
- **https://www.hassaniya.info** (www subdomain)

Ready to share Hassaniya culture with the world! 🌍
