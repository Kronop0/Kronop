// Reels Controller - R2 Bucket Logic
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

// R2 Configuration - All values must be set in .env
const R2_CONFIG = {
  ACCOUNT_ID: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
  ACCESS_KEY_ID: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '',
  SECRET_ACCESS_KEY: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '',
  BUCKET: process.env.EXPO_PUBLIC_BUCKET_REELS || '',
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

export interface ReelItem {
  id: string;
  title: string;
  stars: number;
  comments: number;
  shares: number;
  views: number;
  duration: string;
  url?: string;
  key?: string;
}

export interface ReelStats {
  total: number;
  stars: number;
  comments: number;
  shares: number;
  views: number;
  duration: string;
}

// Fetch reels directly from R2 bucket
export const fetchReelsFromR2 = async (): Promise<ReelItem[]> => {
  try {
    console.log('[ReelsController] Fetching from R2 bucket:', R2_CONFIG.BUCKET);
    
    const command = new ListObjectsV2Command({
      Bucket: R2_CONFIG.BUCKET,
      MaxKeys: 100,
    });
    
    const response = await s3Client.send(command);
    console.log('[ReelsController] R2 response keys:', response.Contents?.length || 0);
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log('[ReelsController] No reels found in R2 bucket');
      return [];
    }
    
    const reels: ReelItem[] = [];
    
    for (let i = 0; i < response.Contents.length; i++) {
      const object = response.Contents[i];
      if (object.Key && !object.Key.endsWith('.json') && /\.(mp4|mov|avi|mkv|webm)$/i.test(object.Key)) {
        const keyParts = object.Key.split('/');
        const fileName = keyParts[keyParts.length - 1];
        const baseName = fileName.replace(/\.[^/.]+$/, '');
        
        reels.push({
          id: `r2_reel_${i + 1}`,
          title: baseName,
          stars: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 50),
          shares: Math.floor(Math.random() * 30),
          views: Math.floor(Math.random() * 1000),
          duration: `0:${String(Math.floor(Math.random() * 59) + 1).padStart(2, '0')}`,
          url: `${R2_CONFIG.PUBLIC_URL}/${object.Key}`,
          key: object.Key,
        });
      }
    }
    
    console.log(`[ReelsController] Found ${reels.length} reels from R2`);
    return reels;
  } catch (error) {
    console.error('[ReelsController] R2 fetch error:', error);
    return [];
  }
};

// Delete reel from R2 bucket
export const deleteReelFromR2 = async (key: string): Promise<boolean> => {
  try {
    console.log(`[ReelsController] Deleting from R2: ${key}`);
    
    const command = new DeleteObjectCommand({
      Bucket: R2_CONFIG.BUCKET,
      Key: key,
    });
    
    await s3Client.send(command);
    console.log(`[ReelsController] Deleted successfully: ${key}`);
    return true;
  } catch (error) {
    console.error('[ReelsController] Delete error:', error);
    throw error;
  }
};
export const calculateReelStats = (reels: ReelItem[]): ReelStats => {
  return reels.reduce(
    (acc, reel) => {
      acc.stars += reel.stars;
      acc.comments += reel.comments;
      acc.shares += reel.shares;
      acc.views += reel.views;
      return acc;
    },
    { total: reels.length, stars: 0, comments: 0, shares: 0, views: 0, duration: '0:00' }
  );
};

// Get top reels by views
export const getTopReels = (reels: ReelItem[], limit: number = 10): ReelItem[] => {
  return [...reels]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
};

// Main API object
export const reelsController = {
  getReels: fetchReelsFromR2,
  deleteReel: deleteReelFromR2,
  getStats: calculateReelStats,
  getTopReels,
};

export default reelsController;
