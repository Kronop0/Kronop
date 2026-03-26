import { cloudVideoManager, VideoData, ChunkManager } from './cloudVideoManager';
import { EnhancedVideoData, fetchEnhancedVideoData, getVideoStreamingUrl as getEnhancedVideoStreamingUrl } from './videoDataService';

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl: string;
  duration: string;
  views: string;
  likes: number;
  isLiked: boolean;
  category: string;
  user: {
    name: string;
    avatar: string;
    isSupported: boolean;
    supporters: number;
  };
  description: string;
  comments: number;
  videoKey?: string;
  chunkManager?: ChunkManager;
}

/**
 * Transform cloud video data to app video format
 */
function transformVideoData(videoData: VideoData): Video {
  const config = cloudVideoManager.getConfig();
  
  const videoUrl = cloudVideoManager.getVideoUrl(videoData.videoKey);
  const thumbnailUrl = cloudVideoManager.getThumbnailUrl(videoData.thumbnailKey);
  const avatarUrl = cloudVideoManager.getAvatarUrl(videoData.user.avatarKey);
  
  return {
    id: videoData.id,
    title: videoData.title,
    thumbnail: thumbnailUrl,
    videoUrl: videoUrl,
    duration: videoData.duration,
    views: formatViews(videoData.views),
    likes: videoData.likes,
    isLiked: false,
    category: videoData.category,
    user: {
      name: videoData.user.name,
      avatar: avatarUrl,
      isSupported: videoData.user.isSupported,
      supporters: videoData.user.supporters,
    },
    description: videoData.description,
    comments: videoData.comments,
    videoKey: videoData.videoKey,
    chunkManager: undefined,
  };
}

/**
 * Transform enhanced video data to app video format
 */
function transformEnhancedVideoData(enhancedVideoData: EnhancedVideoData): Video {
  return {
    id: enhancedVideoData.id,
    title: enhancedVideoData.title,
    thumbnail: enhancedVideoData.thumbnailUrl,
    videoUrl: enhancedVideoData.videoUrl,
    duration: enhancedVideoData.duration,
    views: enhancedVideoData.views,
    likes: enhancedVideoData.likes,
    isLiked: false,
    category: enhancedVideoData.category,
    user: {
      name: enhancedVideoData.user.name,
      avatar: enhancedVideoData.user.avatarUrl,
      isSupported: enhancedVideoData.user.isSupported,
      supporters: enhancedVideoData.user.supporters,
    },
    description: enhancedVideoData.description,
    comments: enhancedVideoData.comments,
    videoKey: enhancedVideoData.videoUrl.split('/').pop() || '', // Extract videoKey from URL
    chunkManager: enhancedVideoData.chunkManager,
  };
}

/**
 * Fetch long videos from cloud with enhanced metadata
 */
export async function fetchLongVideos(): Promise<Video[]> {
  try {
    // Use enhanced video data service for better metadata handling
    const enhancedVideoDataList = await fetchEnhancedVideoData();
    
    // Handle empty data gracefully
    if (!enhancedVideoDataList || enhancedVideoDataList.length === 0) {
      console.log('No videos available from enhanced service');
      return [];
    }
    
    // Transform enhanced data to Video interface
    const videos = enhancedVideoDataList.map(transformEnhancedVideoData);
    
    // Initialize chunk managers for videos with videoKey (DISABLED for now)
    return videos.map(video => {
      // Disable chunk manager to avoid 400 errors - use direct streaming
      return { ...video, chunkManager: undefined };
    });
  } catch (error) {
    console.error('Error fetching long videos from enhanced service:', error);
    
    // Fallback to original method if enhanced service fails
    try {
      const videoDataList = await cloudVideoManager.fetchLongVideos();
      
      if (!videoDataList || videoDataList.length === 0) {
        console.log('No videos available from cloud fallback');
        return [];
      }
      
      const videos = videoDataList.map(transformVideoData);
      
      return videos.map(video => {
        return { ...video, chunkManager: undefined };
      });
    } catch (fallbackError) {
      console.error('Both enhanced and fallback video fetching failed:', fallbackError);
      return [];
    }
  }
}

/**
 * Get long videos with caching
 */
export async function getLongVideos(): Promise<Video[]> {
  try {
    const videos = await fetchLongVideos();
    return videos;
  } catch (error) {
    console.error('getLongVideos: Error fetching videos:', error);
    return [];
  }
}

/**
 * Get optimized streaming URL for video with enhanced metadata support
 */
export function getVideoStreamingUrl(video: Video): string {
  // Use enhanced video streaming URL if available
  if (video.videoKey) {
    return cloudVideoManager.getVideoUrl(video.videoKey);
  }
  
  return video.videoUrl;
}

/**
 * Get video metadata bundle (Thumbnail, Title, Description) for UI
 * @param videoId - Video ID
 */
export async function getVideoMetadataBundle(videoId: string): Promise<{
  thumbnailUrl: string;
  title: string;
  description: string;
} | null> {
  try {
    const videos = await fetchLongVideos();
    const video = videos.find(v => v.id === videoId);
    
    if (!video) {
      return null;
    }
    
    return {
      thumbnailUrl: video.thumbnail,
      title: video.title,
      description: video.description,
    };
  } catch (error) {
    console.error('Error fetching video metadata bundle:', error);
    return null;
  }
}

/**
 * Initialize chunk manager for video
 */
export function initializeChunkManager(video: Video): Video {
  // DISABLED - Chunk manager causing 400 errors
  // if (!video.videoKey) {
  //   return video;
  // }
  
  // const chunkManager = cloudVideoManager.initializeChunkManager(video.videoKey);
  
  // return {
  //   ...video,
  //   chunkManager,
  //   videoUrl: getVideoStreamingUrl({ ...video, chunkManager }),
  // };
  
  return video;
}

/**
 * Toggle like status
 */
export function toggleLike(videoId: string, videos: Video[]): Video[] {
  return videos.map(video => {
    if (video.id === videoId) {
      return {
        ...video,
        isLiked: !video.isLiked,
        likes: video.isLiked ? video.likes - 1 : video.likes + 1,
      };
    }
    return video;
  });
}

/**
 * Format views number
 */
export function formatViews(views: number): string {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + 'M';
  }
  if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K';
  }
  return views.toString();
}

/**
 * Cleanup video resources
 */
export function cleanupVideoResources(videos: Video[]): void {
  // DISABLED - Chunk manager not available
  // videos.forEach(video => {
  //   if (video.chunkManager) {
  //     video.chunkManager.cleanup();
  //   }
  // });
}

/**
 * Preload video chunks
 */
export async function preloadVideoChunks(video: Video, startIndex: number = 0, count: number = 3): Promise<void> {
  // DISABLED - Chunk manager not available
  // if (video.chunkManager) {
  //   await video.chunkManager.preloadChunks(startIndex, count);
  // }
}

/**
 * Get video chunk URL
 */
export function getChunkUrl(video: Video, chunkIndex: number): string | null {
  // DISABLED - Chunk manager not available
  // if (video.chunkManager) {
  //   return video.chunkManager.getChunkUrl(chunkIndex);
  // }
  return null;
}

/**
 * Check if chunk is loaded
 */
export function isChunkLoaded(video: Video, chunkIndex: number): boolean {
  // DISABLED - Chunk manager not available
  // if (video.chunkManager) {
  //   return video.chunkManager.isChunkLoaded(chunkIndex);
  // }
  return false;
}
