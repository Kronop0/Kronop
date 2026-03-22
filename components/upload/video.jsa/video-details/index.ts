// Video Details Index Boss - Strict Data Collector
// Collects only 6 essential data points and filters out everything else

import TitleHandler from './TitleHandler';
import DescriptionHandler from './DescriptionHandler';
import ThumbnailHandler from './ThumbnailHandler';
import TagsHandler from './TagsHandler';
import CategoryHandler from './CategoryHandler';
import { UserInfoHandler } from './UserInfoHandler';

export interface VideoDetails {
  title: string;
  description: string;
  thumbnail: string | null;
  tags: string[];
  category: string;
  userInfo: {
    userId: string;
    username?: string;
    email?: string;
  };
}

export interface VideoDetailsHandlers {
  title: string;
  onTitleChange: (title: string) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  thumbnail: string | null;
  onThumbnailChange: (thumbnail: string | null) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  userInfo: VideoDetails['userInfo'];
  onUserInfoChange: (userInfo: VideoDetails['userInfo']) => void;
}

const VideoDetailsIndex = {
  // Strict collector - only allows these 6 data points
  collectVideoDetails: function(handlers: VideoDetailsHandlers): VideoDetails {
    try {
      console.log('VideoDetailsIndex: Collecting strict 6-point data');

      // Strict Filter: Only collect these 6 essential data points
      const strictData: VideoDetails = {
        title: handlers.title?.trim() || '',
        description: handlers.description?.trim() || '',
        thumbnail: handlers.thumbnail || null,
        tags: Array.isArray(handlers.tags) ? handlers.tags.filter(tag => tag.trim()) : [],
        category: handlers.category?.trim() || '',
        userInfo: handlers.userInfo || { userId: '' }
      };

      // Validation: Ensure no extra data leaks through
      Object.keys(strictData).forEach(key => {
        if (!['title', 'description', 'thumbnail', 'tags', 'category', 'userInfo'].includes(key)) {
          console.warn(`VideoDetailsIndex: Blocking unauthorized data field: ${key}`);
          delete (strictData as any)[key];
        }
      });

      // Clean validation
      if (!strictData.title) {
        console.warn('VideoDetailsIndex: Missing required title');
      }
      if (!strictData.userInfo.userId) {
        console.warn('VideoDetailsIndex: Missing required user ID');
      }

      console.log('VideoDetailsIndex: Successfully collected 6-point data', {
        hasTitle: !!strictData.title,
        hasDescription: !!strictData.description,
        hasThumbnail: !!strictData.thumbnail,
        tagsCount: strictData.tags.length,
        hasCategory: !!strictData.category,
        hasUserId: !!strictData.userInfo.userId
      });

      return strictData;

    } catch (error) {
      console.error('VideoDetailsIndex: Data collection failed:', error);
      throw new Error(`Video details collection failed: ${error.message}`);
    }
  },

  // Handover: Send clean data directly to r2Server
  handoverToR2Server: async function(videoDetails: VideoDetails, fileMetadata: any) {
    try {
      console.log('VideoDetailsIndex: Handing over clean data to r2Server');

      // Create clean metadata for r2Server
      const cleanMetadata = {
        // Only the 6 essential data points
        title: videoDetails.title,
        description: videoDetails.description,
        thumbnail: videoDetails.thumbnail,
        tags: videoDetails.tags,
        category: videoDetails.category,
        userInfo: videoDetails.userInfo,
        
        // Essential file metadata (not user data)
        fileName: fileMetadata.name,
        fileSize: fileMetadata.size,
        fileType: fileMetadata.type,
        uploadTime: new Date().toISOString()
      };

      // Filter out any accidental extra data
      const allowedKeys = [
        'title', 'description', 'thumbnail', 'tags', 'category', 'userInfo',
        'fileName', 'fileSize', 'fileType', 'uploadTime'
      ];
      
      Object.keys(cleanMetadata).forEach(key => {
        if (!allowedKeys.includes(key)) {
          console.warn(`VideoDetailsIndex: Removing unauthorized metadata: ${key}`);
          delete (cleanMetadata as any)[key];
        }
      });

      console.log('VideoDetailsIndex: Clean metadata prepared for r2Server', {
        dataPoints: Object.keys(cleanMetadata).length,
        isClean: true
      });

      return cleanMetadata;

    } catch (error) {
      console.error('VideoDetailsIndex: Handover failed:', error);
      throw new Error(`Data handover failed: ${error.message}`);
    }
  },

  // Export all handlers for easy import
  TitleHandler,
  DescriptionHandler,
  ThumbnailHandler,
  TagsHandler,
  CategoryHandler,
  UserInfoHandler
};

export default VideoDetailsIndex;