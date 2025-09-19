/**
 * Utility functions for handling Bunny CDN image URLs
 */

/**
 * Constructs a full Bunny CDN URL for an image
 * @param {string} imagePath - The image path/filename from database
 * @returns {string} - Full Bunny CDN URL
 */
export const getBunnyImageUrl = (imagePath) => {
  if (!imagePath) {
    console.log('getBunnyImageUrl: No image path provided');
    return null;
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('getBunnyImageUrl: Already full URL:', imagePath);
    return imagePath;
  }
  
  // Get the CDN URL from environment - fallback to known working URL
  let cdnUrl = import.meta.env.VITE_BUNNY_CDN_URL;
  
  if (!cdnUrl) {
    console.warn('VITE_BUNNY_CDN_URL not configured, using fallback');
    cdnUrl = 'https://hassaniya.b-cdn.net'; // Fallback to known working URL
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // Construct full URL
  const fullUrl = `${cdnUrl}/${cleanPath}`;
  
  console.log('getBunnyImageUrl:', {
    original: imagePath,
    cdnUrl: cdnUrl,
    cleanPath: cleanPath,
    fullUrl: fullUrl
  });
  
  return fullUrl;
};

/**
 * Validates if an image URL is accessible
 * @param {string} imageUrl - The image URL to validate
 * @returns {Promise<boolean>} - Promise that resolves to true if image is accessible
 */
export const validateImageUrl = async (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    
    // Set a timeout to avoid hanging
    setTimeout(() => resolve(false), 10000);
    
    img.src = imageUrl;
  });
};

/**
 * Gets optimized image URL with Bunny CDN parameters
 * @param {string} imagePath - The base image path
 * @param {object} options - Optimization options
 * @param {number} options.width - Target width
 * @param {number} options.height - Target height  
 * @param {string} options.quality - Quality (1-100)
 * @returns {string} - Optimized Bunny CDN URL
 */
export const getOptimizedImageUrl = (imagePath, options = {}) => {
  const baseUrl = getBunnyImageUrl(imagePath);
  
  if (!baseUrl || (!options.width && !options.height && !options.quality)) {
    return baseUrl;
  }
  
  const params = new URLSearchParams();
  
  if (options.width) params.append('width', options.width);
  if (options.height) params.append('height', options.height);
  if (options.quality) params.append('quality', options.quality);
  
  return `${baseUrl}?${params.toString()}`;
};
