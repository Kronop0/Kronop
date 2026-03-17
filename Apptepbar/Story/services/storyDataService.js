// Story Data Service - Integration layer for R2 service
// This file shows how to use R2 service to fetch and format stories for StorySection

const r2StoryService = require('./R2 service.js');

// [KRONOP-DEBUG] Story Data Service initialized
console.log('[KRONOP-DEBUG] 📦 Story Data Service initializing...');

class StoryDataService {
  constructor() {
    console.log('[KRONOP-DEBUG] 🔧 Story Data Service constructor called');
  }

  /**
   * Fetch stories from R2 and format for StorySection
   */
  async fetchStoriesForSection() {
    console.log('[KRONOP-DEBUG] 🔄 fetchStoriesForSection called');
    
    try {
      // Fetch raw stories from R2
      const rawStories = await r2StoryService.fetchStories();
      console.log(`[KRONOP-DEBUG] 📥 Received ${rawStories.length} raw stories from R2`);

      // Group stories by user (for now, group all under a demo user)
      // In real app, you would group by actual user IDs from your auth system
      const groupedStories = this.groupStoriesByUser(rawStories);
      
      console.log(`[KRONOP-DEBUG] 📊 Created ${groupedStories.length} story groups`);
      return groupedStories;

    } catch (error) {
      console.error('[KRONOP-DEBUG] ❌ Error in fetchStoriesForSection:', error);
      console.log('[KRONOP-DEBUG] 🔄 Using fallback demo stories with proper types...');
      
      // Return fallback demo stories with proper types and working URLs
      return this.getFallbackDemoStories();
    }
  }

  /**
   * Get fallback demo stories when R2 service is unavailable
   */
  getFallbackDemoStories() {
    console.log('[KRONOP-DEBUG] 🎭 Creating fallback demo stories with local assets...');
    
    // Demo stories with local assets instead of non-existent R2 URLs
    const demoStories = [
      {
        id: 'demo-story-1',
        title: 'Demo Story 1',
        story_type: 'image',
        type: 'image',
        url: null, // Use local asset
        imageUrl: null, // Use local asset
        videoUrl: undefined,
        thumbnailUrl: null, // Use local asset
        duration: undefined,
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        size: 50000,
        fileName: 'demo-story-1.jpg',
        bucketPath: 'stories/demo-story-1.jpg',
        useLocalAsset: true
      },
      {
        id: 'demo-story-2',
        title: 'Demo Story 2',
        story_type: 'image',
        type: 'image',
        url: null, // Use local asset
        imageUrl: null, // Use local asset
        videoUrl: undefined,
        thumbnailUrl: null, // Use local asset
        duration: undefined,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        size: 45000,
        fileName: 'demo-story-2.jpg',
        bucketPath: 'stories/demo-story-2.jpg',
        useLocalAsset: true
      },
      {
        id: 'demo-story-3',
        title: 'Demo Story 3',
        story_type: 'video',
        type: 'video',
        url: null, // Use local asset
        imageUrl: undefined,
        videoUrl: null, // Use local asset
        thumbnailUrl: null, // Use local asset
        duration: 5,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
        size: 1000000,
        fileName: 'demo-story-3.mp4',
        bucketPath: 'stories/demo-story-3.mp4',
        useLocalAsset: true
      }
    ];

    console.log(`[KRONOP-DEBUG] 📦 Created ${demoStories.length} demo stories`);
    
    // Group demo stories by users
    return this.groupStoriesByUser(demoStories);
  }

