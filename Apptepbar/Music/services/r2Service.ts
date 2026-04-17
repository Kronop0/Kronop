// Cloudflare R2 Service — Uses AWS S3 SDK for listing + Pre-signed URLs for playback
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Song } from '../types';
import { R2_SONG_CONFIG, isR2Configured } from '../constants/r2Config';

// Metadata for URL regeneration
export interface SongMetadata {
  id: string;
  title: string;
  artist: string;
  r2Key: string;
  etag: string;
}

const AUDIO_EXTS = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'];

// URL Cache - prevents redundant computation
const urlCache = new Map<string, { url: string; expiry: number }>();
const CACHE_TTL_MS = 1000 * 60 * 55; // 55 minutes

// S3 Client for R2 listing
const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_SONG_CONFIG.endpoint,
  credentials: {
    accessKeyId: R2_SONG_CONFIG.accessKeyId || '',
    secretAccessKey: R2_SONG_CONFIG.secretAccessKey || '',
  },
});

// Get audio URL - uses pre-signed URL for authenticated access
async function getAudioUrl(key: string): Promise<string> {
  const now = Date.now();
  const cached = urlCache.get(key);
  
  if (cached && cached.expiry > now) {
    return cached.url;
  }
  
  try {
    // Validate credentials before attempting
    if (!R2_SONG_CONFIG.accessKeyId || !R2_SONG_CONFIG.secretAccessKey) {
      throw new Error('R2 credentials not configured');
    }
    
    // Generate pre-signed URL valid for 1 hour
    const command = new GetObjectCommand({
      Bucket: R2_SONG_CONFIG.bucketSong,
      Key: key,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    urlCache.set(key, { url, expiry: now + CACHE_TTL_MS });
    console.log('[R2] Generated pre-signed URL for:', key);
    return url;
  } catch (error) {
    console.error('[R2] Failed to generate pre-signed URL for:', key, error);
    // Don't fallback to public URL if credentials are missing - it will 401
    throw error;
  }
}

// Clear URL cache when needed
export function clearUrlCache(): void {
  urlCache.clear();
}

// List objects using S3 SDK (authenticated)
async function listR2Objects(): Promise<{ key: string; etag: string }[]> {
  if (!isR2Configured()) {
    console.log('[R2] Not configured - skipping fetch');
    return [];
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_SONG_CONFIG.bucketSong,
      MaxKeys: 1000,
    });

    const response = await s3Client.send(command);
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log('[R2] Bucket is empty');
      return [];
    }

    return response.Contents.map((item) => ({
      key: item.Key || '',
      etag: item.ETag?.replace(/"/g, '') || '',
    })).filter((item) => item.key);
  } catch (error) {
    console.warn('[R2] Failed to list objects:', error);
    return [];
  }
}

// ── R2 Song Service ──────────────────────────────────────────────────────────

class R2SongService {
  private r2Keys = new Map<string, string>(); // song.id -> r2Key
  private etags = new Map<string, string>(); // song.id -> etag

  private isAudio(key: string): boolean {
    const lower = key.toLowerCase();
    return AUDIO_EXTS.some((ext) => lower.endsWith(ext));
  }

  async fetchSongs(): Promise<Song[]> {
    if (!isR2Configured()) {
      console.log('[R2] Not configured - returning empty playlist');
      return [];
    }
    
    console.log('[R2] Listing bucket:', R2_SONG_CONFIG.bucketSong);
    const startTime = Date.now();
    
    // Clear previous mappings
    this.r2Keys.clear();
    this.etags.clear();
    
    try {
      const objects = await listR2Objects();
      
      if (objects.length === 0) {
        console.log('[R2] No objects found in bucket');
        return [];
      }

      // Process songs with async audio URL generation
      const audioFiles = objects.filter((o) => this.isAudio(o.key));
      const songResults = await Promise.allSettled(
        audioFiles.map(async (o, index) => {
          const fileName = o.key.split('/').pop() ?? o.key;
          const nameNoExt = decodeURIComponent(fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
          const dashIndex = nameNoExt.indexOf(' - ');
          const artist = dashIndex !== -1 ? nameNoExt.slice(0, dashIndex).trim() : 'Unknown Artist';
          const title = dashIndex !== -1 ? nameNoExt.slice(dashIndex + 3).trim() : nameNoExt;
          const uniqueId = `r2-${index}-${o.etag?.slice(0, 8) || 'unknown'}`;
          const audioUrl = await getAudioUrl(o.key);
          
          // Store mappings for caching
          this.r2Keys.set(uniqueId, o.key);
          this.etags.set(uniqueId, o.etag || '');
          
          return {
            id: uniqueId,
            title,
            artist,
            albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
            audioUrl,
            category: 'all',
          };
        })
      );
      
      const songs: Song[] = songResults
        .filter((result) => result.status === 'fulfilled')
        .map((result) => (result as PromiseFulfilledResult<Song>).value);
      
      const failedCount = songResults.length - songs.length;
      if (failedCount > 0) {
        console.warn(`[R2] Failed to generate URLs for ${failedCount} songs`);
      }

      const duration = Date.now() - startTime;
      console.log(`[R2] ${songs.length} songs found in ${duration}ms`);
      return songs;
    } catch (error) {
      console.error('[R2] Error fetching songs:', error);
      return [];
    }
  }

  // Regenerate fresh pre-signed URLs from cached metadata
  async regenerateUrls(metadata: SongMetadata[]): Promise<Song[]> {
    if (!isR2Configured()) {
      console.log('[R2] Not configured - cannot regenerate URLs');
      return [];
    }

    const results = await Promise.allSettled(
      metadata.map(async (m) => {
        const audioUrl = await getAudioUrl(m.r2Key);
        return {
          id: m.id,
          title: m.title,
          artist: m.artist,
          albumArt: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80',
          audioUrl,
          category: 'all',
        };
      })
    );

    return results
      .filter((result) => result.status === 'fulfilled')
      .map((result) => (result as PromiseFulfilledResult<Song>).value);
  }

  // Get mappings for caching
  getR2Keys(): Map<string, string> {
    return new Map(this.r2Keys);
  }

  getEtags(): Map<string, string> {
    return new Map(this.etags);
  }
}

export const r2SongService = new R2SongService();
