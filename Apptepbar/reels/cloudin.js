// Cloudflare R2 Configuration for Kronop Reels
// Only R2 variables from .env file - NO API URLs, NO API Variables

// Get R2 configuration from environment variables
const R2_ACCOUNT_ID = process.env.EXPO_PUBLIC_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY;
const R2_ENDPOINT = process.env.EXPO_PUBLIC_R2_ENDPOINT;
const BUCKET_REELS = process.env.EXPO_PUBLIC_BUCKET_REELS;

// R2 Configuration Object - Only R2, No API
const CLOUD_CONFIG = {
  // Public R2 URL for video streaming
  publicR2Url: 'https://pub-600cd3134366496fadf941970cac2df6.r2.dev',
  
  // R2 Configuration from .env
  r2Config: {
    accountId: R2_ACCOUNT_ID,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    endpoint: R2_ENDPOINT,
    bucket: BUCKET_REELS,
  },
  
  // Video quality presets
  quality: {
    low: '480p',
    medium: '720p', 
    high: '1080p',
    ultra: '4k'
  },
  
  // Streaming configuration
  streaming: {
    enableRangeRequests: true,
    bufferSize: 1024 * 1024, // 1MB chunks
    maxRetries: 3,
    timeout: 10000, // 10 seconds
  }
};

/**
 * Get R2 URL specifically for reels
 * @param {string} videoKey - Video file key or filename
 * @returns {string} Complete R2 streaming URL for reels
 */
function getReelUrl(videoKey) {
  if (!videoKey) {
    console.warn('⚠️ Reel video key is empty');
    return '';
  }
  
  // Remove leading slash if present
  const cleanKey = videoKey.startsWith('/') ? videoKey.slice(1) : videoKey;
  
  // Add Reels/ prefix if not already present
  const reelKey = cleanKey.startsWith('Reels/') ? cleanKey : `Reels/${cleanKey}`;
  
  // Construct full R2 URL
  const fullUrl = `${CLOUD_CONFIG.publicR2Url}/${reelKey}`;
  
  console.log(`🎬 Reel URL: ${fullUrl}`);
  return fullUrl;
}

/**
 * Get public R2 URL for video streaming
 * @param {string} videoKey - Video file key/path
 * @returns {string} Complete streaming URL
 */
function getVideoUrl(videoKey) {
  if (!videoKey) {
    console.warn('⚠️ Video key is empty');
    return '';
  }
  
  // Remove leading slash if present
  const cleanKey = videoKey.startsWith('/') ? videoKey.slice(1) : videoKey;
  
  // Construct full URL
  const fullUrl = `${CLOUD_CONFIG.publicR2Url}/${cleanKey}`;
  
  console.log(`🎬 Video URL: ${fullUrl}`);
  return fullUrl;
}

/**
 * Get streaming URL with quality preference
 * @param {string} videoKey - Video file key
 * @param {string} quality - Video quality (low, medium, high, ultra)
 * @returns {string} Quality-specific streaming URL
 */
function getQualityStreamUrl(videoKey, quality = 'medium') {
  const qualitySuffix = CLOUD_CONFIG.quality[quality] || CLOUD_CONFIG.quality.medium;
  const qualityKey = `${videoKey}_${qualitySuffix}`;
  
  return getVideoUrl(qualityKey);
}

/**
 * Generate range request URL for partial video loading
 * @param {string} videoKey - Video file key
 * @param {number} start - Start byte position
 * @param {number} end - End byte position
 * @returns {string} Range request URL
 */
function getRangeUrl(videoKey, start = 0, end = null) {
  const baseUrl = getVideoUrl(videoKey);
  const range = end ? `bytes=${start}-${end}` : `bytes=${start}-`;
  
  return `${baseUrl}?range=${range}`;
}

/**
 * Check if URL is valid R2 streaming URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid R2 URL
 */
function isValidR2Url(url) {
  return url && url.startsWith(CLOUD_CONFIG.publicR2Url);
}

/**
 * Extract video key from R2 URL
 * @param {string} url - Full R2 URL
 * @returns {string} Video key
 */
function extractVideoKey(url) {
  if (!isValidR2Url(url)) {
    return '';
  }
  
  return url.replace(CLOUD_CONFIG.publicR2Url + '/', '');
}

/**
 * Get optimized video URL based on network conditions
 * @param {string} videoKey - Video file key
 * @param {object} networkInfo - Network speed and type info
 * @returns {string} Optimized streaming URL
 */
function getOptimizedUrl(videoKey, networkInfo = {}) {
  const { speed = 'fast', type = 'wifi' } = networkInfo;
  
  // Auto-adjust quality based on network
  if (type === 'cellular' || speed === 'slow') {
    return getQualityStreamUrl(videoKey, 'low');
  } else if (speed === 'medium') {
    return getQualityStreamUrl(videoKey, 'medium');
  } else {
    return getQualityStreamUrl(videoKey, 'high');
  }
}

// Export configuration and functions
module.exports = {
  CLOUD_CONFIG,
  getVideoUrl,
  getReelUrl,
  getQualityStreamUrl,
  getRangeUrl,
  isValidR2Url,
  extractVideoKey,
  getOptimizedUrl,
  // R2 Configuration for reels
  r2Config: CLOUD_CONFIG.r2Config,
  r2PublicUrl: CLOUD_CONFIG.publicR2Url,
  r2Bucket: BUCKET_REELS,
};

// For ES6 modules compatibility
export {
  CLOUD_CONFIG,
  getVideoUrl,
  getReelUrl,
  getQualityStreamUrl,
  getRangeUrl,
  isValidR2Url,
  extractVideoKey,
  getOptimizedUrl,
};

// Export R2 configuration separately
export const r2Config = CLOUD_CONFIG.r2Config;
export const r2PublicUrl = CLOUD_CONFIG.publicR2Url;
export const r2Bucket = BUCKET_REELS;

// Default export for easy importing
export default {
  CLOUD_CONFIG,
  getVideoUrl,
  getReelUrl,
  getQualityStreamUrl,
  getRangeUrl,
  isValidR2Url,
  extractVideoKey,
  getOptimizedUrl,
  r2Config: CLOUD_CONFIG.r2Config,
  r2PublicUrl: CLOUD_CONFIG.publicR2Url,
  r2Bucket: BUCKET_REELS,
};
