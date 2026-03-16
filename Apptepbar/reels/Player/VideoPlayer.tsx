import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface VideoPlayerProps {
  source: string;
  isPlaying?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  source, 
  isPlaying = true 
}) => {
  console.log('🎬 Simple VideoPlayer:', source);

  const player = useVideoPlayer({
    uri: source,
    headers: {
      'User-Agent': 'KronopApp'
    }
  }, (player) => {
    console.log('🎥 Video player ready');
    player.loop = true;
    player.muted = false;
  });

  useEffect(() => {
    if (isPlaying) {
      console.log('▶️ Playing:', source);
      player.play();
    } else {
      console.log('⏸️ Paused:', source);
      player.pause();
    }
  }, [isPlaying, player]);

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
