// ==================== FETCHING INFORMATION SERVICE ====================
// Fetches detailed data from Cloudflare R2 for photos/videos
// Includes title, uploader info, and metadata

import { API_KEYS } from '../../constants/Config';
import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

// R2 Configuration
const R2_CONFIG = {
  R2_ACCOUNT_ID: process.env.EXPO_PUBLIC_R2_ACCOUNT_ID || '',
  R2_ACCESS_KEY_ID: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '',
  R2_SECRET_ACCESS_KEY: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '',
  R2_BUCKET_NAME: process.env.EXPO_PUBLIC_R2_BUCKET_NAME || 'kronop-photos',
  R2_ENDPOINT: process.env.EXPO_PUBLIC_R2_ENDPOINT || '',
  PUBLIC_BUCKET_URL: 'https://pub-e904e5818e734484a5ead6201a4cefe3.r2.dev',
};

// Extended Photo/Video Information
export interface MediaInfo {
  id: string;
  url: string;
  title: string; // Original title from upload
  caption?: string; // Description
  uploader: {
    id: string;
    username: string;
    channelLogo?: string;
    displayName: string;
  };
  metadata: {
    uploadDate: string;
    fileSize: number;
    mimeType: string;
    dimensions?: {
      width: number;
      height: number;
    };
  };
  engagement: {
    likes: number;
    comments: number;
    views: number;
  };
  category: string;
  tags: string[];
}

// Fetching Information Service
class FetchingInformationService {
  private s3Client: S3Client;

  constructor() {
    // Initialize S3 Client for R2
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_CONFIG.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_CONFIG.R2_ACCESS_KEY_ID,
        secretAccessKey: R2_CONFIG.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  // Get detailed information for a specific media file
  async getMediaInfo(fileKey: string): Promise<MediaInfo | null> {
    console.log(`[fetchingInformation.ts] Fetching detailed info for: ${fileKey}`);
    
    try {
      // Get object metadata from R2
      const headCommand = new HeadObjectCommand({
        Bucket: R2_CONFIG.R2_BUCKET_NAME,
        Key: fileKey,
      });

      const headResponse = await this.s3Client.send(headCommand);
      
      // Extract metadata from object headers
      const metadata = headResponse.Metadata || {};
      
      // Build comprehensive media info
      const keyParts = fileKey.split('/');
      const fileNameWithExt = keyParts[keyParts.length - 1];
      const baseName = fileNameWithExt.replace(/\.[^/.]+$/, '');

      const mediaInfo: MediaInfo = {
        id: fileKey.replace(/[^a-zA-Z0-9]/g, '_'),
        url: `${R2_CONFIG.PUBLIC_BUCKET_URL}/${fileKey}`,
        title: metadata.title || baseName,
        caption: metadata.caption || metadata.description || '',
        uploader: {
          id: metadata.uploaderId || 'unknown',
          username: metadata.username || 'Anonymous',
          channelLogo: metadata.channelLogo || '',
          displayName: metadata.displayName || metadata.username || 'Anonymous',
        },
        metadata: {
          uploadDate: headResponse.LastModified?.toISOString() || new Date().toISOString(),
          fileSize: headResponse.ContentLength || 0,
          mimeType: headResponse.ContentType || 'image/jpeg',
          dimensions: metadata.width && metadata.height ? {
            width: parseInt(metadata.width),
            height: parseInt(metadata.height),
          } : undefined,
        },
        engagement: {
          likes: parseInt(metadata.likes || '0'),
          comments: parseInt(metadata.comments || '0'),
          views: parseInt(metadata.views || '0'),
        },
        category: metadata.category || 'general',
        tags: metadata.tags ? metadata.tags.split(',').map((tag: string) => tag.trim()) : [],
      };

      console.log(`[fetchingInformation.ts] ✓ Media info fetched: ${mediaInfo.title}`);
      return mediaInfo;

    } catch (error) {
      console.error(`[fetchingInformation.ts] ❌ Error fetching media info:`, error);
      return null;
    }
  }

  // Get batch information for multiple media files
  async getBatchMediaInfo(fileKeys: string[]): Promise<MediaInfo[]> {
    console.log(`[fetchingInformation.ts] Fetching batch info for ${fileKeys.length} files in parallel...`);
    
    // Fetch all media info in parallel using Promise.all() - MUCH FASTER!
    const mediaInfoPromises = fileKeys.map(fileKey => this.getMediaInfo(fileKey));
    const mediaInfos = (await Promise.all(mediaInfoPromises)).filter((info): info is MediaInfo => info !== null);

    console.log(`[fetchingInformation.ts] ✓ Batch info completed: ${mediaInfos.length} files processed in parallel`);
    return mediaInfos;
  }

  // Get uploader profile information
  async getUploaderInfo(uploaderId: string): Promise<MediaInfo['uploader'] | null> {
    console.log(`[fetchingInformation.ts] Fetching uploader info for: ${uploaderId}`);
    
    try {
      // In a real implementation, this would query a user database
      // For now, return basic info
      const uploaderInfo: MediaInfo['uploader'] = {
        id: uploaderId,
        username: `User_${uploaderId}`,
        channelLogo: '',
        displayName: `Display Name ${uploaderId}`,
      };

      console.log(`[fetchingInformation.ts] ✓ Uploader info fetched: ${uploaderInfo.displayName}`);
      return uploaderInfo;

    } catch (error) {
      console.error(`[fetchingInformation.ts] ❌ Error fetching uploader info:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const fetchingService = new FetchingInformationService();

export default fetchingService;
