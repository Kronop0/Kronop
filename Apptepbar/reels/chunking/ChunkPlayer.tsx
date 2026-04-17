import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { StreamLogic } from './StreamLogic';

interface ChunkPlayerProps {
  r2Url: string; // Direct R2 URL
  isActive?: boolean;
  onSwipe?: () => void;
}

export const ChunkPlayer: React.FC<ChunkPlayerProps> = ({
  r2Url,
  isActive = true,
  onSwipe
}) => {
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const videoRef = useRef<Video>(null);
  const streamLogicRef = useRef<StreamLogic | null>(null);

  // Initialize streaming when URL changes
  useEffect(() => {
    if (r2Url && isActive) {
      startStreaming();
    }

    return () => {
      cleanup();
    };
  }, [r2Url, isActive]);

  const startStreaming = async () => {
    console.log('🎬 Starting ChunkPlayer for:', r2Url);
    
    // Create stream logic instance
    streamLogicRef.current = new StreamLogic();
    
    // Start streaming
    await streamLogicRef.current.startStreaming(
      r2Url,
      // onReady - when file is ready
      (fileUri) => {
        console.log('🎥 Video ready, setting URI');
        setVideoUri(fileUri);
        setIsBuffering(false);
      },
      // onProgress - download progress
      (progress) => {
        setLoadingProgress(progress);
      },
      // onError - handle errors
      (error) => {
        console.error('❌ Streaming error:', error);
        setIsBuffering(false);
      }
    );
  };

  const cleanup = async () => {
    console.log('🧹 Cleaning up ChunkPlayer');
    
    // Stop video
    if (videoRef.current) {
      try {
        await videoRef.current.stopAsync();
        await videoRef.current.unloadAsync();
      } catch (error) {
        console.warn('⚠️ Error unloading video:', error);
      }
    }

    // Clean up stream logic
    if (streamLogicRef.current) {
      await streamLogicRef.current.cleanup();
      streamLogicRef.current = null;
    }

    // Reset state
    setVideoUri(null);
    setIsBuffering(true);
    setLoadingProgress(0);
  };

  const handleVideoLoad = () => {
    console.log('✅ Video loaded');
    setIsBuffering(false);
    
    // Auto-play when loaded and active
    if (videoRef.current && isActive) {
      videoRef.current.playAsync();
    }
  };

  const handleVideoError = (error: any) => {
    console.error('❌ Video error:', error);
    setIsBuffering(false);
  };

  const handleSwipe = () => {
    cleanup();
    onSwipe?.();
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {/* Loading indicator */}
      {isBuffering && (
        <View style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1,
          alignItems: 'center'
        }}>
          <ActivityIndicator size="large" color="white" />
          <Text style={{ color: 'white', marginTop: 10 }}>
            Loading Video...
          </Text>
          {loadingProgress > 0 && (
            <Text style={{ color: 'white', marginTop: 5 }}>
              {Math.round(loadingProgress * 100)}%
            </Text>
          )}
        </View>
      )}
      
      {/* Video player */}
      {videoUri && (
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={{ flex: 1 }}
          shouldPlay={isActive}
          isLooping
          resizeMode={ResizeMode.COVER}
          onLoad={handleVideoLoad}
          onError={handleVideoError}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded) {
              setIsBuffering(false);
            }
          }}
        />
      )}
      
      {/* Swipe indicator */}
      {onSwipe && (
        <View
          style={{
            position: 'absolute',
            bottom: 50,
            left: '50%',
            transform: 'translateX(-50%)',
            alignItems: 'center'
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, opacity: 0.7 }}>
            Swipe Up →
          </Text>
        </View>
      )}
    </View>
  );
};

export default ChunkPlayer;
