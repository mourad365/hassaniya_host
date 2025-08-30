/**
 * Media Service for Bunny CDN file handling
 * Replaces Supabase Storage functionality
 */

// Get media configuration from environment
const getMediaConfig = () => {
  return {
    enableUpload: import.meta.env.VITE_ENABLE_FILE_UPLOAD === 'true',
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '200000000'), // 200MB default
    allowedTypes: [
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/opus', 'audio/mp3',
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime',
      'application/pdf', 'application/epub+zip', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'text/plain', 'text/markdown', 'text/csv'
    ],
    bunny: {
      storageApiKey: import.meta.env.VITE_BUNNY_STORAGE_API_KEY,
      storageZone: import.meta.env.VITE_BUNNY_STORAGE_ZONE,
      cdnUrl: import.meta.env.VITE_BUNNY_CDN_URL
    }
  };
};

/**
 * Sanitize filename for safe storage
 */
export const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Validate file before upload
 */
export const validateFile = (file) => {
  const config = getMediaConfig();
  
  if (file.size > config.maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds ${Math.round(config.maxFileSize / 1024 / 1024)}MB limit`
    };
  }
  
  if (!config.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not supported`
    };
  }
  
  return { valid: true };
};

/**
 * Generate media URL for Bunny CDN
 */
export const generateMediaUrl = (
  contentType,
  dialect,
  filename
) => {
  const config = getMediaConfig();
  const sanitizedFilename = sanitizeFilename(filename);
  return `${config.bunny.cdnUrl}/${contentType}/${dialect}/${sanitizedFilename}`;
};

/**
 * Convert existing Supabase URLs to Bunny CDN URLs
 */
export const migrateMediaUrl = (supabaseUrl) => {
  if (!supabaseUrl) return '';
  
  // If it's already a full URL, return as is
  if (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')) {
    return supabaseUrl;
  }
  
  // If it's a relative path, convert to Bunny CDN URL
  const config = getMediaConfig();
  return `${config.bunny.cdnUrl}/${supabaseUrl.replace(/^\/+/, '')}`;
};

/**
 * Upload file to Bunny CDN Storage
 */
export const uploadToBunny = async (
  file,
  contentType,
  dialect
) => {
  const config = getMediaConfig();
  
  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.error
    };
  }
  
  // Check if uploads are enabled
  if (!config.enableUpload) {
    return {
      success: false,
      error: 'File uploads are currently disabled. Please contact administrator.'
    };
  }
  
  if (!config.bunny.storageApiKey || !config.bunny.storageZone) {
    return {
      success: false,
      error: 'Bunny CDN configuration is missing. Please check environment variables.'
    };
  }
  
  try {
    const sanitizedFilename = sanitizeFilename(file.name);
    const filePath = `${contentType}/${dialect}/${sanitizedFilename}`;
    
    // Upload to Bunny Storage API
    const uploadUrl = `https://storage.bunnycdn.com/${config.bunny.storageZone}/${filePath}`;
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'AccessKey': config.bunny.storageApiKey,
        'Content-Type': 'application/octet-stream'
      },
      body: file
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    // Generate the CDN URL
    const cdnUrl = `${config.bunny.cdnUrl}/${filePath}`;
    
    console.log('File uploaded successfully to Bunny CDN:', cdnUrl);
    
    return {
      success: true,
      url: cdnUrl
    };
    
  } catch (error) {
    console.error('Bunny CDN upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
};

/**
 * Check if a media URL is accessible
 */
export const validateMediaUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Get file type from content type
 */
export const getFileTypeFromContentType = (contentType) => {
  if (contentType === 'audio') return 'audio';
  if (contentType === 'video') return 'video';
  if (contentType === 'book') return 'books';
  return 'thumbnails';
};

/**
 * Extract filename from URL
 */
export const getFilenameFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 1] || 'unknown';
  } catch {
    return 'unknown';
  }
};

/**
 * Generate download link for media files
 */
export const generateDownloadLink = (url, filename) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || getFilenameFromUrl(url);
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default {
  uploadToBunny,
  generateMediaUrl,
  migrateMediaUrl,
  validateFile,
  validateMediaUrl,
  sanitizeFilename,
  generateDownloadLink,
  getFileTypeFromContentType,
  getFilenameFromUrl
};
