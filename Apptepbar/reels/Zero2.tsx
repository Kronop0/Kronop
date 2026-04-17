import React, { useCallback } from 'react';
import { ViewToken, FlatList } from 'react-native';
import { View, StyleSheet, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getVideoUrl } from './cloudin';
import VideoContainer from './Components/VideoContainer';
import InteractionBar from './Components/InteractionBar';
import ChannelInfo from './Components/ChannelInfo';
import ReelPlayer from './Player/ReelPlayer';
// @ts-ignore
import { fetchReelsFromR2 } from './ZeroLogic';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

export interface VideoItem {
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

// Pre-warming logic for instant next reel
export const usePreWarmNextReel = (preWarmedVideos: Set<string>, setPreWarmedVideos: React.Dispatch<React.SetStateAction<Set<string>>>) => {
  return useCallback(async (nextVideoUrl: string) => {
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
  }, [preWarmedVideos, setPreWarmedVideos]);
};

// Fetch videos directly from R2 bucket
export const useFetchVideosFromAPI = () => {
  return useCallback(async (setVideos: React.Dispatch<React.SetStateAction<VideoItem[]>>, setLoading: React.Dispatch<React.SetStateAction<boolean>>, setError: React.Dispatch<React.SetStateAction<string | null>>) => {
    try {
      console.log('🎬 Fetching videos from API...');
      
      // Fetch from R2 only - no mock data
      const reelsData = await fetchReelsFromR2();
      
      if (reelsData && reelsData.length > 0) {
        console.log('✅ Fetched reels from R2:', reelsData.length);
        
        // Transform to VideoItem format with detailed logging
        const transformedVideos = reelsData.map((reel, index) => {
          const videoUrl = getVideoUrl(reel.videoUrl);
          console.log(`🔄 Transforming reel ${index + 1}: ${reel.id} -> ${videoUrl}`);
          
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
          };
        });
        
        console.log('🎯 FINAL VIDEO LIST FOR REELS:');
        transformedVideos.forEach((video, index) => {
          console.log(`🎬 Video ${index + 1}: ${video.id} - URI: ${video.uri} - Title: ${video.title}`);
        });
        
        setVideos(transformedVideos);
        setLoading(false);
        console.log('🚀 Reels loaded successfully!');
      } else {
        console.log('⚠️ No reels data received');
        setVideos([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error fetching videos:', error);
      setError('Failed to load reels');
      setLoading(false);
    }
  }, []);
};

// Simplified preloading logic
export const useVideoPreloading = (videos: VideoItem[], currentVisibleIndex: number, preloadedVideos: Set<string>, setPreloadedVideos: React.Dispatch<React.SetStateAction<Set<string>>>) => {
  return useCallback(() => {
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
  }, [currentVisibleIndex, videos, preloadedVideos, setPreloadedVideos]);
};

// Viewable items changed handler
export const useOnViewableItemsChanged = (currentVisibleIndex: number, setCurrentVisibleIndex: React.Dispatch<React.SetStateAction<number>>, videos: VideoItem[], preWarmedVideos: Set<string>, preWarmNextReel: (url: string) => Promise<void>) => {
  return React.useCallback(({ viewableItems }: { viewableItems: ViewToken<VideoItem>[] }) => {
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
  }, [currentVisibleIndex, setCurrentVisibleIndex, videos, preWarmedVideos, preWarmNextReel]);
};

// Video tap handler
export const useHandleVideoTap = (pausedVideos: Set<string>, setPausedVideos: React.Dispatch<React.SetStateAction<Set<string>>>) => {
  return useCallback((videoId: string) => {
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
  }, [pausedVideos, setPausedVideos]);
};

// Video playing checker
export const useIsVideoPlaying = (currentVisibleIndex: number, pausedVideos: Set<string>) => {
  return useCallback((videoId: string, index: number) => {
    const isVisible = index === currentVisibleIndex;
    const isPaused = pausedVideos.has(videoId);
    return isVisible && !isPaused;
  }, [currentVisibleIndex, pausedVideos]);
};

// Render video item component
export const useRenderVideoItem = (handleVideoTap: (videoId: string) => void, isVideoPlaying: (videoId: string, index: number) => boolean, insets: any) => {
  const styles = StyleSheet.create({
    videoContainer: {
      width: screenWidth,
      height: screenHeight,
      position: 'relative',
      backgroundColor: 'transparent',
    },
    videoWrapper: {
      width: screenWidth,
      height: screenHeight,
      position: 'relative',
      backgroundColor: 'transparent',
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
    },
  });

  return useCallback(({ item, index }: { item: VideoItem; index: number }) => {
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
  }, [handleVideoTap, isVideoPlaying, insets]);
};
