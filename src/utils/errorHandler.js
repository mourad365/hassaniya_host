/**
 * Production-ready error handling utilities
 */
import { isProduction } from '@/utils/config';

/**
 * Error types for categorization
 */
export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  VALIDATION: 'validation',
  DATABASE: 'database',
  FILE_UPLOAD: 'file_upload',
  VIDEO_PLAYBACK: 'video_playback',
  UNKNOWN: 'unknown'
};

/**
 * Arabic error messages for user-friendly display
 */
export const ERROR_MESSAGES = {
  [ERROR_TYPES.NETWORK]: 'خطأ في الاتصال بالإنترنت. يرجى المحاولة مرة أخرى.',
  [ERROR_TYPES.AUTHENTICATION]: 'خطأ في المصادقة. يرجى تسجيل الدخول مرة أخرى.',
  [ERROR_TYPES.AUTHORIZATION]: 'ليس لديك صلاحية للوصول إلى هذا المحتوى.',
  [ERROR_TYPES.VALIDATION]: 'البيانات المدخلة غير صحيحة. يرجى المراجعة والمحاولة مرة أخرى.',
  [ERROR_TYPES.DATABASE]: 'خطأ في قاعدة البيانات. يرجى المحاولة لاحقاً.',
  [ERROR_TYPES.FILE_UPLOAD]: 'فشل في رفع الملف. يرجى التأكد من نوع وحجم الملف.',
  [ERROR_TYPES.VIDEO_PLAYBACK]: 'خطأ في تشغيل الفيديو. يرجى المحاولة مرة أخرى.',
  [ERROR_TYPES.UNKNOWN]: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
};

/**
 * Categorize error based on error object or message
 */
export const categorizeError = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN;
  
  const errorMessage = error.message || error.toString().toLowerCase();
  const errorCode = error.code || error.status;
  
  // Network errors
  if (errorMessage.includes('network') || 
      errorMessage.includes('fetch') || 
      errorMessage.includes('connection') ||
      errorCode === 'NETWORK_ERROR') {
    return ERROR_TYPES.NETWORK;
  }
  
  // Authentication errors
  if (errorMessage.includes('authentication') || 
      errorMessage.includes('invalid login') ||
      errorMessage.includes('unauthorized') ||
      errorCode === 401) {
    return ERROR_TYPES.AUTHENTICATION;
  }
  
  // Authorization errors
  if (errorMessage.includes('forbidden') || 
      errorMessage.includes('access denied') ||
      errorCode === 403) {
    return ERROR_TYPES.AUTHORIZATION;
  }
  
  // Validation errors
  if (errorMessage.includes('validation') || 
      errorMessage.includes('invalid') ||
      errorMessage.includes('required') ||
      errorCode === 400 || errorCode === 422) {
    return ERROR_TYPES.VALIDATION;
  }
  
  // Database errors
  if (errorMessage.includes('database') || 
      errorMessage.includes('sql') ||
      errorMessage.includes('connection') ||
      errorCode === 500) {
    return ERROR_TYPES.DATABASE;
  }
  
  // File upload errors
  if (errorMessage.includes('upload') || 
      errorMessage.includes('file') ||
      errorMessage.includes('storage')) {
    return ERROR_TYPES.FILE_UPLOAD;
  }
  
  // Video playback errors
  if (errorMessage.includes('video') || 
      errorMessage.includes('media') ||
      errorMessage.includes('playback') ||
      errorMessage.includes('bunny')) {
    return ERROR_TYPES.VIDEO_PLAYBACK;
  }
  
  return ERROR_TYPES.UNKNOWN;
};

/**
 * Get user-friendly error message in Arabic
 */
export const getUserFriendlyMessage = (error) => {
  const errorType = categorizeError(error);
  return ERROR_MESSAGES[errorType] || ERROR_MESSAGES[ERROR_TYPES.UNKNOWN];
};

/**
 * Log error with proper categorization and context
 */
export const logError = (error, context = {}) => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    type: categorizeError(error),
    message: error.message || error.toString(),
    stack: error.stack,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: context.userId || 'anonymous'
  };
  
  if (isProduction()) {
    // In production, log essential info only
    console.error('Error:', {
      type: errorInfo.type,
      message: errorInfo.message,
      timestamp: errorInfo.timestamp,
      context: errorInfo.context
    });
    
    // Here you could send to error tracking service like Sentry
    // Sentry.captureException(error, { extra: errorInfo });
  } else {
    // In development, log full details
    console.error('Development Error:', errorInfo);
    console.trace();
  }
  
  return errorInfo;
};

/**
 * Handle API errors with consistent response
 */
export const handleApiError = (error, context = {}) => {
  const errorInfo = logError(error, { ...context, source: 'api' });
  
  return {
    success: false,
    error: {
      type: errorInfo.type,
      message: getUserFriendlyMessage(error),
      code: error.code || error.status,
      timestamp: errorInfo.timestamp
    }
  };
};

/**
 * Retry mechanism for network operations
 */
export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      return { success: true, data: result };
    } catch (error) {
      lastError = error;
      
      // Don't retry for client errors (4xx) except 408, 429
      if (error.status >= 400 && error.status < 500 && 
          error.status !== 408 && error.status !== 429) {
        break;
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  return handleApiError(lastError, { attempts: maxRetries });
};

/**
 * Safe async operation wrapper
 */
export const safeAsync = async (operation, fallback = null, context = {}) => {
  try {
    return await operation();
  } catch (error) {
    logError(error, { ...context, source: 'safeAsync' });
    return fallback;
  }
};

/**
 * Validate and sanitize operation result
 */
export const validateResult = (result, validator, context = {}) => {
  try {
    if (typeof validator === 'function') {
      return validator(result);
    }
    return result;
  } catch (error) {
    logError(error, { ...context, source: 'validation' });
    return null;
  }
};

/**
 * Generic error boundary handler
 */
export const createErrorHandler = (component) => {
  return (error, errorInfo) => {
    logError(error, {
      component,
      errorBoundary: true,
      errorInfo
    });
  };
};

/**
 * Rate limiting error handler
 */
export const isRateLimited = (error) => {
  return error.status === 429 || 
         error.message?.includes('rate limit') ||
         error.message?.includes('too many requests');
};

/**
 * Handle rate limiting with exponential backoff
 */
export const handleRateLimit = (error) => {
  const retryAfter = error.headers?.['retry-after'] || 60;
  const backoffTime = Math.min(retryAfter * 1000, 300000); // Max 5 minutes
  
  return {
    isRateLimited: true,
    retryAfter: backoffTime,
    message: `تم تجاوز حد المحاولات. يرجى المحاولة بعد ${Math.ceil(backoffTime / 1000)} ثانية.`
  };
};

/**
 * Check if error is recoverable
 */
export const isRecoverableError = (error) => {
  const errorType = categorizeError(error);
  const recoverableTypes = [
    ERROR_TYPES.NETWORK,
    ERROR_TYPES.DATABASE
  ];
  
  return recoverableTypes.includes(errorType) || 
         error.status >= 500 || // Server errors
         error.status === 408 || // Request timeout
         error.status === 429;   // Rate limited
};

/**
 * Create error summary for admin dashboard
 */
export const createErrorSummary = (errors) => {
  const summary = {
    total: errors.length,
    byType: {},
    recent: errors.slice(-10),
    trends: {}
  };
  
  errors.forEach(error => {
    const type = error.type || ERROR_TYPES.UNKNOWN;
    summary.byType[type] = (summary.byType[type] || 0) + 1;
  });
  
  return summary;
};
