const appJson = {
  expo: {
    name: "kronop-app",
    slug: "kronop-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};

require('dotenv').config();

module.exports = () => ({
  ...appJson.expo,
  plugins: [
    '@react-native-google-signin/google-signin',
  ],
  extra: {
    ...appJson.expo.extra,
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


