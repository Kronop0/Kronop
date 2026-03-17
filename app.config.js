const appJson = require('./app.json');
require('dotenv').config();

module.exports = () => ({
  ...appJson.expo,
  extra: {
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    EXPO_PUBLIC_R2_ACCESS_KEY_ID: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '',
    EXPO_PUBLIC_R2_SECRET_ACCESS_KEY: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '',
    EXPO_PUBLIC_R2_ACCOUNT_ID: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
    EXPO_PUBLIC_BUCKET_REELS: process.env.EXPO_PUBLIC_BUCKET_REELS || '',
    EXPO_PUBLIC_BUCKET_STORY: process.env.EXPO_PUBLIC_BUCKET_STORY || 'kronop-story',
    EXPO_PUBLIC_R2_ENDPOINT: process.env.EXPO_PUBLIC_R2_ENDPOINT || '',
  },
});


