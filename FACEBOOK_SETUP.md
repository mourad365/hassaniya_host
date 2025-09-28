# Facebook API Setup for Production

## 🚨 Current Issue: 400 Bad Request in Production

Your Facebook API is working in localhost but failing in production with a 400 error. This is a common issue with Facebook access tokens.

## 📋 Quick Fix Checklist

### 1. Check Environment Variables in Production (Vercel/Netlify)

Make sure these environment variables are set in your deployment platform:

```bash
VITE_FACEBOOK_PAGE_ID=101470072189930
VITE_FACEBOOK_PAGE_ACCESS_TOKEN=your_actual_long_lived_token_here
```

**🚨 CRITICAL - Bearer Token Format:**
- Use `VITE_FACEBOOK_PAGE_ACCESS_TOKEN` (not `VITE_FACEBOOK_PAGE_TOKEN`)
- Use the **FULL** access token string (e.g., `EAABwzLixnjYBAOFZC...`)
- **DO NOT** include "Bearer " prefix in the environment variable
- **DO NOT** include quotes around the token value in Vercel/Netlify

### 2. Generate a New Long-Lived Access Token

The token you're using may be expired or domain-restricted. Follow these steps:

#### Step 1: Go to Facebook Graph API Explorer
- Visit: https://developers.facebook.com/tools/explorer/
- Login with your Facebook account

#### Step 2: Generate Page Access Token
1. Select your Facebook App from the dropdown
2. Select "Page Access Token" from the token dropdown
3. Choose your page "101470072189930"
4. Add these permissions:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_read_user_content`

#### Step 3: Convert to Long-Lived Token
1. Copy the generated token
2. Go to: https://developers.facebook.com/tools/debug/accesstoken/
3. Paste your token and click "Debug"
4. Click "Extend Access Token" 
5. Copy the new long-lived token (valid for 60 days)

#### Step 4: Update Production Environment
- In Vercel: Go to Project Settings → Environment Variables
- In Netlify: Go to Site Settings → Environment Variables
- Update: `VITE_FACEBOOK_PAGE_ACCESS_TOKEN=your_new_long_lived_token`

### 3. Verify App Settings

#### Domain Verification
1. Go to Facebook App Dashboard: https://developers.facebook.com/apps/
2. Select your app
3. Go to Settings → Basic
4. Add your production domain to "App Domains"
5. Add your production URL to "Website" under "Website URL"

#### Valid OAuth Redirect URIs
1. In App Dashboard → Products → Facebook Login → Settings
2. Add your production domain to "Valid OAuth Redirect URIs"

## 🔧 Testing Tools

### Debug Component
Use the existing `FacebookDebugger` component at `/debug/facebook` to test your configuration:

```jsx
// Add this route temporarily for testing
import FacebookDebugger from '../components/debug/FacebookDebugger';
// Route: /debug/facebook
```

### Manual Testing
You can test your token manually:

```bash
# Test token validity
curl "https://graph.facebook.com/me?access_token=YOUR_TOKEN"

# Test page access  
curl "https://graph.facebook.com/v19.0/101470072189930?access_token=YOUR_TOKEN"

# Test posts fetch
curl "https://graph.facebook.com/v19.0/101470072189930/posts?fields=id,message&access_token=YOUR_TOKEN&limit=1"
```

## 🚨 Common Issues & Solutions

### Issue 1: Bearer Token Format Error (400 Bad Request)
**Symptoms**: Works in localhost but fails in production with 400 error
**Solution**: Check token format in production environment
- In Vercel: Dashboard → Project → Settings → Environment Variables
- Make sure `VITE_FACEBOOK_PAGE_ACCESS_TOKEN` contains only the raw token (e.g., `EAABwzLixnjYBAOFZC...`)
- NO "Bearer " prefix, NO quotes, NO extra spaces
- Redeploy after updating environment variables

### Issue 2: "Invalid OAuth access token"
**Solution**: Token expired or invalid
- Generate a new long-lived token
- Update environment variables in production

### Issue 2: "Insufficient permissions"
**Solution**: Missing permissions
- Add required permissions: `pages_show_list`, `pages_read_engagement`
- Regenerate token with proper permissions

### Issue 3: "Unsupported get request"
**Solution**: Page not accessible or private
- Make sure the Facebook page is public
- Verify the page ID is correct: `101470072189930`

### Issue 4: Works in localhost but not production
**Solution**: Domain restrictions
- Add production domain to Facebook App settings
- Use same token in both environments

## 📝 Environment Variables Template

Update your production environment variables:

```env
# Facebook Integration - REQUIRED for Culture Page
VITE_FACEBOOK_PAGE_ID=101470072189930
VITE_FACEBOOK_PAGE_ACCESS_TOKEN=your_long_lived_access_token_here

# Make sure to use VITE_FACEBOOK_PAGE_ACCESS_TOKEN
# (not VITE_FACEBOOK_PAGE_TOKEN)
```

## 🔄 Token Refresh Schedule

Facebook access tokens expire regularly:

- **Short-lived tokens**: Expire in 1-2 hours
- **Long-lived tokens**: Expire in 60 days
- **Page access tokens**: Can be made permanent (follow Facebook docs)

**Recommendation**: Set up a reminder to refresh tokens every 30 days.

## 🚀 Next Steps

1. **Immediate Fix**: Generate new long-lived token and update production environment
2. **Test**: Use FacebookDebugger component to verify the fix
3. **Monitor**: Check browser console for detailed error messages
4. **Automate**: Consider setting up token refresh automation for production

## 📞 Support

If issues persist after following this guide:

1. Check browser console for detailed error messages
2. Use the FacebookDebugger component
3. Verify all steps above are completed
4. Test with a fresh token from Graph API Explorer

Remember: The same token that works in localhost should work in production if properly configured.
