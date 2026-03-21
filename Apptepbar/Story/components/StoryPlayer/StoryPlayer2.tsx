import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VideoView } from 'expo-video';
import { StreamLogic } from '../../../reels/chunking/StreamLogic';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface StoryPlayerProps {
  videoUrl: string;
  nextVideoUrl?: string;
  isPlaying?: boolean;
  onVideoEnd?: () => void;
  onPlayerReady?: (player: any) => void;
  style?: any;
}

export const useStoryChunking = (
  videoUrl: string,
  nextVideoUrl: string | undefined,
  setLocalVideoUri: (uri: string | null) => void,
  setIsBuffering?: (val: boolean) => void
) => {
  const streamLogicRef = React.useRef<StreamLogic | null>(null);
  const nextStreamLogicRef = React.useRef<StreamLogic | null>(null);

  useEffect(() => {
    if (videoUrl) startChunking();
    return () => { cleanup(); };
  }, [videoUrl]);

  useEffect(() => {
    nextVideoUrl && prefetchNextStory();
  }, [nextVideoUrl]);

  const prefetchNextStory = async () => {
    if (nextStreamLogicRef.current) return;
    const nextStreamLogic = new StreamLogic();
    nextStreamLogicRef.current = nextStreamLogic;
    try {
      await nextStreamLogic.startStreaming(nextVideoUrl, null, (progress) => {
        if (progress >= 0.1) {
          nextStreamLogic.cleanup();
          nextStreamLogicRef.current = null;
        }
      }, null);
    } catch {}
  };

  const startChunking = async () => {
    const streamLogic = new StreamLogic();
    streamLogicRef.current = streamLogic;
    await streamLogic.startStreaming(
      videoUrl,
      (fileUri) => {
        setLocalVideoUri(fileUri);
        setIsBuffering?.(false);
      },
      null,
      () => setIsBuffering?.(false)
    );
  };

  const cleanup = async () => {
    streamLogicRef.current?.cleanup();
    nextStreamLogicRef.current?.cleanup();
    streamLogicRef.current = null;
    nextStreamLogicRef.current = null;
    setLocalVideoUri(null);
    setIsBuffering?.(true);
  };

  return { streamLogicRef, cleanup };
};

// Import useStoryPlayerSetup from StoryPlayer3
import { useStoryPlayerSetup } from './StoryPlayer3';

export const ChunkedStoryVideo = ({ videoUrl, nextVideoUrl, style, onVideoEnd, onPlayerReady }: StoryPlayerProps) => {
  const [localVideoUri, setLocalVideoUri] = React.useState<string | null>(null);
  const [isBuffering, setIsBuffering] = React.useState(true);
  const [isReady, setIsReady] = React.useState(false);

  useStoryChunking(videoUrl, nextVideoUrl, (uri) => {
    if (uri) {
      setLocalVideoUri(uri);
      setIsBuffering(false);
      setIsReady(true);
    }
  }, setIsBuffering);

  const player = useStoryPlayerSetup(localVideoUri, true);

  useEffect(() => {
    if (onPlayerReady && player && isReady) {
      onPlayerReady(player);
    }
  }, [player, onPlayerReady, isReady]);

  if (!isReady || !localVideoUri) {
    return (
      <View style={[style, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff' }}>⏳ Loading...</Text>
      </View>
    );
  }

  return (
    <VideoView
      player={player}
      style={style}
      contentFit="contain"
      nativeControls={false}
      allowsPictureInPicture={false}
    />
  );
};

export const storyStyles = StyleSheet.create({
  video: { width: screenWidth, height: screenHeight, backgroundColor: '#000' },
});
