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
      
      // Get video file size
      const headResponse = await fetch(this.videoUrl, { method: 'HEAD' });
      this.totalSize = parseInt(headResponse.headers.get('content-length') || '0');
      
      // Calculate total chunks
      this.totalChunks = Math.ceil(this.totalSize / this.chunkSize);
      
      console.log(`📊 Video size: ${this.totalSize} bytes, Chunks: ${this.totalChunks}`);
      
      // Preload first 3 chunks immediately
      await this.preloadChunks([0, 1, 2]);
      
      return true;
    } catch (error) {
      console.error('❌ Chunk Manager initialization failed:', error);
      return false;
    }
  }

  // Preload specific chunks
  async preloadChunks(chunkIndices) {
    const promises = chunkIndices.map(async (chunkIndex) => {
      // Validate chunk index is within bounds
      if (chunkIndex < 0 || chunkIndex >= this.totalChunks) {
        console.warn(`⚠️ Invalid chunk index ${chunkIndex}, total chunks: ${this.totalChunks}`);
        return null;
      }
      
      if (this.loadedChunks.has(chunkIndex)) return null;
      
      const start = chunkIndex * this.chunkSize;
      const end = Math.min(start + this.chunkSize - 1, this.totalSize - 1);
      
      try {
        console.log(`📥 Preloading chunk ${chunkIndex}: ${start}-${end}`);
        
        const response = await fetch(this.videoUrl, {
          headers: {
            'Range': `bytes=${start}-${end}`,
            'User-Agent': 'KronopApp-Streamer/1.0'
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
        
        console.log(`✅ Chunk ${chunkIndex} loaded: ${chunkData.byteLength} bytes`);
        return chunkData;
        
      } catch (error) {
        console.error(`❌ Chunk ${chunkIndex} failed:`, error);
        return null;
      }
    });

    const results = await Promise.all(promises);
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
}

// Active chunk managers for videos
const activeChunkManagers = new Map();

/**
 * Get R2 URL specifically for reels with chunk-based streaming
 * @param {string} videoKey - Video file key or filename
 * @returns {string} Complete R2 streaming URL for reels
 */
function getReelUrl(videoKey) {
  if (!videoKey) {
    console.warn('⚠️ Reel video key is empty');
    return '';
  }
  
  // Remove leading slash if present
  const cleanKey = videoKey.startsWith('/') ? videoKey.slice(1) : videoKey;
  
  // Add Reels/ prefix if not already present
  const reelKey = cleanKey.startsWith('Reels/') ? cleanKey : `Reels/${cleanKey}`;
  
  // Construct full R2 URL
  const fullUrl = `${CLOUD_CONFIG.publicR2Url}/${reelKey}`;
  
  console.log(`🎬 Reel URL: ${fullUrl}`);
  
  // Initialize chunk manager for this video
  if (!activeChunkManagers.has(fullUrl)) {
    const chunkManager = new ChunkManager(fullUrl);
    activeChunkManagers.set(fullUrl, chunkManager);
    
    // Initialize chunk manager asynchronously
    chunkManager.initialize().then(success => {
      if (success) {
        console.log('🚀 Chunk Manager ready for:', fullUrl);
      }
    });
  }
  
  return fullUrl;
}

/**
 * Get chunk data for specific video
 * @param {string} videoUrl - Complete video URL
 * @param {number} chunkIndex - Chunk index to fetch
 * @returns {Promise<ArrayBuffer|null>} Chunk data
 */
async function getVideoChunk(videoUrl, chunkIndex) {
  const chunkManager = activeChunkManagers.get(videoUrl);
  
  if (!chunkManager) {
    console.warn('⚠️ No chunk manager found for:', videoUrl);
    return null;
  }
  
  // If chunk already loaded, return immediately
  if (chunkManager.isChunkLoaded(chunkIndex)) {
    return chunkManager.getChunk(chunkIndex)?.data || null;
  }
  
  // Load chunk on demand
  const chunks = await chunkManager.preloadChunks([chunkIndex]);
  return chunks[0] || null;
}

/**
 * Get streaming progress for video
 * @param {string} videoUrl - Complete video URL
 * @returns {Object} Progress information
 */
function getStreamingProgress(videoUrl) {
  const chunkManager = activeChunkManagers.get(videoUrl);
  return chunkManager ? chunkManager.getProgress() : null;
}

/**
 * Prefetch next chunks for smooth playback
 * @param {string} videoUrl - Complete video URL
 * @param {number} currentChunkIndex - Current playing chunk
 */
async function prefetchNextChunks(videoUrl, currentChunkIndex) {
  const chunkManager = activeChunkManagers.get(videoUrl);
  
  if (!chunkManager) return;
  
  const nextChunks = chunkManager.getNextChunks(currentChunkIndex);
  if (nextChunks.length > 0) {
    console.log(`🔄 Prefetching chunks: ${nextChunks.join(', ')}`);
    await chunkManager.preloadChunks(nextChunks);
  }
}

/**
 * Cleanup chunk manager for video
 * @param {string} videoUrl - Complete video URL
 */
function cleanupChunkManager(videoUrl) {
  const chunkManager = activeChunkManagers.get(videoUrl);
  if (chunkManager) {
    console.log('🧹 Cleaning up chunk manager for:', videoUrl);
    activeChunkManagers.delete(videoUrl);
  }
}

/**
 * Get public R2 URL for video streaming
 * @param {string} videoKey - Video file key/path
 * @returns {string} Complete streaming URL
 */
function getVideoUrl(videoKey) {
  if (!videoKey) {
    console.warn('⚠️ Video key is empty');
    return '';
  }
  
  // Remove leading slash if present
  const cleanKey = videoKey.startsWith('/') ? videoKey.slice(1) : videoKey;
  
  // Construct full URL
  const fullUrl = `${CLOUD_CONFIG.publicR2Url}/${cleanKey}`;
  
  console.log(`🎬 Video URL: ${fullUrl}`);
  return fullUrl;
}

/**
 * Get streaming URL with quality preference
 * @param {string} videoKey - Video file key
 * @param {string} quality - Video quality (low, medium, high, ultra)
 * @returns {string} Quality-specific streaming URL
 */
function getQualityStreamUrl(videoKey, quality = 'medium') {
  const qualitySuffix = CLOUD_CONFIG.quality[quality] || CLOUD_CONFIG.quality.medium;
  const qualityKey = `${videoKey}_${qualitySuffix}`;
  
  return getVideoUrl(qualityKey);
}

/**
 * Generate range request URL for partial video loading
 * @param {string} videoKey - Video file key
 * @param {number} start - Start byte position
 * @param {number} end - End byte position
 * @returns {string} Range request URL
 */
function getRangeUrl(videoKey, start = 0, end = null) {
  const baseUrl = getVideoUrl(videoKey);
  const range = end ? `bytes=${start}-${end}` : `bytes=${start}-`;
  
  return `${baseUrl}?range=${range}`;
}

/**
 * Check if URL is valid R2 streaming URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid R2 URL
 */
function isValidR2Url(url) {
  return url && url.startsWith(CLOUD_CONFIG.publicR2Url);
}

/**
 * Extract video key from R2 URL
 * @param {string} url - Full R2 URL
 * @returns {string} Video key
 */
function extractVideoKey(url) {
  if (!isValidR2Url(url)) {
    return '';
  }
  
  return url.replace(CLOUD_CONFIG.publicR2Url + '/', '');
}

/**
 * Get optimized video URL based on network conditions
 * @param {string} videoKey - Video file key
 * @param {object} networkInfo - Network speed and type info
 * @returns {string} Optimized streaming URL
 */
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

// Export configuration and functions
module.exports = {
  CLOUD_CONFIG,
  getReelUrl,
  getVideoUrl,
  getRangeUrl,
  getVideoChunk,
  getStreamingProgress,
  prefetchNextChunks,
  cleanupChunkManager,
  r2Config: CLOUD_CONFIG.r2Config,
  r2PublicUrl: CLOUD_CONFIG.publicR2Url,
  r2Bucket: BUCKET_REELS,
  ChunkManager,
  activeChunkManagers
};
