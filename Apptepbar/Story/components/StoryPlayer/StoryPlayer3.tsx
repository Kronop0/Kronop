import React, { useEffect } from 'react';
import { VideoView, useVideoPlayer } from 'expo-video';

export const useStoryPlayerSetup = (finalVideoUrl: string | null, isPlaying: boolean) => {
  const isLocalFile = finalVideoUrl?.startsWith('file://') || finalVideoUrl?.startsWith('/');
  const player = useVideoPlayer(finalVideoUrl || '', (p) => {
    if (p && isLocalFile) {
      p.loop = false;
      p.muted = false;
      isPlaying && p.play();
    }
  });

  const hasReplacedRef = React.useRef(false);
  useEffect(() => {
    if (player && isLocalFile && finalVideoUrl && !hasReplacedRef.current) {
      hasReplacedRef.current = true;
      player.replaceAsync(finalVideoUrl).then(() => isPlaying && player.play());
    }
  }, [player, finalVideoUrl, isLocalFile, isPlaying]);

  useEffect(() => {
    if (player && isLocalFile) {
      isPlaying ? player.play() : player.pause();
    }
  }, [isPlaying, player, isLocalFile]);

  return player;
};
