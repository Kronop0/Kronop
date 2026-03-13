// ==================== CENTRAL API CONFIGURATION ====================
// ONE SOURCE OF TRUTH for all API endpoints
// ALL COMPONENTS SHOULD IMPORT FROM HERE

// Get base URL from environment
const getBaseUrl = () => {
  // Check for Render URL first (priority)
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  // Check for secondary API URL
  if (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Fallback to Render URL
  return 'https://kronop-76zy.onrender.com';
};

export const BASE_URL = getBaseUrl();

// API Endpoints - ALL COMPONENTS MUST USE THESE
export const API_ENDPOINTS = {
  // Content endpoints
  PHOTOS: `${BASE_URL}/api/photos`,
  VIDEOS: `${BASE_URL}/api/videos`,
  REELS: `${BASE_URL}/api/reels`,
  STORIES: `${BASE_URL}/api/stories`,
  LIVE: `${BASE_URL}/api/live`,

  // User endpoints
  USER_PROFILE: `${BASE_URL}/api/users/profile`,

  // Auth endpoints
  LOGIN: `${BASE_URL}/api/auth/login`,
  REGISTER: `${BASE_URL}/api/auth/register`,

  // Interaction endpoints
  LIKE: `${BASE_URL}/api/like`,
  COMMENT: `${BASE_URL}/api/comment`,
  SHARE: `${BASE_URL}/api/share`
};

export default BASE_URL;
