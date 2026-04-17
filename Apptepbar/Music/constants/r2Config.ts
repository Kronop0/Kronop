// Cloudflare R2 — Song bucket configuration
// Configure via .env file at project root (loads automatically)

// Config from .env only - no hardcoded values
const defaultConfig = {
  accountId: '',
  accessKeyId: '',
  secretAccessKey: '',
  endpoint: '',
  publicUrl: '',
  bucketSong: 'kronop-songs',
};

// Load from .env if available (Expo auto-loads .env files)
export const R2_SONG_CONFIG = {
  accountId: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID,
  accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY,
  endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT,
  publicUrl: process.env.EXPO_PUBLIC_R2_PUBLIC_URL,
  bucketSong: process.env.EXPO_PUBLIC_BUCKET_SONG || defaultConfig.bucketSong,
};

// Helper to check if R2 is configured
export const isR2Configured = (): boolean => {
  return !!(
    R2_SONG_CONFIG.accessKeyId &&
    R2_SONG_CONFIG.secretAccessKey &&
    R2_SONG_CONFIG.endpoint &&
    R2_SONG_CONFIG.bucketSong
  );
};
