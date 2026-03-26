import { cloudVideoManager, VideoData, ChunkManager } from './cloudVideoManager';

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
 * Fetch long videos from cloud
 */
export async function fetchLongVideos(): Promise<Video[]> {
  try {
    const videoDataList = await cloudVideoManager.fetchLongVideos();
    
    // Handle empty data gracefully
    if (!videoDataList || videoDataList.length === 0) {
      console.log('No videos available from cloud');
      return [];
    }
    
    const videos = videoDataList.map(transformVideoData);
    
    // Initialize chunk managers for videos with videoKey (DISABLED for now)
    return videos.map(video => {
      // Disable chunk manager to avoid 400 errors - use direct streaming
      return { ...video, chunkManager: undefined };
    });
  } catch (error) {
    console.error('Error fetching long videos from cloud:', error);
    return [];
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
 * Get optimized streaming URL for video
 */
export function getVideoStreamingUrl(video: Video): string {
  // Use direct R2 streaming URL instead of chunk manager
  if (video.videoKey) {
    return cloudVideoManager.getVideoUrl(video.videoKey);
  }
  
  return video.videoUrl;
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
