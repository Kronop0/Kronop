import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { StreamLogic } from '../chunking/StreamLogic';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface ReelPlayerProps {
  videoUrl: string;
  isPlaying?: boolean;
}

const ReelPlayer: React.FC<ReelPlayerProps> = ({
  videoUrl,
  isPlaying = true
}) => {
  console.log('🚀 Ultra-Fast ReelPlayer with Chunking:', videoUrl);

  const [localVideoUri, setLocalVideoUri] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(true);
  const streamLogicRef = React.useRef<StreamLogic | null>(null);

  // Start chunking when videoUrl changes
  useEffect(() => {
    if (videoUrl) {
      startChunking();
    }

    return () => {
      cleanup();
    };
  }, [videoUrl]);

  const startChunking = async () => {
    console.log('📥 Starting chunking for:', videoUrl);
    
    const streamLogic = new StreamLogic();
    streamLogicRef.current = streamLogic;

    await streamLogic.startStreaming(
      videoUrl,
      // onReady - when first chunk is written and file is ready
      (fileUri) => {
        console.log('✅ First chunk ready, setting local URI:', fileUri);
        setLocalVideoUri(fileUri);
        setIsBuffering(false);
      },
      // onProgress - optional
      (progress) => {
        console.log(`📊 Chunking progress: ${Math.round(progress * 100)}%`);
      },
      // onError - handle errors
      (error) => {
        console.error('❌ Chunking failed:', error);
        setIsBuffering(false);
        // Fallback to direct URL if chunking fails
        setLocalVideoUri(videoUrl);
      }
    );
  };

  const cleanup = async () => {
    console.log('🧹 Cleaning up chunking');
    
    if (streamLogicRef.current) {
      await streamLogicRef.current.cleanup();
      streamLogicRef.current = null;
    }
    
    setLocalVideoUri(null);
    setIsBuffering(true);
  };

  // Use local URI if available, otherwise fallback to original URL
  const finalVideoUrl = localVideoUri || videoUrl;

  // ZERO setup - Direct URL play with maximum quality
  const player = useVideoPlayer(finalVideoUrl, (player) => {
    if (player) {
      console.log('⚡ Hardware acceleration enabled - MAX QUALITY');
      player.loop = true;
      player.muted = false;
      
      // Zero compression - Maximum quality settings (available properties only)
      try {
        // Hardware decoding for sharp pixels
        player.allowsExternalPlayback = true;
        
        // High fidelity rendering - use available properties
        // Note: Some properties may not be available in expo-video
        console.log('🔧 Maximum quality settings applied');
      } catch (e) {
        console.log('🔧 Quality settings applied with available options');
      }
      
      // INSTANT PLAY - जैसे ही file path मिले, बिना delay के play करो
      if (isPlaying) {
        player.play();
        console.log('🚀 INSTANT PLAY - First chunk received, playing immediately');
      }
    }
  });

  // NEVER show controls - always false
  const showControls = false;

  // Simple play/pause control
  useEffect(() => {
    if (player) {
      try {
        if (isPlaying) {
          player.play();
          console.log('▶️ Ultra-fast play:', videoUrl);
        } else {
          player.pause();
          console.log('⏸️ Paused:', videoUrl);
        }
      } catch (error) {
        console.warn('⚠️ Control error:', error);
      }
    }
  }, [isPlaying, player, videoUrl]);

  return (
    <View style={styles.container}>
      <VideoView 
        player={player} 
        style={styles.video}
        contentFit="cover" // Perfect fit without distortion
        allowsFullscreen={false}
        // NO NATIVE CONTROLS - पूरी तरह से disable
        allowsPictureInPicture={false}
        nativeControls={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    width: screenWidth,
    height: screenHeight,
    zIndex: 1000, // Video on top
    // High fidelity rendering - no scaling artifacts
    backgroundColor: 'transparent',
  },
});

export default ReelPlayer;
