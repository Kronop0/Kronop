// Video Details Index Boss - Strict Data Collector
// Collects only 6 essential data points and filters out everything else

import TitleHandler from './TitleHandler';
import DescriptionHandler from './DescriptionHandler';
import ThumbnailHandler from './ThumbnailHandler';
import TagsHandler from './TagsHandler';
import CategoryHandler from './CategoryHandler';
import { UserInfoHandler } from './UserInfoHandler';
import R2Thumbnail from '../R2Thumbnail';

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

      // Validation: Check if all required data is present
      const errors = [];
      
      if (!handlers.title || handlers.title.trim() === '') {
        errors.push('Title is required');
      }
      
      if (!handlers.userInfo || !handlers.userInfo.userId) {
        errors.push('User ID is required');
      }

      // If validation errors, don't proceed
      if (errors.length > 0) {
        console.error('❌ VIDEO DETAILS VALIDATION FAILED:');
        errors.forEach(error => console.error(`  - ${error}`));
        console.log('==========================================');
        console.log('🚫 UPLOAD BLOCKED: Missing required data prevents upload');
        console.log('==========================================');
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }

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

      // Final validation before upload
      if (!videoDetails.title || videoDetails.title.trim() === '') {
        console.error('❌ UPLOAD BLOCKED: Title is required for upload');
        console.log('==========================================');
        throw new Error('Cannot upload without title');
      }

      if (!videoDetails.userInfo.userId) {
        console.error('❌ UPLOAD BLOCKED: User ID is required for upload');
        console.log('==========================================');
        throw new Error('Cannot upload without user ID');
      }

      // Handle thumbnail - check if it's already a cloud URL or needs upload
      let thumbnailUrl = null;
      if (videoDetails.thumbnail) {
        // Check if thumbnail is already a cloud URL (starts with https://)
        if (videoDetails.thumbnail.startsWith('https://')) {
          console.log('VideoDetailsIndex: Using existing cloud thumbnail URL:', videoDetails.thumbnail);
          thumbnailUrl = videoDetails.thumbnail;
        } else {
          // It's a local file - DON'T upload here, let VideoUpload handle it
          console.log('VideoDetailsIndex: Local thumbnail detected, will upload after video succeeds');
          console.log('VideoDetailsIndex: Local URI:', videoDetails.thumbnail);
          // Pass local URI as-is - VideoUpload will handle the upload
          thumbnailUrl = videoDetails.thumbnail;
        }
      }

      // Create clean metadata for r2Server
      const cleanMetadata = {
        // Only the 6 essential data points
        title: videoDetails.title,
        description: videoDetails.description,
        thumbnail: thumbnailUrl, // Use R2 URL instead of local URI
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
        hasThumbnail: !!thumbnailUrl,
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
  UserInfoHandler,
  R2Thumbnail
};

export default VideoDetailsIndex;