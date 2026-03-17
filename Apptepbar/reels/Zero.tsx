import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  ViewToken,
  TouchableWithoutFeedback,
  FlatList,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VideoContainer from './Components/VideoContainer';
import InteractionBar from './Components/InteractionBar';
import ChannelInfo from './Components/ChannelInfo';
import ReelPlayer from './Player/ReelPlayer';
import { getVideoUrl } from './cloudin';
// @ts-ignore
import { fetchReelsFromR2 } from './ZeroLogic';

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
  const [preloadedVideos, setPreloadedVideos] = useState<Set<string>>(new Set());
  const [preWarmedVideos, setPreWarmedVideos] = useState<Set<string>>(new Set());
  const flatListRef = useRef<FlatList<VideoItem>>(null);

  const insets = useSafeAreaInsets();

  // Pre-warming logic for instant next reel
  const preWarmNextReel = useCallback(async (nextVideoUrl: string) => {
    if (preWarmedVideos.has(nextVideoUrl)) return;
    
    try {
      console.log('🔥 Pre-warming next reel:', nextVideoUrl);
      
      // Simulate pre-warming (in real implementation, this would prepare video)
      setTimeout(() => {
        setPreWarmedVideos(prev => new Set(prev).add(nextVideoUrl));
        console.log('✅ Next reel pre-warmed and ready:', nextVideoUrl);
      }, 100); // Minimal delay for instant readiness
      
    } catch (error) {
      console.log('⚠️ Pre-warm failed:', error);
    }
  }, [preWarmedVideos]);

  // Initialize and fetch videos
  useEffect(() => {
    const initializeReels = async () => {
      try {
        console.log('🚀 Starting reels initialization...');
        await fetchVideosFromAPI();
      } catch (error) {
        console.error('❌ Reels initialization failed:', error);
        setError('Failed to load reels');
        setLoading(false);
      }
    };
    
    // Only initialize if videos array is empty
    if (videos.length === 0) {
      initializeReels();
    }
  }, [videos.length]);

  // Simplified preloading - only focus on next reel
  useEffect(() => {
    if (videos.length === 0 || currentVisibleIndex < 0) return;
    
    const currentIndex = currentVisibleIndex;
    const nextIndex = (currentIndex + 1) % videos.length;
    const nextVideo = videos[nextIndex];
    
    console.log(`🎯 Simple preloading: Current=${currentIndex}, Next=${nextIndex}`);
    
    // Only preload next video, no complex cleanup
    if (nextVideo && !preloadedVideos.has(nextVideo.id)) {
      console.log(`⏭️ Preloading next reel: ${nextVideo.id}`);
      
      // Simple background preload without chunk managers
      setTimeout(() => {
        setPreloadedVideos(prev => new Set(prev).add(nextVideo.id));
        console.log(`✅ Next reel marked as ready: ${nextVideo.id}`);
      }, 200); // Small delay to not block UI
    }
    
    // Keep only current and next in memory (simple cleanup)
    if (preloadedVideos.size > 2) {
      const videosToKeep = new Set([
        videos[currentIndex]?.id,
        nextVideo?.id
      ].filter(Boolean));
      
      if (videosToKeep.size < preloadedVideos.size) {
        console.log(`🧹 Simple memory cleanup: keeping ${Array.from(videosToKeep).join(', ')}`);
        setPreloadedVideos(videosToKeep);
      }
    }
    
  }, [currentVisibleIndex, videos]); // Remove complex dependencies

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

  const onViewableItemsChanged = React.useCallback(({ viewableItems }: { viewableItems: ViewToken<VideoItem>[] }) => {
    console.log('👀 Viewable items changed:', viewableItems.length);
    
    // ONLY update index - NO async operations to prevent blocking
    if (viewableItems.length > 0 && viewableItems[0].index !== undefined && viewableItems[0].index !== null) {
      const newIndex = viewableItems[0].index;
      const oldIndex = currentVisibleIndex;
      
      // Update index only if actually changed
      if (newIndex !== oldIndex) {
        console.log(`🔄 Ultra-fast index change: ${oldIndex} → ${newIndex}`);
        setCurrentVisibleIndex(newIndex);
        
        // Pre-warm next reel in background for instant play
        if (videos.length > 0) {
          const nextIndex = (newIndex + 1) % videos.length;
          const nextVideo = videos[nextIndex];
          if (nextVideo && !preWarmedVideos.has(nextVideo.id)) {
            console.log(`🔥 Pre-warming reel ${nextIndex} for instant play`);
            preWarmNextReel(nextVideo.uri);
          }
        }
      }
    }
  }, [currentVisibleIndex, videos, preWarmedVideos, preWarmNextReel]);

  const viewabilityConfig = React.useRef({
    viewAreaCoveragePercentThreshold: 80,
    minimumViewTime: 100,
    itemVisibilityPercentThreshold: 80,
  }).current;

  const handleVideoTap = useCallback((videoId: string) => {
    // Simple tap to toggle play/pause state
    setPausedVideos((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  }, []);

  const isVideoPlaying = useCallback((videoId: string, index: number) => {
    const isVisible = index === currentVisibleIndex;
    const isPaused = pausedVideos.has(videoId);
    return isVisible && !isPaused;
  }, [currentVisibleIndex, pausedVideos]);

  const renderVideoItem = ({ item, index }: { item: VideoItem; index: number }) => {
    const isPlaying = isVideoPlaying(item.id, index);

    return (
      <View style={styles.videoContainer}>
        {/* Status Bar Overlay */}
        <View style={[styles.statusBarOverlay, { height: insets.top }]} />
        
        <TouchableWithoutFeedback onPress={() => handleVideoTap(item.id)}>
          <View style={styles.videoWrapper}>
            <ReelPlayer
              key={`${item.uri}-${index}`}
              videoUrl={item.uri}
              isPlaying={isPlaying}
            />
          </View>
        </TouchableWithoutFeedback>
        {/* Gradient Overlay Top */}
        <View style={[styles.gradientOverlay, styles.topGradient]} />
        {/* Gradient Overlay Bottom */}
        <View style={[styles.gradientOverlay, styles.bottomGradient]} />
        
        {/* JUGAAD - Ultimate control killer */}
        <View style={styles.controlKiller} />
        
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
          <Text style={styles.loadingText}>Loading Reels...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : videos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No reels available</Text>
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
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
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
  statusBarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 2,
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
  },
  topGradient: {
    top: 0,
    height: 150,
    backgroundColor: 'transparent',
  },
  bottomGradient: {
    bottom: 0,
    height: 200,
    backgroundColor: 'transparent',
  },
  // JUGAAD - Force hide any remaining controls
  controlKiller: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'transparent',
    opacity: 0,
    zIndex: -9999,
    pointerEvents: 'none' as const,
    display: 'none' as const,
    visibility: 'hidden' as const,
  },
});

export default Zero;
