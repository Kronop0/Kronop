// Cloudflare R2 Configuration for Kronop Reels
// Advanced Chunk-based Streaming System with Range Requests

// Get R2 configuration from environment variables
const R2_ACCOUNT_ID = process.env.EXPO_PUBLIC_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY;
const R2_ENDPOINT = process.env.EXPO_PUBLIC_R2_ENDPOINT;
const BUCKET_REELS = process.env.EXPO_PUBLIC_BUCKET_REELS;

// R2 Configuration Object
const CLOUD_CONFIG = {
  // Public R2 URL for video streaming
  publicR2Url: 'https://pub-600cd3134366496fadf941970cac2df6.r2.dev',
  
  // R2 Configuration from .env
  r2Config: {
    accountId: R2_ACCOUNT_ID,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    endpoint: R2_ENDPOINT,
    bucket: BUCKET_REELS,
  },
  
  // Video quality presets
  quality: {
    low: '480p',
    medium: '720p', 
    high: '1080p',
    ultra: '4k'
  },
  
  // Advanced streaming configuration
  streaming: {
    enableRangeRequests: true,
    chunkSize: 1024 * 1024, // 1MB chunks
    bufferSize: 10 * 1024 * 1024, // 10MB buffer
    maxRetries: 3,
    timeout: 15000, // 15 seconds
    prefetchChunks: 2, // Prefetch next 2 chunks
    adaptiveBitrate: true,
  }
};

// Chunk management system
class ChunkManager {
  constructor(videoUrl) {
    this.videoUrl = videoUrl;
    this.chunks = new Map();
    this.totalSize = 0;
    this.chunkSize = CLOUD_CONFIG.streaming.chunkSize;
    this.loadedChunks = new Set();
    this.currentChunk = 0;
  }

