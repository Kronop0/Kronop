import { Video } from '../types';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

// R2 Configuration from .env
const R2_CONFIG = {
  accountId: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID,
  accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY,
  endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT,
  publicUrl: process.env.EXPO_PUBLIC_R2_PUBLIC_URL,
  buckets: {
    video: process.env.EXPO_PUBLIC_BUCKET_VIDEO || 'kronop-video',
    videoThumbnail: process.env.EXPO_PUBLIC_BUCKET_VIDEO_THUMBNAIL || 'kronop-video-tha',
  },
};

// S3 Client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_CONFIG.endpoint,
  credentials: {
    accessKeyId: R2_CONFIG.accessKeyId,
    secretAccessKey: R2_CONFIG.secretAccessKey,
  },
  forcePathStyle: true,
});

/**
 * Generate public URL for R2 object
 */
function getPublicUrl(bucket: string, key: string): string {
  return `${R2_CONFIG.publicUrl}/${bucket}/${key}`;
}

/**
 * List all videos from R2 bucket
 * Uses S3 ListObjectsV2 API via AWS SDK
 */
export async function listR2Videos(): Promise<Video[]> {
  try {
    if (!R2_CONFIG.accountId || !R2_CONFIG.accessKeyId || !R2_CONFIG.secretAccessKey) {
      console.error('[Video R2] Missing R2 credentials');
      return [];
    }

    const command = new ListObjectsV2Command({
      Bucket: R2_CONFIG.buckets.video,
      MaxKeys: 1000,
    });

    const response = await s3Client.send(command);
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log('[Video R2] No videos found in bucket');
      return [];
    }

    const videos = parseR2ListResponse(response.Contents);
    return videos;
  } catch (error) {
    console.error('Error listing R2 videos:', error);
    return [];
  }
}

/**
 * Parse R2 ListObjectsV2 response from AWS SDK
 */
function parseR2ListResponse(objects: any[]): Video[] {
  const videos: Video[] = [];
  
  for (const object of objects) {
    const key = object.Key;
    if (!key) continue;
    
    const lastModified = object.LastModified ? new Date(object.LastModified).getTime() : Date.now();
    const size = object.Size || 0;
    
    // Skip if not a video file
    if (!key.match(/\.(mp4|m3u8|mov|webm)$/i)) {
      continue;
    }
    
    // Generate IDs and URLs
    const id = key.replace(/[^a-zA-Z0-9]/g, '_');
    const videoUrl = getPublicUrl(R2_CONFIG.buckets.video, key);
    const thumbnailKey = key.replace(/\.[^.]+$/, '.jpg');
    const thumbnailUrl = getPublicUrl(R2_CONFIG.buckets.videoThumbnail, thumbnailKey);
    
    videos.push({
      id,
      userId: 'r2_user',
      username: 'Kronop Creator',
      userAvatar: `https://i.pravatar.cc/150?u=${id}`,
      thumbnailUrl,
      videoUrl,
      title: key.replace(/\.[^.]+$/, '').replace(/_/g, ' ').replace(/-/g, ' '),
      description: `Video uploaded from R2 storage`,
      views: Math.floor(size / 10000), // Mock views based on file size
      likes: Math.floor(size / 50000),
      comments: Math.floor(size / 100000),
      shares: 0,
      earnings: 0,
      duration: '10:00', // Will be updated when video loads
      timestamp: lastModified,
      isLiked: false,
      isSaved: false,
      category: 'R2 Upload',
    });
  }
  
  return videos.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Get video metadata from R2
 */
export async function getR2VideoMetadata(key: string): Promise<Partial<Video> | null> {
  try {
    const headUrl = `${R2_CONFIG.publicUrl}/${R2_CONFIG.buckets.video}/${key}`;
    
    const response = await fetch(headUrl, { method: 'HEAD' });
    
    if (!response.ok) {
      return null;
    }
    
    const contentLength = response.headers.get('content-length');
    const lastModified = response.headers.get('last-modified');
    
    return {
      duration: contentLength ? formatDuration(parseInt(contentLength, 10)) : '0:00',
      timestamp: lastModified ? new Date(lastModified).getTime() : Date.now(),
    };
  } catch (error) {
    console.error('Error getting video metadata:', error);
    return null;
  }
}

/**
 * Format duration from file size (rough estimate)
 */
function formatDuration(bytes: number): string {
  // Assume average bitrate of 2 Mbps
  const seconds = Math.floor(bytes * 8 / 2000000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Check if R2 is configured properly
 */
export function isR2Configured(): boolean {
  return !!(
    R2_CONFIG.accountId &&
    R2_CONFIG.accessKeyId &&
    R2_CONFIG.secretAccessKey &&
    R2_CONFIG.publicUrl
  );
}
