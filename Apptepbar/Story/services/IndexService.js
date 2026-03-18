// Index Service - Fetches Story URLs and User Profile Details from Cloud R2
// This service provides video/image URLs along with complete user profile information

const r2StoryService = require('./R2 service.js');

console.log('[KRONOP-DEBUG] 📦 Index Service initializing...');

class IndexService {
  constructor() {
    console.log('[KRONOP-DEBUG] 🔧 Index Service constructor called');
    
    // User profile cache for performance
    this.userProfileCache = new Map();
  }

  /**
   * Fetch story with complete user profile information
   * @param {string} storyId - Story ID
   * @returns {Object} Story with user profile
   */
  async fetchStoryWithProfile(storyId) {
    console.log(`[KRONOP-DEBUG] 🎯 Fetching story with profile: ${storyId}`);
    
    try {
      const story = await r2StoryService.getStoryById(storyId);
      
      if (!story) {
        console.log(`[KRONOP-DEBUG] ❌ Story not found: ${storyId}`);
        return null;
      }

      // Fetch user profile for this story
      const userProfile = await this.fetchUserProfile(story.userId || 'default-user');
      
      return {
        ...story,
        user: userProfile
      };
    } catch (error) {
      console.error('[KRONOP-DEBUG] ❌ Error fetching story with profile:', error);
      return null;
    }
  }

  /**
   * Fetch all stories with user profile information
   * @returns {Array} Array of stories with user profiles
   */
  async fetchAllStoriesWithProfiles() {
    console.log('[KRONOP-DEBUG] 🔄 Fetching all stories with profiles...');
    
    try {
      const stories = await r2StoryService.fetchStories();
      
      const storiesWithProfiles = await Promise.all(
        stories.map(async (story) => {
          const userProfile = await this.fetchUserProfile(story.userId || this.extractUserIdFromPath(story.bucketPath));
          return {
            ...story,
            user: userProfile
          };
        })
      );
      
      console.log(`[KRONOP-DEBUG] ✅ Fetched ${storiesWithProfiles.length} stories with profiles`);
      return storiesWithProfiles;
    } catch (error) {
      console.error('[KRONOP-DEBUG] ❌ Error fetching stories with profiles:', error);
      return [];
    }
  }

  /**
   * Fetch user profile from R2 or backend
   * @param {string} userId - User ID
   * @returns {Object} User profile data
   */
  async fetchUserProfile(userId) {
    console.log(`[KRONOP-DEBUG] 👤 Fetching user profile: ${userId}`);
    
    // Check cache first
    if (this.userProfileCache.has(userId)) {
      console.log(`[KRONOP-DEBUG] 💾 Using cached profile for: ${userId}`);
      return this.userProfileCache.get(userId);
    }

    // TODO: Replace with actual backend API call when ready
    // For now, return mock user profile data
    const userProfile = this.getDefaultUserProfile(userId);
    
    // Cache the profile
    this.userProfileCache.set(userId, userProfile);
    
    return userProfile;
  }

  /**
   * Get default user profile (mock data)
   * In production, this will be replaced with actual API call
   */
  getDefaultUserProfile(userId) {
    // Generate consistent mock data based on userId
    const userNames = [
      'Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Neha Singh', 
      'Vikram Verma', 'Anjali Gupta', 'Rohan Joshi', 'Kavita Reddy',
      'Arjun Nair', 'Divya Iyer', 'Karan Malhotra', 'Pooja Mehta'
    ];
    
    const channelNames = [
      'TravelDiaries', 'FoodieCorner', 'TechTalks', 'FashionFiesta',
      'MusicVibes', 'FitnessGoals', 'ArtGallery', 'NatureLover',
      'ComedyClub', 'NewsDaily', 'SportsZone', 'CookingMaster'
    ];
    
    // Use userId to get consistent index
    const index = userId ? parseInt(userId.replace(/\D/g, '')) % 12 : Math.floor(Math.random() * 12);
    
    const supporters = Math.floor(Math.random() * 10000) + 100;
    const supporting = Math.floor(Math.random() * 500) + 10;
    
    return {
      userId: userId || `user-${Date.now()}`,
      userName: userNames[index] || 'User',
      channelName: channelNames[index] || 'Channel',
      avatar: `https://pub-a59d5a6739a14835816a2c0d2e12fc46.r2.dev/avatars/${userId || 'default'}.jpg`,
      supporters: supporters,
      supporting: supporting,
      isVerified: supporters > 5000,
      bio: 'Welcome to my channel! 🎉',
      followers: Math.floor(supporters * 0.8),
      following: Math.floor(supporting * 1.2),
      totalStories: Math.floor(Math.random() * 50) + 1,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    };
  }

