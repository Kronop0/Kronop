// Story Controller - R2 Bucket Logic
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

// R2 Configuration - All values must be set in .env
const R2_CONFIG = {
  ACCOUNT_ID: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
  ACCESS_KEY_ID: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '',
  SECRET_ACCESS_KEY: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '',
  BUCKET: process.env.EXPO_PUBLIC_BUCKET_STORY || '',
  PUBLIC_URL: 'https://pub-e904e5818e734484a5ead6201a4cefe3.r2.dev',
};

// Initialize S3 Client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_CONFIG.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_CONFIG.ACCESS_KEY_ID,
    secretAccessKey: R2_CONFIG.SECRET_ACCESS_KEY,
  },
});

export interface StoryItem {
  id: string;
  title: string;
  stars: number;
  comments: number;
  shares: number;
  views: number;
  expires: string;
  url?: string;
  story_type?: 'image' | 'video';
  key?: string; // R2 object key for deletion
}

export interface StoryStats {
  total: number;
  stars: number;
  comments: number;
  shares: number;
  views: number;
  expires: string;
}

// Fetch stories directly from R2 bucket
export const fetchStoriesFromR2 = async (): Promise<StoryItem[]> => {
  try {
    console.log('[StoryController] Fetching from R2 bucket:', R2_CONFIG.BUCKET);
    
    const command = new ListObjectsV2Command({
      Bucket: R2_CONFIG.BUCKET,
      MaxKeys: 100,
    });
    
    const response = await s3Client.send(command);
    console.log('[StoryController] R2 response keys:', response.Contents?.length || 0);
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log('[StoryController] No stories found in R2 bucket');
      return [];
    }
    
    const stories: StoryItem[] = [];
    
    for (let i = 0; i < response.Contents.length; i++) {
      const object = response.Contents[i];
      if (object.Key && !object.Key.endsWith('.json') && /\.(jpe?g|png|gif|webp|mp4|mov)$/i.test(object.Key)) {
        const keyParts = object.Key.split('/');
        const fileName = keyParts[keyParts.length - 1];
        const baseName = fileName.replace(/\.[^/.]+$/, '');
        
        // Detect story type based on file extension
        const fileExtension = object.Key.split('.').pop()?.toLowerCase() || '';
        const isVideo = ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(fileExtension);
        const storyType = isVideo ? 'video' : 'image';
        
        stories.push({
          id: `r2_story_${i + 1}`,
          title: baseName,
          stars: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 50),
          shares: Math.floor(Math.random() * 30),
          views: Math.floor(Math.random() * 1000),
          expires: '24h',
          url: `${R2_CONFIG.PUBLIC_URL}/${object.Key}`,
          story_type: storyType,
          key: object.Key, // Store the actual R2 key for deletion
        });
      }
    }
    
    console.log(`[StoryController] Found ${stories.length} stories from R2`);
    return stories;
  } catch (error) {
    console.error('[StoryController] R2 fetch error:', error);
    return [];
  }
};

// Delete story from R2 bucket
export const deleteStoryFromR2 = async (key: string): Promise<boolean> => {
  try {
    console.log(`[StoryController] Deleting from R2: ${key}`);
    
    const command = new DeleteObjectCommand({
      Bucket: R2_CONFIG.BUCKET,
      Key: key,
    });
    
    await s3Client.send(command);
    console.log(`[StoryController] Deleted successfully: ${key}`);
    return true;
  } catch (error) {
    console.error('[StoryController] Delete error:', error);
    throw error;
  }
};
export const calculateStoryStats = (stories: StoryItem[]): StoryStats => {
  const stats = stories.reduce(
    (acc, story) => {
      acc.stars += story.stars;
      acc.comments += story.comments;
      acc.shares += story.shares;
      acc.views += story.views;
      return acc;
    },
    { total: stories.length, stars: 0, comments: 0, shares: 0, views: 0, expires: '24h' }
  );
  return stats;
};

// Get top stories by views
export const getTopStories = (stories: StoryItem[], limit: number = 10): StoryItem[] => {
  return [...stories]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
};

// Main API object
export const storyController = {
  getStories: fetchStoriesFromR2,
  deleteStory: deleteStoryFromR2,
  getStats: calculateStoryStats,
  getTopStories,
};

export default storyController;
