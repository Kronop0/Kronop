import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  ViewToken,
  TouchableWithoutFeedback,
  Animated,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VideoContainer from './Components/VideoContainer';
import InteractionBar from './Components/InteractionBar';
import ChannelInfo from './Components/ChannelInfo';
import VideoPlayer from './Player/VideoPlayer';
// @ts-ignore
import GhostFeedManager from './GhostFeedManager';
import { API_KEYS } from '@/constants/Config';
import { getVideoUrl, getReelUrl, activeChunkManagers, ChunkManager } from './cloudin';
// @ts-ignore
import { fetchReelsFromR2 } from './ZeroLogic';
// @ts-ignore
import { smartPreloader } from './SmartPreloader';

// API URL from constants
const KRONOP_API_URL = 'https://kronop-76zy.onrender.com';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface VideoItem {
  id: string;
  uri: string;
  title: string;
  channelName: string;
  channelLogo: string;
  isVerified?: boolean;
  likes?: number;
  comments?: number;
  shares?: number;
}

const Zero: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState<number>(0);
  const [pausedVideos, setPausedVideos] = useState<Set<string>>(new Set());
  const [showPlayPauseMap, setShowPlayPauseMap] = useState<Map<string, boolean>>(new Map());
  const [preloadedVideos, setPreloadedVideos] = useState<Set<string>>(new Set());
  const [swipeDirection, setSwipeDirection] = useState<'up' | 'down' | null>(null);
  const [memoryOptimizedMode, setMemoryOptimizedMode] = useState(true);
  const flatListRef = useRef<FlatList<VideoItem>>(null);
  const fadeAnimMap = useRef<Map<string, Animated.Value>>(new Map()).current;
  const hideTimeoutMap = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map()).current;
  const loadedChunksRef = useRef<Map<string, Set<string>>>(new Map()).current;

  // Manual swipe function for debugging and fallback
  const swipeToNextVideo = useCallback(() => {
    if (videos.length === 0) return;
    
    const nextIndex = (currentVisibleIndex + 1) % videos.length;
    console.log(`👆 Manually swiping to next video: ${nextIndex}`);
    
    setCurrentVisibleIndex(nextIndex);
    flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
  }, [currentVisibleIndex, videos.length]);

  const swipeToPrevVideo = useCallback(() => {
    if (videos.length === 0) return;
    
    const prevIndex = currentVisibleIndex === 0 ? videos.length - 1 : currentVisibleIndex - 1;
    console.log(`👇 Manually swiping to previous video: ${prevIndex}`);
    
    setCurrentVisibleIndex(prevIndex);
    flatListRef.current?.scrollToIndex({ index: prevIndex, animated: true });
  }, [currentVisibleIndex, videos.length]);

  const insets = useSafeAreaInsets();

  // Initialize and fetch videos
  useEffect(() => {
    const initializeReels = async () => {
      try {
        await fetchVideosFromAPI();
      } catch (error) {
        console.error('❌ Reels initialization failed:', error);
        setLoading(false);
      }
    };
    
    // Only initialize if videos array is empty
    if (videos.length === 0) {
      initializeReels();
    }
  }, [videos.length]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      // Clean up preloaded chunks when component unmounts
      smartPreloader.cleanup();
      console.log('🧹 SmartPreloader cleaned up on unmount');
    };
  }, []);

  // Memory-optimized preloading - only keep current and next reels
  useEffect(() => {
    if (!memoryOptimizedMode || videos.length === 0 || currentVisibleIndex < 0) return;
    
    const currentIndex = currentVisibleIndex;
    const nextIndex = (currentIndex + 1) % videos.length;
    const prevIndex = currentIndex === 0 ? videos.length - 1 : currentIndex - 1;
    
    const currentVideo = videos[currentIndex];
    const nextVideo = videos[nextIndex];
    const prevVideo = videos[prevIndex];
    
    console.log(`🧠 Memory mode: Loading only current + next reels`);
    console.log(`📺 Current: ${currentVideo?.id}, Next: ${nextVideo?.id}, Previous: ${prevVideo?.id}`);
    
    // Clean up all other chunks except current and next
    const videosToKeep = new Set([currentVideo?.id, nextVideo?.id].filter(Boolean));
    
    // Clean up chunk managers for videos we don't need
    Object.keys(activeChunkManagers).forEach(uri => {
      const videoId = videos.find(v => v.uri === uri)?.id;
      if (videoId && !videosToKeep.has(videoId)) {
        const manager = activeChunkManagers.get(uri);
        if (manager) {
          console.log(`🗑️ Cleaning up chunks for: ${uri}`);
          manager.cleanup();
          activeChunkManagers.delete(uri);
        }
      }
    });
    
    // Preload next reel chunks only
    if (nextVideo && !preloadedVideos.has(nextVideo.id)) {
      console.log(`⏭️ Preloading next reel chunks: ${nextVideo.id}`);
      
      // Create chunk manager for next video if not exists
      if (!activeChunkManagers.has(nextVideo.uri)) {
        const chunkManager = new ChunkManager(nextVideo.uri);
        activeChunkManagers.set(nextVideo.uri, chunkManager);
      }
      
      // Preload first 2 chunks of next video
      const nextManager = activeChunkManagers.get(nextVideo.uri);
      if (nextManager) {
        nextManager.preloadChunks([0, 1]).then(() => {
          setPreloadedVideos(prev => new Set(prev).add(nextVideo.id));
          console.log(`✅ Next reel preloaded: ${nextVideo.id}`);
        });
      }
    }
    
    // Update preloaded set to only keep current and next
    setPreloadedVideos(videosToKeep);
    
  }, [currentVisibleIndex, videos, memoryOptimizedMode]);

  // Fetch videos directly from R2 bucket
  const fetchVideosFromAPI = async () => {
    try {
      console.log('🎬 Fetching videos from API...');
      
      // Fetch from R2 only - no mock data
      const reelsData = await fetchReelsFromR2();
      
      if (reelsData && reelsData.length > 0) {
        console.log('✅ Fetched reels from R2:', reelsData.length);
        
        // Transform API data to VideoItem format
        const transformedVideos = reelsData.map((reel: any) => {
          const videoUrl = getVideoUrl(reel.videoUrl);
          console.log(`🎥 Transforming reel: ${reel.id} -> ${videoUrl}`);
          
          return {
            id: reel.id,
            uri: videoUrl,
            title: reel.title || reel.description || 'Amazing Reel',
            channelName: reel.channelName || reel.username || 'Kronop',
            channelLogo: `https://picsum.photos/seed/${reel.id}/200/200.jpg`,
            isVerified: false,
            likes: reel.likes || Math.floor(Math.random() * 10000),
            comments: reel.comments || Math.floor(Math.random() * 1000),
            shares: reel.shares || Math.floor(Math.random() * 500),
            supports: reel.supports || 0,
            videoUrl: reel.videoUrl,
          };
        });
        
        console.log('🎯 Transformed videos:', transformedVideos.length);
        transformedVideos.forEach((video: any, index: number) => {
          console.log(`🎬 Video ${index + 1}:`, video.id, video.uri);
        });
        setVideos(transformedVideos);
        
        // Initialize chunk managers for each video
        transformedVideos.forEach((video: any) => {
          if (!activeChunkManagers.has(video.uri)) {
            console.log('📦 Creating chunk manager for:', video.uri);
            const chunkManager = new ChunkManager(video.uri);
            activeChunkManagers.set(video.uri, chunkManager);
          }
        });
        
        setError(null);
      } else {
        console.warn('⚠️ No reels found in R2 bucket');
        setVideos([]);
      }
      
    } catch (error) {
      console.error('💥 Fetch Error:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const onViewableItemsChanged = React.useCallback(({ viewableItems, changed }: { viewableItems: ViewToken<VideoItem>[]; changed: ViewToken<VideoItem>[] }) => {
    console.log('👀 Viewable items changed:', viewableItems.length, 'Changed:', changed.length);
    
    if (viewableItems.length > 0 && viewableItems[0].index !== undefined && viewableItems[0].index !== null) {
      const newIndex = viewableItems[0].index;
      const oldIndex = currentVisibleIndex;
      
      console.log(`🔄 Video index changed from ${oldIndex} to ${newIndex}`);
      setCurrentVisibleIndex(newIndex);
      
      // Hide all play/pause controls when scrolling
      setShowPlayPauseMap(new Map());
      
      // Memory-optimized: Only preload next reel, clean up others
      if (videos.length > 0 && newIndex !== oldIndex && memoryOptimizedMode) {
        const currentVideo = videos[newIndex];
        const nextIndex = (newIndex + 1) % videos.length;
        const nextVideo = videos[nextIndex];
        
        if (currentVideo && nextVideo) {
          console.log(`🎯 Memory swipe: ${oldIndex} → ${newIndex}, keeping current + next only`);
          
          // Clean up previous video chunks
          if (oldIndex >= 0 && oldIndex < videos.length) {
            const prevVideo = videos[oldIndex];
            if (prevVideo && prevVideo.id !== currentVideo.id) {
              const prevManager = activeChunkManagers.get(prevVideo.uri);
              if (prevManager) {
                console.log(`🗑️ Cleaning previous reel chunks: ${prevVideo.id}`);
                prevManager.cleanup();
              }
            }
          }
          
          // Preload next video chunks (first 2 chunks only)
          if (!activeChunkManagers.has(nextVideo.uri)) {
            const chunkManager = new ChunkManager(nextVideo.uri);
            activeChunkManagers.set(nextVideo.uri, chunkManager);
          }
          
          const nextManager = activeChunkManagers.get(nextVideo.uri);
          if (nextManager) {
            nextManager.preloadChunks([0, 1]).then(() => {
              setPreloadedVideos(prev => new Set(prev).add(nextVideo.id));
              console.log(`⏭️ Next reel ready: ${nextVideo.id}`);
            });
          }
        }
      }
    }
  }, [currentVisibleIndex, videos, memoryOptimizedMode]);

  const viewabilityConfig = React.useRef({
    viewAreaCoveragePercentThreshold: 80,
    minimumViewTime: 100,
    itemVisibilityPercentThreshold: 80,
  }).current;

  const handleVideoTap = useCallback((videoId: string) => {
    // Toggle play/pause state
    setPausedVideos((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });

    // Show play/pause button temporarily
    setShowPlayPauseMap((prev: Map<string, boolean>) => {
      const newMap = new Map(prev);
      newMap.set(videoId, true);
      return newMap;
    });

    // Initialize fade animation if not exists
    if (!fadeAnimMap.has(videoId)) {
      fadeAnimMap.set(videoId, new Animated.Value(1));
    }

    const fadeAnim = fadeAnimMap.get(videoId);
    if (fadeAnim) {
      // Reset to fully visible
      fadeAnim.setValue(1);

      // Clear existing timeout
      if (hideTimeoutMap.has(videoId)) {
        clearTimeout(hideTimeoutMap.get(videoId));
      }

      // Set new timeout to fade out after 1 second
      const timeout = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setShowPlayPauseMap((prev: Map<string, boolean>) => {
            const newMap = new Map(prev);
            newMap.delete(videoId);
            return newMap;
          });
        });
      }, 1000);

      hideTimeoutMap.set(videoId, timeout);
    }
  }, [fadeAnimMap]);

  const isVideoPlaying = useCallback((videoId: string, index: number) => {
    const isVisible = index === currentVisibleIndex;
    const isPaused = pausedVideos.has(videoId);
    return isVisible && !isPaused;
  }, [currentVisibleIndex, pausedVideos]);

  const renderVideoItem = ({ item, index }: { item: VideoItem; index: number }) => {
    const isPlaying = isVideoPlaying(item.id, index);
    const showPlayPause = showPlayPauseMap.get(item.id) || false;
    const fadeAnim = fadeAnimMap.get(item.id);
    const isPaused = pausedVideos.has(item.id);
    const isPreloaded = preloadedVideos.has(item.id);

    // Get chunk manager for this video (for debugging only)
    const chunkManager = activeChunkManagers.get(item.uri);

    return (
      <View style={styles.videoContainer}>
        {/* Status Bar Overlay */}
        <View style={[styles.statusBarOverlay, { height: insets.top }]} />
        
        <TouchableWithoutFeedback onPress={() => handleVideoTap(item.id)}>
          <View style={styles.videoWrapper}>
            <VideoPlayer
              videoUrl={item.uri}
              isPlaying={isPlaying}
            />

            {/* Play/Pause Overlay - Center of Screen */}
            {showPlayPause && fadeAnim && (
              <Animated.View style={[styles.playPauseOverlay, { opacity: fadeAnim }]}>
                <View style={styles.playPauseButton}>
                  {isPaused ? (
                    <View style={styles.playIcon}>
                      <View style={[styles.playTriangle, { borderLeftWidth: 20, borderTopWidth: 12, borderBottomWidth: 12 }]} />
                    </View>
                  ) : (
                    <View style={styles.pauseIcon}>
                      <View style={styles.pauseBar} />
                      <View style={styles.pauseBar} />
                    </View>
                  )}
                </View>
              </Animated.View>
            )}
          </View>
        </TouchableWithoutFeedback>
        {/* Gradient Overlay Top */}
        <View style={[styles.gradientOverlay, styles.topGradient]} />
        {/* Gradient Overlay Bottom */}
        <View style={[styles.gradientOverlay, styles.bottomGradient]} />
        
        {/* Interaction Bar - Self-contained buttons */}
        <InteractionBar
          videoId={item.id}
          title={item.title}
          initialLikes={item.likes || 0}
          initialComments={item.comments || 0}
          initiallyLiked={false}
        />
        
        {/* Channel Info - Self-contained */}
        <ChannelInfo
          videoId={item.id}
          channelLogo={item.channelLogo}
          channelName={item.channelName}
          videoTitle={item.title}
          isVerified={item.isVerified}
          initiallySupported={false}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <VideoContainer
          videos={videos}
          renderItem={renderVideoItem}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          flatListRef={flatListRef}
        />
      )}
      {/* GhostFeedManager for smart caching and preloading */}
      <GhostFeedManager
        maxReels={2}
        preloadCount={1}
        onReelChange={(reel) => {
          console.log('👻 GhostFeed reel changed:', reel?.id || 'No reel');
          if (reel && !videos.length) {
            // If Zero.tsx has no videos but GhostFeed has a reel, use it
            const videoUrl = getReelUrl(reel.videoUrl);
            const newVideo = {
              id: reel.id,
              uri: videoUrl,
              title: reel.description,
              channelName: reel.username,
              channelLogo: `https://picsum.photos/seed/${reel.id}/200/200.jpg`,
              isVerified: false,
              likes: reel.likes,
              comments: reel.comments,
              shares: reel.shares,
            };
            setVideos([newVideo]);
          }
        }}
        onMemoryWarning={(usage) => console.log('⚠️ Memory warning:', usage)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  videoContainer: {
    width: screenWidth,
    height: screenHeight,
    position: 'relative',
  },
  videoWrapper: {
    width: screenWidth,
    height: screenHeight,
    position: 'relative',
  },
  preloadIndicator: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  preloadDot: {
    width: 12,
    height: 12,
    backgroundColor: '#00ff00',
    borderRadius: 6,
  },
  statusBarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 2,
  },
  playPauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 5,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  playTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: '#fff',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightWidth: 0,
  },
  pauseIcon: {
    width: 24,
    height: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  pauseBar: {
    width: 6,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1, // Lower than buttons and text
  },
  topGradient: {
    top: 0,
    height: 120,
    backgroundColor: 'transparent',
    borderTopColor: 'transparent',
  },
  bottomGradient: {
    bottom: 0,
    height: 200,
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
  },
});

export default Zero;
