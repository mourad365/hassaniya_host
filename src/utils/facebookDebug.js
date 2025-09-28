// Facebook API Debug Utility
// Use this to test your Facebook API configuration

export async function testFacebookToken() {
  const PAGE_ID = import.meta.env.VITE_FACEBOOK_PAGE_ID;
  const ACCESS_TOKEN = import.meta.env.VITE_FACEBOOK_PAGE_ACCESS_TOKEN;
  
  console.log('🔍 Facebook Debug Test Starting...');
  console.log('📍 PAGE_ID:', PAGE_ID);
  console.log('🔑 ACCESS_TOKEN exists:', !!ACCESS_TOKEN);
  console.log('🔑 ACCESS_TOKEN length:', ACCESS_TOKEN?.length || 0);
  console.log('🏷️ ACCESS_TOKEN prefix:', ACCESS_TOKEN?.substring(0, 20) + '...');
  console.log('🌐 Environment:', import.meta.env.MODE);
  console.log('🔗 Base URL:', window.location.origin);
  
  if (!PAGE_ID || !ACCESS_TOKEN) {
    console.error('❌ Missing required environment variables');
    return {
      success: false,
      error: 'Missing PAGE_ID or ACCESS_TOKEN',
      details: {
        hasPageId: !!PAGE_ID,
        hasAccessToken: !!ACCESS_TOKEN
      }
    };
  }

  // Test 1: Check token validity with multiple methods
  try {
    console.log('🧪 Test 1: Checking access token validity...');
    
    // Method 1: Query parameter
    const tokenUrl = `https://graph.facebook.com/me?access_token=${ACCESS_TOKEN}`;
    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();
    
    console.log('📊 Token validation response:', tokenData);
    
    if (!tokenResponse.ok) {
      console.error('❌ Token validation failed:', tokenData);
      return {
        success: false,
        error: 'Invalid access token',
        details: tokenData
      };
    }
    
    console.log('✅ Token is valid:', tokenData);
  } catch (error) {
    console.error('❌ Token validation error:', error);
    return {
      success: false,
      error: 'Token validation failed',
      details: error.message
    };
  }

  // Test 2: Check page access
  try {
    console.log('🧪 Test 2: Checking page access...');
    const pageUrl = `https://graph.facebook.com/v19.0/${PAGE_ID}?access_token=${ACCESS_TOKEN}`;
    const pageResponse = await fetch(pageUrl);
    const pageData = await pageResponse.json();
    
    if (!pageResponse.ok) {
      console.error('❌ Page access failed:', pageData);
      return {
        success: false,
        error: 'Cannot access page',
        details: pageData
      };
    }
    
    console.log('✅ Page access successful:', pageData);
  } catch (error) {
    console.error('❌ Page access error:', error);
    return {
      success: false,
      error: 'Page access failed',
      details: error.message
    };
  }

  // Test 3: Try fetching posts
  try {
    console.log('🧪 Test 3: Fetching posts...');
    const postsUrl = `https://graph.facebook.com/v19.0/${PAGE_ID}/posts?fields=id,message,created_time&access_token=${ACCESS_TOKEN}&limit=1`;
    const postsResponse = await fetch(postsUrl);
    const postsData = await postsResponse.json();
    
    if (!postsResponse.ok) {
      console.error('❌ Posts fetch failed:', postsData);
      return {
        success: false,
        error: 'Cannot fetch posts',
        details: postsData
      };
    }
    
    console.log('✅ Posts fetch successful:', postsData);
    
    return {
      success: true,
      message: 'All tests passed!',
      postsCount: postsData.data?.length || 0
    };
    
  } catch (error) {
    console.error('❌ Posts fetch error:', error);
    return {
      success: false,
      error: 'Posts fetch failed',
      details: error.message
    };
  }
}

// Test Facebook API with detailed logging
export async function debugFacebookAPI() {
  console.log('🚀 Starting Facebook API Debug...');
  
  const result = await testFacebookToken();
  
  console.log('📊 Final Result:', result);
  
  if (!result.success) {
    console.log(`
    🔧 TROUBLESHOOTING STEPS:
    
    1. Check your Facebook access token:
       - Go to Facebook Graph API Explorer
       - Generate a new Page Access Token
       - Make sure token has 'pages_show_list' and 'pages_read_engagement' permissions
    
    2. Verify environment variables in Vercel:
       - VITE_FACEBOOK_PAGE_ID=${import.meta.env.VITE_FACEBOOK_PAGE_ID}
       - VITE_FACEBOOK_PAGE_ACCESS_TOKEN=*** (${import.meta.env.VITE_FACEBOOK_PAGE_ACCESS_TOKEN?.length || 0} chars)
    
    3. Check token expiry:
       - Facebook access tokens expire regularly
       - Generate a long-lived token if needed
    
    4. Verify page permissions:
       - Make sure the app has permission to read the page
       - Check if the page is public
    `);
  }
  
  return result;
}
