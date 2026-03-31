// ==================== UNIFIED CONFIGURATION ====================
// ONE SOURCE OF TRUTH - All API Keys, Endpoints and Configuration
// NO HARDCODED VALUES ANYWHERE IN THE PROJECT

// ==================== API KEYS ====================
export const API_KEYS = {
  // External Search APIs
  OPENAI: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  GOOGLE_SEARCH: process.env.EXPO_PUBLIC_GOOGLE_SEARCH_KEY || '',
  GOOGLE_SEARCH_CX: process.env.EXPO_PUBLIC_GOOGLE_SEARCH_CX || '',
  UNSPLASH: process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY || '',
  PEXELS: process.env.EXPO_PUBLIC_PEXELS_API_KEY || '',
  
  // AI Supporter Key (for AI Image Generation)
  AI_SUPPORT: process.env.EXPO_PUBLIC_AI_SUPPORT_KEY || '',
  
  // Groq AI API Key (for Support Chat)
  GROQ: process.env.EXPO_PUBLIC_GROQ_API_KEY || '',
  
  // Spreadsheet API
  SPREADSHEET_API_KEY: process.env.EXPO_PUBLIC_SPREADSHEET_API_KEY || '',
  
  // Additional API Keys
  PIXABAY: process.env.EXPO_PUBLIC_PIXABAY_KEY || '',
  FLICKR: process.env.EXPO_PUBLIC_FLICKR_KEY || '',
  GIPHY: process.env.EXPO_PUBLIC_GIPHY_KEY || '',
  BING: process.env.EXPO_PUBLIC_BING_KEY || '',
  OPENVERSE: process.env.EXPO_PUBLIC_OPENVERSE_KEY || '',
  STABLE_DIFFUSION: process.env.EXPO_PUBLIC_STABLE_DIFFUSION_KEY || '',
  
  // OneSignal
  ONESIGNAL_APP_ID: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || '',
  ONESIGNAL_REST_API_KEY: process.env.ONESIGNAL_REST_API_KEY || '',
  
  // Google Auth
  GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
  GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
  
  // Supabase
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // JWT Secret
  JWT_SECRET: process.env.JWT_SECRET || process.env.EXPO_PUBLIC_JWT_SECRET || process.env.SUPABASE_JWT_SECRET || '',
};

// ==================== DATABASE CONFIGURATION ====================
export const DATABASE_CONFIG = {
  MONGODB_URI: process.env.EXPO_PUBLIC_MONGODB_URI || process.env.MONGODB_URI || '',
  REDIS_TTL_SECONDS: parseInt(process.env.REDIS_TTL_SECONDS || '30', 10),
};

// ==================== SERVER CONFIGURATION ====================
export const SERVER_CONFIG = {
  PORT: Number(process.env.EXPO_PUBLIC_PORT) || Number(process.env.PORT) || 8000,
  NODE_ENV: process.env.EXPO_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || 'development',
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL || 'https://kronop-76zy.onrender.com',
  WS_PORT: Number(process.env.WS_PORT) || 8080,
};

// ==================== BASE URL ====================
export const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  if (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return 'https://kronop-76zy.onrender.com';
};

export const BASE_URL = getBaseUrl();

// ==================== API ENDPOINTS ====================
export const API_ENDPOINTS = {
  // Content endpoints
  PHOTOS: `${BASE_URL}/photos`,
  VIDEOS: `${BASE_URL}/videos`,
  REELS: `${BASE_URL}/reels`,
  STORIES: `${BASE_URL}/stories`,
  LIVE: `${BASE_URL}/live`,
  
  // User endpoints
  USER_PROFILE: `${BASE_URL}/user/profile`,
  
  // Auth endpoints
  LOGIN: `${BASE_URL}/auth/login`,
  REGISTER: `${BASE_URL}/auth/register`,
  
  // Interaction endpoints
  LIKE: `${BASE_URL}/like`,
  COMMENT: `${BASE_URL}/comment`,
  SHARE: `${BASE_URL}/share`,
};

// ==================== DEFAULT EXPORT ====================
export default {
  API_KEYS,
  DATABASE_CONFIG,
  SERVER_CONFIG,
  BASE_URL,
  API_ENDPOINTS,
};
