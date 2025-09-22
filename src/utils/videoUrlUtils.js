/**
 * Utility functions for constructing correct video URLs from Bunny Video Library
 * 
 * IMPORTANT: Storage (hassaniya.b-cdn.net) = Images ONLY
 *           Video Library (vz-xxx.b-cdn.net) = Videos ONLY
 */
import { getDefaultAccessMode, getVideoToken, shouldUseAuthentication } from '@/utils/bunnyVideoCollections';

/**
 * Check if a video path/ID is a Bunny Stream video GUID
 * @param {string} videoPath 
 * @returns {boolean}
 */
const isBunnyStreamGuid = (videoPath) => {
  // Bunny Stream GUIDs are 36 characters with hyphens in specific positions
  const guidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return guidPattern.test(videoPath);
};

/**
 * Check if a URL is from Bunny Storage (should NOT be used for videos)
 * @param {string} url 
 * @returns {boolean}
 */
const isBunnyStorageUrl = (url) => {
  return url && url.includes('hassaniya.b-cdn.net');
};

/**
 * Check if a URL is from Bunny Video CDN (correct for videos)
 * @param {string} url 
 * @returns {boolean}
 */
const isBunnyVideoUrl = (url) => {
  return url && url.includes('vz-a9578edc-805.b-cdn.net');
};

/**
 * Get streaming strategy URLs for a video (HLS first, then direct play)
 * @param {string} videoPath - Should be Bunny Stream GUID or valid Video Library URL
 * @returns {object} - Object with HLS and play URLs, or null if invalid
 */
export const getBunnyVideoUrls = (videoPath) => {
  if (!videoPath) {
    console.log('getBunnyVideoUrls: No video path provided');
    return null;
  }
  
  console.log('getBunnyVideoUrls: Processing input:', videoPath);
  
  // REJECT storage URLs - they cause CORS errors for video playback
  if (isBunnyStorageUrl(videoPath)) {
    console.error('🚫 getBunnyVideoUrls: REJECTED - Storage URLs cannot be used for video playback!', {
      url: videoPath,
      reason: 'Storage CDN (hassaniya.b-cdn.net) does not support cross-origin video streaming'
    });
    return null;
  }
  
  // If it's already a video library URL, return as is
  if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) {
    if (isBunnyVideoUrl(videoPath)) {
      console.log('✅ getBunnyVideoUrls: Valid Video Library URL:', videoPath);
      return {
        hls: videoPath.includes('.m3u8') ? videoPath : null,
        play: videoPath.includes('/play') ? videoPath : null,
        primary: videoPath
      };
    } else {
      console.warn('⚠️ getBunnyVideoUrls: URL is not from Video Library CDN:', videoPath);
      return { primary: videoPath };
    }
  }
  
  // Check if it's a Bunny Stream GUID
  if (isBunnyStreamGuid(videoPath)) {
    const videoCdnHostname = import.meta.env.VITE_BUNNY_VIDEO_CDN_HOSTNAME;
    if (!videoCdnHostname) {
      console.error('getBunnyVideoUrls: VITE_BUNNY_VIDEO_CDN_HOSTNAME not configured for Bunny Stream');
      return null;
    }
    
    // Construct both HLS and Play URLs
    const hlsUrlBase = `https://${videoCdnHostname}/${videoPath}/playlist.m3u8`;
    const playUrlBase = `https://${videoCdnHostname}/${videoPath}/play`;
    const hlsUrl = appendTokenIfNeeded(hlsUrlBase);
    const playUrl = appendTokenIfNeeded(playUrlBase);
    
    console.log('✅ getBunnyVideoUrls: Constructed Video Library URLs:', {
      original: videoPath,
      hls: hlsUrl,
      play: playUrl,
      videoCdnHostname,
      strategy: 'HLS first, then direct play'
    });
    
    return {
      hls: hlsUrl,
      play: playUrl,
      primary: hlsUrl // Try HLS first
    };
  }
  
  // If it's not a GUID and not a valid URL, reject it
  console.error('🚫 getBunnyVideoUrls: Invalid input - not a GUID or valid Video Library URL:', videoPath);
  return null;
};

