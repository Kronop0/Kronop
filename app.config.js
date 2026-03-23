const appJson = {
  expo: {
    name: "kronop",
    slug: "kronop",
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
      "*/"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.kronopaman.kronop"
    },
    android: {
      package: "com.kronopaman.kronop",
      versionCode: 2,
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
        projectId: "61a99a9f-ea90-4fa5-aaec-132e2d8bb76c"
      }
    }
  }
};

module.exports = () => ({
  ...appJson.expo,
  plugins: [
    '@react-native-google-signin/google-signin',
    [
      '@spreen/ffmpeg-kit-react-native-config',
      {
        package: 'https'
      }
    ],
    [
      'expo-build-properties',
      {
        android: {
          extraMavenRepos: [
            'https://jitpack.io',
            'mavenCentral()'
          ]
        }
      }
    ]
  ],
  extra: {
    ...appJson.expo.extra,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
    EXPO_PUBLIC_R2_ACCESS_KEY_ID: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '',
    EXPO_PUBLIC_R2_SECRET_ACCESS_KEY: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '',
    EXPO_PUBLIC_R2_ACCOUNT_ID: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
    EXPO_PUBLIC_R2_ENDPOINT: process.env.EXPO_PUBLIC_R2_ENDPOINT || '',
    EXPO_PUBLIC_BUCKET_REELS: process.env.EXPO_PUBLIC_BUCKET_REELS || '',
    EXPO_PUBLIC_BUCKET_VIDEO: process.env.EXPO_PUBLIC_BUCKET_VIDEO || 'kronop-video',
    EXPO_PUBLIC_BUCKET_LIVE: process.env.EXPO_PUBLIC_BUCKET_LIVE || '',
    EXPO_PUBLIC_BUCKET_STORY: process.env.EXPO_PUBLIC_BUCKET_STORY || '',
    EXPO_PUBLIC_BUCKET_PHOTO: process.env.EXPO_PUBLIC_BUCKET_PHOTO || 'kronop-photos',
    EXPO_PUBLIC_BUCKET_SONG: process.env.EXPO_PUBLIC_BUCKET_SONG || '',
  },
});