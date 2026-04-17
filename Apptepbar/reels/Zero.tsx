import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VideoContainer from './Components/VideoContainer';
import InteractionBar from './Components/InteractionBar';
import ChannelInfo from './Components/ChannelInfo';
import ReelPlayer from './Player/ReelPlayer';
import { 
  VideoItem, 
  usePreWarmNextReel, 
  useFetchVideosFromAPI, 
  useVideoPreloading, 
  useOnViewableItemsChanged, 
  useHandleVideoTap, 
  useIsVideoPlaying,
  useRenderVideoItem 
} from './Zero2';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const Zero: React.FC = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState<number>(0);
  const [pausedVideos, setPausedVideos] = useState<Set<string>>(new Set());
  const [preloadedVideos, setPreloadedVideos] = useState<Set<string>>(new Set());
  const [preWarmedVideos, setPreWarmedVideos] = useState<Set<string>>(new Set());
  const flatListRef = useRef<any>(null);

  const insets = useSafeAreaInsets();

  // Import hooks from Zero2
  const preWarmNextReel = usePreWarmNextReel(preWarmedVideos, setPreWarmedVideos);
  const fetchVideosFromAPI = useFetchVideosFromAPI();
  const videoPreloading = useVideoPreloading(videos, currentVisibleIndex, preloadedVideos, setPreloadedVideos);
  const onViewableItemsChanged = useOnViewableItemsChanged(currentVisibleIndex, setCurrentVisibleIndex, videos, preWarmedVideos, preWarmNextReel);
  const handleVideoTap = useHandleVideoTap(pausedVideos, setPausedVideos);
  const isVideoPlaying = useIsVideoPlaying(currentVisibleIndex, pausedVideos);
  const renderVideoItem = useRenderVideoItem(handleVideoTap, isVideoPlaying, insets);

  // Initialize and fetch videos
  useEffect(() => {
    const initializeReels = async () => {
      try {
        console.log('🚀 Starting reels initialization...');
        await fetchVideosFromAPI(setVideos, setLoading, setError);
      } catch (error) {
        console.error('❌ Reels initialization failed:', error);
        setError('Failed to load reels');
        setLoading(false);
      }
    };

    initializeReels();

    // Auto-refresh every 30 seconds to check for new videos
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing reels for new videos...');
      fetchVideosFromAPI(setVideos, setLoading, setError);
    }, 30000); // 30 seconds

    return () => {
      clearInterval(refreshInterval);
      console.log('🛑 Auto-refresh stopped');
    };
  }, [fetchVideosFromAPI]);

  // Simplified preloading
  useEffect(() => {
    videoPreloading();
  }, [videoPreloading]);

  const viewabilityConfig = {
    viewAreaCoveragePercentThreshold: 80,
    minimumViewTime: 100,
    itemVisibilityPercentThreshold: 80,
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
    backgroundColor: 'transparent', // Remove black background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
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
    backgroundColor: 'transparent',
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
    backgroundColor: 'transparent',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default Zero;
