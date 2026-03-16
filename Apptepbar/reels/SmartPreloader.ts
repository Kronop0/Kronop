import { activeChunkManagers } from './cloudin';

interface PreloadedChunk {
  videoUrl: string;
  chunkIndex: number;
  data: ArrayBuffer;
  timestamp: number;
}

interface PreloadQueue {
  videoUrl: string;
  priority: number;
  status: 'pending' | 'loading' | 'completed' | 'failed';
}

class SmartPreloader {
  private preloadedChunks: Map<string, Map<number, ArrayBuffer>> = new Map();
  private preloadQueue: PreloadQueue[] = [];
  private isPreloading: boolean = false;
  private maxPreloadVideos: number = 2;
  private chunksPerVideo: number = 3;
  private preloadTimeout: number = 10000; // 10 seconds timeout

  // Add next reel to preload queue
  public preloadNextReel(currentVideoUrl: string, nextVideoUrl: string): void {
    console.log('🔄 Adding next reel to preload queue:', nextVideoUrl);

    // Remove any existing entry for this video
    this.preloadQueue = this.preloadQueue.filter(item => item.videoUrl !== nextVideoUrl);

    // Add to queue with high priority
    this.preloadQueue.push({
      videoUrl: nextVideoUrl,
      priority: 1, // High priority for next reel
      status: 'pending'
    });

    // Start preloading if not already running
    this.startPreloading();
  }

  // Add multiple next reels to queue (for smoother scrolling)
  public preloadUpcomingReels(currentVideoUrl: string, upcomingVideos: string[]): void {
    console.log('🔄 Adding upcoming reels to preload queue:', upcomingVideos);

    upcomingVideos.forEach((videoUrl, index) => {
      // Remove any existing entry
      this.preloadQueue = this.preloadQueue.filter(item => item.videoUrl !== videoUrl);

      // Add to queue with decreasing priority
      this.preloadQueue.push({
        videoUrl,
        priority: 10 - index, // Higher priority for closer videos
        status: 'pending'
      });
    });

    // Limit queue size
    this.preloadQueue = this.preloadQueue
      .sort((a, b) => a.priority - b.priority)
      .slice(0, this.maxPreloadVideos);

    this.startPreloading();
  }

  // Start the preloading process
  private async startPreloading(): Promise<void> {
    if (this.isPreloading) return;

    this.isPreloading = true;
    console.log('🚀 Smart preloader started');

    while (this.preloadQueue.length > 0) {
      const nextItem = this.preloadQueue.find(item => item.status === 'pending');
      
      if (!nextItem) {
        // All items are either loading or completed
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      nextItem.status = 'loading';
      
      try {
        await this.preloadVideoChunks(nextItem.videoUrl);
        nextItem.status = 'completed';
        console.log('✅ Preload completed for:', nextItem.videoUrl);
      } catch (error) {
        console.error('❌ Preload failed for:', nextItem.videoUrl, error);
        nextItem.status = 'failed';
      }
    }

    this.isPreloading = false;
    console.log('🏁 Smart preloader finished');
  }

  // Preload chunks for a specific video
  private async preloadVideoChunks(videoUrl: string): Promise<void> {
    console.log('📥 Preloading chunks for:', videoUrl);

    const chunkManager = activeChunkManagers.get(videoUrl);
    if (!chunkManager) {
      console.warn('⚠️ No chunk manager found for:', videoUrl);
      return;
    }

    // Initialize chunk manager if needed
    if (!chunkManager.totalChunks) {
      await chunkManager.initialize();
    }

    // Preload first N chunks (usually 3)
    const chunksToLoad: number[] = [];
    for (let i = 0; i < Math.min(this.chunksPerVideo, chunkManager.totalChunks); i++) {
      chunksToLoad.push(i);
    }

    console.log(`📥 Loading ${chunksToLoad.length} chunks:`, chunksToLoad);

    const loadedChunks = await chunkManager.preloadChunks(chunksToLoad);

    if (loadedChunks.length > 0) {
      // Store preloaded chunks
      if (!this.preloadedChunks.has(videoUrl)) {
        this.preloadedChunks.set(videoUrl, new Map());
      }

      const videoChunks = this.preloadedChunks.get(videoUrl)!;
      
      loadedChunks.forEach((chunk: ArrayBuffer, index: number) => {
        if (chunk) {
          videoChunks.set(chunksToLoad[index], chunk);
          console.log(`✅ Preloaded chunk ${chunksToLoad[index]}:`, chunk.byteLength, 'bytes');
        }
      });

      console.log(`🎯 Preloaded ${loadedChunks.length}/${chunksToLoad.length} chunks for ${videoUrl}`);
    }
  }

  // Get preloaded chunks for instant playback
  public getPreloadedChunks(videoUrl: string): Map<number, ArrayBuffer> | null {
    const chunks = this.preloadedChunks.get(videoUrl);
    if (chunks && chunks.size > 0) {
      console.log(`🎯 Found ${chunks.size} preloaded chunks for:`, videoUrl);
      return chunks;
    }
    return null;
  }

  // Check if video has preloaded chunks
  public hasPreloadedChunks(videoUrl: string): boolean {
    const chunks = this.preloadedChunks.get(videoUrl);
    return chunks ? chunks.size > 0 : false;
  }

  // Get preloaded chunk by index
  public getPreloadedChunk(videoUrl: string, chunkIndex: number): ArrayBuffer | null {
    const chunks = this.preloadedChunks.get(videoUrl);
    if (chunks) {
      return chunks.get(chunkIndex) || null;
    }
    return null;
  }

  // Clean up old preloaded chunks to save memory
  public cleanup(keepVideos: string[] = []): void {
    console.log('🧹 Cleaning up preloaded chunks, keeping:', keepVideos);

    // Remove chunks for videos not in keep list
    for (const [videoUrl, chunks] of this.preloadedChunks.entries()) {
      if (!keepVideos.includes(videoUrl)) {
        console.log('🗑️ Removing preloaded chunks for:', videoUrl);
        this.preloadedChunks.delete(videoUrl);
      }
    }

    // Remove completed items from queue
    this.preloadQueue = this.preloadQueue.filter(item => 
      item.status !== 'completed' && item.status !== 'failed'
    );
  }

  // Get preload status for debugging
  public getStatus(): {
    preloadedVideos: number;
    totalChunks: number;
    queueLength: number;
    isPreloading: boolean;
  } {
    let totalChunks = 0;
    for (const chunks of this.preloadedChunks.values()) {
      totalChunks += chunks.size;
    }

    return {
      preloadedVideos: this.preloadedChunks.size,
      totalChunks,
      queueLength: this.preloadQueue.length,
      isPreloading: this.isPreloading
    };
  }

  // Force preload a specific video immediately
  public async forcePreload(videoUrl: string): Promise<void> {
    console.log('⚡ Force preloading:', videoUrl);
    
    // Add to front of queue with highest priority
    this.preloadQueue.unshift({
      videoUrl,
      priority: 0,
      status: 'pending'
    });

    // Start preloading immediately
    await this.startPreloading();
  }
}

// Export singleton instance
export const smartPreloader = new SmartPreloader();

// Export types for external use
export type { PreloadedChunk, PreloadQueue };
