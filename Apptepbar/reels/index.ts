// Reels Index File - Instant Next Reel Loading
// Ensures next reel loads immediately when user swipes, no blank screens

import { preloadNextReelInstantly, initializeInstantLoader } from './InstantLoader';
import { activeChunkManagers } from './cloudin';

class ReelsIndexManager {
  private static instance: ReelsIndexManager;
  private currentReelIndex: number = 0;
  private totalReels: number = 0;
  private reelUrls: string[] = [];
  private isInitialized: boolean = false;

  static getInstance(): ReelsIndexManager {
    if (!ReelsIndexManager.instance) {
      ReelsIndexManager.instance = new ReelsIndexManager();
    }
    return ReelsIndexManager.instance;
  }

  // Initialize with reel data
  async initialize(reels: any[]) {
    console.log('🚀 Initializing Reels Index Manager');
    
    this.reelUrls = reels.map(reel => reel.uri);
    this.totalReels = reels.length;
    this.currentReelIndex = 0;
    
    // Initialize instant loader
    await initializeInstantLoader(this.reelUrls);
    
    // Preload first 3 reels immediately
    await this.preloadInitialReels();
    
    this.isInitialized = true;
    console.log('✅ Reels Index Manager ready');
  }

  // Preload first 3 reels for instant access
  private async preloadInitialReels() {
    console.log('⚡ Preloading initial reels for instant playback');
    
    const indicesToPreload = [0, 1, 2]; // First 3 reels
    for (const index of indicesToPreload) {
      if (index < this.totalReels) {
        await preloadNextReelInstantly(this.reelUrls[index]);
        console.log(`⚡ Preloaded reel ${index}: ${this.reelUrls[index]}`);
      }
    }
  }

  // Get current reel
  getCurrentReel(): string {
    return this.reelUrls[this.currentReelIndex] || '';
  }

  // Move to next reel instantly
  async moveToNextReel(): Promise<string> {
    const nextIndex = (this.currentReelIndex + 1) % this.totalReels;
    this.currentReelIndex = nextIndex;
    
    console.log(`⏭️ Moving to next reel: ${nextIndex}`);
    
    // Start loading next reel in background immediately
    const afterNextIndex = (nextIndex + 1) % this.totalReels;
    await preloadNextReelInstantly(this.reelUrls[afterNextIndex]);
    
    // Clean up old reel (keep only last 2)
    this.cleanupOldReels(nextIndex);
    
    return this.getCurrentReel();
  }

  // Move to previous reel instantly
  async moveToPreviousReel(): Promise<string> {
    const prevIndex = this.currentReelIndex === 0 ? this.totalReels - 1 : this.currentReelIndex - 1;
    this.currentReelIndex = prevIndex;
    
    console.log(`⏮️ Moving to previous reel: ${prevIndex}`);
    
    // Start loading previous reel in background immediately
    const beforePrevIndex = prevIndex === 0 ? this.totalReels - 1 : prevIndex - 1;
    await preloadNextReelInstantly(this.reelUrls[beforePrevIndex]);
    
    // Clean up old reel (keep only last 2)
    this.cleanupOldReels(prevIndex);
    
    return this.getCurrentReel();
  }

  // Clean up old reels to save memory (keep only current + next + previous)
  private cleanupOldReels(currentIndex: number) {
    const keepIndices = [
      currentIndex,
      (currentIndex + 1) % this.totalReels, // next
      currentIndex === 0 ? this.totalReels - 1 : currentIndex - 1 // previous
    ];

    // Clean up chunk managers for reels we don't need
    Object.keys(activeChunkManagers).forEach((uri, index) => {
      const shouldKeep = keepIndices.some(keepIndex => this.reelUrls[keepIndex] === uri);
      
      if (!shouldKeep) {
        const manager = activeChunkManagers.get(uri);
        if (manager) {
          console.log(`🗑️ Cleaning up old reel: ${uri}`);
          manager.cleanup();
          activeChunkManagers.delete(uri);
        }
      }
    });
  }

  // Get reel status
  getReelStatus() {
    return {
      currentIndex: this.currentReelIndex,
      totalReels: this.totalReels,
      isInitialized: this.isInitialized,
      currentReel: this.getCurrentReel(),
      nextReel: this.reelUrls[(this.currentReelIndex + 1) % this.totalReels],
      previousReel: this.currentReelIndex === 0 ? 
        this.reelUrls[this.totalReels - 1] : 
        this.reelUrls[this.currentReelIndex - 1]
    };
  }

  // Force preload specific reel
  async preloadReel(index: number) {
    if (index >= 0 && index < this.totalReels) {
      await preloadNextReelInstantly(this.reelUrls[index]);
      console.log(`⚡ Force preloaded reel ${index}`);
    }
  }
}

export default ReelsIndexManager;
export { ReelsIndexManager };
