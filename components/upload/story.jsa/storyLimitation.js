// Story Limitation System - 24 Hours Auto-Delete
// Manages expiry timestamps and automatic cleanup for stories

const { S3Client, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// R2 Configuration from environment
const r2Config = {
  region: 'auto',
  endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
};

// Initialize S3 client for R2
const s3Client = new S3Client(r2Config);

const storyLimitation = {
  // Add expiry timestamp to metadata
  addExpiryTimestamp: (metadata) => {
    const currentTime = new Date();
    const expiryTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    return {
      ...metadata,
      expiresAt: expiryTime.toISOString(),
      uploadTime: currentTime.toISOString(),
      storyDuration: 24 * 60 * 60 * 1000 // 24 hours in milliseconds
    };
  },

  // Check if a story has expired
  isStoryExpired: (expiresAt) => {
    const currentTime = new Date();
    const expiryDate = new Date(expiresAt);
    return currentTime > expiryDate;
  },

  // Get time remaining for a story
  getTimeRemaining: (expiresAt) => {
    const currentTime = new Date();
    const expiryDate = new Date(expiresAt);
    const timeRemaining = expiryDate - currentTime;
    
    if (timeRemaining <= 0) {
      return { expired: true, hours: 0, minutes: 0 };
    }
    
    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      expired: false,
      hours,
      minutes,
      totalMilliseconds: timeRemaining
    };
  },

  // List all stories in bucket with their metadata
  listAllStories: async () => {
    try {
      const bucketName = process.env.EXPO_PUBLIC_BUCKET_STORY;
      const stories = [];
      
      // List photos
      const photoParams = {
        Bucket: bucketName,
        Prefix: 'stories/photos/',
        MaxKeys: 1000
      };
      
      const photoCommand = new ListObjectsV2Command(photoParams);
      const photoResult = await s3Client.send(photoCommand);
      
      if (photoResult.Contents) {
        for (const object of photoResult.Contents) {
          stories.push({
            key: object.Key,
            type: 'photo',
            lastModified: object.LastModified,
            size: object.Size
          });
        }
      }
      
      // List videos
      const videoParams = {
        Bucket: bucketName,
        Prefix: 'stories/videos/',
        MaxKeys: 1000
      };
      
      const videoCommand = new ListObjectsV2Command(videoParams);
      const videoResult = await s3Client.send(videoCommand);
      
      if (videoResult.Contents) {
        for (const object of videoResult.Contents) {
          stories.push({
            key: object.Key,
            type: 'video',
            lastModified: object.LastModified,
            size: object.Size
          });
        }
      }
      
      console.log(`📖 Found ${stories.length} stories in bucket`);
      return stories;
      
    } catch (error) {
      console.error('❌ Error listing stories:', error);
      return [];
    }
  },

  // Delete expired stories from R2
  deleteExpiredStories: async () => {
    try {
      console.log('🧹 Starting cleanup of expired stories...');
      const stories = await storyLimitation.listAllStories();
      const deletedCount = { photos: 0, videos: 0 };
      
      for (const story of stories) {
        // Check if story is older than 24 hours (reliable fallback check)
        const uploadTime = new Date(story.lastModified);
        const currentTime = new Date();
        const ageInHours = (currentTime - uploadTime) / (1000 * 60 * 60);
        
        if (ageInHours >= 24) {
          try {
            const bucketName = process.env.EXPO_PUBLIC_BUCKET_STORY;
            const deleteParams = {
              Bucket: bucketName,
              Key: story.key
            };
            
            const deleteCommand = new DeleteObjectCommand(deleteParams);
            await s3Client.send(deleteCommand);
            
            console.log(`🗑️ Deleted expired ${story.type}: ${story.key} (${ageInHours.toFixed(1)}h old)`);
            
            if (story.type === 'photo') {
              deletedCount.photos++;
            } else {
              deletedCount.videos++;
            }
            
          } catch (deleteError) {
            console.error(`❌ Failed to delete ${story.key}:`, deleteError);
          }
        } else {
          console.log(`⏰ Story still active: ${story.key} (${ageInHours.toFixed(1)}h old)`);
        }
      }
      
      console.log(`✅ Cleanup completed: ${deletedCount.photos} photos, ${deletedCount.videos} videos deleted`);
      return {
        success: true,
        deletedCount,
        totalDeleted: deletedCount.photos + deletedCount.videos
      };
      
    } catch (error) {
      console.error('❌ Error in cleanup process:', error);
      return {
        success: false,
        error: error.message,
        deletedCount: { photos: 0, videos: 0 },
        totalDeleted: 0
      };
    }
  },

  // Schedule automatic cleanup (run every hour)
  startAutoCleanup: () => {
    console.log('⏰ Starting automatic story cleanup scheduler...');
    
    // Run cleanup immediately on start
    storyLimitation.deleteExpiredStories();
    
    // Schedule cleanup to run every hour
    const cleanupInterval = setInterval(() => {
      console.log('⏰ Running scheduled cleanup...');
      storyLimitation.deleteExpiredStories();
    }, 60 * 60 * 1000); // 1 hour in milliseconds
    
    // Return cleanup function to stop the scheduler if needed
    return () => {
      clearInterval(cleanupInterval);
      console.log('⏹️ Story cleanup scheduler stopped');
    };
  },

  // Get story statistics
  getStoryStats: async () => {
    try {
      const stories = await storyLimitation.listAllStories();
      const stats = {
        total: stories.length,
        photos: 0,
        videos: 0,
        expiringSoon: 0, // Less than 2 hours remaining
        expired: 0
      };
      
      const currentTime = new Date();
      
      for (const story of stories) {
        // Count by type
        if (story.type === 'photo') {
          stats.photos++;
        } else {
          stats.videos++;
        }
        
        // Check age (fallback for stories without expiry metadata)
        const uploadTime = new Date(story.lastModified);
        const ageInHours = (currentTime - uploadTime) / (1000 * 60 * 60);
        
        if (ageInHours >= 24) {
          stats.expired++;
        } else if (ageInHours >= 22) {
          stats.expiringSoon++;
        }
      }
      
      return stats;
      
    } catch (error) {
      console.error('❌ Error getting story stats:', error);
      return {
        total: 0,
        photos: 0,
        videos: 0,
        expiringSoon: 0,
        expired: 0
      };
    }
  }
};

module.exports = storyLimitation;