  // Initialize chunk manager with video metadata
  async initialize() {
    try {
      console.log('🔧 Initializing Chunk Manager for:', this.videoUrl);
      
      // Get video file size with retry logic
      let headResponse;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          headResponse = await fetch(this.videoUrl, { 
            method: 'HEAD',
            headers: {
              'User-Agent': 'KronopApp-ChunkStreamer/1.0'
            }
          });
          
          if (headResponse.ok) break;
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        } catch (error) {
          console.warn(`Retry ${retryCount + 1} failed:`, error);
          retryCount++;
          if (retryCount >= maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
      if (!headResponse || !headResponse.ok) {
        throw new Error(`HTTP ${headResponse?.status || 'Unknown'}: Failed to get video metadata`);
      }
      
      this.totalSize = parseInt(headResponse.headers.get('content-length') || '0');
      
      if (this.totalSize === 0) {
        throw new Error('Video file size is 0 - file may not exist or be accessible');
      }
      
      // Calculate total chunks
      this.totalChunks = Math.ceil(this.totalSize / this.chunkSize);
      
      console.log(`📊 Chunk Manager Ready - Size: ${this.totalSize} bytes, Chunks: ${this.totalChunks}`);
      
      // Only preload if we have valid chunks
      if (this.totalChunks > 0) {
        // Preload first 3 chunks immediately
        const preloadResults = await this.preloadChunks([0, 1, 2]);
        console.log(`🚀 Initial preload complete: ${preloadResults.length} chunks loaded`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Chunk Manager initialization failed:', error);
      // Set default values to prevent complete failure
      this.totalSize = 0;
      this.totalChunks = 0;
      return false;
    }
  }

  // Preload specific chunks
  async preloadChunks(chunkIndices) {
    // Validate chunkIndices parameter
    if (!chunkIndices || !Array.isArray(chunkIndices)) {
      console.warn('⚠️ Invalid chunkIndices parameter:', chunkIndices);
      return [];
    }
    
    // Skip if chunks are already being loaded or totalChunks is 0
    if (this.totalChunks === 0) {
      console.warn('⚠️ Cannot preload chunks: totalChunks is 0');
      return [];
    }

    const promises = chunkIndices.map(async (chunkIndex) => {
      // Validate chunk index is within bounds
      if (chunkIndex < 0 || chunkIndex >= this.totalChunks) {
        console.warn(`⚠️ Invalid chunk index ${chunkIndex}, total chunks: ${this.totalChunks}`);
        return null;
      }
      
      if (this.loadedChunks.has(chunkIndex)) {
        console.log(`✅ Chunk ${chunkIndex} already loaded: ${this.chunks.get(chunkIndex)?.size} bytes`);
        return this.chunks.get(chunkIndex)?.data || null;
      }
      
      const start = chunkIndex * this.chunkSize;
      const end = Math.min(start + this.chunkSize - 1, this.totalSize - 1);
      
      try {
        console.log(`📥 Loading chunk ${chunkIndex}: bytes ${start}-${end}`);
        
        // Use Range headers for Cloudflare R2 chunk streaming
        const response = await fetch(this.videoUrl, {
          headers: {
            'User-Agent': 'KronopApp-ChunkStreamer/1.0',
            'Range': `bytes=${start}-${end}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const chunkData = await response.arrayBuffer();
        
        // Store chunk
        this.chunks.set(chunkIndex, {
          data: chunkData,
          start,
          end,
          size: chunkData.byteLength,
          timestamp: Date.now()
        });
        
        this.loadedChunks.add(chunkIndex);
        
        console.log(`✅ Chunk ${chunkIndex} loaded successfully: ${chunkData.byteLength} bytes`);
        return chunkData;
        
      } catch (error) {
        console.error(`❌ Chunk ${chunkIndex} failed (attempt 1):`, error);
        
        // Retry logic: Try 2 more times with exponential backoff
        for (let attempt = 2; attempt <= 3; attempt++) {
          try {
            console.log(`🔄 Retrying chunk ${chunkIndex}, attempt ${attempt}...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            
            const retryResponse = await fetch(this.videoUrl, {
              headers: {
                'User-Agent': 'KronopApp-ChunkStreamer/1.0',
                'Range': `bytes=${start}-${end}`
              }
            });
            
            if (!retryResponse.ok) {
              throw new Error(`HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
            }
            
            const retryChunkData = await retryResponse.arrayBuffer();
            
            this.chunks.set(chunkIndex, {
              data: retryChunkData,
              start,
              end,
              size: retryChunkData.byteLength,
              timestamp: Date.now()
            });
            
            this.loadedChunks.add(chunkIndex);
            
            console.log(`✅ Chunk ${chunkIndex} loaded on retry ${attempt}: ${retryChunkData.byteLength} bytes`);
            return retryChunkData;
            
          } catch (retryError) {
            console.error(`❌ Chunk ${chunkIndex} retry ${attempt} failed:`, retryError);
            if (attempt === 3) {
              console.error(`🚫 Chunk ${chunkIndex} failed after 3 attempts`);
              return null;
            }
          }
        }
        
        return null;
      }
    });

    const results = await Promise.all(promises);
    const successCount = results.filter(r => r !== null).length;
    
    if (successCount > 0) {
      console.log(`🎯 Preload complete: ${successCount}/${chunkIndices.length} chunks loaded`);
    }
    
    return results.filter(r => r !== null);
  }

  // Get specific chunk for playback
  getChunk(chunkIndex) {
    return this.chunks.get(chunkIndex);
  }

  // Get next chunks for prefetching
  getNextChunks(currentIndex, count = 2) {
    const nextChunks = [];
    for (let i = 1; i <= count; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < this.totalChunks && !this.loadedChunks.has(nextIndex)) {
        nextChunks.push(nextIndex);
      }
    }
    return nextChunks;
  }

  // Check if chunk is loaded
  isChunkLoaded(chunkIndex) {
    return this.loadedChunks.has(chunkIndex);
  }

  // Get loading progress
  getProgress() {
    return {
      loaded: this.loadedChunks.size,
      total: this.totalChunks,
      percentage: Math.round((this.loadedChunks.size / this.totalChunks) * 100),
      bytesLoaded: Array.from(this.chunks.values()).reduce((sum, chunk) => sum + chunk.size, 0),
      totalBytes: this.totalSize
    };
  }

  // Clean up all chunks and reset state
  cleanup() {
    console.log(`🧹 Cleaning up chunk manager for: ${this.videoUrl}`);
    
    // Clear all loaded chunks
    this.chunks.clear();
    this.loadedChunks.clear();
    
    // Reset state
    this.totalSize = 0;
    this.totalChunks = 0;
    this.isInitialized = false;
    
    console.log(`✅ Chunk manager cleanup complete`);
  }
};

// Direct URL Play - Maximum Quality
export const getVideoUrl = (videoKey) => {
  const baseUrl = CLOUD_CONFIG.publicR2Url;

  // Return direct URL with maximum quality parameters
  const fullUrl = `${baseUrl}/${videoKey}?quality=original&no-compression=true`;
  console.log(`🔗 Generated MAX QUALITY Video URL: ${fullUrl}`);
  return fullUrl;
};

// Legacy function for compatibility
export const getReelUrl = (reelKey) => {
  return getVideoUrl(reelKey);
};

// Active chunk managers for enabled chunk system
export const activeChunkManagers = new Map();

// Initialize chunk manager for a video URL
export const initializeChunkManagerForUrl = async (videoUrl) => {
  try {
    // Check if already exists
    if (activeChunkManagers.has(videoUrl)) {
      return activeChunkManagers.get(videoUrl);
    }

    const chunkManager = new ChunkManager(videoUrl);
    const initialized = await chunkManager.initialize();

    if (initialized) {
      activeChunkManagers.set(videoUrl, chunkManager);
      console.log('✅ Chunk manager initialized for:', videoUrl);
    }

    return chunkManager;
  } catch (error) {
    console.error('❌ Failed to initialize chunk manager:', error);
    return null;
  }
};

// Get streaming progress
export const getStreamingProgress = (videoUrl) => {
  const chunkManager = activeChunkManagers.get(videoUrl);
  if (chunkManager) {
    return chunkManager.getProgress();
  }
  return null;
};

// Get or create chunk manager for video
export const getVideoChunk = async (videoUrl, chunkIndex) => {
  try {
    let chunkManager = activeChunkManagers.get(videoUrl);

    // Initialize if not exists
    if (!chunkManager) {
      chunkManager = await initializeChunkManagerForUrl(videoUrl);
    }

    if (!chunkManager) {
      console.warn('⚠️ No chunk manager available for:', videoUrl);
      return null;
    }

    // Check if chunk is already loaded
    if (chunkManager.isChunkLoaded(chunkIndex)) {
      return chunkManager.getChunk(chunkIndex);
    }

    // Load the specific chunk with retry
    const maxRetries = 3;
    let retryCount = 0;
    let chunk = null;

    while (retryCount < maxRetries && !chunk) {
      try {
        await chunkManager.preloadChunks([chunkIndex]);
        chunk = chunkManager.getChunk(chunkIndex);
        if (!chunk) {
          throw new Error(`Chunk ${chunkIndex} not found after preload`);
        }
      } catch (error) {
        retryCount++;
        console.warn(`⚠️ Chunk ${chunkIndex} load retry ${retryCount}/${maxRetries}:`, error.message);
        if (retryCount >= maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
      }
    }

    return chunk;
  } catch (error) {
    console.error('❌ Failed to get video chunk:', error);
    return null; // Return null instead of crashing
  }
};

// Prefetch next chunks for smooth playback
export const prefetchNextChunks = async (videoUrl, currentChunkIndex) => {
  try {
    const chunkManager = activeChunkManagers.get(videoUrl);
    if (!chunkManager) {
      return;
    }

    const nextChunks = chunkManager.getNextChunks(currentChunkIndex, 2);
    if (nextChunks.length > 0) {
      await chunkManager.preloadChunks(nextChunks);
    }
  } catch (error) {
    console.warn('⚠️ Prefetch failed:', error);
    // Don't crash on prefetch failure
  }
};

// Cleanup chunk manager
export const cleanupChunkManager = (videoUrl) => {
  const chunkManager = activeChunkManagers.get(videoUrl);
  if (chunkManager) {
    chunkManager.cleanup();
    activeChunkManagers.delete(videoUrl);
    console.log('🧹 Chunk manager cleaned up for:', videoUrl);
  }
};

// Get optimized video URL based on network conditions
function getOptimizedUrl(videoKey, networkInfo = {}) {
  const { speed = 'fast', type = 'wifi' } = networkInfo;

  // Auto-adjust quality based on network
  if (type === 'cellular' || speed === 'slow') {
    return getQualityStreamUrl(videoKey, 'low');
  } else if (speed === 'medium') {
    return getQualityStreamUrl(videoKey, 'medium');
  } else {
    return getQualityStreamUrl(videoKey, 'high');
  }
}

// Legacy quality function for compatibility
function getQualityStreamUrl(videoKey, quality = 'medium') {
  console.log('🚀 Direct URL Play - No quality system');
  return getVideoUrl(videoKey);
}

// Network-based quality selection (simplified)
function getAdaptiveStreamUrl(videoKey, networkType = 'wifi', speed = 'fast') {
  // For Direct URL Play, return the same URL regardless of quality
  return getVideoUrl(videoKey);
}

// Export configuration and functions
module.exports = {
  CLOUD_CONFIG,
  getReelUrl,
  getVideoUrl,
  getVideoChunk,
  getStreamingProgress,
  prefetchNextChunks,
  cleanupChunkManager,
  getQualityStreamUrl,
  getAdaptiveStreamUrl,
  getOptimizedUrl,
  r2Config: CLOUD_CONFIG.r2Config,
  r2PublicUrl: CLOUD_CONFIG.publicR2Url,
  r2Bucket: BUCKET_REELS,
  ChunkManager,
  activeChunkManagers
};
