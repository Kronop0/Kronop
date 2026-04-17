import registerRootComponent from 'expo/src/launch/registerRootComponent';

import App from 'expo-router/entry';

// Global error handling for app startup
console.error('🚀 AppEntry.js - Starting app initialization...');

// Register TrackPlayer service asynchronously with better error handling
(async () => {
  try {
    console.error('🎵 Attempting to register TrackPlayer service...');
    const TrackPlayer = (await import('react-native-track-player')).default;
    TrackPlayer.registerPlaybackService(() => require('./service'));
    console.error('✅ TrackPlayer service registered successfully');
  } catch (error) {
    console.error('🔴 TrackPlayer registration failed:', error);
    console.error('🔴 TrackPlayer error details:', error.message, error.stack);
  }
})();

// Register the app with error handling
try {
  console.error('📱 Registering root component...');
  registerRootComponent(App);
  console.error('✅ Root component registered successfully');
} catch (error) {
  console.error('🔴 Failed to register root component:', error);
  console.error('🔴 Registration error details:', error.message, error.stack);
}
