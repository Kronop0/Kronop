import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { r2SongService, clearUrlForKey, testUrlAccessibility, getAlternativeUrl } from '../services/r2Service';
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
    
    let song = list[index];
    
    try {
      // Check if song is already prefetched
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
      
      // Check if URL contains expired timestamp (simple validation)
      try {
        const url = new URL(song.audioUrl);
        const amzDate = url.searchParams.get('X-Amz-Date');
        const amzExpires = parseInt(url.searchParams.get('X-Amz-Expires') || '3600');
        
        if (amzDate) {
          const urlTime = new Date(amzDate + 'Z').getTime();
          const expiryTime = urlTime + (amzExpires * 1000);
          const now = Date.now();
          
          // Regenerate if URL expires in less than 5 minutes
          if (expiryTime - now < 5 * 60 * 1000) {
            console.log('[Audio] URL expiring soon, regenerating proactively...');
            const r2Key = r2SongService.getR2Keys().get(song.id);
            if (r2Key) {
              clearUrlForKey(r2Key);
            }
            
            const metadata = Array.from(r2SongService.getR2Keys().entries())
              .filter(([id]) => id === song.id)
              .map(([id, r2Key]) => ({
                id,
                title: song.title,
                artist: song.artist,
                r2Key,
                etag: r2SongService.getEtags().get(id) || ''
              }));
            
            if (metadata.length > 0) {
              const regeneratedSongs = await r2SongService.regenerateUrls(metadata);
              const regeneratedSong = regeneratedSongs.find(s => s.id === song.id);
              if (regeneratedSong) {
                song = regeneratedSong;
                // Update playlist with fresh URL
                const updatedList = [...list];
                updatedList[index] = song;
                playlistRef.current = updatedList;
                setPlaylist(updatedList);
                console.log('[Audio] URL regenerated successfully');
              }
            }
          }
        }
      } catch (parseError) {
        console.warn('[Audio] Failed to parse URL timestamp:', parseError);
      }
      
      console.log('[Audio] Loading song:', song.title);
      console.log('[Audio] Audio URL:', song.audioUrl);
      console.log('[Audio] URL length:', song.audioUrl.length);
      
      // Test URL accessibility before attempting to load audio
      console.log('[Audio] Testing URL accessibility...');
      let audioUrl = song.audioUrl;
      let isUrlAccessible = await testUrlAccessibility(audioUrl);
      
      // If URL is not accessible, try alternative URL method
      if (!isUrlAccessible) {
        console.warn('[Audio] URL is not accessible, trying alternative URL...');
        try {
          const r2Key = r2SongService.getR2Keys().get(song.id);
          const keyToUse = r2Key || audioUrl.split('/').pop() || '';
          audioUrl = await getAlternativeUrl(keyToUse, audioUrl);
          
          // Update song with new URL
          song = { ...song, audioUrl };
          
          // Update playlist
          const updatedList = [...list];
          updatedList[index] = song;
          playlistRef.current = updatedList;
          setPlaylist(updatedList);
          
          // Test alternative URL
          isUrlAccessible = await testUrlAccessibility(audioUrl);
          if (!isUrlAccessible) {
            console.warn('[Audio] Alternative URL also not accessible, this may cause loading failure');
          } else {
            console.log('[Audio] Alternative URL is accessible');
          }
        } catch (altError) {
          console.error('[Audio] Failed to get alternative URL:', altError);
        }
      }
      
      // Create and load the sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
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
        true
      );
      
      soundRef.current = sound;
      showMediaNotificationImmediate(song, true);
      
      // Prefetch next songs while current is playing
      prefetchNextSongs(index);
      
    } catch (e) {
      console.error('[Audio] Load failed:', e);
      console.error('[Audio] Error details:', {
        songTitle: song.title,
        songId: song.id,
        audioUrl: song.audioUrl,
        urlLength: song.audioUrl?.length,
        errorMessage: e instanceof Error ? e.message : 'Unknown error',
        errorStack: e instanceof Error ? e.stack : undefined,
        timestamp: new Date().toISOString()
      });

      // Retry logic for 403 errors (expired URLs)
      if (e instanceof Error && (e.message.includes('403') || e.message.includes('forbidden'))) {
        console.log('[Audio] 403 error detected, attempting URL regeneration and retry...');
        try {
          // Check if we're using a public URL (no signature parameters)
          const isPublicUrl = !song.audioUrl.includes('X-Amz-Signature');
          
          if (isPublicUrl) {
            console.log('[Audio] Using public URL - 403 suggests file not found or bucket not public');
            console.log('[Audio] Skipping retry for public URL - file may not exist');
            return; // Exit early for public URLs
          }
          
          // Force clear URL cache for this song's R2 key
          const r2Key = r2SongService.getR2Keys().get(song.id);
          if (r2Key) {
            clearUrlForKey(r2Key);
          }
          
          let metadata = Array.from(r2SongService.getR2Keys().entries())
            .filter(([id]) => id === song.id)
            .map(([id, r2Key]) => ({
              id,
              title: song.title,
              artist: song.artist,
              r2Key,
              etag: r2SongService.getEtags().get(id) || ''
            }));
          
          // Fallback: If no metadata found, try to extract R2 key from URL
          if (metadata.length === 0) {
            console.log('[Audio] No metadata found, attempting to extract R2 key from URL...');
            try {
              const url = new URL(song.audioUrl);
              const urlPath = url.pathname;
              // Extract key from URL path (remove leading /songs/ if present)
              const extractedKey = urlPath.replace(/^\/songs\//, '');
              
              if (extractedKey) {
                console.log('[Audio] Extracted R2 key:', extractedKey);
                metadata = [{
                  id: song.id,
                  title: song.title,
                  artist: song.artist,
                  r2Key: extractedKey,
                  etag: ''
                }];
                
                // Populate service mappings with this extracted key
                r2SongService.getR2Keys().set(song.id, extractedKey);
              }
            } catch (extractError) {
              console.warn('[Audio] Failed to extract R2 key from URL:', extractError);
            }
          }
          
          if (metadata.length > 0) {
            const regeneratedSongs = await r2SongService.regenerateUrls(metadata);
            const regeneratedSong = regeneratedSongs.find(s => s.id === song.id);
            if (regeneratedSong) {
              console.log('[Audio] Generated new URL:', regeneratedSong.audioUrl.substring(0, 100) + '...');
              
              // Update playlist with fresh URL
              const updatedList = [...list];
              updatedList[index] = regeneratedSong;
              playlistRef.current = updatedList;
              setPlaylist(updatedList);
              
              // Small delay to ensure URL is properly set
              await new Promise(resolve => setTimeout(resolve, 100));
              
              // Retry loading with fresh URL
              console.log('[Audio] Retrying with regenerated URL...');
              const { sound: retrySound } = await Audio.Sound.createAsync(
                { uri: regeneratedSong.audioUrl },
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
                true
              );
              soundRef.current = retrySound;
              showMediaNotificationImmediate(regeneratedSong, true);
              prefetchNextSongs(index);
              console.log('[Audio] Retry successful - song is now playing');
              return; // Success, exit early
            } else {
              console.error('[Audio] No regenerated song found for ID:', song.id);
            }
          } else {
            console.error('[Audio] No metadata found and could not extract R2 key for song ID:', song.id);
            console.error('[Audio] Song URL:', song.audioUrl);
          }
        } catch (retryError) {
          console.error('[Audio] Retry failed:', retryError);
          console.error('[Audio] Retry error details:', {
            message: retryError instanceof Error ? retryError.message : 'Unknown',
            stack: retryError instanceof Error ? retryError.stack : undefined
          });
        }
      }
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
