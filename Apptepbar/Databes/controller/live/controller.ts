// Live Controller - R2 Bucket Logic
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

// R2 Configuration - All values must be set in .env
const R2_CONFIG = {
  ACCOUNT_ID: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
  ACCESS_KEY_ID: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '',
  SECRET_ACCESS_KEY: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '',
  BUCKET: process.env.EXPO_PUBLIC_BUCKET_LIVE || '',
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

export interface LiveItem {
  id: string;
  title: string;
  stars: number;
  comments: number;
  shares: number;
  viewers: number;
  status: 'live' | 'ended';
  url?: string;
  key?: string;
}

export interface LiveStats {
  total: number;
  stars: number;
  comments: number;
  shares: number;
  viewers: number;
}

// Fetch live streams directly from R2 bucket
export const fetchLiveFromR2 = async (): Promise<LiveItem[]> => {
  try {
    console.log('[LiveController] Fetching from R2 bucket:', R2_CONFIG.BUCKET);
    
    const command = new ListObjectsV2Command({
      Bucket: R2_CONFIG.BUCKET,
      MaxKeys: 100,
    });
    
    const response = await s3Client.send(command);
    console.log('[LiveController] R2 response keys:', response.Contents?.length || 0);
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log('[LiveController] No live streams found in R2 bucket');
      return [];
    }
    
    const liveStreams: LiveItem[] = [];
    
    for (let i = 0; i < response.Contents.length; i++) {
      const object = response.Contents[i];
      if (object.Key && !object.Key.endsWith('.json') && /\.(mp4|mov|avi|mkv|webm|m3u8)$/i.test(object.Key)) {
        const keyParts = object.Key.split('/');
        const fileName = keyParts[keyParts.length - 1];
        const baseName = fileName.replace(/\.[^/.]+$/, '');
        
        liveStreams.push({
          id: `r2_live_${i + 1}`,
          title: baseName,
          stars: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 50),
          shares: Math.floor(Math.random() * 30),
          viewers: Math.floor(Math.random() * 1000),
          status: 'live',
          url: `${R2_CONFIG.PUBLIC_URL}/${object.Key}`,
          key: object.Key,
        });
      }
    }
    
    console.log(`[LiveController] Found ${liveStreams.length} live streams from R2`);
    return liveStreams;
  } catch (error) {
    console.error('[LiveController] R2 fetch error:', error);
    return [];
  }
};

// Delete live stream from R2 bucket
export const deleteLiveFromR2 = async (key: string): Promise<boolean> => {
  try {
    console.log(`[LiveController] Deleting from R2: ${key}`);
    
    const command = new DeleteObjectCommand({
      Bucket: R2_CONFIG.BUCKET,
      Key: key,
    });
    
    await s3Client.send(command);
    console.log(`[LiveController] Deleted successfully: ${key}`);
    return true;
  } catch (error) {
    console.error('[LiveController] Delete error:', error);
    throw error;
  }
};
export const calculateLiveStats = (liveStreams: LiveItem[]): LiveStats => {
  return liveStreams.reduce(
    (acc, live) => {
      acc.stars += live.stars;
      acc.comments += live.comments;
      acc.shares += live.shares;
      acc.viewers += live.viewers;
      return acc;
    },
    { total: liveStreams.length, stars: 0, comments: 0, shares: 0, viewers: 0 }
  );
};

// Get top live streams by viewers
export const getTopLiveStreams = (liveStreams: LiveItem[], limit: number = 10): LiveItem[] => {
  return [...liveStreams]
    .sort((a, b) => b.viewers - a.viewers)
    .slice(0, limit);
};

// Main API object
export const liveController = {
  getLiveStreams: fetchLiveFromR2,
  deleteLiveStream: deleteLiveFromR2,
  getStats: calculateLiveStats,
  getTopLiveStreams,
};

export default liveController;
