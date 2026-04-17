// Video Controller - R2 Bucket Logic
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

// R2 Configuration - All values must be set in .env
const R2_CONFIG = {
  ACCOUNT_ID: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
  ACCESS_KEY_ID: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '',
  SECRET_ACCESS_KEY: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '',
  BUCKET: process.env.EXPO_PUBLIC_BUCKET_VIDEO || '',
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

export interface VideoItem {
  id: string;
  title: string;
  stars: number;
  comments: number;
  shares: number;
  views: number;
  duration: string;
  url?: string;
  key?: string; // R2 object key for deletion
}

export interface VideoStats {
  total: number;
  stars: number;
  comments: number;
  shares: number;
  views: number;
  duration: string;
}

// Fetch videos directly from R2 bucket
export const fetchVideosFromR2 = async (): Promise<VideoItem[]> => {
  try {
    console.log('[VideoController] Fetching from R2 bucket:', R2_CONFIG.BUCKET);
    
    const command = new ListObjectsV2Command({
      Bucket: R2_CONFIG.BUCKET,
      MaxKeys: 100,
    });
    
    const response = await s3Client.send(command);
    console.log('[VideoController] R2 response keys:', response.Contents?.length || 0);
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log('[VideoController] No videos found in R2 bucket');
      return [];
    }
    
    const videos: VideoItem[] = [];
    
    for (let i = 0; i < response.Contents.length; i++) {
      const object = response.Contents[i];
      if (object.Key && !object.Key.endsWith('.json') && /\.(mp4|mov|avi|mkv|webm)$/i.test(object.Key)) {
        const keyParts = object.Key.split('/');
        const fileName = keyParts[keyParts.length - 1];
        const baseName = fileName.replace(/\.[^/.]+$/, '');
        
        videos.push({
          id: `r2_video_${i + 1}`,
          title: baseName,
          stars: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 50),
          shares: Math.floor(Math.random() * 30),
          views: Math.floor(Math.random() * 1000),
          duration: `${Math.floor(Math.random() * 10)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
          url: `${R2_CONFIG.PUBLIC_URL}/${object.Key}`,
          key: object.Key, // Store the actual R2 key for deletion
        });
      }
    }
    
    console.log(`[VideoController] Found ${videos.length} videos from R2`);
    return videos;
  } catch (error) {
    console.error('[VideoController] R2 fetch error:', error);
    return [];
  }
};

// Delete video from R2 bucket
export const deleteVideoFromR2 = async (key: string): Promise<boolean> => {
  try {
    console.log(`[VideoController] Deleting from R2: ${key}`);
    
    const command = new DeleteObjectCommand({
      Bucket: R2_CONFIG.BUCKET,
      Key: key,
    });
    
    await s3Client.send(command);
    console.log(`[VideoController] Deleted successfully: ${key}`);
    return true;
  } catch (error) {
    console.error('[VideoController] Delete error:', error);
    throw error;
  }
};
export const calculateVideoStats = (videos: VideoItem[]): VideoStats => {
  const stats = videos.reduce(
    (acc, video) => {
      acc.stars += video.stars;
      acc.comments += video.comments;
      acc.shares += video.shares;
      acc.views += video.views;
      return acc;
    },
    { total: videos.length, stars: 0, comments: 0, shares: 0, views: 0, duration: '0:00' }
  );
  return stats;
};

// Get top videos by views
export const getTopVideos = (videos: VideoItem[], limit: number = 10): VideoItem[] => {
  return [...videos]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
};

// Main API object
export const videoController = {
  getVideos: fetchVideosFromR2,
  deleteVideo: deleteVideoFromR2,
  getStats: calculateVideoStats,
  getTopVideos,
};

export default videoController;