  /**
   * Group individual stories into user groups
   */
  groupStoriesByUser(stories) {
    console.log('[KRONOP-DEBUG] 🗂️ Grouping stories by user...');

    // Create user groups based on actual story data
    // In real app, you would have actual user data from your auth system
    const userGroups = {};

    stories.forEach((story, index) => {
      // Create a user ID from the story (simplified logic)
      // In real app, this would come from your user authentication system
      const userId = `user-${index % 3 + 1}`; // Cycle through 3 demo users
      const userNames = ['User Alpha', 'User Beta', 'User Gamma'];
      const userIndex = index % 3;
      
      // Create user group if not exists
      if (!userGroups[userId]) {
        userGroups[userId] = {
          userId: userId,
          userName: userNames[userIndex],
          userAvatar: story.thumbnailUrl || story.url, // Use story thumbnail as avatar
          stories: [],
          latestTimestamp: story.created_at
        };
        
        console.log(`[KRONOP-DEBUG] 👤 Created user group: ${userNames[userIndex]} (${userId})`);
        console.log(`[KRONOP-DEBUG]   - User avatar: ${userGroups[userId].userAvatar}`);
      }

      // Add story to user group
      const storyForGroup = {
        id: story.id,
        imageUrl: story.imageUrl,
        videoUrl: story.videoUrl,
        thumbnailUrl: story.thumbnailUrl,
        fallbackUrl: story.fallbackUrl, // Add fallback URL
        duration: story.duration,
        type: story.type, // 'video' or 'image'
        story_type: story.story_type, // 'video' or 'image'
        timestamp: new Date(story.created_at),
        url: story.url // Main URL from R2 - THIS IS THE KEY FIX
      };

      userGroups[userId].stories.push(storyForGroup);

      // Update latest timestamp if this story is newer
      const storyTime = new Date(story.created_at).getTime();
      const groupTime = new Date(userGroups[userId].latestTimestamp).getTime();
      if (storyTime > groupTime) {
        userGroups[userId].latestTimestamp = story.created_at;
      }

      console.log(`[KRONOP-DEBUG] 📝 Added story to group: ${story.title} (${story.type})`);
      console.log(`[KRONOP-DEBUG]   - Story URL: ${story.url}`);
      console.log(`[KRONOP-DEBUG]   - Story imageUrl: ${story.imageUrl}`);
      console.log(`[KRONOP-DEBUG]   - Story videoUrl: ${story.videoUrl}`);
      console.log(`[KRONOP-DEBUG]   - Story thumbnailUrl: ${story.thumbnailUrl}`);
    });

    // Convert to array and sort by latest timestamp
    const groupedArray = Object.values(userGroups).sort((a, b) => {
      return new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime();
    });

    console.log(`[KRONOP-DEBUG] ✅ Created ${groupedArray.length} user groups`);
    groupedArray.forEach((group, index) => {
      console.log(`[KRONOP-DEBUG]   ${index + 1}. ${group.userName} - ${group.stories.length} stories`);
      console.log(`[KRONOP-DEBUG]      - User avatar: ${group.userAvatar}`);
      
      // Log latest story details
      const latestStory = group.stories[group.stories.length - 1];
      if (latestStory) {
        console.log(`[KRONOP-DEBUG]      - Latest story: ${latestStory.id}`);
        console.log(`[KRONOP-DEBUG]      - Latest story URL: ${latestStory.url}`);
        console.log(`[KRONOP-DEBUG]      - Latest story type: ${latestStory.type}`);
      }
    });

    return groupedArray;
  }

  /**
   * Get stories by type (video or image)
   */
  async fetchStoriesByType(type) {
    console.log(`[KRONOP-DEBUG] 🎯 Fetching stories by type: ${type}`);
    
    try {
      const rawStories = await r2StoryService.fetchStoriesByType(type);
      const groupedStories = this.groupStoriesByUser(rawStories);
      
      console.log(`[KRONOP-DEBUG] 📊 Found ${groupedStories.length} groups with ${type} stories`);
      return groupedStories;
    } catch (error) {
      console.error('[KRONOP-DEBUG] ❌ Error fetching stories by type:', error);
      return [];
    }
  }

  /**
   * Get recent stories
   */
  async fetchRecentStories(hours = 24) {
    console.log(`[KRONOP-DEBUG] ⏰ Fetching recent stories from last ${hours} hours`);
    
    try {
      const rawStories = await r2StoryService.getRecentStories(hours);
      const groupedStories = this.groupStoriesByUser(rawStories);
      
      console.log(`[KRONOP-DEBUG] 📊 Found ${groupedStories.length} groups with recent stories`);
      return groupedStories;
    } catch (error) {
      console.error('[KRONOP-DEBUG] ❌ Error fetching recent stories:', error);
      return [];
    }
  }
}

// Export singleton instance
console.log('[KRONOP-DEBUG] 🏭 Creating Story Data Service singleton...');
const storyDataService = new StoryDataService();
console.log('[KRONOP-DEBUG] ✅ Story Data Service ready for use');

module.exports = storyDataService;
