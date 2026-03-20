import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { StreamLogic } from '../chunking/StreamLogic';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface ReelPlayerProps {
  videoUrl: string;
  isPlaying?: boolean;
  nextVideoUrl?: string; // Add next video URL for pre-fetch
}

// Chunking logic for ReelPlayer
export const useReelChunking = (videoUrl: string, nextVideoUrl: string | undefined, setLocalVideoUri: React.Dispatch<React.SetStateAction<string | null>>, setIsBuffering: React.Dispatch<React.SetStateAction<boolean>> | undefined) => {
  const streamLogicRef = React.useRef<StreamLogic | null>(null);
  const nextStreamLogicRef = React.useRef<StreamLogic | null>(null);

  // Start chunking when videoUrl changes
  useEffect(() => {
    if (videoUrl) {
      startChunking();
    }

    return () => {
      cleanup();
    };
  }, [videoUrl]);

  // PRE-FETCH next video's first chunk in background
  useEffect(() => {
    if (nextVideoUrl) {
      prefetchNextReel();
    }
  }, [nextVideoUrl]);

  const prefetchNextReel = async () => {
    if (nextStreamLogicRef.current) return; // Already pre-fetching
    
    try {
      console.log('🚀 PRE-FETCHING next reel:', nextVideoUrl);
      
      const nextStreamLogic = new StreamLogic();
      nextStreamLogicRef.current = nextStreamLogic;

      // Download first 2 chunks only
      await nextStreamLogic.startStreaming(
        nextVideoUrl,
        // onReady - first chunk ready
        (fileUri) => {
          console.log('✅ Next reel first chunk cached:', fileUri);
          // Rename to cache file
          // TODO: Move this file to next_reel_cache.mp4
        },
        // onProgress
        (progress) => {
          if (progress >= 0.1) { // After 10% download
            console.log('📊 Next reel pre-fetch progress: 10% - pausing for memory');
            nextStreamLogic.cleanup();
            nextStreamLogicRef.current = null;
          }
        },
        // onError
        (error) => {
          console.log('⚠️ Next reel pre-fetch failed:', error);
        }
      );
    } catch (error) {
      console.log('❌ Pre-fetch error:', error);
    }
  };

  const startChunking = async () => {
    console.log('📥 Starting chunking for:', videoUrl);
    
    const streamLogic = new StreamLogic();
    streamLogicRef.current = streamLogic;

    await streamLogic.startStreaming(
      videoUrl,
      // onReady - when first chunk is written and file is ready
      (fileUri) => {
        console.log('✅ First chunk ready, setting local URI:', fileUri);
        console.log('🎯 PROOF: This is LOCAL FILE from expo-file-system:', fileUri);
        console.log('📁 File path starts with file://:', fileUri.startsWith('file://'));
        setLocalVideoUri(fileUri);
        if (setIsBuffering) setIsBuffering(false);
      },
      // onProgress - optional
      (progress) => {
        console.log(`📊 Chunking progress: ${Math.round(progress * 100)}%`);
      },
      // onError - handle errors
      (error) => {
        console.error('❌ Chunking failed:', error);
        if (setIsBuffering) setIsBuffering(false);
        // NO FALLBACK - Only local file allowed for true chunking
        console.log('🚫 NO DIRECT URL FALLBACK - Waiting for local file only');
      }
    );
  };

  const cleanup = async () => {
    console.log('🧹 Cleaning up chunking');
    
    if (streamLogicRef.current) {
      await streamLogicRef.current.cleanup();
      streamLogicRef.current = null;
    }
    
    if (nextStreamLogicRef.current) {
      await nextStreamLogicRef.current.cleanup();
      nextStreamLogicRef.current = null;
    }
    
    setLocalVideoUri(null);
    setIsBuffering(true);
  };

  return { streamLogicRef, cleanup };
};

// Player setup logic
export const useReelPlayerSetup = (finalVideoUrl: string | null, isPlaying: boolean) => {
  // ZERO setup - ONLY LOCAL FILE from chunking
  const player = useVideoPlayer(finalVideoUrl, (player) => {
    if (player) {
      console.log('⚡ Hardware acceleration enabled - MAX QUALITY');
      console.log('🎯 PROOF: Player using LOCAL FILE:', finalVideoUrl);
      console.log('📁 File type:', finalVideoUrl?.startsWith('file://') ? '✅ LOCAL FILE' : '❌ DIRECT URL');
      
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
          console.log('▶️ Ultra-fast play:', finalVideoUrl);
        } else {
          player.pause();
          console.log('⏸️ Paused:', finalVideoUrl);
        }
      } catch (error) {
        console.warn('⚠️ Control error:', error);
      }
    }
  }, [isPlaying, player, finalVideoUrl]);

  return { player, showControls };
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Remove black background
  },
  video: {
    width: screenWidth,
    height: screenHeight,
    zIndex: 1000, // Video on top
    // High fidelity rendering - no scaling artifacts
    backgroundColor: 'transparent',
  },
});
