import { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Share, Alert } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Image } from 'expo-image';
import { colors, spacing, typography, borderRadius } from '@/Apptepbar/Video/ThemeConstants';
import { getLongVideos, Video } from '@/Apptepbar/Video/services/videoService';
import { AdsBanner, HorizontalVideoList, VideoQualitySelector, VideoStatsOverlay, FullscreenVideoPlayer, CommentsModal, ReportModal, VideoControlsOverlay } from '@/Apptepbar/Video/components';

type VideoQuality = '360p' | '480p' | '720p' | '1080p' | 'Auto';

export default function VideoPlayerScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: 'long' | 'reel' }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize all hooks at the top level (before any conditional returns)
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [supporters, setSupporters] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const [showQualitySelector, setShowQualitySelector] = useState(false);
  const [showStatsOverlay, setShowStatsOverlay] = useState(true);
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('Auto');
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const controlsTimeoutRef = useRef<number | null>(null);
  
  // Always call useVideoPlayer hook before any conditional returns
  const video = videos.find((v: Video) => v.id === id);
  const player = useVideoPlayer(video?.videoUrl || '', player => {
    player.loop = false;
    player.play();
  });
  
  // All useEffect hooks must be called before any conditional returns
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const videoList = await getLongVideos(); // For now, only long videos are supported
        setVideos(videoList);
      } catch (error) {
        console.error('Error loading videos:', error);
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVideos();
  }, [type]);
  
  const currentIndex = videos.findIndex((v: Video) => v.id === id);
  
  // Update state when video changes
  useEffect(() => {
    if (video) {
      setIsLiked(video?.isLiked || false);
      setLikes(video?.likes || 0);
      setIsSupported(video?.user.isSupported || false);
      setSupporters(video?.user.supporters || 0);
    }
  }, [video]);
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);
  
  // useCallback hooks must also be before conditional returns
  const hideControlsAfterDelay = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  const handleVideoPress = useCallback(() => {
    setShowControls(prev => {
      const newState = !prev;
      if (newState) {
        hideControlsAfterDelay();
      }
      return newState;
    });
  }, [hideControlsAfterDelay]);

  const handlePlayPause = useCallback(() => {
    if (player.playing) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
    hideControlsAfterDelay();
  }, [player, hideControlsAfterDelay]);

  const handlePreviousVideo = useCallback(() => {
    if (currentIndex > 0) {
      const prevVideo = videos[currentIndex - 1];
      router.push(`/video/${prevVideo.id}?type=${type}`);
    }
    hideControlsAfterDelay();
  }, [currentIndex, videos, type, router, hideControlsAfterDelay]);

  const handleNextVideo = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      const nextVideo = videos[currentIndex + 1];
      router.push(`/video/${nextVideo.id}?type=${type}`);
    }
    hideControlsAfterDelay();
  }, [currentIndex, videos, type, router, hideControlsAfterDelay]);

  const handleFullscreen = useCallback(() => {
    setShowFullscreen(true);
  }, []);

  const handleToggleLike = useCallback(() => {
    setIsLiked((prev: boolean) => !prev);
    setLikes((prev: number) => isLiked ? prev - 1 : prev + 1);
  }, [isLiked]);

  const handleToggleSupport = useCallback(() => {
    setIsSupported((prev: boolean) => !prev);
    setSupporters((prev: number) => isSupported ? prev - 1 : prev + 1);
  }, [isSupported]);

  const handleShare = useCallback(async () => {
    if (!video) return;
    try {
      await Share.share({
        message: `Check out this video: ${video?.title}\n\nUploaded by ${video?.user?.name}`,
        title: video?.title || '',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [video]);

  const handleSave = useCallback(() => {
    setIsSaved(prev => !prev);
    Alert.alert(
      isSaved ? 'Removed from saved' : 'Saved',
      isSaved ? 'Video removed from your saved list' : 'Video saved to your library'
    );
  }, [isSaved]);
  
  // Now conditional returns are allowed after all hooks
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }
  
  if (!video) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Video not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top }
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <AdsBanner />
        
        <View style={styles.titleStrip}>
          <Text style={styles.stripTitle} numberOfLines={1} ellipsizeMode="tail">
            {video.title}
          </Text>
        </View>

        <View style={styles.playerContainer}>
          <VideoView 
            style={[styles.video, { flex: 1, width: '100%', height: '100%', zIndex: 1 }]}
            player={player}
            fullscreenOptions={{
              enable: true,
            }}
            allowsPictureInPicture
          />
          <Pressable style={styles.videoOverlay} onPress={handleVideoPress}>
            <VideoStatsOverlay 
              duration={video.duration}
              views={parseInt(video.views.replace(/[KM]/g, '')) * (video.views.includes('M') ? 1000000 : video.views.includes('K') ? 1000 : 1)}
              visible={showStatsOverlay}
            />
            <VideoControlsOverlay
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onPrevious={handlePreviousVideo}
              onNext={handleNextVideo}
              hasPrevious={currentIndex > 0}
              hasNext={currentIndex < videos.length - 1}
              visible={showControls}
            />
          </Pressable>
        </View>

        <View style={styles.userSection}>
          <View style={styles.userHeaderRow}>
            <View style={styles.ownerInfoCompact}>
              <Image 
                source={{ uri: video.user.avatar }}
                style={styles.avatarSmall}
                contentFit="cover"
                onError={() => {
                  // Avatar failed to load, but we'll keep the placeholder background
                }}
              />
              <View style={styles.ownerTextCompact}>
                <Text style={styles.userNameCompact}>{video.user.name}</Text>
                <Text style={styles.supportersTextCompact}>{formatNumber(supporters)} supporters</Text>
              </View>
            </View>
            
            <View style={styles.headerIcons}>
              <Pressable 
                style={styles.iconButton}
                onPress={handleFullscreen}
              >
                <MaterialIcons name="fullscreen" size={24} color={colors.text} />
              </Pressable>
              
              <Pressable 
                style={styles.iconButton}
                onPress={() => setShowQualitySelector(true)}
              >
                <MaterialIcons name="hd" size={24} color={colors.text} />
              </Pressable>
              
              <Pressable 
                style={styles.iconButton}
                onPress={() => setShowStatsOverlay(!showStatsOverlay)}
              >
                <MaterialIcons name="info-outline" size={24} color={colors.text} />
              </Pressable>
            </View>
          </View>
          
          <View style={styles.actionButtonsContainer}>
            <Pressable 
              style={[styles.largeButton, styles.supportLargeButton, isSupported && styles.supportedLargeButton]}
              onPress={handleToggleSupport}
            >
              <MaterialIcons 
                name={isSupported ? 'check' : 'favorite'} 
                size={20} 
                color={isSupported ? colors.textMuted : colors.text} 
              />
              <Text style={[styles.largeButtonText, isSupported && styles.supportedLargeButtonText]}>
                {isSupported ? 'Supported' : 'Support'}
              </Text>
            </Pressable>
            
            <Pressable style={[styles.largeButton, styles.channelButton]}>
              <MaterialIcons name="play-circle-outline" size={20} color={colors.text} />
              <Text style={styles.largeButtonText}>Check Channel</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.title}>{video.title}</Text>
          
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <MaterialIcons name="visibility" size={16} color={colors.textMuted} />
              <Text style={styles.statText}>{video.views} views</Text>
            </View>
            
            <View style={styles.statItem}>
              <MaterialIcons name="schedule" size={16} color={colors.textMuted} />
              <Text style={styles.statText}>{video.duration}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable 
              style={styles.actionButton}
              onPress={handleToggleLike}
            >
              <MaterialIcons 
                name={isLiked ? 'star' : 'star-border'} 
                size={22} 
                color={isLiked ? colors.primary : colors.textMuted} 
              />
              <Text style={[styles.actionText, isLiked && styles.likedText]}>
                {formatNumber(likes)}
              </Text>
            </Pressable>

            <Pressable 
              style={styles.actionButton}
              onPress={() => setShowComments(true)}
            >
              <MaterialIcons name="comment" size={22} color={colors.textMuted} />
              <Text style={styles.actionText}>{formatNumber(video.comments)}</Text>
            </Pressable>

            <Pressable 
              style={styles.actionButton}
              onPress={handleShare}
            >
              <MaterialIcons name="share" size={22} color={colors.textMuted} />
              <Text style={styles.actionText}>Share</Text>
            </Pressable>

            <Pressable 
              style={styles.actionButton}
              onPress={() => setShowReport(true)}
            >
              <MaterialIcons name="flag" size={22} color={colors.textMuted} />
              <Text style={styles.actionText}>Report</Text>
            </Pressable>

            <Pressable 
              style={styles.actionButton}
              onPress={handleSave}
            >
              <MaterialIcons 
                name={isSaved ? 'bookmark' : 'bookmark-border'} 
                size={22} 
                color={isSaved ? colors.primary : colors.textMuted} 
              />
              <Text style={[styles.actionText, isSaved && styles.savedText]}>Save</Text>
            </Pressable>
          </View>

          <Pressable 
            style={styles.descriptionHeader}
            onPress={() => setShowDescription(!showDescription)}
          >
            <Text style={styles.descriptionTitle}>Description</Text>
            <MaterialIcons 
              name={showDescription ? 'expand-less' : 'expand-more'} 
              size={24} 
              color={colors.textSubtle} 
            />
          </Pressable>
          
          {showDescription && (
            <View style={styles.descriptionContent}>
              <Text style={styles.descriptionText}>{video.description}</Text>
            </View>
          )}
        </View>
        
      </ScrollView>
      
      <VideoQualitySelector 
        visible={showQualitySelector}
        onClose={() => setShowQualitySelector(false)}
        currentQuality={videoQuality}
        onQualityChange={setVideoQuality}
      />
      
      <FullscreenVideoPlayer
        visible={showFullscreen}
        onClose={() => setShowFullscreen(false)}
        player={player}
      />
      
      <CommentsModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        videoTitle={video.title}
        commentCount={video.comments}
      />
      
      <ReportModal
        visible={showReport}
        onClose={() => setShowReport(false)}
        videoTitle={video.title}
      />
    </View>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    fontSize: 16,
    color: colors.error || '#ff6b6b',
    textAlign: 'center',
    marginTop: 50,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  playerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    zIndex: 10,
    position: 'relative',
    flex: 1,
  },
  video: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  userSection: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  userHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  ownerInfoCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginLeft: spacing.sm,
  },
  iconButton: {
    padding: spacing.xs,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
  },
  ownerTextCompact: {
    marginLeft: spacing.sm,
  },
  userNameCompact: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  supportersTextCompact: {
    fontSize: 11,
    color: colors.textMuted,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  largeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: spacing.sm,
  },
  supportLargeButton: {
    backgroundColor: colors.primary,
  },
  supportedLargeButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  channelButton: {
    backgroundColor: colors.surfaceLight,
  },
  largeButtonText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  supportedLargeButtonText: {
    color: colors.textMuted,
  },
  info: {
    padding: spacing.md,
  },
  titleStrip: {
    width: '100%',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  stripTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
    display: 'none',
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  actionButton: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
  },
  actionText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  likedText: {
    color: colors.primary,
  },
  savedText: {
    color: colors.primary,
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  descriptionTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  descriptionContent: {
    paddingTop: spacing.sm,
  },
  descriptionText: {
    ...typography.bodySmall,
    color: colors.textSubtle,
    lineHeight: 22,
  },
});
