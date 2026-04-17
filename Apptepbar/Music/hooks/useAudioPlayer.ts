import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { r2SongService } from '../services/r2Service';
import { getCachedSongs, cacheSongs } from '../services/songCacheService';
import { showMediaNotification, dismissMediaNotification, requestNotificationPermission, showMediaNotificationImmediate } from '../services/notificationService';
import { Song } from '../types';

// Prefetch cache for next songs
const prefetchCache = new Map<string, Audio.Sound>();

export function useAudioPlayer() {
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const [songsError, setSongsError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const playlistRef = useRef<Song[]>([]);
  const loadingRef = useRef(false);
  const currentIndexRef = useRef(0);

  useEffect(() => { requestNotificationPermission(); }, []);

  // Cleanup prefetch cache
  const clearPrefetchCache = useCallback(() => {
    prefetchCache.forEach((sound) => {
      try {
        sound.unloadAsync();
      } catch {
        // Ignore cleanup errors
      }
    });
    prefetchCache.clear();
  }, []);

  // Prefetch next songs for instant playback
  const prefetchNextSongs = useCallback(async (currentIdx: number) => {
    const list = playlistRef.current;
    if (list.length === 0) return;
    
    // Prefetch next 2 songs
    const indicesToPrefetch = [
      (currentIdx + 1) % list.length,
      (currentIdx + 2) % list.length,
    ];
    
    for (const idx of indicesToPrefetch) {
      const song = list[idx];
      if (!song || prefetchCache.has(song.id)) continue;
      
      try {
        // Preload sound without playing
        const { sound } = await Audio.Sound.createAsync(
          { uri: song.audioUrl },
          { shouldPlay: false },
          undefined,
          true // Download first for instant playback
        );
        prefetchCache.set(song.id, sound);
        
        if (__DEV__) {
          console.log(`[Prefetch] Loaded: ${song.title}`);
        }
      } catch (e) {
        // Silently fail prefetch - it's just optimization
        if (__DEV__) {
          console.log(`[Prefetch] Failed for ${song.title}:`, e);
        }
      }
    }
    
    // Clean up old prefetches (keep only next 5)
    const songsToKeep = new Set([
      list[currentIdx]?.id,
      ...indicesToPrefetch.map(i => list[i]?.id),
    ].filter(Boolean));
    
    prefetchCache.forEach((sound, songId) => {
      if (!songsToKeep.has(songId)) {
        try {
          sound.unloadAsync();
        } catch {}
        prefetchCache.delete(songId);
      }
    });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
        let songs = await getCachedSongs(r2SongService.regenerateUrls.bind(r2SongService));
        if (!songs) {
          songs = await r2SongService.fetchSongs();
          if (songs.length > 0) {
            await cacheSongs(songs, r2SongService.getR2Keys(), r2SongService.getEtags());
          }
        }
        if (songs.length === 0) {
          setSongsError('No songs found in bucket.');
        } else {
          playlistRef.current = songs;
          setPlaylist(songs);
        }
      } catch (e) {
        console.error('[Player] Load error:', e);
        setSongsError('Failed to load songs. Check your connection and R2 credentials.');
      } finally {
        setIsLoadingSongs(false);
      }
    })();
    return () => {
      soundRef.current?.unloadAsync();
      dismissMediaNotification();
      clearPrefetchCache();
    };
  }, [clearPrefetchCache]);

  const loadAndPlay = useCallback(async (index: number) => {
    const list = playlistRef.current;
    if (!list[index]) return;
    
    // Prevent loading if already loading
    if (loadingRef.current) {
      console.log('[Player] Already loading, please wait...');
      return;
    }
    
    loadingRef.current = true;
    setIsLoading(true);
    currentIndexRef.current = index;
    
    try {
      // Check if song is already prefetched
      const song = list[index];
      const prefetched = prefetchCache.get(song.id);
      
      if (prefetched) {
        // Use prefetched sound - INSTANT playback
        if (soundRef.current) {
          try {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
          } catch {}
        }
        
        // Remove from prefetch cache (we're using it now)
        prefetchCache.delete(song.id);
        soundRef.current = prefetched;
        
        // Update callback for status updates
        soundRef.current.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
          if (!status.isLoaded) return;
          setPosition(status.positionMillis);
          setDuration(status.durationMillis ?? 0);
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            const next = index + 1 < list.length ? index + 1 : 0;
            loadAndPlay(next);
          }
        });
        
        await soundRef.current.playAsync();
        setCurrentIndex(index);
        showMediaNotificationImmediate(song, true);
        
        // Prefetch next songs while current is playing
        prefetchNextSongs(index);
        return;
      }
      
      // Stop and unload any existing sound completely
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        } catch (e) {
          // Ignore errors during cleanup
          console.log('[Player] Cleanup error (ignored):', e);
        }
        soundRef.current = null;
      }
      setCurrentIndex(index);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: song.audioUrl },
        { shouldPlay: true },
        (status: AVPlaybackStatus) => {
          if (!status.isLoaded) return;
          setPosition(status.positionMillis);
          setDuration(status.durationMillis ?? 0);
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            const next = index + 1 < list.length ? index + 1 : 0;
            loadAndPlay(next);
          }
        },
        true // Download first
      );
      soundRef.current = sound;
      showMediaNotificationImmediate(song, true);
      
      // Prefetch next songs while current is loading
      prefetchNextSongs(index);
    } catch (e) {
      console.error('[Audio] Load failed:', e);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [prefetchNextSongs]);

  const playSongAtIndex = useCallback(async (index: number) => {
    await loadAndPlay(index);
  }, [loadAndPlay]);

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current || loadingRef.current) return;
    const list = playlistRef.current;
    try {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        showMediaNotification(list[currentIndex], false);
      } else {
        await soundRef.current.playAsync();
        showMediaNotification(list[currentIndex], true);
      }
    } catch (e) {
      console.error('[Player] Toggle play/pause error:', e);
    }
  }, [isPlaying, currentIndex]);

  return {
    playlist,
    currentSong: playlist[currentIndex] ?? null,
    currentIndex,
    isPlaying,
    isLoading,
    isLoadingSongs,
    songsError,
    duration,
    position,
    togglePlayPause,
    playSongAtIndex,
    prefetchNextSongs, // Expose for manual prefetch if needed
  };
}
