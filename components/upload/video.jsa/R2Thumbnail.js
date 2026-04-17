// R2 Thumbnail Handler - Dedicated System for Thumbnail Uploads
// Handles thumbnail upload to R2 bucket and returns public URL

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as FileSystem from 'expo-file-system/legacy';
import Constants from 'expo-constants';

// Expo environment variables - use process.env directly for React Native
const r2AccountId = process.env.EXPO_PUBLIC_R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY;
const r2Endpoint = process.env.EXPO_PUBLIC_R2_ENDPOINT;
const r2PublicUrl = process.env.EXPO_PUBLIC_R2_PUBLIC_URL;

// Determine the correct endpoint
// For R2 S3 operations, we need the R2 API endpoint, not the public URL
const r2ApiEndpoint = `https://${r2AccountId}.r2.cloudflarestorage.com`;
const finalEndpoint = r2Endpoint || r2ApiEndpoint;

console.log('🔧 R2Thumbnail: Environment variables check:', {
  hasAccountId: !!r2AccountId,
  hasAccessKeyId: !!r2AccessKeyId,
  hasSecretAccessKey: !!r2SecretAccessKey,
  hasEndpoint: !!r2Endpoint,
  hasPublicUrl: !!r2PublicUrl,
  accountIdPrefix: r2AccountId ? r2AccountId.substring(0, 8) + '...' : 'missing',
  accessKeyPrefix: r2AccessKeyId ? r2AccessKeyId.substring(0, 8) + '...' : 'missing',
  secretKeyLength: r2SecretAccessKey ? r2SecretAccessKey.length : 0,
  providedEndpoint: r2Endpoint,
  r2ApiEndpoint: r2ApiEndpoint,
  finalEndpoint: finalEndpoint,
  publicUrl: r2PublicUrl
});

const s3Client = new S3Client({
  region: 'auto',
  endpoint: finalEndpoint,
  credentials: {
    accessKeyId: r2AccessKeyId || '',
    secretAccessKey: r2SecretAccessKey || '',
  },
  forcePathStyle: true,
});

const R2Thumbnail = {
  // Upload thumbnail to R2 and return public URL
  // Now saves thumbnail with same base name as video (e.g., video.mp4 -> video.jpg)
  uploadThumbnail: async (imageUri, videoFileName) => {
    try {
      // Generate thumbnail filename from video filename
      // Remove video extension and add .jpg
      const baseName = videoFileName.replace(/\.[^/.]+$/, '');
      const fileName = `${baseName}.jpg`;
      const bucketName = process.env.EXPO_PUBLIC_BUCKET_VIDEO || 'kronop-video';
      
      console.log('R2Thumbnail: Uploading thumbnail:', {
        bucket: bucketName,
        file: fileName,
        videoFileName: videoFileName,
        imageUri: imageUri
      });

      // Validate that imageUri is a local file path, not a cloud URL
      if (!imageUri || typeof imageUri !== 'string') {
        throw new Error('Invalid image URI provided');
      }

      // Check if it's a local file (starts with file:// or is a relative path)
      if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        throw new Error('Cannot read cloud URLs directly. Provide local file path.');
      }

      let fileData;
      try {
        // Get file info first
        const fileInfo = await FileSystem.getInfoAsync(imageUri);
        
        if (!fileInfo.exists) {
          throw new Error('File does not exist at the provided path');
        }
        
        // Read file as base64
        fileData = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64
        });
        
        console.log('R2Thumbnail: File read successfully, size:', fileInfo.size);
        
      } catch (fsError) {
        console.error('❌ FILE READ FAILED: Cannot read image file:', fsError.message);
        console.log('==========================================');
        throw new Error(`File read failed: ${fsError.message}`);
      }

      // Convert base64 to buffer manually
      let arrayBuffer;
      try {
        const binaryString = atob(fileData);
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i);
        }
        arrayBuffer = uint8Array.buffer;
        console.log('R2Thumbnail: Base64 to buffer conversion successful');
        
      } catch (convertError) {
        console.error('❌ CONVERSION FAILED: Base64 to buffer failed:', convertError.message);
        console.log('==========================================');
        throw new Error(`File conversion failed: ${convertError.message}`);
      }

      // Upload to R2
      const uploadParams = {
        Bucket: bucketName,
        Key: fileName,
        Body: arrayBuffer,
        ContentType: 'image/jpeg',
        Metadata: {
          uploadTime: new Date().toISOString(),
          type: 'thumbnail',
          uniqueId: uniqueId
        }
      };

      const command = new PutObjectCommand(uploadParams);
      const result = await s3Client.send(command);

      console.log('R2Thumbnail: Upload successful:', fileName);

      // Return public URL - Direct R2 public URL (same path as video, just .jpg)
      const publicUrl = `${r2PublicUrl}/${fileName}`;
      console.log('R2Thumbnail: Upload successful:', fileName);
      console.log('🔗 THUMBNAIL PUBLIC URL:', publicUrl);
      console.log('==========================================');
      
      return {
        success: true,
        message: 'Thumbnail uploaded successfully',
        url: publicUrl,
        fileName: fileName,
        etag: result.ETag
      };

    } catch (error) {
      console.error('❌ THUMBNAIL UPLOAD FAILED: Cloud upload failed:', error.message);
      console.log('==========================================');
      
      // Check for specific R2 errors
      if (error.message.includes('SignatureDoesNotMatch')) {
        console.error('🔐 SIGNATURE ERROR: R2 credentials or endpoint mismatch');
        console.error('🔐 Check: EXPO_PUBLIC_R2_ACCESS_KEY_ID, EXPO_PUBLIC_R2_SECRET_ACCESS_KEY');
        console.error('🔐 Check: EXPO_PUBLIC_R2_ENDPOINT configuration');
      }
      
      if (error.message.includes('Access Denied')) {
        console.error('🚫 ACCESS ERROR: Permission denied for bucket');
        console.error('🚫 Check: Bucket permissions and CORS settings');
      }

      if (error.message.includes('NoSuchBucket')) {
        console.error('🪣 BUCKET ERROR: Bucket does not exist');
        console.error('🪣 Check: EXPO_PUBLIC_BUCKET_VIDEO environment variable');
      }
      
      return {
        success: false,
        message: 'Failed to upload thumbnail',
        error: error.message
      };
    }
  },

  // Generate unique ID for thumbnail
  generateUniqueId: () => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `thumb_${timestamp}_${random}`;
  },

  // Get thumbnail URL based on video filename
  // Returns URL with same name as video but .jpg extension
  getThumbnailUrl: (videoFileName) => {
    const baseName = videoFileName.replace(/\.[^/.]+$/, '');
    return `${r2PublicUrl}/${baseName}.jpg`;
  }
};

export default R2Thumbnail;
