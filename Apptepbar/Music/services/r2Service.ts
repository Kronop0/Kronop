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

// Debug function to log R2 configuration status
export const debugR2Config = (): void => {
  console.log('[R2] Configuration Debug:');
  console.log('- Account ID:', R2_SONG_CONFIG.accountId ? '✓ Set' : '✗ Missing');
  console.log('- Access Key ID:', R2_SONG_CONFIG.accessKeyId ? '✓ Set' : '✗ Missing');
  console.log('- Secret Access Key:', R2_SONG_CONFIG.secretAccessKey ? '✓ Set' : '✗ Missing');
  console.log('- Endpoint:', R2_SONG_CONFIG.endpoint || '✗ Missing');
  console.log('- Public URL:', R2_SONG_CONFIG.publicUrl || '✗ Missing');
  console.log('- Bucket Name:', R2_SONG_CONFIG.bucketSong);
  console.log('- Overall Status:', isR2Configured() ? '✓ Configured' : '✗ Not Configured');
};

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
  forcePathStyle: true,
});

// Get audio URL - uses pre-signed URL for authenticated access
async function getAudioUrl(key: string): Promise<string> {
  const now = Date.now();
  const cached = urlCache.get(key);
  
  if (cached && cached.expiry > now) {
    console.log('[R2] Using cached URL for:', key, 'expires in:', Math.floor((cached.expiry - now) / 1000), 'seconds');
    return cached.url;
  }
  
  // Check if R2 is properly configured
  if (!isR2Configured()) {
    console.error('[R2] R2 not configured - missing credentials');
    throw new Error('R2 credentials not configured. Please check your .env file.');
  }
  
  // Try pre-signed URL first (more reliable with proper credentials)
  try {
    console.log('[R2] Generating pre-signed URL for:', key);
    debugR2Config();
    
    // Generate pre-signed URL valid for 1 hour
    const command = new GetObjectCommand({
      Bucket: R2_SONG_CONFIG.bucketSong,
      Key: key,
    });
    
    console.log('[R2] GetObject command:', {
      Bucket: R2_SONG_CONFIG.bucketSong,
      Key: key
    });
    
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    // For R2 with forcePathStyle: true, the URL should already be correct
    // Format: https://<account-id>.r2.cloudflarestorage.com/<bucket>/<key>
    // No need for URL replacement
    urlCache.set(key, { url: url, expiry: now + CACHE_TTL_MS });
    
    console.log('[R2] Generated pre-signed URL for:', key);
    console.log('[R2] URL preview:', url.substring(0, 100) + '...');
    console.log('[R2] URL length:', url.length);
    
    // Parse URL components for debugging
    try {
      const urlObj = new URL(url);
      console.log('[R2] URL components:', {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        pathname: urlObj.pathname,
        searchParams: {
          'X-Amz-Date': urlObj.searchParams.get('X-Amz-Date'),
          'X-Amz-Expires': urlObj.searchParams.get('X-Amz-Expires'),
          'X-Amz-SignedHeaders': urlObj.searchParams.get('X-Amz-SignedHeaders'),
          'X-Amz-Signature': urlObj.searchParams.get('X-Amz-Signature')?.substring(0, 20) + '...'
        }
      });
    } catch (parseError) {
      console.warn('[R2] Failed to parse generated URL:', parseError);
    }
    
    return url;
  } catch (error) {
    console.error('[R2] Failed to generate pre-signed URL for:', key, error);
    console.error('[R2] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    // Fall back to public URL if pre-signed fails
    if (R2_SONG_CONFIG.publicUrl) {
      console.log('[R2] Falling back to public URL for:', key);
      const publicUrl = `${R2_SONG_CONFIG.publicUrl}/${key}`;
      console.log('[R2] Public URL:', publicUrl);
      
      urlCache.set(key, { url: publicUrl, expiry: now + CACHE_TTL_MS });
      return publicUrl;
    }
    
    throw error;
  }
}

// Clear URL cache when needed
export function clearUrlCache(): void {
  urlCache.clear();
}

// Clear specific URL from cache
export function clearUrlForKey(key: string): void {
  urlCache.delete(key);
}

// Check if cached URL is expired
export function isUrlExpired(key: string): boolean {
  const cached = urlCache.get(key);
  if (!cached) return true;
  return cached.expiry <= Date.now();
}

// Test if a URL is accessible (for debugging 403 issues)
export async function testUrlAccessibility(url: string): Promise<boolean> {
  try {
    console.log('[R2] Testing URL accessibility:', url.substring(0, 100) + '...');
    const response = await fetch(url, { method: 'HEAD' });
    console.log('[R2] URL test response:', {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'content-type': response.headers.get('content-type'),
        'content-length': response.headers.get('content-length'),
        'access-control-allow-origin': response.headers.get('access-control-allow-origin')
      }
    });
    
    // Log detailed error information for debugging
    if (!response.ok) {
      console.error('[R2] URL accessibility failed:', {
        url: url.substring(0, 100) + '...',
        status: response.status,
        statusText: response.statusText,
        isPublicUrl: !url.includes('X-Amz-Signature'),
        suggestion: response.status === 401 ? 'Check R2 credentials and bucket permissions' : 
                   response.status === 403 ? 'Check bucket CORS policy and public access settings' :
                   'Unknown error - check R2 configuration'
      });
    }
    
    return response.ok;
  } catch (error) {
    console.error('[R2] URL test failed:', error);
    return false;
  }
}

