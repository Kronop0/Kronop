import { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Share, Text } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer } from 'expo-video';
import { colors, spacing } from '@/Apptepbar/Video/ThemeConstants';
import { VideoPlayer } from './components/2.VideoPlayer';
import { VideoUserSection } from './components/3.VideoUserSection';
import { VideoActions } from './components/4.VideoActions';
import { VideoInfo } from './components/6.VideoInfo';
import { VideoModals } from './components/7.VideoModals';

type VideoQuality = '360p' | '480p' | '720p' | '1080p' | 'Auto';

export default function VideoPlayerScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: 'long' | 'reel' }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // States
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // UI states
  const [showQualitySelector, setShowQualitySelector] = useState(false);
  const [showStatsOverlay, setShowStatsOverlay] = useState(true);
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('Auto');
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReport, setShowReport] = useState(false);
  
  // Social states
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [supporters, setSupporters] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  
  // Load videos
  useEffect(() => {
    const loadVideos = async () => {
      try {
        console.log('VideoPlayer: Starting to load videos...');
        const { getLongVideos } = await import('@/Apptepbar/Video/services/videoService');
        const videoList = await getLongVideos();
        console.log('VideoPlayer: Received', videoList.length, 'videos');
        setVideos(videoList);
        
        // Find current video
        const currentVideo = videoList.find(v => v.id === id);
        setVideo(currentVideo);
        
        // Update social states
        if (currentVideo) {
          setIsLiked(currentVideo.isLiked || false);
          setLikes(currentVideo.likes || 0);
          setIsSupported(currentVideo.user?.isSupported || false);
          setSupporters(currentVideo.user?.supporters || 0);
          
          // Debug description loading
          console.log('VideoPlayer: Video data loaded:', {
            id: currentVideo.id,
            title: currentVideo.title,
            description: currentVideo.description,
            hasDescription: !!currentVideo.description,
            descriptionLength: currentVideo.description?.length || 0
          });
        }
      } catch (error) {
        console.error('VideoPlayer: Error loading videos:', error);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadVideos();
  }, [id, type]);

  // Initialize player when video is available
  const player = useVideoPlayer(video?.videoUrl || '', player => {
    if (video?.videoUrl) {
      player.loop = false;
      // Don't auto-play - wait for user interaction
      console.log('VideoPlayer: Player initialized for:', video?.videoUrl);
    }
  });

  // Event handlers
  const handleToggleLike = useCallback(() => {
    setIsLiked(prev => !prev);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  }, [isLiked]);

  const handleToggleSupport = useCallback(() => {
    setIsSupported(prev => !prev);
    setSupporters(prev => isSupported ? prev - 1 : prev + 1);
  }, [isSupported]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out this video: ${video?.title}`,
        title: video?.title || 'Check out this video',
      });
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  }, [video]);

  const handleSave = useCallback(() => setIsSaved(prev => !prev), []);
  const handleQualitySelector = useCallback(() => setShowQualitySelector(prev => !prev), []);
  const handleQualityChange = useCallback((quality: VideoQuality) => {
    setVideoQuality(quality);
    setShowQualitySelector(false);
  }, []);
  const handleStatsOverlay = useCallback(() => setShowStatsOverlay(prev => !prev), []);
  const handleFullscreen = useCallback(() => setShowFullscreen(true), []);
  const handleComments = useCallback(() => setShowComments(true), []);
  const handleReport = useCallback(() => setShowReport(true), []);
  const handleVideoPress = useCallback(() => {
    if (player) {
      if (player.playing) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
      }
    }
    console.log('VideoPlayer: Video pressed');
  }, [player, isPlaying]);

  // Render states
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading video...</Text>
      </View>
    );
  }
  
  if (!video) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Video not found</Text>
        <Text style={styles.loadingText}>ID: {id}</Text>
      </View>
    );
  }

  // Main render
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingTop: insets.top }]}
      >
        <VideoPlayer 
          player={player}
          duration={video.duration}
          views={parseInt(video.views.replace(/[KM]/g, '')) * (video.views.includes('M') ? 1000000 : video.views.includes('K') ? 1000 : 1)}
          showStatsOverlay={showStatsOverlay}
          onVideoPress={handleVideoPress}
          thumbnail={video.thumbnail}
          isPlaying={isPlaying}
        />

        <VideoActions 
          isLiked={isLiked}
          likes={likes}
          comments={video.comments}
          isSaved={isSaved}
          onToggleLike={handleToggleLike}
          onComments={handleComments}
          onShare={handleShare}
          onReport={handleReport}
          onSave={handleSave}
        />

        <VideoUserSection 
          user={video.user}
          isSupported={isSupported}
          supporters={supporters}
          onToggleSupport={handleToggleSupport}
          onFullscreen={handleFullscreen}
          onQualitySelector={handleQualitySelector}
          onStatsOverlay={handleStatsOverlay}
          showStatsOverlay={showStatsOverlay}
        />

        <VideoInfo 
          title={video.title}
          duration={video.duration}
          views={video.views}
          metadataLoading={false}
          metadataError={null}
        />
        
      </ScrollView>
      
      <VideoModals 
        showQualitySelector={showQualitySelector}
        showFullscreen={showFullscreen}
        showComments={showComments}
        showReport={showReport}
        videoQuality={videoQuality}
        player={player}
        videoTitle={video.title}
        commentCount={video.comments}
        onCloseQualitySelector={() => setShowQualitySelector(false)}
        onQualityChange={setVideoQuality}
        onCloseFullscreen={() => setShowFullscreen(false)}
        onCloseComments={() => setShowComments(false)}
        onCloseReport={() => setShowReport(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  content: { paddingBottom: spacing.xl },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.background 
  },
  loadingText: { fontSize: 16, color: colors.text },
});
