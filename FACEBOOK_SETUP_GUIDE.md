# Facebook API Setup Guide

To display live Facebook posts in your app, you need to configure Facebook API credentials. Follow these steps:

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click "Create App"
3. Choose "Business" as the app type
4. Fill in your app details:
   - App Name: "Hassaniya Platform"
   - Contact Email: Your email
   - Business Account: Select or create one

## Step 2: Configure Your App

1. In your Facebook App dashboard, go to "App Settings" > "Basic"
2. Add your domain to "App Domains": `localhost` (for development)
3. Add your website URL in "Website" section
4. Save changes

## Step 3: Get Page Access Token

1. Go to "Tools" > "Graph API Explorer"
2. Select your app from the dropdown
3. Click "Generate Access Token"
4. Select your Facebook page
5. Add these permissions:
   - `pages_read_engagement`
   - `pages_show_list`
6. Generate the token and copy it

## Step 4: Get Long-Lived Token (Optional but Recommended)

1. Use the Access Token Debugger to extend your token
2. Or use this API call:
```
https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}
```

## Step 5: Update Your Code

In `src/components/FacebookFeed.jsx`, replace these values:

```javascript
const FACEBOOK_APP_ID = 'your-actual-app-id';
const FACEBOOK_ACCESS_TOKEN = 'your-actual-page-access-token';
```

## Step 6: Test Your Integration

1. Save the file
2. Refresh your app
3. Navigate to the Facebook page
4. You should see your live Facebook posts!

## Important Notes

- **Page Access Token**: Use a Page Access Token, not a User Access Token
- **Permissions**: Make sure your token has `pages_read_engagement` permission
- **Public Posts**: Only public posts will be visible
- **Rate Limits**: Facebook has API rate limits, so don't make too many requests
- **Security**: Never commit your access token to version control

## Troubleshooting

### Common Issues:

1. **"Invalid Access Token"**: Check if your token is valid and has correct permissions
2. **"Unsupported get request"**: Make sure you're using a Page Access Token
3. **CORS Error**: This shouldn't happen with server-side requests, but if it does, you may need a backend proxy
4. **No posts returned**: Check if your page has public posts and the token has correct permissions

### Testing Your Token:

Test your access token with this URL:
```
https://graph.facebook.com/v19.0/me?access_token=YOUR_ACCESS_TOKEN
```

This should return information about your page if the token is valid.

## Security Best Practices

1. **Environment Variables**: Store your tokens in environment variables
2. **Token Rotation**: Regularly rotate your access tokens
3. **Minimal Permissions**: Only request the permissions you need
4. **Server-Side**: Consider moving API calls to your backend for better security

## Need Help?

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api/)
- [Page Access Tokens Guide](https://developers.facebook.com/docs/pages/access-tokens/)
- [Facebook API Explorer](https://developers.facebook.com/tools/explorer/)
