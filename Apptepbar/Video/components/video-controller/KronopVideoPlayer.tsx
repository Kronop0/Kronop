import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Dimensions,
  PanResponder,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

interface KronopVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  autoplay?: boolean;
  onError?: (error: string) => void;
  onLoad?: (duration: number) => void;
  onProgress?: (progress: { currentTime: number; duration: number }) => void;
  onComplete?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function KronopVideoPlayer({
  videoUrl,
  thumbnailUrl,
  title,
  autoplay = false,
  onError,
  onLoad,
  onProgress,
  onComplete,
}: KronopVideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [lastTap, setLastTap] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const player = useVideoPlayer(videoUrl, (playerInstance) => {
    playerInstance.loop = false;
    if (autoplay) {
      playerInstance.play();
    }
  });

  const isPlaying = player.playing;
  const duration = player.duration;
  const status = player.status;

  // Auto-hide controls timer
  const resetControlsTimer = useCallback(() => {
    if (controlsTimeout) clearTimeout(controlsTimeout);
    setShowControls(true);
    const timeout = setTimeout(() => {
      if (status === 'readyToPlay' && isPlaying) {
        setShowControls(false);
      }
    }, 3000);
    setControlsTimeout(timeout);
  }, [status, isPlaying, controlsTimeout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout) clearTimeout(controlsTimeout);
      player.pause();
    };
  }, [controlsTimeout, player]);

  // Handle status changes
  useEffect(() => {
    const subscription = player.addListener('statusChange', (event) => {
      const newStatus = event.status;
      switch (newStatus) {
        case 'readyToPlay':
          setIsLoading(false);
          setHasError(false);
          if (player.duration && player.duration > 0) {
            onLoad?.(player.duration);
          }
          break;
        case 'loading':
          setIsLoading(true);
          break;
        case 'error':
          setIsLoading(false);
          setHasError(true);
          setErrorMessage('Playback failed');
          onError?.('Playback failed');
          break;
        case 'idle':
          // Video completed or stopped
          break;
      }
    });

    return () => {
      subscription.remove();
    };
  }, [player, onError, onLoad]);

  // Handle playback completion
  useEffect(() => {
    const subscription = player.addListener('playToEnd', () => {
      onComplete?.();
    });

    return () => {
      subscription.remove();
    };
  }, [player, onComplete]);

  // Progress tracking
  useEffect(() => {
    if (status !== 'readyToPlay') return;

    const interval = setInterval(() => {
      if (isPlaying && player.currentTime !== undefined) {
        setCurrentTime(player.currentTime);
        onProgress?.({
          currentTime: player.currentTime,
          duration: duration || 0,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, isPlaying, player, duration, onProgress]);

  // Play/Pause toggle
  const togglePlayPause = useCallback(() => {
    if (status !== 'readyToPlay') return;

    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    resetControlsTimer();
  }, [status, isPlaying, player, resetControlsTimer]);

  // Double tap seek (left -10s, right +10s)
  const handleDoubleTap = useCallback((side: 'left' | 'right') => {
    if (status !== 'readyToPlay') return;

    const seekAmount = side === 'left' ? -10 : 10; // 10 seconds
    const newTime = Math.max(0, Math.min((duration || 0), currentTime + seekAmount));
    
    player.seekBy(seekAmount);
    resetControlsTimer();
  }, [status, currentTime, duration, player, resetControlsTimer]);

  // Single tap handler (play/pause or show controls)
  const handleTap = useCallback((x: number) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      // Double tap detected
      const side = x < SCREEN_WIDTH / 2 ? 'left' : 'right';
      handleDoubleTap(side);
    } else {
      // Single tap - toggle controls or play/pause
      if (showControls) {
        togglePlayPause();
      } else {
        resetControlsTimer();
      }
    }
    setLastTap(now);
  }, [lastTap, showControls, handleDoubleTap, togglePlayPause, resetControlsTimer]);

  // Pan responder for gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          // Tap detected
          handleTap(gestureState.x0);
        }
      },
    })
  ).current;

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress
  const progress = duration && duration > 0
    ? (currentTime / duration) * 100
    : 0;

  // Detect if URL is HLS
  const isHLS = videoUrl?.includes('.m3u8') || videoUrl?.includes('playlist');

  if (hasError) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
          <Text style={styles.errorText}>Failed to load video</Text>
          <Text style={styles.errorSubtext}>{errorMessage || 'Check your connection'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setHasError(false);
              setIsLoading(true);
              player.replace(videoUrl);
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Video Component */}
      <VideoView
        player={player}
        style={styles.video}
        contentFit="contain"
        nativeControls={false}
      />

      {/* Thumbnail overlay (shows while loading) */}
      {isLoading && thumbnailUrl && (
        <View style={styles.thumbnailOverlay}>
          <Image
            source={{ uri: thumbnailUrl }}
            style={styles.thumbnailImage}
            contentFit="cover"
          />
        </View>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8B00FF" />
          <Text style={styles.loadingText}>
            {isHLS ? 'Loading stream...' : 'Loading video...'}
          </Text>
        </View>
      )}

      {/* Controls overlay */}
      {showControls && status === 'readyToPlay' && (
        <View style={styles.controlsOverlay}>
          {/* Top bar - Title */}
          {title && (
            <View style={styles.topBar}>
              <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
            </View>
          )}

          {/* Center play button */}
          {!isPlaying && (
            <TouchableOpacity
              style={styles.centerPlayButton}
              onPress={togglePlayPause}
              activeOpacity={0.8}
            >
              <Ionicons name="play-circle" size={72} color="rgba(255,255,255,0.95)" />
            </TouchableOpacity>
          )}

          {/* Bottom controls */}
          <View style={styles.bottomBar}>
            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <View style={[styles.progressDot, { left: `${progress}%` }]} />
            </View>

            {/* Time and controls row */}
            <View style={styles.controlsRow}>
              <Text style={styles.timeText}>
                {formatTime(currentTime)} / {formatTime(duration || 0)}
              </Text>

              <View style={styles.controlButtons}>
                <TouchableOpacity onPress={togglePlayPause} style={styles.controlButton}>
                  <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Double tap indicators */}
      {showControls && (
        <>
          <View style={[styles.seekIndicator, { left: 20 }]}>
            <Ionicons name="play-back" size={20} color="rgba(255,255,255,0.5)" />
            <Text style={styles.seekText}>-10s</Text>
          </View>
          <View style={[styles.seekIndicator, { right: 20 }]}>
            <Ionicons name="play-forward" size={20} color="rgba(255,255,255,0.5)" />
            <Text style={styles.seekText}>+10s</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 14,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
    zIndex: 3,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  centerPlayButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -36 }, { translateY: -36 }],
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  progressContainer: {
    height: 20,
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressBackground: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B00FF',
    borderRadius: 2,
  },
  progressDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8B00FF',
    top: '50%',
    transform: [{ translateY: -6 }, { translateX: -6 }],
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  controlButton: {
    padding: 4,
  },
  seekIndicator: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    alignItems: 'center',
    opacity: 0.6,
  },
  seekText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  errorSubtext: {
    color: '#888888',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#8B00FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
