// Cloudflare R2 Service for fetching songs
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { Song } from '../types';

// R2 Configuration - Using Environment Variables
const R2_CONFIG = {
  accountId: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
  accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '',
  endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT || '',
  bucketName: process.env.EXPO_PUBLIC_BUCKET_SONG || 'kronop-song',
};

class R2Service {
  private client: S3Client;
  private bucketName: string;

  constructor() {
    // Initialize S3 Client for Cloudflare R2
    this.client = new S3Client({
      region: 'auto',
      endpoint: R2_CONFIG.endpoint,
      credentials: {
        accessKeyId: R2_CONFIG.accessKeyId,
        secretAccessKey: R2_CONFIG.secretAccessKey,
      },
    });
    this.bucketName = R2_CONFIG.bucketName;
  }

  /**
   * Fetch all songs from R2 bucket
   */
  async fetchSongs(): Promise<Song[]> {
    console.log('🔍 Connecting to R2 bucket:', this.bucketName);
    console.log('🔑 Using account ID:', R2_CONFIG.accountId);
    console.log('🌐 Endpoint:', R2_CONFIG.endpoint);
    
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      MaxKeys: 1000, // Fetch up to 1000 objects
    });

    const response = await this.client.send(command);
    
    console.log('📦 R2 Response:', {
      objectCount: response.Contents?.length || 0,
      isTruncated: response.IsTruncated,
      bucketName: this.bucketName,
    });
    
    if (!response.Contents || response.Contents.length === 0) {
      console.warn('⚠️ R2 bucket is empty - no objects found');
      console.warn('Please upload audio files to the kronop-song bucket');
      return [];
    }

    console.log(`📂 Found ${response.Contents.length} objects in bucket:`);
    response.Contents.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.Key} (${(item.Size || 0) / 1024} KB)`);
    });

    // Convert R2 objects to Song format
    const allObjects = response.Contents.map((item, index) => {
      const key = item.Key || '';
      const fileName = key.split('/').pop() || '';
      const songName = fileName.replace(/\.[^/.]+$/, ''); // Remove extension
      
      // Create unique ID using combination of ETag, index, and key hash
      const eTag = item.ETag?.replace(/"/g, '') || '';
      const keyHash = key.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const uniqueId = eTag ? `${eTag}-${index}` : `song-${keyHash}-${index}`;

      return {
        id: uniqueId,
        title: songName,
        artist: 'Artist Name',
        albumArt: `https://images.unsplash.com/photo-${1614149162883 + index}-504ce4d13909?w=800&q=80`,
        audioUrl: this.getPublicUrl(key),
        channelId: 'ch1',
      };
    });

    // Filter only audio files
    const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac', '.MP3', '.WAV', '.M4A'];
    const songs = allObjects.filter(song => {
      const isAudio = audioExtensions.some(ext => song.audioUrl.toLowerCase().endsWith(ext.toLowerCase()));
      if (!isAudio) {
        console.log(`❌ Skipped non-audio file: ${song.title}`);
      }
      return isAudio;
    });

    console.log(`✅ Found ${songs.length} audio files out of ${allObjects.length} total objects`);
    
    if (songs.length === 0) {
      console.warn('⚠️ No audio files found in bucket. Supported formats: .mp3, .wav, .m4a, .aac, .ogg, .flac');
    }
    
    return songs;
  }

  /**
   * Get public URL for R2 object
   */
  private getPublicUrl(key: string): string {
    // New public URL format for R2 bucket
    // Base URL: https://pub-36bd44eb481c484dad3c0c0447aab38b.r2.dev/
    // Full link: https://pub-36bd44eb481c484dad3c0c0447aab38b.r2.dev/songs/song_name.mp3
    
    const baseUrl = 'https://pub-36bd44eb481c484dad3c0c0447aab38b.r2.dev';
    const publicUrl = `${baseUrl}/${key}`;
    console.log('📎 Generated R2 public URL:', publicUrl);
    return publicUrl;
  }

  /**
   * Get signed URL for private access (optional)
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      // Note: For signed URLs, you would need to use getSignedUrl from @aws-sdk/s3-request-presigner
      // This is a placeholder - implement if needed
      return this.getPublicUrl(key);
    } catch (error) {
      console.error('Failed to get signed URL:', error);
      throw error;
    }
  }

  /**
   * Upload a song to R2 (optional)
   */
  async uploadSong(file: Blob, fileName: string): Promise<string> {
    // Implement upload functionality if needed
    // This would require PutObjectCommand
    throw new Error('Upload functionality not implemented yet');
  }

  /**
   * Search songs by name
   */
  async searchSongs(query: string): Promise<Song[]> {
    const allSongs = await this.fetchSongs();
    const searchQuery = query.toLowerCase();
    
    return allSongs.filter(song => 
      song.title.toLowerCase().includes(searchQuery) ||
      song.artist.toLowerCase().includes(searchQuery)
    );
  }

  /**
   * Get song by ID
   */
  async getSongById(id: string): Promise<Song | null> {
    const songs = await this.fetchSongs();
    return songs.find(song => song.id === id) || null;
  }
}

// Export singleton instance
export const r2Service = new R2Service();
