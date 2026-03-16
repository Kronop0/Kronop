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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VideoContainer from './Components/VideoContainer';
import InteractionBar from './Components/InteractionBar';
import ChannelInfo from './Components/ChannelInfo';
import VideoPlayer from './Player/VideoPlayer';
// @ts-ignore
import GhostFeedManager from './GhostFeedManager';
import { API_KEYS } from '@/constants/Config';
import { getVideoUrl, getReelUrl } from './cloudin';
// @ts-ignore
import { fetchReelsFromR2 } from './ZeroLogic';

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
  const fadeAnimMap = useRef<Map<string, Animated.Value>>(new Map()).current;
  const hideTimeoutMap = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map()).current;

  const insets = useSafeAreaInsets();

  // Initialize and fetch videos
  useEffect(() => {
    const initializeReels = async () => {
      try {
        await fetchVideosFromAPI();
      } catch (error) {
        setLoading(false);
      }
    };
    
    initializeReels();
  }, []);

  // Preload next reel in background
  useEffect(() => {
    if (videos.length > 0 && currentVisibleIndex >= 0) {
      const nextIndex = (currentVisibleIndex + 1) % videos.length;
      const nextVideo = videos[nextIndex];
      
      if (nextVideo && !preloadedVideos.has(nextVideo.id)) {
        console.log(`🔄 Preloading next reel: ${nextVideo.id}`);
        
        // Create hidden video element to preload
        const preloadVideo = () => {
          const video = document.createElement('video');
          video.src = nextVideo.uri;
          video.preload = 'auto';
          video.muted = true;
          
          video.addEventListener('canplaythrough', () => {
            console.log(`✅ Preloaded: ${nextVideo.id}`);
            setPreloadedVideos(prev => new Set(prev).add(nextVideo.id));
          });
          
          video.addEventListener('error', () => {
            console.log(`❌ Preload failed: ${nextVideo.id}`);
          });
          
          // Start loading
          video.load();
        };

        // For React Native, we'll simulate preloading with a timeout
        setTimeout(() => {
          setPreloadedVideos(prev => new Set(prev).add(nextVideo.id));
          console.log(`✅ Preloaded (simulated): ${nextVideo.id}`);
        }, 2000);
      }
    }
  }, [currentVisibleIndex, videos, preloadedVideos]);

  // Fetch videos directly from R2 bucket
  const fetchVideosFromAPI = async () => {
    console.log('🎬 Starting fetch...');
    
    try {
      // Fetch reels directly from R2
      const reels = await fetchReelsFromR2();
      
      console.log('📊 Response reels:', reels.length, 'reels received');
      
      if (reels.length > 0) {
        const formattedVideos = reels.map((reel: any) => {
          console.log('🎥 Processing reel:', reel._id || reel.id);
          
          // Use getReelUrl for proper R2 integration
          const videoUrl = getReelUrl(reel.videoUrl || reel.url || reel.filename);
          
          return {
            id: reel._id || reel.id,
            uri: videoUrl,
            title: reel.title || reel.description,
            channelName: reel.username || reel.channelName,
            channelLogo: reel.channelLogo || `https://picsum.photos/seed/${reel.id}/200/200.jpg`,
            isVerified: reel.isVerified || false,
            likes: reel.likes || 0,
            comments: reel.comments || 0,
            shares: reel.shares || 0,
          };
        });
        
        console.log('✅ Formatted videos ready:', formattedVideos.length);
        setVideos(formattedVideos);
      } else {
        console.warn('⚠️ No reels found');
        setVideos([]);
        setError('No reels found');
      }
    } catch (error) {
      console.error('💥 Fetch Error:', error);
      setVideos([]);
      setError('Failed to load reels');
    } finally {
      setLoading(false);
    }
  };

  const onViewableItemsChanged = React.useCallback(({ viewableItems }: { viewableItems: ViewToken<VideoItem>[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index !== undefined && viewableItems[0].index !== null) {
      setCurrentVisibleIndex(viewableItems[0].index);
      // Hide all play/pause controls when scrolling
      setShowPlayPauseMap(new Map());
    }
  }, []);

  const viewabilityConfig = React.useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleVideoTap = useCallback((videoId: string) => {
    // Toggle play/pause state
    setPausedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });

    // Show play/pause button temporarily
    setShowPlayPauseMap(prev => {
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
          setShowPlayPauseMap(prev => {
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

    return (
      <View style={styles.videoContainer}>
        {/* Status Bar Overlay */}
        <View style={[styles.statusBarOverlay, { height: insets.top }]} />
        
        {/* Preloading Indicator */}
        {isPreloaded && (
          <View style={styles.preloadIndicator}>
            <View style={styles.preloadDot} />
          </View>
        )}
        
        <TouchableWithoutFeedback onPress={() => handleVideoTap(item.id)}>
          <View style={styles.videoWrapper}>
            <VideoPlayer
              source={item.uri}
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
            const mockVideo = {
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
            setVideos([mockVideo]);
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