// Try alternative URL method if primary fails
export async function getAlternativeUrl(key: string, currentUrl: string): Promise<string> {
  const isPublicUrl = !currentUrl.includes('X-Amz-Signature');
  
  if (isPublicUrl) {
    console.log('[R2] Public URL failed, trying pre-signed URL...');
    // Clear cache and try pre-signed URL
    clearUrlForKey(key);
    
    try {
      // Generate pre-signed URL
      const command = new GetObjectCommand({
        Bucket: R2_SONG_CONFIG.bucketSong,
        Key: key,
      });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      
      // For R2 with forcePathStyle: true, the URL should already be correct
      console.log('[R2] Generated alternative pre-signed URL for:', key);
      return signedUrl;
    } catch (error) {
      console.error('[R2] Failed to generate alternative URL:', error);
      throw error;
    }
  } else {
    console.log('[R2] Pre-signed URL failed, trying public URL...');
    if (R2_SONG_CONFIG.publicUrl) {
      const publicUrl = `${R2_SONG_CONFIG.publicUrl}/${key}`;
      console.log('[R2] Generated alternative public URL for:', key);
      return publicUrl;
    }
    throw new Error('No alternative URL available');
  }
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
    console.log('[R2] Starting fetchSongs...');
    
    // Run comprehensive R2 test first
    await testR2Configuration();
    
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

    // Populate internal mappings for retry logic
    this.r2Keys.clear();
    this.etags.clear();
    
    metadata.forEach((m) => {
      if (m.r2Key) {
        this.r2Keys.set(m.id, m.r2Key);
        this.etags.set(m.id, m.etag);
      }
    });

    console.log('[R2] Populated mappings for', this.r2Keys.size, 'songs');

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

// Simple test function to check R2 configuration
export const testR2Configuration = async (): Promise<void> => {
  console.log('=== R2 Configuration Test ===');
  debugR2Config();
  
  if (!isR2Configured()) {
    console.log('❌ R2 is not properly configured');
    return;
  }
  
  try {
    // Test S3 client connection
    const command = new ListObjectsV2Command({
      Bucket: R2_SONG_CONFIG.bucketSong,
      MaxKeys: 1,
    });
    
    console.log('🔍 Testing S3 connection...');
    const response = await s3Client.send(command);
    console.log('✅ S3 connection successful');
    console.log(`📁 Found ${response.Contents?.length || 0} objects in bucket`);
    
    if (response.Contents && response.Contents.length > 0) {
      const firstObject = response.Contents[0];
      console.log(`📄 First object: ${firstObject.Key}`);
      
      // Test URL generation for first object
      try {
        const testUrl = await getAudioUrl(firstObject.Key!);
        console.log(`🔗 Generated test URL: ${testUrl.substring(0, 100)}...`);
        
        // Test URL accessibility
        const isAccessible = await testUrlAccessibility(testUrl);
        console.log(isAccessible ? '✅ URL is accessible' : '❌ URL is not accessible');
      } catch (urlError) {
        console.error('❌ URL generation failed:', urlError);
      }
    }
  } catch (error) {
    console.error('❌ S3 connection failed:', error);
  }
  
  console.log('=== End R2 Configuration Test ===');
};

// Quick debug function - call this immediately to see R2 config
export const quickR2Debug = (): void => {
  console.log('🔍 QUICK R2 DEBUG:');
  console.log('Account ID:', R2_SONG_CONFIG.accountId ? '✓ Set' : '✗ Missing');
  console.log('Access Key ID:', R2_SONG_CONFIG.accessKeyId ? '✓ Set' : '✗ Missing');
  console.log('Secret Access Key:', R2_SONG_CONFIG.secretAccessKey ? '✓ Set' : '✗ Missing');
  console.log('Endpoint:', R2_SONG_CONFIG.endpoint || '✗ Missing');
  console.log('Public URL:', R2_SONG_CONFIG.publicUrl || '✗ Missing');
  console.log('Bucket:', R2_SONG_CONFIG.bucketSong);
  console.log('Overall:', isR2Configured() ? '✓ Configured' : '✗ Not Configured');
  console.log('🔍 END DEBUG');
};

// Run quick debug immediately when service loads
quickR2Debug();

// Clear cache on load to force fresh pre-signed URLs
clearUrlCache();

export const r2SongService = new R2SongService();
