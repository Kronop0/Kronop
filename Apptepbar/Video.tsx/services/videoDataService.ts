// Video Data Service - Enhanced data fetching from Cloud/R2/Backend
import { cloudVideoManager, VideoData, ChunkManager } from './cloudVideoManager';

export interface EnhancedVideoData {
  id: string;
  title: string;
  description: string;
  category: string; // Only used for filtering, not displayed elsewhere
  thumbnailUrl: string;
  uploadTime: string; // ISO string from createdAt
  videoUrl: string;
  duration: string;
  views: string;
  likes: number;
  comments: number;
  user: {
    name: string;
    avatarUrl: string;
    isSupported: boolean;
    supporters: number;
  };
  chunkManager?: ChunkManager; // Chunk-based streaming support
}

/**
 * Fetch enhanced video data from Cloud/R2 storage with Chunk-based streaming
 * Includes title, description, category, thumbnail URL, and upload time
 */
export async function fetchEnhancedVideoData(): Promise<EnhancedVideoData[]> {
  try {
    console.log('Fetching enhanced video data from Cloud/R2...');

    // Get videos directly from R2 storage
    const r2Videos = await cloudVideoManager.fetchLongVideos();

    if (!r2Videos || r2Videos.length === 0) {
      console.log('No videos found in R2 storage');
      return [];
    }

    // Transform to enhanced format with chunk support
    const enhancedVideos: EnhancedVideoData[] = r2Videos.map((video: VideoData) => {
      // Initialize chunk manager for each video (DISABLED for now - use direct streaming)
      const chunkManager = undefined; // cloudVideoManager.initializeChunkManager(video.videoKey);
      
      return {
        id: video.id,
        title: video.title,
        description: video.description,
        category: video.category, // For filtering only
        thumbnailUrl: cloudVideoManager.getThumbnailUrl(video.thumbnailKey),
        uploadTime: video.createdAt, // Using createdAt as upload time
        videoUrl: cloudVideoManager.getVideoUrl(video.videoKey),
        duration: video.duration,
        views: video.views.toString(),
        likes: video.likes,
        comments: video.comments,
        user: {
          name: video.user.name,
          avatarUrl: cloudVideoManager.getAvatarUrl(video.user.avatarKey),
          isSupported: video.user.isSupported,
          supporters: video.user.supporters,
        },
        chunkManager, // Chunk-based streaming support (currently disabled)
      };
    });

    console.log(`Fetched ${enhancedVideos.length} enhanced video records with metadata`);
    return enhancedVideos;

  } catch (error) {
    console.error('Error fetching enhanced video data:', error);
    throw error;
  }
}

/**
 * Get videos by category for filtering
 * @param category - Category to filter by, or 'all' for all videos
 */
export async function getVideosByCategory(category: string = 'all'): Promise<EnhancedVideoData[]> {
  const allVideos = await fetchEnhancedVideoData();

  if (category === 'all') {
    return allVideos;
  }

  return allVideos.filter(video => video.category === category);
}

/**
 * Get single video by ID with metadata
 * @param videoId - Video ID to fetch
 */
export async function getVideoById(videoId: string): Promise<EnhancedVideoData | null> {
  const allVideos = await fetchEnhancedVideoData();
  return allVideos.find(video => video.id === videoId) || null;
}

/**
 * Get video streaming URL with chunk support
 * @param video - Enhanced video data
 */
export function getVideoStreamingUrl(video: EnhancedVideoData): string {
  // Use direct R2 streaming URL instead of chunk manager (DISABLED for now)
  if (video.chunkManager) {
    // Chunk-based streaming would go here
    // return video.chunkManager.getStreamingUrl();
  }
  
  return video.videoUrl;
}

/**
 * Initialize chunk manager for enhanced video
 * @param video - Enhanced video data
 */
export function initializeChunkManager(video: EnhancedVideoData): EnhancedVideoData {
  // DISABLED - Chunk manager causing 400 errors
  // if (!video.videoUrl) {
  //   return video;
  // }
  
  // Extract videoKey from videoUrl
  // const videoKey = video.videoUrl.split('/').pop() || '';
  // const chunkManager = cloudVideoManager.initializeChunkManager(videoKey);
  
  // return {
  //   ...video,
  //   chunkManager,
  //   videoUrl: getVideoStreamingUrl({ ...video, chunkManager }),
  // };
  
  return video;
}

/**
 * Get video metadata bundle (Thumbnail, Title, Description)
 * @param videoId - Video ID
 */
export async function getVideoMetadataBundle(videoId: string): Promise<{
  thumbnailUrl: string;
  title: string;
  description: string;
} | null> {
  try {
    const video = await getVideoById(videoId);
    if (!video) {
      return null;
    }
    
    return {
      thumbnailUrl: video.thumbnailUrl,
      title: video.title,
      description: video.description,
    };
  } catch (error) {
    console.error('Error fetching video metadata bundle:', error);
    return null;
  }
}
