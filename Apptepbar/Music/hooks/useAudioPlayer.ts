import { useState, useEffect, useCallback } from 'react';
import { AVPlaybackStatus } from 'expo-av';
import { audioService } from '../services/audioService';
import { Song } from '../types';
import { loadSongs } from '../data/songs';

export enum RepeatMode {
  OFF = 'off',
  ONE = 'one',
  ALL = 'all',
}

export function useAudioPlayer() {
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>(RepeatMode.ALL);

  const currentSong = playlist[currentIndex];

  // Load songs from R2 on mount
  useEffect(() => {
    const fetchPlaylist = async () => {
      try {
        setIsLoadingSongs(true);
        const songs = await loadSongs();
        setPlaylist(songs);
      } catch (error) {
        console.error('Failed to load playlist:', error);
        setPlaylist([]);
      } finally {
        setIsLoadingSongs(false);
      }
    };

    fetchPlaylist();
  }, []);

  // Initialize audio
  useEffect(() => {
    audioService.initialize();
    return () => {
      audioService.cleanup();
    };
  }, []);

  // Load song
  const loadSong = useCallback(async (index: number) => {
    try {
      setIsLoading(true);
      setIsPlaying(false);
      setPosition(0);

      const song = playlist[index];
      await audioService.loadSong(song);

      // Set up playback status listener
      audioService.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
          setDuration(status.durationMillis || 0);
          setPosition(status.positionMillis || 0);
          
          // Only update isPlaying if it actually changed to avoid infinite loops
          const actualPlayingState = status.isPlaying || false;
          if (actualPlayingState !== isPlaying) {
            setIsPlaying(actualPlayingState);
          }

          // Auto play next song when current finishes (only if user was playing)
          if (status.didJustFinish && isPlaying) {
            // Auto-next logic will be handled by handleNext when called
            let nextIndex: number;
            if (repeatMode === RepeatMode.ONE) {
              nextIndex = currentIndex;
            } else if (isShuffle) {
              nextIndex = Math.floor(Math.random() * playlist.length);
            } else {
              nextIndex = currentIndex + 1;
              if (nextIndex >= playlist.length) {
                nextIndex = repeatMode === RepeatMode.ALL ? 0 : currentIndex;
              }
            }

            if (nextIndex !== currentIndex || repeatMode === RepeatMode.ONE) {
              setCurrentIndex(nextIndex);
              loadSong(nextIndex);
              if (repeatMode === RepeatMode.ONE) {
                setTimeout(() => audioService.play(), 100);
              }
            }
          }
        }
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load song:', error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, [playlist, isPlaying, currentIndex, repeatMode, isShuffle, playlist.length]);

  // Load first song on mount
  useEffect(() => {
    if (playlist.length > 0) {
      loadSong(0);
    }
  }, []);

  // Play/Pause toggle
  const togglePlayPause = useCallback(async () => {
    try {
      if (!currentSong) return;
      
      if (isPlaying) {
        await audioService.pause();
        setIsPlaying(false); // Immediately update state
      } else {
        await audioService.play();
        // Let the playback status listener update the state
      }
    } catch (error) {
      console.error('Failed to toggle play/pause:', error);
      setIsPlaying(false); // Reset to safe state on error
    }
  }, [isPlaying, currentSong]);

  // Next song
  const handleNext = useCallback(() => {
    let nextIndex: number;

    if (repeatMode === RepeatMode.ONE) {
      nextIndex = currentIndex;
    } else if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= playlist.length) {
        nextIndex = repeatMode === RepeatMode.ALL ? 0 : currentIndex;
      }
    }

    if (nextIndex !== currentIndex || repeatMode === RepeatMode.ONE) {
      setCurrentIndex(nextIndex);
      loadSong(nextIndex);
      if (isPlaying || repeatMode === RepeatMode.ONE) {
        setTimeout(() => audioService.play(), 100);
      }
    }
  }, [currentIndex, playlist.length, isShuffle, repeatMode, isPlaying, loadSong]);

  // Previous song
  const handlePrevious = useCallback(() => {
    if (position > 3000) {
      // If more than 3 seconds played, restart current song
      audioService.seekTo(0);
    } else {
      const prevIndex = currentIndex - 1 < 0 ? playlist.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
      loadSong(prevIndex);
      if (isPlaying) {
        setTimeout(() => audioService.play(), 100);
      }
    }
  }, [currentIndex, playlist.length, position, isPlaying, loadSong]);

  // Seek
  const handleSeek = useCallback(async (value: number) => {
    try {
      await audioService.seekTo(value);
      setPosition(value);
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  }, []);

  // Volume control
  const handleVolumeChange = useCallback(async (value: number) => {
    try {
      await audioService.setVolume(value);
      setVolume(value);
    } catch (error) {
      console.error('Failed to change volume:', error);
    }
  }, []);

  // Toggle shuffle
  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  // Toggle repeat
  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === RepeatMode.OFF) return RepeatMode.ALL;
      if (prev === RepeatMode.ALL) return RepeatMode.ONE;
      return RepeatMode.OFF;
    });
  }, []);

  // Play specific song from list
  const playSongAtIndex = useCallback(async (index: number) => {
    if (index < 0 || index >= playlist.length) return;
    
    try {
      if (index === currentIndex) {
        // If same song, just toggle play/pause
        if (isPlaying) {
          await audioService.pause();
          setIsPlaying(false);
        } else {
          await audioService.play();
        }
      } else {
        // Load and play new song
        setCurrentIndex(index);
        await loadSong(index);
        // Start playing after a short delay to ensure song is loaded
        setTimeout(async () => {
          try {
            await audioService.play();
          } catch (error) {
            console.error('Failed to play new song:', error);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Failed to play song at index:', error);
      setIsPlaying(false);
    }
  }, [currentIndex, playlist.length, isPlaying, loadSong]);

  return {
    playlist,
    currentSong,
    currentIndex,
    isPlaying,
    isLoading,
    isLoadingSongs,
    duration,
    position,
    volume,
    isShuffle,
    repeatMode,
    togglePlayPause,
    handleNext,
    handlePrevious,
    handleSeek,
    handleVolumeChange,
    toggleShuffle,
    toggleRepeat,
    playSongAtIndex,
  };
}
