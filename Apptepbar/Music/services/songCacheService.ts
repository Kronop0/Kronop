// Song Cache Service — AsyncStorage caching for R2 song metadata (NOT URLs)
// Pre-signed URLs expire in 1 hour, so we cache metadata and regenerate URLs on load
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types';
import type { SongMetadata } from './r2Service';

const CACHE_KEY = 'krono-songs-v5'; // Bumped for metadata-only cache
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours (metadata doesn't expire)

// Re-export for convenience
export type { SongMetadata };

interface CacheEntry {
  timestamp: number;
  songs: SongMetadata[];
}

export async function getCachedSongs(
  regenerateUrls?: (metadata: SongMetadata[]) => Promise<Song[]>
): Promise<Song[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    const age = Date.now() - entry.timestamp;
    if (age > CACHE_TTL_MS) {
      console.log('[Cache] Expired, will refetch from R2');
      return null;
    }
    
    // If no regenerator provided, return null to force fresh fetch
    if (!regenerateUrls) {
      console.log('[Cache] Hit but no URL regenerator available, forcing fresh fetch');
      return null;
    }
    
    console.log(`[Cache] Hit — ${entry.songs.length} songs, regenerating fresh URLs...`);
    
    // Regenerate fresh pre-signed URLs from cached metadata
    const songsWithFreshUrls = await regenerateUrls(entry.songs);
    console.log(`[Cache] Regenerated URLs for ${songsWithFreshUrls.length} songs`);
    return songsWithFreshUrls;
  } catch (e) {
    console.warn('[Cache] Read error:', e);
    return null;
  }
}

export async function cacheSongs(songs: Song[], r2Keys: Map<string, string>, etags: Map<string, string>): Promise<void> {
  try {
    // Store only metadata + R2 keys, NOT the pre-signed URLs
    const metadata: SongMetadata[] = songs.map(song => ({
      id: song.id,
      title: song.title,
      artist: song.artist,
      r2Key: r2Keys.get(song.id) || '',
      etag: etags.get(song.id) || '',
    })).filter(m => m.r2Key); // Only cache if we have the R2 key
    
    const entry: CacheEntry = { timestamp: Date.now(), songs: metadata };
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    console.log(`[Cache] Saved ${metadata.length} songs (metadata only, no URLs)`);
  } catch (e) {
    console.warn('[Cache] Write error:', e);
  }
}

export async function clearSongCache(): Promise<void> {
  await AsyncStorage.removeItem(CACHE_KEY);
  // Also clear all old cache keys
  await AsyncStorage.removeItem('krono-songs');
  await AsyncStorage.removeItem('krono-songs-v2');
  await AsyncStorage.removeItem('krono-songs-v3');
  await AsyncStorage.removeItem('krono-songs-v4');
  console.log('[Cache] Cleared all versions');
}
