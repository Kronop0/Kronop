// Profile Fetch Service - Gets real user data from profile URL
// Extracts user name and channel logo dynamically

const profileService = {
  // Fetch user profile data from profile URL
  fetchUserProfile: async (profileUrl = null) => {
    try {
      console.log('👤 Fetching user profile data...');
      
      // If no profile URL provided, try to get from local storage or context
      if (!profileUrl) {
        // Try to get from localStorage (web) or AsyncStorage (React Native)
        if (typeof window !== 'undefined' && window.localStorage) {
          profileUrl = window.localStorage.getItem('userProfileUrl');
        } else {
          // For React Native, use AsyncStorage
          try {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            profileUrl = await AsyncStorage.getItem('userProfileUrl');
          } catch (asyncError) {
            console.log('👤 AsyncStorage not available:', asyncError.message);
          }
        }
      }
      
      // If still no profile URL, try to get from global state or context
      if (!profileUrl) {
        try {
          // Check if there's a global user context or state
          if (typeof global !== 'undefined' && global.userProfile) {
            console.log('👤 Using global user profile');
            const profile = global.userProfile;
            return {
              userName: profile.userName || profile.name || 'unknown_user',
              channelLogo: profile.channelLogo || profile.logo || '',
              profileUrl: profileUrl || '',
              source: 'global'
            };
          }
          
          // Try to get from React Navigation/Context
          if (typeof global !== 'undefined' && global.auth) {
            console.log('👤 Using global auth state');
            const auth = global.auth;
            return {
              userName: auth.user?.displayName || auth.user?.email?.split('@')[0] || 'unknown_user',
              channelLogo: auth.user?.photoURL || '',
              profileUrl: profileUrl || '',
              source: 'auth'
            };
          }
        } catch (globalError) {
          console.log('👤 No global profile found:', globalError.message);
        }
        
        console.warn('⚠️ No profile URL found, using empty profile');
        return {
          userName: 'unknown_user',
          channelLogo: '',
          profileUrl: '',
          source: 'fallback'
        };
      }
      
      // Fetch profile data
      const response = await fetch(profileUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.status}`);
      }
      
      const profileData = await response.json();
      
      // Extract user name and channel logo from profile data
      const userProfile = {
        userName: profileData?.name || profileData?.userName || profileData?.displayName || '',
        channelLogo: profileData?.channelLogo || profileData?.logo || profileData?.avatar || profileData?.profileImage || '',
        profileUrl: profileUrl,
        // Additional profile data that might be useful
        bio: profileData?.bio || '',
        email: profileData?.email || '',
        userId: profileData?.id || profileData?.userId || ''
      };
      
      console.log('✅ User profile fetched successfully:', userProfile);
      return userProfile;
      
    } catch (error) {
      console.error('❌ Failed to fetch user profile:', error);
      
      // Return empty profile on error
      return {
        userName: '',
        channelLogo: '',
        profileUrl: '',
        error: error.message
      };
    }
  },

  // Save profile URL to local storage
  saveProfileUrl: async (profileUrl) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('userProfileUrl', profileUrl);
      } else {
        // For React Native, use AsyncStorage
        // const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        // await AsyncStorage.setItem('userProfileUrl', profileUrl);
      }
      console.log('💾 Profile URL saved:', profileUrl);
    } catch (error) {
      console.error('❌ Failed to save profile URL:', error);
    }
  },

  // Clear profile data
  clearProfile: async () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem('userProfileUrl');
      } else {
        // For React Native, use AsyncStorage
        // const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        // await AsyncStorage.removeItem('userProfileUrl');
      }
      console.log('🗑️ Profile data cleared');
    } catch (error) {
      console.error('❌ Failed to clear profile data:', error);
    }
  }
};

module.exports = profileService;