/**
 * Convert a video identifier to the appropriate Bunny Video Library URL (Legacy - prefer getBunnyVideoUrls)
 * @param {string} videoPath - Should be Bunny Stream GUID or valid Video Library URL
 * @returns {string|null} - Appropriate video URL for Bunny Video Library or null if invalid
 */
export const getBunnyVideoUrl = (videoPath) => {
  const urls = getBunnyVideoUrls(videoPath);
  return urls ? urls.primary : null;
};

/**
 * Extract video ID from various video inputs (for iframe fallback)
 * @param {string} videoInput - Video URL or GUID
 * @returns {string|null} - Clean video ID for iframe usage
 */
export const extractVideoId = (videoInput) => {
  if (!videoInput) return null;
  
  // If it's a GUID, return as-is
  if (isBunnyStreamGuid(videoInput)) {
    return videoInput;
  }
  
  // If it's a full Video Library URL, extract the GUID
  if (videoInput.includes('/play') || videoInput.includes('/playlist.m3u8')) {
    const matches = videoInput.match(/\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\//i);
    if (matches && matches[1]) {
      return matches[1];
    }
  }
  
  console.warn('extractVideoId: Could not extract video ID from:', videoInput);
  return null;
};

/**
 * Create iframe URL for video fallback
 * @param {string} videoInput - Video URL or GUID
 * @returns {string|null} - Iframe URL or null if invalid
 */
export const getIframeUrl = (videoInput) => {
  const videoId = extractVideoId(videoInput);
  const libraryId = import.meta.env.VITE_BUNNY_VIDEO_LIBRARY_ID;
  const cdnHostname = import.meta.env.VITE_BUNNY_VIDEO_CDN_HOSTNAME;
  
  if (!videoId) {
    console.error('getIframeUrl: Missing video ID:', { videoId });
    return null;
  }
  
  // Try multiple iframe URL patterns to find one that works
  const urlsToTry = [];
  
  // Pattern 1: Standard Bunny Stream iframe (most common)
  if (libraryId) {
    urlsToTry.push(`https://iframe.mediadelivery.net/play/${libraryId}/${videoId}`);
  }
  
  // Pattern 2: Direct CDN iframe
  if (cdnHostname) {
    urlsToTry.push(`https://${cdnHostname}/${videoId}/iframe`);
  }
  
  // Pattern 3: Alternative iframe format
  if (cdnHostname) {
    urlsToTry.push(`https://iframe.${cdnHostname.replace('vz-', '')}/${videoId}`);
  }
  
  // For now, return the first URL (standard format)
  const iframeUrl = urlsToTry[0];
  
  console.log('✅ getIframeUrl: Generated iframe URLs to try:', {
    input: videoInput,
    videoId,
    libraryId,
    cdnHostname,
    urlsToTry,
    selectedUrl: iframeUrl
  });
  
  return iframeUrl;
};

/**
 * Get HLS manifest URL for Bunny Stream video
 * @param {string} videoInput - Video URL or GUID
 * @returns {string|null} - HLS manifest URL or null if invalid
 */
export const getHLSUrl = (videoInput) => {
  const videoId = extractVideoId(videoInput);
  const videoCdnHostname = import.meta.env.VITE_BUNNY_VIDEO_CDN_HOSTNAME;
  
  if (!videoId || !videoCdnHostname) {
    console.error('getHLSUrl: Missing video ID or CDN hostname:', { videoId, videoCdnHostname });
    return null;
  }
  
  const hlsUrl = `https://${videoCdnHostname}/${videoId}/playlist.m3u8`;
  const final = appendTokenIfNeeded(hlsUrl);
  console.log('✅ getHLSUrl: Generated HLS URL:', {
    input: videoInput,
    videoId,
    videoCdnHostname,
    hlsUrl: final
  });
  
  return final;
};

/**
 * Test video URL construction and provide recommendations
 * @param {string} input - Video input to test
 * @returns {object} - Test results and recommendations
 */
export const testVideoUrl = (input) => {
  const results = {
    input,
    isGuid: isBunnyStreamGuid(input),
    isStorageUrl: isBunnyStorageUrl(input),
    isVideoUrl: isBunnyVideoUrl(input),
    recommendations: []
  };
  
  // Test URL construction
  try {
    const urls = getBunnyVideoUrls(input);
    results.urls = urls;
    results.playUrl = urls?.play;
    results.hlsUrl = urls?.hls;
    results.primaryUrl = urls?.primary;
    results.iframeUrl = getIframeUrl(input);
    results.extractedId = extractVideoId(input);
  } catch (error) {
    results.error = error.message;
  }
  
  // Generate recommendations
  if (results.isStorageUrl) {
    results.recommendations.push('🚫 CRITICAL: This is a Storage URL - videos CANNOT be served from Storage CDN due to CORS');
    results.recommendations.push('✅ SOLUTION: Upload video to Bunny Video Library and use the GUID instead');
  }
  
  if (!results.isGuid && !results.isVideoUrl) {
    results.recommendations.push('⚠️ WARNING: Input is neither a GUID nor a valid Video Library URL');
  }
  
  if (results.isGuid && results.urls) {
    results.recommendations.push('✅ GOOD: Valid GUID detected, URLs constructed successfully');
    if (results.hlsUrl) {
      results.recommendations.push('🎬 STRATEGY: Will try HLS streaming first (usually works better)');
    }
    if (results.playUrl) {
      results.recommendations.push('🎬 FALLBACK: Direct play URL available as backup');
    }
  }
  
  if (!results.iframeUrl) {
    results.recommendations.push('❌ ERROR: Could not generate iframe fallback URL');
  }
  
  console.table(results);
  return results;
};

/**
 * Validate and log video URL for debugging
 * @param {string} url - Video URL to validate
 * @param {string} title - Video title for logging
 */
export const debugVideoUrl = (url, title = 'Unknown') => {
  console.log(`[Video Debug] ${title}:`, {
    url,
    isFullUrl: url && (url.startsWith('http://') || url.startsWith('https://')),
    isBunnyVideoCDN: url && isBunnyVideoUrl(url),
    isBunnyStorageCDN: url && isBunnyStorageUrl(url),
    isGuid: url && isBunnyStreamGuid(url),
    length: url ? url.length : 0,
    extractedId: extractVideoId(url),
    environment: {
      BUNNY_VIDEO_CDN_HOSTNAME: import.meta.env.VITE_BUNNY_VIDEO_CDN_HOSTNAME,
      BUNNY_VIDEO_LIBRARY_ID: import.meta.env.VITE_BUNNY_VIDEO_LIBRARY_ID
    }
  });
  
  return url;
};

// Internal helper: append Bunny token if authentication is available
function appendTokenIfNeeded(url) {
  try {
    // Always try to add authentication if we have credentials
    if (shouldUseAuthentication()) {
      const token = getVideoToken();
      if (token) {
        const separator = url.includes('?') ? '&' : '?';
        const authenticatedUrl = `${url}${separator}token=${encodeURIComponent(token)}`;
        console.log('🔐 appendTokenIfNeeded: Added authentication token to URL');
        return authenticatedUrl;
      }
    }
    
    console.log('🔓 appendTokenIfNeeded: No authentication applied to URL');
    return url;
  } catch (e) {
    console.warn('⚠️ appendTokenIfNeeded: Error applying authentication, using original URL:', e.message);
    // If utils not available for any reason, return original URL
    return url;
  }
}
