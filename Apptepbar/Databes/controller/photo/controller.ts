// Photo Controller - R2 Bucket Logic
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

// R2 Configuration - All values must be set in .env
const R2_CONFIG = {
  ACCOUNT_ID: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
  ACCESS_KEY_ID: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '',
  SECRET_ACCESS_KEY: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '',
  BUCKET: process.env.EXPO_PUBLIC_BUCKET_PHOTO || '',
  PUBLIC_URL: 'https://pub-e904e5818e734484a5ead6201a4cefe3.r2.dev',
};

// Initialize S3 Client for R2
const s3Client = new S3Client({
  region: process.env.EXPO_PUBLIC_R2_REGION || 'auto',
  endpoint: `https://${R2_CONFIG.ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_CONFIG.ACCESS_KEY_ID,
    secretAccessKey: R2_CONFIG.SECRET_ACCESS_KEY,
  },
});

export interface PhotoItem {
  id: string;
  title: string;
  stars: number;
  comments: number;
  shares: number;
  views: number;
  url?: string;
  key?: string; // R2 object key for deletion
}

export interface PhotoStats {
  total: number;
  stars: number;
  comments: number;
  shares: number;
  views: number;
}

// Fetch photos directly from R2 bucket
export const fetchPhotosFromR2 = async (): Promise<PhotoItem[]> => {
  try {
    console.log('[PhotoController] Fetching from R2 bucket:', R2_CONFIG.BUCKET);
    
    const command = new ListObjectsV2Command({
      Bucket: R2_CONFIG.BUCKET,
      MaxKeys: 100,
    });
    
    const response = await s3Client.send(command);
    console.log('[PhotoController] R2 response keys:', response.Contents?.length || 0);
    
    if (!response.Contents || response.Contents.length === 0) {
      console.log('[PhotoController] No photos found in R2 bucket');
      return [];
    }
    
    const photos: PhotoItem[] = [];
    
    for (let i = 0; i < response.Contents.length; i++) {
      const object = response.Contents[i];
      if (object.Key && !object.Key.endsWith('.json') && /\.(jpe?g|png|gif|webp)$/i.test(object.Key)) {
        const keyParts = object.Key.split('/');
        const fileName = keyParts[keyParts.length - 1];
        const baseName = fileName.replace(/\.[^/.]+$/, '');
        
        const fullUrl = `${R2_CONFIG.PUBLIC_URL}/${object.Key}`;
        
        console.log('[PhotoController] Photo URL:', fullUrl);
        
        photos.push({
          id: `r2_photo_${i + 1}`,
          title: baseName,
          stars: Math.floor(Math.random() * 100),
          comments: Math.floor(Math.random() * 50),
          shares: Math.floor(Math.random() * 30),
          views: Math.floor(Math.random() * 1000),
          url: fullUrl,
          key: object.Key, // Store the actual R2 key for deletion
        });
      }
    }
    
    console.log(`[PhotoController] Found ${photos.length} photos from R2`);
    return photos;
  } catch (error) {
    console.error('[PhotoController] R2 fetch error:', error);
    return [];
  }
};

// Delete photo from R2 bucket
export const deletePhotoFromR2 = async (key: string): Promise<boolean> => {
  try {
    console.log(`[PhotoController] Deleting from R2: ${key}`);
    
    const command = new DeleteObjectCommand({
      Bucket: R2_CONFIG.BUCKET,
      Key: key,
    });
    
    await s3Client.send(command);
    console.log(`[PhotoController] Deleted successfully: ${key}`);
    return true;
  } catch (error) {
    console.error('[PhotoController] Delete error:', error);
    throw error;
  }
};
export const calculatePhotoStats = (photos: PhotoItem[]): PhotoStats => {
  return photos.reduce(
    (acc, photo) => {
      acc.stars += photo.stars;
      acc.comments += photo.comments;
      acc.shares += photo.shares;
      acc.views += photo.views;
      return acc;
    },
    { total: photos.length, stars: 0, comments: 0, shares: 0, views: 0 }
  );
};

// Get top photos by views
export const getTopPhotos = (photos: PhotoItem[], limit: number = 10): PhotoItem[] => {
  return [...photos]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
};

// Main API object
export const photoController = {
  getPhotos: fetchPhotosFromR2,
  deletePhoto: deletePhotoFromR2,
  getStats: calculatePhotoStats,
  getTopPhotos,
};

export default photoController;
