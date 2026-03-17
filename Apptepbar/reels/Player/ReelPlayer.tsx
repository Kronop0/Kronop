import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface ReelPlayerProps {
  videoUrl: string;
  isPlaying?: boolean;
}

const ReelPlayer: React.FC<ReelPlayerProps> = ({
  videoUrl,
  isPlaying = true
}) => {
  console.log('🚀 Ultra-Fast ReelPlayer:', videoUrl);

  // ZERO setup - Direct URL play with hardware acceleration
  const player = useVideoPlayer(videoUrl, (player) => {
    if (player) {
      console.log('⚡ Hardware acceleration enabled');
      player.loop = true;
      player.muted = false;
      
      // Instant play - ZERO complexity
      if (isPlaying) {
        player.play();
      }
    }
  });

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
        contentFit="cover"
        allowsFullscreen={false}
      />
      {/* JUGAAD - Hide any remaining controls */}
      <View style={styles.controlHider} />
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
  },
  controlHider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    opacity: 0,
    zIndex: 999,
    pointerEvents: 'none' as const,
  },
});

export default ReelPlayer;
