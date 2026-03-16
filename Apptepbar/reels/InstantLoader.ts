// Instant Loader - Loads next reel immediately without blank screens
// Preloads reels in background for instant playback

import { activeChunkManagers, ChunkManager } from './cloudin';

// Preloaded reel cache for instant access
const preloadedReels = new Map<string, {
  chunks: Map<number, Uint8Array>;
  isReady: boolean;
  loadTime: number;
}>();

// Initialize instant loader system
export const initializeInstantLoader = async (reelUrls: string[]) => {
  console.log('⚡ Initializing Instant Loader System');
  
  // Preload first 2 reels immediately
  for (let i = 0; i < Math.min(2, reelUrls.length); i++) {
    await preloadNextReelInstantly(reelUrls[i]);
  }
  
  console.log('✅ Instant Loader System Ready');
};

// Instantly preload next reel with high priority
export const preloadNextReelInstantly = async (reelUrl: string): Promise<void> => {
  try {
    console.log(`⚡ Instant preloading: ${reelUrl}`);
    
    // Check if already preloaded and fresh (within 30 seconds)
    const existing = preloadedReels.get(reelUrl);
    if (existing && existing.isReady && (Date.now() - existing.loadTime) < 30000) {
      console.log(`✅ Reel already preloaded: ${reelUrl}`);
      return;
    }

    // Create chunk manager if not exists
    if (!activeChunkManagers.has(reelUrl)) {
      const chunkManager = new ChunkManager(reelUrl);
      await chunkManager.initialize();
      activeChunkManagers.set(reelUrl, chunkManager);
    }

    const manager = activeChunkManagers.get(reelUrl);
    if (!manager) {
      throw new Error(`Failed to create chunk manager for: ${reelUrl}`);
    }

    // Preload first 3 chunks immediately (more aggressive for instant playback)
    const chunksToPreload = [0, 1, 2];
    await manager.preloadChunks(chunksToPreload);

    // Cache as ready
    preloadedReels.set(reelUrl, {
      chunks: manager.chunks,
      isReady: true,
      loadTime: Date.now()
    });

    console.log(`⚡ Instant preload complete: ${reelUrl}`);
    
  } catch (error) {
    console.error(`❌ Instant preload failed: ${reelUrl}`, error);
  }
};

// Get instant reel data for immediate playback
export const getInstantReelData = (reelUrl: string) => {
  const preloaded = preloadedReels.get(reelUrl);
  
  if (preloaded && preloaded.isReady) {
    console.log(`⚡ Serving instant reel: ${reelUrl}`);
    return preloaded;
  }
  
  console.log(`⏳ Reel not preloaded, loading normally: ${reelUrl}`);
  return null;
};

// Check if reel is instantly available
export const isReelInstantlyAvailable = (reelUrl: string): boolean => {
  const preloaded = preloadedReels.get(reelUrl);
  return preloaded?.isReady || false;
};

// Clean up old preloaded reels (keep only last 3)
export const cleanupOldPreloadedReels = (keepUrls: string[]) => {
  const cutoffTime = Date.now() - 60000; // 1 minute old
  
  for (const [url, data] of preloadedReels.entries()) {
    // Remove if not in keep list or too old
    if (!keepUrls.includes(url) || data.loadTime < cutoffTime) {
      preloadedReels.delete(url);
      console.log(`🗑️ Cleaned up old preloaded reel: ${url}`);
    }
  }
};

// Force refresh of a preloaded reel
export const refreshInstantReel = async (reelUrl: string) => {
  preloadedReels.delete(reelUrl);
  await preloadNextReelInstantly(reelUrl);
  console.log(`🔄 Refreshed instant reel: ${reelUrl}`);
};

// Get preloading status
export const getInstantLoaderStatus = () => {
  const status = {
    totalPreloaded: preloadedReels.size,
    readyReels: 0,
    activeManagers: activeChunkManagers.size,
    reels: [] as string[]
  };

  for (const [url, data] of preloadedReels.entries()) {
    status.reels.push(url);
    if (data.isReady) {
      status.readyReels++;
    }
  }

  return status;
};
