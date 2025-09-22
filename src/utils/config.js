/**
 * Configuration management and validation for production environment
 */

/**
 * Required environment variables for production
 */
const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_BUNNY_CDN_URL',
  'VITE_BUNNY_STORAGE_API_KEY',
  'VITE_BUNNY_STORAGE_ZONE',
  'VITE_BUNNY_VIDEO_LIBRARY_ID',
  'VITE_BUNNY_VIDEO_CDN_HOSTNAME',
  'VITE_BUNNY_VIDEO_API_KEY'
];

/**
 * Optional environment variables with defaults
 */
const OPTIONAL_ENV_VARS = {
  VITE_ENABLE_FILE_UPLOAD: 'true',
  VITE_MAX_FILE_SIZE: '200000000',
  VITE_FACEBOOK_PAGE_ID: '101470072189930',
  VITE_SOCIAL_FACEBOOK_URL: '',
  VITE_SOCIAL_TWITTER_URL: '',
  VITE_SOCIAL_INSTAGRAM_URL: '',
  VITE_SOCIAL_YOUTUBE_URL: ''
};

/**
 * Validate environment configuration
 */
export const validateEnvironment = () => {
  const errors = [];
  const warnings = [];
  
  // Check required variables
  REQUIRED_ENV_VARS.forEach(envVar => {
    const value = import.meta.env[envVar];
    if (!value || value.trim() === '') {
      errors.push(`Missing required environment variable: ${envVar}`);
    } else if (value.includes('your-') || value.includes('example') || value.includes('localhost')) {
      warnings.push(`${envVar} appears to contain example/development values`);
    }
  });
  
  // Validate specific formats
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith('https://') && !supabaseUrl.includes('.supabase.co')) {
    errors.push('VITE_SUPABASE_URL must be a valid Supabase URL');
  }
  
  const bunnyUrl = import.meta.env.VITE_BUNNY_CDN_URL;
  if (bunnyUrl && !bunnyUrl.startsWith('https://') && !bunnyUrl.includes('.b-cdn.net')) {
    warnings.push('VITE_BUNNY_CDN_URL should be a valid Bunny CDN URL');
  }
  
  const videoHostname = import.meta.env.VITE_BUNNY_VIDEO_CDN_HOSTNAME;
  if (videoHostname && !videoHostname.includes('.b-cdn.net')) {
    warnings.push('VITE_BUNNY_VIDEO_CDN_HOSTNAME should be a valid Bunny CDN hostname');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Get configuration object with fallbacks
 */
export const getConfig = () => {
  const config = {};
  
  // Add required variables
  REQUIRED_ENV_VARS.forEach(envVar => {
    config[envVar] = import.meta.env[envVar] || '';
  });
  
  // Add optional variables with defaults
  Object.entries(OPTIONAL_ENV_VARS).forEach(([envVar, defaultValue]) => {
    config[envVar] = import.meta.env[envVar] || defaultValue;
  });
  
  return config;
};

/**
 * Check if running in development mode
 */
export const isDevelopment = () => {
  return import.meta.env.DEV;
};

/**
 * Check if running in production mode
 */
export const isProduction = () => {
  return import.meta.env.PROD;
};

/**
 * Get app version from package.json
 */
export const getAppVersion = () => {
  return import.meta.env.VITE_APP_VERSION || '1.0.0';
};

/**
 * Security configuration for production
 */
export const SECURITY_CONFIG = {
  // Session timeout in milliseconds (30 minutes)
  sessionTimeout: 30 * 60 * 1000,
  
  // Maximum login attempts before lockout
  maxLoginAttempts: 5,
  
  // Lockout duration in milliseconds (15 minutes)
  lockoutDuration: 15 * 60 * 1000,
  
  // Rate limiting for API calls
  rateLimiting: {
    upload: { requests: 10, windowMs: 60000 }, // 10 uploads per minute
    auth: { requests: 5, windowMs: 300000 }, // 5 auth attempts per 5 minutes
    general: { requests: 100, windowMs: 60000 } // 100 requests per minute
  },
  
  // File upload restrictions
  fileUpload: {
    enabled: import.meta.env.VITE_ENABLE_FILE_UPLOAD === 'true',
    maxSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 200000000,
    allowedTypes: {
      image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      video: ['video/mp4', 'video/webm'],
      audio: ['audio/mp3', 'audio/wav', 'audio/m4a']
    }
  }
};

/**
 * Initialize application configuration
 */
export const initializeConfig = () => {
  const validation = validateEnvironment();
  
  if (!validation.isValid) {
    console.error('❌ Configuration validation failed:');
    validation.errors.forEach(error => console.error(`  - ${error}`));
    
    if (isProduction()) {
      throw new Error('Application cannot start with invalid configuration in production mode');
    }
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Configuration warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  if (validation.isValid && validation.warnings.length === 0) {
    console.log('✅ Configuration validation passed');
  }
  
  return getConfig();
};

/**
 * Feature flags for production deployment
 */
export const FEATURE_FLAGS = {
  enableDebugComponents: isDevelopment(),
  enableImageUploadTest: isDevelopment(),
  enableVideoUrlTester: isDevelopment(),
  enableDevTools: isDevelopment(),
  enableSourceMaps: isDevelopment(),
  enableConsoleLogging: isDevelopment(),
  enableAnalytics: isProduction(),
  enableErrorReporting: isProduction(),
  enablePerformanceMonitoring: isProduction()
};
