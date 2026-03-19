// R2 Server for Story Upload
// Handles upload to Cloudflare R2 for stories

const { S3Client, PutObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } = require('@aws-sdk/client-s3');
const storyLimitation = require('./storyLimitation');

// R2 Configuration from environment
const r2Config = {
  region: 'auto',
  endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
};

// Initialize S3 client for R2
const s3Client = new S3Client(r2Config);

// Start automatic cleanup scheduler
const stopAutoCleanup = storyLimitation.startAutoCleanup();
console.log('🚀 Auto-cleanup started for stories - 24 hour expiry enabled');

const r2Server = {
  // Upload photo to STORY bucket
  uploadPhoto: async (fileData, fileName, metadata) => {
    try {
      const bucketName = process.env.EXPO_PUBLIC_BUCKET_STORY;
      const fullFileName = `stories/photos/${Date.now()}_${fileName}`;
      
      console.log('📷 Starting R2 photo upload:', {
        bucket: bucketName,
        file: fullFileName,
        size: fileData.length
      });

      // Add expiry timestamp to metadata
      const metadataWithExpiry = storyLimitation.addExpiryTimestamp(metadata);
      
      // Create upload parameters
      const uploadParams = {
        Bucket: bucketName,
        Key: fullFileName,
        Body: fileData,
        ContentType: metadata?.type || 'image/jpeg',
        Metadata: {
          originalName: metadata?.name || fileName,
          uploadTime: metadataWithExpiry.uploadTime,
          expiresAt: metadataWithExpiry.expiresAt,
          category: metadata?.category || 'general',
          title: metadata?.title || 'Story Photo',
          tags: metadata?.tags ? metadata.tags.join(',') : '',
          storyType: 'photo'
        }
      };

      // Perform upload using AWS SDK v3
      const command = new PutObjectCommand(uploadParams);
      const result = await s3Client.send(command);

      console.log('✅ R2 photo upload successful:', fullFileName);

      return {
        success: true,
        message: 'Story photo uploaded successfully to R2',
        fileId: fullFileName,
        fileName: fullFileName,
        publicUrl: `${process.env.EXPO_PUBLIC_R2_ENDPOINT}/${bucketName}/${fullFileName}`,
        uploadTime: new Date().toISOString(),
        bucket: bucketName,
        etag: result.ETag
      };

    } catch (error) {
      console.error('❌ R2 photo upload error:', error);
      return {
        success: false,
        message: 'R2 photo upload failed',
        error: error.message,
        fileId: null,
        fileName: null,
        publicUrl: null
      };
    }
  },

  // Upload video to STORY bucket
  uploadVideo: async (fileData, fileName, metadata) => {
    try {
      const bucketName = process.env.EXPO_PUBLIC_BUCKET_STORY;
      const fullFileName = `stories/videos/${Date.now()}_${fileName}`;
      
      console.log('🎥 Starting R2 video upload:', {
        bucket: bucketName,
        file: fullFileName,
        size: fileData.length
      });

      // Add expiry timestamp to metadata
      const metadataWithExpiry = storyLimitation.addExpiryTimestamp(metadata);
      
      // Create upload parameters
      const uploadParams = {
        Bucket: bucketName,
        Key: fullFileName,
        Body: fileData,
        ContentType: metadata?.type || 'video/mp4',
        Metadata: {
          originalName: metadata?.name || fileName,
          uploadTime: metadataWithExpiry.uploadTime,
          expiresAt: metadataWithExpiry.expiresAt,
          category: metadata?.category || 'general',
          title: metadata?.title || 'Story Video',
          tags: metadata?.tags ? metadata.tags.join(',') : '',
          storyType: 'video',
          duration: metadata?.duration || '0'
        }
      };

      // Perform upload using AWS SDK v3
      const command = new PutObjectCommand(uploadParams);
      const result = await s3Client.send(command);

      console.log('✅ R2 video upload successful:', fullFileName);

      return {
        success: true,
        message: 'Story video uploaded successfully to R2',
        fileId: fullFileName,
        fileName: fullFileName,
        publicUrl: `${process.env.EXPO_PUBLIC_R2_ENDPOINT}/${bucketName}/${fullFileName}`,
        uploadTime: new Date().toISOString(),
        bucket: bucketName,
        etag: result.ETag
      };

    } catch (error) {
      console.error('❌ R2 video upload error:', error);
      return {
        success: false,
        message: 'R2 video upload failed',
        error: error.message,
        fileId: null,
        fileName: null,
        publicUrl: null
      };
    }
  }
};

// Helper function to read file chunks
async function readFileChunk(fileUri, start, size) {
  try {
    console.log(`Reading chunk: start=${start}, size=${size}`);

    // Use expo-file-system to read only the specific bytes we need
    const chunkData = await require('expo-file-system/legacy').readAsStringAsync(fileUri, {
      encoding: require('expo-file-system/legacy').EncodingType.Base64,
      position: start,
      length: size
    });

    // Convert Base64 to Uint8Array
    const binaryString = atob(chunkData);
    const chunkBuffer = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      chunkBuffer[i] = binaryString.charCodeAt(i);
    }

    console.log(`✅ Chunk read: ${chunkBuffer.length} bytes`);
    return chunkBuffer;

  } catch (error) {
    console.error('Error reading chunk:', error);
    throw new Error(`Failed to read file chunk: ${error.message}`);
  }
}

module.exports = r2Server;