  /**
   * Extract user ID from bucket path
   * Path format: stories/userId/filename.ext
   */
  extractUserIdFromPath(bucketPath) {
    if (!bucketPath) return 'default-user';
    
    const parts = bucketPath.split('/');
    if (parts.length >= 2) {
      return parts[1] || 'default-user';
    }
    return 'default-user';
  }

  /**
   * Fetch video URL with quality options
   * @param {string} storyId - Story ID
   * @returns {Object} Video URLs with different qualities
   */
  async fetchVideoUrls(storyId) {
    console.log(`[KRONOP-DEBUG] 🎬 Fetching video URLs for: ${storyId}`);
    
    try {
      const story = await r2StoryService.getStoryById(storyId);
      
      if (!story || story.type !== 'video') {
        return null;
      }

      return {
        original: story.url,
        thumbnail: story.thumbnailUrl,
        fallback: story.fallbackUrl,
        duration: story.duration || 0
      };
    } catch (error) {
      console.error('[KRONOP-DEBUG] ❌ Error fetching video URLs:', error);
      return null;
    }
  }

  /**
   * Fetch image URL with variants
   * @param {string} storyId - Story ID
   * @returns {Object} Image URLs with different sizes
   */
  async fetchImageUrls(storyId) {
    console.log(`[KRONOP-DEBUG] 🖼️ Fetching image URLs for: ${storyId}`);
    
    try {
      const story = await r2StoryService.getStoryById(storyId);
      
      if (!story || story.type !== 'image') {
        return null;
      }

      return {
        original: story.url,
        thumbnail: story.thumbnailUrl || story.url,
        fallback: story.fallbackUrl
      };
    } catch (error) {
      console.error('[KRONOP-DEBUG] ❌ Error fetching image URLs:', error);
      return null;
    }
  }

  /**
   * Get story details for StorySection display
   * Returns story with user avatar and channel name for overlay
   */
  async getStoryForDisplay(storyId) {
    console.log(`[KRONOP-DEBUG] 📱 Getting story for display: ${storyId}`);
    
    const storyWithProfile = await this.fetchStoryWithProfile(storyId);
    
    if (!storyWithProfile) {
      return null;
    }

    return {
      id: storyWithProfile.id,
      type: storyWithProfile.type,
      story_type: storyWithProfile.story_type,
      thumbnailUrl: storyWithProfile.thumbnailUrl,
      url: storyWithProfile.url,
      // User info for overlay on story box
      userAvatar: storyWithProfile.user?.avatar,
      userName: storyWithProfile.user?.userName,
      channelName: storyWithProfile.user?.channelName,
      supporters: storyWithProfile.user?.supporters,
      isVerified: storyWithProfile.user?.isVerified
    };
  }

  /**
   * Clear user profile cache
   */
  clearCache() {
    console.log('[KRONOP-DEBUG] 🗑️ Clearing user profile cache...');
    this.userProfileCache.clear();
  }
}

// Export singleton instance
console.log('[KRONOP-DEBUG] 🏭 Creating Index Service singleton...');
const indexService = new IndexService();
console.log('[KRONOP-DEBUG] ✅ Index Service ready for use');

module.exports = indexService;
