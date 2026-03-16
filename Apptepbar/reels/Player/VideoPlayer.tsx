import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { getVideoChunk, activeChunkManagers, cleanupChunkManager } from '../cloudin';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface VideoPlayerProps {
  videoUrl: string;
  isPlaying?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  isPlaying = true
}) => {
  console.log('🎬 Chunk-Integrated VideoPlayer:', videoUrl);

  // State for chunk-based streaming
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [chunkData, setChunkData] = useState<ArrayBuffer | null>(null);
  const [isChunkLoading, setIsChunkLoading] = useState(false);

  // Create video player with chunk-based streaming
  const player = useVideoPlayer({
    uri: videoUrl,
    headers: {
      'User-Agent': 'KronopApp-ChunkStreamer/1.0'
    },
  }, (player) => {
    if (player) {
      console.log('🎥 Chunk-integrated player ready');
      player.loop = true;
      player.muted = false;
    }
  });

  // Load chunks dynamically based on playback position
  const loadRequiredChunks = async () => {
    const chunkManager = activeChunkManagers.get(videoUrl);
    if (!chunkManager) {
      console.warn('⚠️ No chunk manager found for:', videoUrl);
      return;
    }

    // Ensure chunk manager is initialized
    if (!chunkManager.totalChunks) {
      const initialized = await chunkManager.initialize();
      if (!initialized) {
        console.warn('⚠️ Chunk manager initialization failed for:', videoUrl);
        return;
      }
    }

    // Skip if total chunks is 0 (initialization failed)
    if (chunkManager.totalChunks === 0) {
      console.warn('⚠️ No chunks available for:', videoUrl);
      return;
    }

    // Load current chunk if not loaded
    if (!chunkManager.isChunkLoaded(currentChunkIndex)) {
      setIsChunkLoading(true);
      console.log(`📥 Loading chunk ${currentChunkIndex} for ${videoUrl}`);
      
      const chunks = await chunkManager.preloadChunks([currentChunkIndex]);
      
      if (chunks.length > 0) {
        setChunkData(chunks[0]);
        console.log(`✅ Chunk ${currentChunkIndex} loaded: ${chunks[0].byteLength} bytes`);
      } else {
        console.warn(`⚠️ Failed to load chunk ${currentChunkIndex}`);
      }
      
      setIsChunkLoading(false);
    }

    // Preload next 2 chunks for smooth playback
    const nextChunks = chunkManager.getNextChunks(currentChunkIndex, 2);
    if (nextChunks.length > 0) {
      console.log(`🔄 Preloading next chunks: ${nextChunks.join(', ')}`);
      await chunkManager.preloadChunks(nextChunks);
    }
  };

  // Monitor playback and load chunks accordingly
  useEffect(() => {
    if (!player || !isPlaying) return;

    const monitorPlayback = async () => {
      try {
        const currentTime = player.currentTime;
        const chunkManager = activeChunkManagers.get(videoUrl);
        
        if (chunkManager && chunkManager.totalChunks) {
          // Calculate which chunk should be loaded based on current time
          const estimatedChunkIndex = Math.floor(currentTime / 5); // Rough estimate: 5 seconds per chunk
          
          if (estimatedChunkIndex !== currentChunkIndex && estimatedChunkIndex < chunkManager.totalChunks) {
            setCurrentChunkIndex(estimatedChunkIndex);
          }
        }
      } catch (error) {
        console.warn('Playback monitoring error:', error);
      }
    };

    const interval = setInterval(monitorPlayback, 2000); // Check every 2 seconds
    return () => clearInterval(interval);
  }, [player, isPlaying, videoUrl, currentChunkIndex]);

  // Load chunks when chunk index changes
  useEffect(() => {
    if (isPlaying) {
      loadRequiredChunks();
    }
  }, [currentChunkIndex, isPlaying]);

  // Handle play/pause
  useEffect(() => {
    if (!player) return;

    if (isPlaying) {
      console.log('▶️ Playing chunk stream:', videoUrl);
      player.play();
    } else {
      console.log('⏸️ Paused chunk stream:', videoUrl);
      player.pause();
    }
  }, [isPlaying, player, videoUrl]);

  // Cleanup chunks when component unmounts
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up chunks for:', videoUrl);
      // Don't cleanup immediately, let it linger for potential reuse
      setTimeout(() => {
        cleanupChunkManager(videoUrl);
      }, 30000); // Cleanup after 30 seconds
    };
  }, [videoUrl]);

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
      {isChunkLoading && (
        <View style={styles.chunkLoadingIndicator}>
          <View style={styles.chunkDot} />
        </View>
      )}
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
  chunkLoadingIndicator: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    padding: 8,
    borderRadius: 20,
  },
  chunkDot: {
    width: 12,
    height: 12,
    backgroundColor: '#00ff00',
    borderRadius: 6,
  },
});

export default VideoPlayer;
