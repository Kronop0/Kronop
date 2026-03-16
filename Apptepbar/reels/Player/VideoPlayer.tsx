import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface VideoPlayerProps {
  videoUrl: string;
  isPlaying?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  isPlaying = true
}) => {
  console.log('🎬 Direct HTTP Streaming VideoPlayer:', videoUrl);

  // Create video player with direct HTTP streaming and Range headers
  const player = useVideoPlayer({
    uri: videoUrl,
    headers: {
      'User-Agent': 'KronopApp-DirectStreamer/1.0',
      'Range': 'bytes=0-' // Request first chunk immediately
    },
  }, (player) => {
    if (player) {
      console.log('🎥 Direct HTTP streaming player ready');
      player.loop = true;
      player.muted = false;
    }
  });

  // Handle play/pause
  useEffect(() => {
    if (!player) return;

    if (isPlaying) {
      console.log('▶️ Playing direct stream:', videoUrl);
      player.play();
    } else {
      console.log('⏸️ Paused direct stream:', videoUrl);
      player.pause();
    }
  }, [isPlaying, player, videoUrl]);

  return (
    <View style={styles.container}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        allowsFullscreen={false}
        allowsPictureInPicture={false}
        nativeControls={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#000',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
  },
});

export default VideoPlayer;
