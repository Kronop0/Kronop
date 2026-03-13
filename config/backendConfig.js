// ==================== BACKEND CONFIGURATION ====================
// Node.js compatible configuration for production deployment
// All environment variables centralized here



// ==================== API KEYS ====================
const API_KEYS = {
  // AI Supporter
  AI_SUPPORT: process.env.EXPO_PUBLIC_AI_SUPPORT_KEY,
  STABLE_DIFFUSION: process.env.EXPO_PUBLIC_STABLE_DIFFUSION_KEY,
  
  // External APIs
  OPENAI: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  GOOGLE_SEARCH: process.env.EXPO_PUBLIC_GOOGLE_SEARCH_KEY,
  GOOGLE_SEARCH_CX: process.env.EXPO_PUBLIC_GOOGLE_SEARCH_CX,
  UNSPLASH: process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY,
  PEXELS: process.env.EXPO_PUBLIC_PEXELS_API_KEY,
  PIXABAY: process.env.EXPO_PUBLIC_PIXABAY_KEY,
  FLICKR: process.env.EXPO_PUBLIC_FLICKR_KEY,
  GIPHY: process.env.EXPO_PUBLIC_GIPHY_KEY,
  BING: process.env.EXPO_PUBLIC_BING_KEY,
  OPENVERSE: process.env.EXPO_PUBLIC_OPENVERSE_KEY,
  
  // Auth & Services
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  ONESIGNAL_APP_ID: process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID,
  ONESIGNAL_REST_API_KEY: process.env.ONESIGNAL_REST_API_KEY,
  GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
};

// ==================== DATABASE CONFIGURATION ====================
const DATABASE_CONFIG = {
  MONGODB_URI: process.env.MONGODB_URI || process.env.EXPO_PUBLIC_MONGODB_URI,
  REDIS_TTL_SECONDS: parseInt(process.env.REDIS_TTL_SECONDS || '30', 10)
};

// ==================== SERVER CONFIGURATION ====================
const SERVER_CONFIG = {
  PORT: Number(process.env.PORT) || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL || 'https://kronop-76zy.onrender.com'
};

// ==================== HELPER FUNCTIONS ====================


module.exports = {
  API_KEYS,
  DATABASE_CONFIG,
  SERVER_CONFIG
};
