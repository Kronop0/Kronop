import { useRef } from 'react';

export const useStoryProgress = (
  visible: boolean,
  currentStory: any,
  mediaError: boolean,
  currentStoryIndex: number,
  forceStopAndNext: () => void
) => {
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const startProgress = () => {
    if (!currentStory) return;
    const duration = 9000;
    
    progressInterval.current = setInterval(() => {
      // Progress logic handled in parent
    }, 100) as unknown as NodeJS.Timeout;
  };

  const stopProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  return { progressInterval, startProgress, stopProgress };
};

export const useStoryNavigation = (
  currentStoryIndex: number,
  stories: any[],
  onClose: () => void,
  setCurrentStoryIndex: (idx: number) => void,
  setProgress: (p: number) => void,
  setIsPlaying: (p: boolean) => void,
  stopProgress: () => void
) => {
  const goToNext = () => {
    stopProgress();
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
      setIsPlaying(true);
    } else {
      setTimeout(() => onClose(), 0);
    }
  };

  const goToPrevious = () => {
    stopProgress();
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  return { goToNext, goToPrevious };
};
