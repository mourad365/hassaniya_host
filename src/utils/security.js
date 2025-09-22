/**
 * Security utilities for input validation and sanitization
 */

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  phone: /^[\d\s\-\+\(\)]+$/,
  url: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
  arabicText: /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\s\d\p{P}]+$/u,
  englishText: /^[a-zA-Z0-9\s\p{P}]+$/u,
  filename: /^[a-zA-Z0-9\-_.]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
};

// File upload security
export const FILE_SECURITY = {
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
  allowedAudioTypes: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
  maxFileSize: {
    image: 10 * 1024 * 1024, // 10MB
    video: 500 * 1024 * 1024, // 500MB
    audio: 50 * 1024 * 1024, // 50MB
    document: 5 * 1024 * 1024 // 5MB
  }
};

/**
 * Sanitize string input by removing potentially dangerous characters
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
};

/**
 * Validate email address
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return VALIDATION_PATTERNS.email.test(email.trim().toLowerCase());
};

/**
 * Validate slug format (for URLs)
 */
export const validateSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  return VALIDATION_PATTERNS.slug.test(slug.trim().toLowerCase());
};

/**
 * Validate file type and size
 */
export const validateFile = (file, type = 'image') => {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }
  
  // Check file type
  const allowedTypes = FILE_SECURITY[`allowed${type.charAt(0).toUpperCase() + type.slice(1)}Types`];
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    errors.push(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
  }
  
  // Check file size
  const maxSize = FILE_SECURITY.maxFileSize[type];
  if (maxSize && file.size > maxSize) {
    errors.push(`File too large. Maximum size: ${Math.round(maxSize / (1024 * 1024))}MB`);
  }
  
  // Check for potentially dangerous filenames
  if (!VALIDATION_PATTERNS.filename.test(file.name)) {
    errors.push('Invalid filename. Only letters, numbers, hyphens, underscores, and dots allowed');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate secure filename
 */
export const generateSecureFilename = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop().toLowerCase();
  const safeName = originalName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
  
  return `${prefix}${timestamp}-${random}-${safeName}`;
};

/**
 * Validate and sanitize content data
 */
export const sanitizeContentData = (data) => {
  const sanitized = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (value !== null && value !== undefined) {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
};

/**
 * Check if string contains Arabic text
 */
export const containsArabic = (text) => {
  if (typeof text !== 'string') return false;
  return /[\u0600-\u06FF]/.test(text);
};

/**
 * Rate limiting helper (client-side basic implementation)
 */
export class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  isAllowed(identifier) {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove expired requests
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
  
  reset(identifier) {
    this.requests.delete(identifier);
  }
}

/**
 * Content Security Policy configuration
 */
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
  'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
  'img-src': ["'self'", "data:", "https:", "blob:"],
  'font-src': ["'self'", "https://fonts.gstatic.com"],
  'connect-src': ["'self'", "https://api.supabase.co", "https://*.supabase.co", "https://*.b-cdn.net"],
  'media-src': ["'self'", "https://*.b-cdn.net", "blob:"],
  'frame-src': ["'self'", "https://iframe.mediadelivery.net"],
  'worker-src': ["'self'", "blob:"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};

/**
 * Generate CSP header string
 */
export const generateCSP = () => {
  return Object.entries(CSP_CONFIG)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};
