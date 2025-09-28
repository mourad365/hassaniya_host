// src/services/facebookService.js
// Fetch Facebook Page posts using Graph API with support for pagination (paging.next)

const PAGE_ID = import.meta.env.VITE_FACEBOOK_PAGE_ID;
const PAGE_TOKEN = import.meta.env.VITE_FACEBOOK_PAGE_ACCESS_TOKEN || import.meta.env.VITE_FACEBOOK_PAGE_TOKEN;

const BASE_FIELDS = [
  'id',
  'message',
  'full_picture',
  'created_time',
  'permalink_url',
  'attachments{media_type,media_url,unshimmed_url,subattachments}',
  'from'
].join(',');

function buildInitialUrl(limit = 6) {
  const base = `https://graph.facebook.com/v19.0/${PAGE_ID}/posts`;
  const params = new URLSearchParams({
    fields: BASE_FIELDS,
    access_token: PAGE_TOKEN,
    limit: String(limit)
  });
  return `${base}?${params.toString()}`;
}

export async function getPagePosts({ nextUrl, limit = 6 } = {}) {
  try {
    // Enhanced validation with detailed debugging
    if (!PAGE_ID || !PAGE_TOKEN) {
      console.error('❌ Facebook API Configuration Error:', {
        hasPageId: !!PAGE_ID,
        hasPageToken: !!PAGE_TOKEN,
        pageId: PAGE_ID,
        tokenLength: PAGE_TOKEN?.length || 0,
        environment: import.meta.env.MODE
      });
      throw new Error('Missing VITE_FACEBOOK_PAGE_ID or VITE_FACEBOOK_PAGE_ACCESS_TOKEN in environment variables.');
    }

    let url = nextUrl || buildInitialUrl(limit);

    // Ensure access_token exists in the URL (some next URLs may omit it depending on how it's generated)
    try {
      const u = new URL(url);
      if (!u.searchParams.get('access_token')) {
        u.searchParams.set('access_token', PAGE_TOKEN);
        url = u.toString();
      }
    } catch (_) {
      // If URL constructor fails for any reason, fallback to appending token safely
      url += (url.includes('?') ? '&' : '?') + `access_token=${encodeURIComponent(PAGE_TOKEN)}`;
    }

    // Facebook Graph API only supports access_token as query parameter for CORS requests
    // DO NOT use Authorization header - Facebook CORS policy blocks it
    console.log('🌐 Making Facebook API request:', {
      url: url.replace(PAGE_TOKEN, 'TOKEN_HIDDEN'),
      method: 'GET',
      authMethod: 'query_parameter',
      environment: import.meta.env.MODE
    });

    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      let errorDetails;
      try {
        errorDetails = JSON.parse(text);
      } catch {
        errorDetails = { message: text };
      }
      
      console.error('Facebook API error:', {
        status: res.status,
        statusText: res.statusText,
        url: url.replace(PAGE_TOKEN, 'TOKEN_HIDDEN'),
        error: errorDetails
      });
      
      // Provide specific error messages for common issues
      let userMessage = `Facebook API error (${res.status})`;
      if (res.status === 400) {
        userMessage = 'Invalid Facebook API request. The access token may be expired, invalid, or lacks proper permissions. Please generate a new token.';
      } else if (res.status === 403) {
        userMessage = 'Access denied. Your Facebook token may have expired or lacks permissions.';
      } else if (res.status === 404) {
        userMessage = 'Facebook page not found. Check your page ID.';
      } else if (res.status === 401) {
        userMessage = 'Unauthorized. Your Facebook access token is invalid or expired.';
      }
      
      // Add detailed debugging for production issues
      console.error('🔍 Debug Info:', {
        originalUrl: url.replace(PAGE_TOKEN, 'TOKEN_HIDDEN'),
        pageId: PAGE_ID,
        tokenExists: !!PAGE_TOKEN,
        tokenLength: PAGE_TOKEN?.length || 0,
        environment: import.meta.env.MODE,
        baseUrl: window.location.origin
      });
      
      throw new Error(userMessage);
    }

    const json = await res.json();
    return json; // { data: Post[], paging?: { next, previous } }
  } catch (error) {
    console.error('getPagePosts() failed:', error);
    throw error;
  }
}

// Optional helpers to extract media
export function extractMediaFromPost(post) {
  // Returns { imageUrl?: string, videoUrl?: string }
  let imageUrl = post.full_picture || undefined;
  let videoUrl;

  const attachments = post.attachments?.data || [];
  for (const att of attachments) {
    if (!imageUrl && att.media_url) imageUrl = att.media_url;
    if (!videoUrl && (att.media_type === 'video' || att.media_type === 'native_video')) {
      videoUrl = att.media_url || att.unshimmed_url;
    }

    // Check subattachments (albums/carousels)
    const subs = att.subattachments?.data || [];
    for (const sub of subs) {
      if (!imageUrl && sub.media_url) imageUrl = sub.media_url;
      if (!videoUrl && (sub.media_type === 'video' || sub.media_type === 'native_video')) {
        videoUrl = sub.media_url || sub.unshimmed_url;
      }
    }
  }

  return { imageUrl, videoUrl };
}
