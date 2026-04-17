// Song Controller - R2 Bucket Logic
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

// R2 Configuration - All values must be set in .env
const R2_CONFIG = {
  ACCOUNT_ID: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
  ACCESS_KEY_ID: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '',
  SECRET_ACCESS_KEY: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '',
  BUCKET: process.env.EXPO_PUBLIC_BUCKET_SONG || '',
  PUBLIC_URL: process.env.EXPO_PUBLIC_R2_PUBLIC_URL || '',
};

// Initialize S3 Client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_CONFIG.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_CONFIG.ACCESS_KEY_ID,
    secretAccessKey: R2_CONFIG.SECRET_ACCESS_KEY,
  },
});

export interface SongItem {
  id: string;
  title: string;
  artist: string;
  stars: number;
  comments: number;
  shares: number;
  plays: number;
  duration: string;
  url?: string;
  key?: string;
}

export interface SongStats {
  total: number;
  stars: number;
  comments: number;
  shares: number;
  plays: number;
}

// Fetch songs directly from R2 bucket
export const fetchSongsFromR2 = async (): Promise<SongItem[]> => {
  try {
    console.log('[SongController] Fetching from R2 bucket:', R2_CONFIG.BUCKET);
    
    const command = new ListObjectsV2Command({
      Bucket: R2_CONFIG.BUCKET,
      MaxKeys: 100,
    });
    
    const response = await s3Client.send(command);
    console.log('[SongController] R2 response keys:', response.Contents?.length || 0);
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log('[SongController] No songs found in R2 bucket');
      return [];
    }
    
    const songs: SongItem[] = [];
    
    for (let i = 0; i < response.Contents.length; i++) {
      const object = response.Contents[i];
      if (object.Key && !object.Key.endsWith('.json') && /\.(mp3|wav|ogg|flac|m4a)$/i.test(object.Key)) {
        const keyParts = object.Key.split('/');
        const fileName = keyParts[keyParts.length - 1];
        const baseName = fileName.replace(/\.[^/.]+$/, '');
        
        songs.push({
          id: `r2_song_${i + 1}`,
          title: baseName,
          artist: `Artist ${i + 1}`,
          stars: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 50),
          shares: Math.floor(Math.random() * 30),
          plays: Math.floor(Math.random() * 1000),
          duration: `${Math.floor(Math.random() * 3) + 1}:${String(Math.floor(Math.random() * 59) + 1).padStart(2, '0')}`,
          url: `${R2_CONFIG.PUBLIC_URL}/${object.Key}`,
          key: object.Key,
        });
      }
    }
    
    console.log(`[SongController] Found ${songs.length} songs from R2`);
    return songs;
  } catch (error) {
    console.error('[SongController] R2 fetch error:', error);
    return [];
  }
};

// Delete song from R2 bucket
export const deleteSongFromR2 = async (key: string): Promise<boolean> => {
  try {
    console.log(`[SongController] Deleting from R2: ${key}`);
    
    const command = new DeleteObjectCommand({
      Bucket: R2_CONFIG.BUCKET,
      Key: key,
    });
    
    await s3Client.send(command);
    console.log(`[SongController] Deleted successfully: ${key}`);
    return true;
  } catch (error) {
    console.error('[SongController] Delete error:', error);
    throw error;
  }
};
export const calculateSongStats = (songs: SongItem[]): SongStats => {
  return songs.reduce(
    (acc, song) => {
      acc.stars += song.stars;
      acc.comments += song.comments;
      acc.shares += song.shares;
      acc.plays += song.plays;
      return acc;
    },
    { total: songs.length, stars: 0, comments: 0, shares: 0, plays: 0 }
  );
};

// Get top songs by plays
export const getTopSongs = (songs: SongItem[], limit: number = 10): SongItem[] => {
  return [...songs]
    .sort((a, b) => b.plays - a.plays)
    .slice(0, limit);
};

// Main API object
export const songController = {
  getSongs: fetchSongsFromR2,
  deleteSong: deleteSongFromR2,
  getStats: calculateSongStats,
  getTopSongs,
};

export default songController;
