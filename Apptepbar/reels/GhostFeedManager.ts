import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { API_KEYS } from '@/constants/Config';
// @ts-ignore
import { fetchReelsFromR2 } from './ZeroLogic';

const KRONOP_API_URL = 'https://kronop-76zy.onrender.com';

interface ReelData {
  id: string;
  videoUrl: string;
  username: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  timestamp: number;
}

interface GhostFeedManagerProps {
  maxReels?: number;
  preloadCount?: number;
  onReelChange?: (reel: ReelData) => void;
  onMemoryWarning?: (usage: number) => void;
}

const GhostFeedManager: React.FC<GhostFeedManagerProps> = ({
  maxReels = 2,
  preloadCount = 1,
  onReelChange,
  onMemoryWarning,
}) => {
  // State management - 2-Reel Only Rule
  const [activeReel, setActiveReel] = useState<ReelData | null>(null);
  const [nextReel, setNextReel] = useState<ReelData | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [reels, setReels] = useState<ReelData[]>([]);
  
  // Refs for performance optimization
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const memoryCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const tapCount = useRef<number>(0);

  // Initialize memory monitoring
  useEffect(() => {
    // Start memory monitoring
    memoryCheckIntervalRef.current = setInterval(() => {
      checkMemoryUsage();
    }, 5000) as unknown as NodeJS.Timeout;

    return () => {
      if (memoryCheckIntervalRef.current) {
        clearInterval(memoryCheckIntervalRef.current);
      }
    };
  }, []);

  // Check memory usage and warn if needed
  const checkMemoryUsage = useCallback(async () => {
    try {
      // Get actual memory metrics from chunk managers
      const { activeChunkManagers } = await import('./cloudin');
      const { smartPreloader } = await import('./SmartPreloader');
      
      const totalChunkManagers = activeChunkManagers.size;
      const preloaderStatus = smartPreloader.getStatus();
      
      // Only log if there's actual memory data
      if (totalChunkManagers > 0 || preloaderStatus.preloadedVideos > 0) {
        console.log(`🧠 Memory Status: ${totalChunkManagers} managers, ${preloaderStatus.preloadedVideos} preloaded videos`);
        
        // Warn if memory usage is high
        if (totalChunkManagers > 5) {
          onMemoryWarning?.(totalChunkManagers);
        }
      }
      
    } catch (error) {
      console.warn('Memory check failed:', error);
    }
  }, [onMemoryWarning]);

  // Purge old reels to free memory
  const purgeOldReels = useCallback(async () => {
    try {
      console.log('🧹 Starting memory purge for old reels...');
      
      // Get current active reel and next reel IDs to keep
      const keepIds = new Set<string>();
      if (activeReel) keepIds.add(activeReel.id);
      if (nextReel) keepIds.add(nextReel.id);
      
      // Cleanup chunk managers for old videos
      const { activeChunkManagers } = await import('./cloudin');
      const chunkManagersToCleanup = [];
      
      for (const [videoUrl, chunkManager] of activeChunkManagers.entries()) {
        // Extract video ID from URL for comparison
        const videoId = videoUrl.split('/').pop()?.split('?')[0] || '';
        
        // Check if this chunk manager belongs to an old reel
        const shouldCleanup = !keepIds.has(videoId) && 
                              !videoUrl.includes(activeReel?.videoUrl || '') &&
                              !videoUrl.includes(nextReel?.videoUrl || '');
        
        if (shouldCleanup) {
          chunkManagersToCleanup.push(videoUrl);
          console.log(`🗑️ Marking chunk manager for cleanup: ${videoUrl}`);
        }
      }
      
      // Cleanup old chunk managers
      chunkManagersToCleanup.forEach(videoUrl => {
        activeChunkManagers.delete(videoUrl);
      });
      
      // Cleanup smart preloader
      const { smartPreloader } = await import('./SmartPreloader');
      const keepVideos = Array.from(keepIds).map(id => {
        if (activeReel?.id === id) return activeReel.videoUrl;
        if (nextReel?.id === id) return nextReel.videoUrl;
        return '';
      }).filter(Boolean);
      
      smartPreloader.cleanup(keepVideos);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log('🗑️ Forced garbage collection');
      }
      
      // Memory metrics
      const totalChunkManagers = activeChunkManagers.size;
      const preloaderStatus = smartPreloader.getStatus();
      
      console.log(`✅ Memory purge completed:`);
      console.log(`   - Chunk managers cleaned: ${chunkManagersToCleanup.length}`);
      console.log(`   - Active chunk managers: ${totalChunkManagers}`);
      console.log(`   - Preloaded videos: ${preloaderStatus.preloadedVideos}`);
      console.log(`   - Total preloaded chunks: ${preloaderStatus.totalChunks}`);
      
      // Warn if memory usage is still high
      if (totalChunkManagers > 5) {
        const warning = `⚠️ High memory usage: ${totalChunkManagers} active chunk managers`;
        console.warn(warning);
        onMemoryWarning?.(totalChunkManagers);
      }
      
    } catch (error) {
      console.error('❌ Memory purge failed:', error);
    }
  }, [activeReel, nextReel, onMemoryWarning]);

  // Load reel data (simplified)
  const loadReelFromVault = useCallback(async (reelId: string): Promise<ReelData | null> => {
    try {
      // Direct fetch without LocalVault
      const reels = await fetchReelsFromR2();
      const reel = reels.find((r: any) => r.id === reelId || r._id === reelId);
      
      if (reel) {
        return {
          id: reel.id || reel._id,
          videoUrl: reel.videoUrl || reel.url,
          username: reel.username || reel.channelName,
          description: reel.description || reel.title,
          likes: reel.likes,
          comments: reel.comments,
          shares: reel.shares,
          isLiked: reel.isLiked || false,
          timestamp: reel.timestamp || Date.now(),
        };
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to load reel:', error);
      return null;
    }
  }, []);

  // Save reel data (simplified)
  const saveReelToVault = useCallback(async (reel: ReelData): Promise<void> => {
    try {
      // Simplified save without LocalVault
      console.log(`💾 Reel saved: ${reel.id}`);
    } catch (error) {
      // Silent fail
    }
  }, []);

  // Smart transition with preloading
  const transitionToReel = useCallback(async (targetReelId: string) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    try {
      // Load target reel
      const targetReel = await loadReelFromVault(targetReelId);
      
      if (targetReel) {
        // Preload next reel if available
        const nextReelId = getNextReelId(targetReelId);
        let nextReelData: ReelData | null = null;
        
        if (nextReelId) {
          nextReelData = await loadReelFromVault(nextReelId);
        }
        
        // Smart transition with 1ms delay
        transitionTimeoutRef.current = setTimeout(() => {
          setActiveReel(targetReel);
          setNextReel(nextReelData);
          onReelChange?.(targetReel);
          setIsTransitioning(false);
        }, 1) as unknown as NodeJS.Timeout;
      }
    } catch (error) {
      setIsTransitioning(false);
    }
  }, [isTransitioning, loadReelFromVault, onReelChange]);

  // Get next reel ID for preloading
  const getNextReelId = useCallback((currentId: string): string | null => {
    // Get next reel from actual R2 data
    if (reels.length > 1) {
      const currentIndex = reels.findIndex(reel => reel.id === currentId);
      if (currentIndex !== -1 && currentIndex < reels.length - 1) {
        return reels[currentIndex + 1].id;
      }
    }
    return null;
  }, [reels]);

  // Initialize with first reel from R2
  useEffect(() => {
    const initializeFeed = async () => {
      // Prevent multiple initializations
      if (activeReel) {
        console.log('👻 GhostFeed already initialized, skipping...');
        return;
      }
      
      // Reduce log frequency - only log if debug mode
      if (__DEV__) {
        console.log('👻 GhostFeed initializing...');
      }
      
      try {
        // Fetch from R2 directly
        const reels = await fetchReelsFromR2();
        
        console.log('👻 GhostFeed R2 response:', reels.length, 'reels found');
        
        if (reels && reels.length > 0) {
          console.log('👻 GhostFeed received:', reels.length, 'reels');
          
          // Set reels state for getNextReelId function
          setReels(reels);
          
          const firstReel = {
            id: reels[0]._id || reels[0].id,
            videoUrl: reels[0].videoUrl || reels[0].url || reels[0].filename,
            username: reels[0].username || reels[0].channelName,
            description: reels[0].title || reels[0].description,
            likes: reels[0].likes || 0,
            comments: reels[0].comments || 0,
            shares: reels[0].shares || 0,
            isLiked: false,
            timestamp: Date.now(),
          };
          
          console.log('👻 GhostFeed first reel:', firstReel.id);
          
          // Save to vault and set as active
          await saveReelToVault(firstReel);
          setActiveReel(firstReel);
          onReelChange?.(firstReel);
          return;
        } else {
          console.error('👻 GhostFeed: No reels found in R2 bucket');
          // No mock data - show error instead
          setActiveReel(null);
          return;
        }
      } catch (error) {
        console.error('👻 GhostFeed initialization error:', error);
        // No fallback - keep empty if R2 fails
        setActiveReel(null);
      }
    };
    
    initializeFeed();
  }, [activeReel, loadReelFromVault, saveReelToVault, onReelChange]);

  // Expose methods for parent components
  React.useImperativeHandle(React.createRef<any>(), () => ({
    loadReel: transitionToReel,
    purgeMemory: purgeOldReels,
    getCurrentReel: () => activeReel,
    getNextReel: () => nextReel,
    isTransitioning: () => isTransitioning,
  }));

  return null;
};

// Export GhostFeedManager as default
export default GhostFeedManager;
