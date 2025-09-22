/**
 * Form validation utilities with Arabic error messages
 */
import { sanitizeString, validateEmail, validateSlug, containsArabic, VALIDATION_PATTERNS } from '@/utils/security';

/**
 * Content form validation schema
 */
export const FORM_VALIDATION_RULES = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 200,
    message: 'العنوان مطلوب ويجب أن يكون بين 3-200 حرف'
  },
  slug: {
    required: true,
    pattern: VALIDATION_PATTERNS.slug,
    message: 'الرابط المختصر يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط'
  },
  excerpt: {
    required: false,
    maxLength: 500,
    message: 'الملخص يجب أن يكون أقل من 500 حرف'
  },
  content: {
    required: true,
    minLength: 50,
    message: 'المحتوى مطلوب ويجب أن يكون 50 حرفاً على الأقل'
  },
  category: {
    required: true,
    message: 'الفئة مطلوبة'
  },
  author: {
    required: false,
    maxLength: 100,
    message: 'اسم الكاتب يجب أن يكون أقل من 100 حرف'
  },
  email: {
    pattern: VALIDATION_PATTERNS.email,
    message: 'البريد الإلكتروني غير صحيح'
  },
  phone: {
    pattern: VALIDATION_PATTERNS.phone,
    message: 'رقم الهاتف غير صحيح'
  },
  url: {
    pattern: VALIDATION_PATTERNS.url,
    message: 'الرابط غير صحيح'
  }
};

/**
 * Validate a single field
 */
export const validateField = (fieldName, value, rules = FORM_VALIDATION_RULES) => {
  const rule = rules[fieldName];
  if (!rule) return { isValid: true, errors: [] };

  const errors = [];
  const sanitizedValue = typeof value === 'string' ? sanitizeString(value) : value;

  // Required validation
  if (rule.required && (!sanitizedValue || sanitizedValue.toString().trim() === '')) {
    errors.push(rule.message || `${fieldName} مطلوب`);
    return { isValid: false, errors };
  }

  // Skip other validations if field is empty and not required
  if (!sanitizedValue || sanitizedValue.toString().trim() === '') {
    return { isValid: true, errors: [] };
  }

  const stringValue = sanitizedValue.toString().trim();

  // Length validations
  if (rule.minLength && stringValue.length < rule.minLength) {
    errors.push(`يجب أن يحتوي على ${rule.minLength} أحرف على الأقل`);
  }

  if (rule.maxLength && stringValue.length > rule.maxLength) {
    errors.push(`يجب أن يكون أقل من ${rule.maxLength} حرف`);
  }

  // Pattern validation
  if (rule.pattern && !rule.pattern.test(stringValue)) {
    errors.push(rule.message || 'التنسيق غير صحيح');
  }

  // Special validations
  if (fieldName === 'email' && stringValue && !validateEmail(stringValue)) {
    errors.push('البريد الإلكتروني غير صحيح');
  }

  if (fieldName === 'slug' && stringValue && !validateSlug(stringValue)) {
    errors.push('الرابط المختصر يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط');
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue
  };
};

/**
 * Validate entire form
 */
export const validateForm = (formData, rules = FORM_VALIDATION_RULES) => {
  const results = {};
  const errors = {};
  const sanitizedData = {};
  let isValid = true;

  Object.keys(formData).forEach(fieldName => {
    const result = validateField(fieldName, formData[fieldName], rules);
    results[fieldName] = result;
    
    if (!result.isValid) {
      errors[fieldName] = result.errors;
      isValid = false;
    }
    
    if (result.sanitizedValue !== undefined) {
      sanitizedData[fieldName] = result.sanitizedValue;
    } else {
      sanitizedData[fieldName] = formData[fieldName];
    }
  });

  return {
    isValid,
    errors,
    sanitizedData,
    results
  };
};

/**
 * Generate slug from title
 */
export const generateSlug = (title) => {
  if (!title || typeof title !== 'string') return '';
  
  return title
    .toLowerCase()
    .trim()
    // Replace Arabic characters with transliteration if needed
    .replace(/[\u0600-\u06FF]/g, '') // Remove Arabic for now - you might want transliteration
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Validate file upload
 */
export const validateFileUpload = (file, type = 'image') => {
  const errors = [];
  
  if (!file) {
    errors.push('لم يتم اختيار ملف');
    return { isValid: false, errors };
  }

  // File size limits (in bytes)
  const sizeLimit = {
    image: 10 * 1024 * 1024, // 10MB
    video: 500 * 1024 * 1024, // 500MB
    audio: 50 * 1024 * 1024, // 50MB
    document: 5 * 1024 * 1024 // 5MB
  };

  // Allowed file types
  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    video: ['video/mp4', 'video/webm', 'video/quicktime'],
    audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a'],
    document: ['application/pdf', 'text/plain', 'application/msword']
  };

  // Check file size
  if (file.size > sizeLimit[type]) {
    const maxSizeMB = Math.round(sizeLimit[type] / (1024 * 1024));
    errors.push(`حجم الملف كبير جداً. الحد الأقصى ${maxSizeMB} ميجابايت`);
  }

  // Check file type
  if (!allowedTypes[type].includes(file.type)) {
    const allowedExtensions = allowedTypes[type].map(t => t.split('/')[1]).join(', ');
    errors.push(`نوع الملف غير مدعوم. الأنواع المدعومة: ${allowedExtensions}`);
  }

  // Check filename for security
  const filename = file.name.toLowerCase();
  const dangerousExtensions = ['.exe', '.bat', '.com', '.cmd', '.scr', '.pif', '.js', '.vbs'];
  const hasDangerousExtension = dangerousExtensions.some(ext => filename.endsWith(ext));
  
  if (hasDangerousExtension) {
    errors.push('نوع الملف غير آمن');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize HTML content (basic)
 */
export const sanitizeHtmlContent = (html) => {
  if (typeof html !== 'string') return '';
  
  // Remove script tags and event handlers
  return html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/<object[^>]*>.*?<\/object>/gi, '')
    .replace(/<embed[^>]*>.*?<\/embed>/gi, '');
};

/**
 * Common validation messages in Arabic
 */
export const VALIDATION_MESSAGES = {
  required: 'هذا الحقل مطلوب',
  email: 'البريد الإلكتروني غير صحيح',
  minLength: (min) => `يجب أن يحتوي على ${min} أحرف على الأقل`,
  maxLength: (max) => `يجب أن يكون أقل من ${max} حرف`,
  pattern: 'التنسيق غير صحيح',
  fileSize: (max) => `حجم الملف يجب أن يكون أقل من ${max} ميجابايت`,
  fileType: (types) => `أنواع الملفات المدعومة: ${types}`,
  url: 'الرابط غير صحيح',
  phone: 'رقم الهاتف غير صحيح',
  slug: 'الرابط المختصر يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط'
};
