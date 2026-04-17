// Cloud Video Manager - Direct R2 Integration

import { listVideosFromR2, checkR2Configuration } from '../r2VideoService';

interface CloudVideoConfig {
  apiBaseUrl: string;
  r2Endpoint: string;
  r2AccountId: string;
  r2AccessKeyId: string;
  r2SecretAccessKey: string;
  videoBucket: string;
}

interface VideoData {
  id: string;
  title: string;
  description: string;
  duration: string;
  views: number;
  likes: number;
  comments: number;
  category: string;
  videoKey: string;
  thumbnailKey: string;
  user: {
    name: string;
    avatarKey: string;
    isSupported: boolean;
    supporters: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface ChunkInfo {
  index: number;
  start: number;
  end: number;
  url: string;
  loaded: boolean;
  loading: boolean;
}

class CloudVideoManager {
  private config: CloudVideoConfig;
  private videoCache: Map<string, VideoData[]> = new Map();
  private chunkCache: Map<string, Map<number, ChunkInfo>> = new Map();
  private cacheTimestamps: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.config = {
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || process.env.EXPO_PUBLIC_API_URL || 'https://kronop-76zy.onrender.com',
      r2Endpoint: 'https://pub-ec9340c906bd4c20a0d2640524d276fe.r2.dev',
      r2AccountId: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
      r2AccessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '',
      r2SecretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '',
      videoBucket: process.env.EXPO_PUBLIC_BUCKET_VIDEO || 'kronop-video',
    };
    
    // Log configuration for debugging
    console.log('CloudVideoManager initialized with:', {
      apiBaseUrl: this.config.apiBaseUrl,
      r2Endpoint: this.config.r2Endpoint,
      videoBucket: this.config.videoBucket,
      hasCredentials: !!(this.config.r2AccessKeyId && this.config.r2SecretAccessKey)
    });
  }

  /**
   * Fetch long videos directly from R2 storage
   */
  async fetchLongVideos(): Promise<VideoData[]> {
    const cacheKey = 'long_videos';
    const now = Date.now();
    
    // Check cache first
    if (this.videoCache.has(cacheKey)) {
      const timestamp = this.cacheTimestamps.get(cacheKey) || 0;
      if (now - timestamp < this.CACHE_DURATION) {
        return this.videoCache.get(cacheKey)!;
      }
    }

    try {
      console.log('Fetching videos directly from R2 storage...');
      
      // Check R2 configuration first
      if (!checkR2Configuration()) {
        throw new Error('R2 configuration is missing or invalid');
      }
      
      // Get videos directly from R2
      const r2Videos = await listVideosFromR2();
      
      console.log(`Received ${r2Videos.length} videos from R2 storage`);
      
      // Handle empty data gracefully
      if (!r2Videos || r2Videos.length === 0) {
        console.log('No videos found in R2 bucket');
        return [];
      }

      // Transform R2 video data to our format
      const videos: VideoData[] = r2Videos.map((video: any) => ({
        id: video.id,
        title: video.title,
        description: video.description,
        duration: video.duration,
        views: video.views,
        likes: video.likes,
        comments: video.comments,
        category: video.category,
        videoKey: video.videoKey,
        thumbnailKey: video.thumbnailKey,
        user: {
          name: video.user.name,
          avatarKey: video.user.avatarKey,
          isSupported: video.user.isSupported,
          supporters: video.user.supporters,
        },
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
      }));

      console.log(`Processed ${videos.length} videos from R2 direct storage`);
      
      // Cache the results
      this.videoCache.set(cacheKey, videos);
      this.cacheTimestamps.set(cacheKey, now);

      return videos;
    } catch (error) {
      console.error('CloudVideoManager: Failed to fetch videos from R2', error);
      throw error;
    }
  }

  /**
   * Get streaming URL for video
   */
  getVideoUrl(videoKey: string): string {
    return `https://pub-ec9340c906bd4c20a0d2640524d276fe.r2.dev/${videoKey}`;
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(thumbnailKey: string): string {
    return `https://pub-ec9340c906bd4c20a0d2640524d276fe.r2.dev/${thumbnailKey}`;
  }

  /**
   * Get avatar URL
   */
  getAvatarUrl(avatarKey: string): string {
    return `https://pub-ec9340c906bd4c20a0d2640524d276fe.r2.dev/${avatarKey}`;
  }

  /**
   * Initialize chunk manager for a video
   */
  initializeChunkManager(videoKey: string, totalSize?: number): ChunkManager {
    return new ChunkManager(videoKey, this.config, totalSize);
  }

  /**
   * Get video chunks for streaming
   */
  async getVideoChunks(videoKey: string, chunkSize: number = 1024 * 1024): Promise<ChunkInfo[]> {
    const cacheKey = `chunks_${videoKey}`;
    
    if (this.chunkCache.has(cacheKey)) {
      const chunks = Array.from(this.chunkCache.get(cacheKey)!.values());
      return chunks.sort((a, b) => a.index - b.index);
    }

    try {
      // Get video metadata to determine total size
      const response = await fetch(`${this.config.apiBaseUrl}/api/videos/metadata/${videoKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get video metadata');
      }

      const metadata = await response.json();
      const totalSize = metadata.size || 0;
      const totalChunks = Math.ceil(totalSize / chunkSize);

      const chunks: ChunkInfo[] = [];
      const chunkMap = new Map<number, ChunkInfo>();

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize - 1, totalSize - 1);
        
        const chunk: ChunkInfo = {
          index: i,
          start,
          end,
          url: `${this.getVideoUrl(videoKey)}?range=${start}-${end}`,
          loaded: false,
          loading: false,
        };

        chunks.push(chunk);
        chunkMap.set(i, chunk);
      }

      this.chunkCache.set(cacheKey, chunkMap);
      return chunks;
    } catch (error) {
      console.error('Failed to get video chunks:', error);
      throw error;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.videoCache.clear();
    this.chunkCache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Get configuration
   */
  getConfig(): CloudVideoConfig {
    return { ...this.config };
  }
}

/**
 * Chunk Manager for video streaming
 */
class ChunkManager {
  private videoKey: string;
  private config: CloudVideoConfig;
  private chunks: Map<number, ChunkInfo> = new Map();
  private loadedChunks: Set<number> = new Set();
  private loadingChunks: Set<number> = new Set();
  private totalSize?: number;
  private chunkSize: number = 1024 * 1024; // 1MB

  constructor(videoKey: string, config: CloudVideoConfig, totalSize?: number) {
    this.videoKey = videoKey;
    this.config = config;
    this.totalSize = totalSize;
  }

  /**
   * Preload chunks
   */
  async preloadChunks(startIndex: number = 0, count: number = 3): Promise<void> {
    const promises: Promise<void>[] = [];

    for (let i = startIndex; i < startIndex + count; i++) {
      if (!this.loadedChunks.has(i) && !this.loadingChunks.has(i)) {
        promises.push(this.loadChunk(i));
      }
    }

    await Promise.all(promises);
  }

  /**
   * Load a specific chunk with retry logic
   */
  private async loadChunk(index: number): Promise<void> {
    if (this.loadedChunks.has(index) || this.loadingChunks.has(index)) {
      return;
    }

    this.loadingChunks.add(index);

    // Retry logic: up to 3 attempts with exponential backoff
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < maxRetries) {
      try {
        const start = index * this.chunkSize;
        const end = this.totalSize ? Math.min(start + this.chunkSize - 1, this.totalSize - 1) : start + this.chunkSize - 1;

        const url = `https://pub-ec9340c906bd4c20a0d2640524d276fe.r2.dev/${this.videoKey}`;
        const response = await fetch(url, {
          headers: {
            'Range': `bytes=${start}-${end}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load chunk ${index}: ${response.status}`);
        }

        const chunk: ChunkInfo = {
          index,
          start,
          end,
          url: response.url,
          loaded: true,
          loading: false,
        };

        this.chunks.set(index, chunk);
        this.loadedChunks.add(index);
        this.loadingChunks.delete(index);

        console.log(`✅ Chunk ${index} loaded successfully`);
        return; // Success - exit the retry loop

      } catch (error) {
        lastError = error as Error;
        retryCount++;

        if (retryCount < maxRetries) {
          const delayMs = 1000 * Math.pow(2, retryCount); // Exponential backoff: 2s, 4s
          console.warn(`⚠️ Chunk ${index} load failed (attempt ${retryCount}/${maxRetries}), retrying in ${delayMs}ms:`, lastError.message);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    // All retries failed
    this.loadingChunks.delete(index);
    console.error(`🚫 Chunk ${index} failed after ${maxRetries} attempts:`, lastError);
    // Don't throw - app should continue without this chunk
  }

  /**
   * Get chunk URL for streaming
   */
  getChunkUrl(index: number): string | null {
    const chunk = this.chunks.get(index);
    return chunk?.url || null;
  }

  /**
   * Check if chunk is loaded
   */
  isChunkLoaded(index: number): boolean {
    return this.loadedChunks.has(index);
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.chunks.clear();
    this.loadedChunks.clear();
    this.loadingChunks.clear();
  }

  /**
   * Get streaming URL (fallback)
   */
  getStreamingUrl(): string {
    return `https://pub-ec9340c906bd4c20a0d2640524d276fe.r2.dev/${this.videoKey}`;
  }
}

// Export singleton instance
export const cloudVideoManager = new CloudVideoManager();
export { CloudVideoManager, ChunkManager };
export type { VideoData, ChunkInfo, CloudVideoConfig };
