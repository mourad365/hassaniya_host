/**
 * Media Service for Hostinger-based file handling
 * Replaces Supabase Storage functionality
 */

import { getHostingerMediaUrl, convertSupabaseToHostinger } from '../utils/hostingerUtils';

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
    hostinger: {
      baseUrl: import.meta.env.VITE_BASE_URL || 'https://mousouaa.com',
      mediaUrl: import.meta.env.VITE_MEDIA_URL || 'https://mousouaa.com/media',
      apiUrl: import.meta.env.VITE_API_URL || 'https://mousouaa.com/api'
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
 * Generate media URL for Hostinger hosting
 */
export const generateMediaUrl = (
  contentType,
  dialect,
  filename
) => {
  const config = getMediaConfig();
  return getHostingerMediaUrl(contentType, dialect, filename, config.hostinger);
};

/**
 * Convert existing Supabase URLs to Hostinger URLs
 */
export const migrateMediaUrl = (supabaseUrl) => {
  if (!supabaseUrl) return '';
  
  // If it's already a full URL, return as is
  if (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')) {
    return supabaseUrl;
  }
  
  // If it's a relative path, convert to full URL
  const config = getMediaConfig();
  return convertSupabaseToHostinger ? convertSupabaseToHostinger(supabaseUrl, config.hostinger) : supabaseUrl;
};

/**
 * Upload file to Hostinger using PHP upload endpoint
 */
export const uploadToHostinger = async (
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
  
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('content_type', contentType);
    formData.append('dialect', dialect);
    
    // Upload to PHP endpoint
    const uploadUrl = `${config.hostinger.apiUrl}/upload.php`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let browser set it with boundary
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Upload failed');
    }
    
    console.log('File uploaded successfully:', result.url);
    
    return {
      success: true,
      url: result.url
    };
    
  } catch (error) {
    console.error('Upload error:', error);
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
  uploadToHostinger,
  generateMediaUrl,
  migrateMediaUrl,
  validateFile,
  validateMediaUrl,
  sanitizeFilename,
  generateDownloadLink,
  getFileTypeFromContentType,
  getFilenameFromUrl
};
