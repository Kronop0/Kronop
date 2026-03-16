// R2 Server for Video Upload
// Handles multipart upload to Cloudflare R2

import { S3Client, PutObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

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

const r2Server = {
  // Upload video to R2 bucket
  uploadVideo: async (fileData, metadata) => {
    try {
      const bucketName = process.env.EXPO_PUBLIC_BUCKET_VIDEO;
      const fileName = `videos/${Date.now()}_${metadata.name || 'video.mp4'}`;
      
      console.log('Starting R2 upload:', {
        bucket: bucketName,
        file: fileName,
        size: metadata.size
      });

      // Create upload parameters
      const uploadParams = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileData,
        ContentType: metadata.type || 'video/mp4',
        Metadata: {
          originalName: metadata.name,
          uploadTime: new Date().toISOString(),
          category: metadata.category || 'general',
          title: metadata.title || 'Untitled Video'
        }
      };

      // Perform upload using AWS SDK v3
      const command = new PutObjectCommand(uploadParams);
      const result = await s3Client.send(command);

      console.log('R2 upload successful:', fileName);

      return {
        success: true,
        message: 'Video uploaded successfully to R2',
        fileId: fileName,
        location: `${process.env.EXPO_PUBLIC_R2_ENDPOINT}/${bucketName}/${fileName}`,
        bucket: bucketName,
        etag: result.ETag
      };

    } catch (error) {
      console.error('R2 upload error:', error);
      return {
        success: false,
        message: 'R2 upload failed',
        error: error.message
      };
    }
  },

  // Multipart upload for large files
  uploadLargeVideo: async (fileData, metadata) => {
    try {
      const bucketName = process.env.EXPO_PUBLIC_BUCKET_VIDEO;
      const fileName = `videos/${Date.now()}_${metadata.name || 'video.mp4'}`;
      
      console.log('Starting multipart R2 upload:', {
        bucket: bucketName,
        file: fileName,
        size: metadata.size
      });

      // Create multipart upload
      const createCommand = new CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: fileName,
        ContentType: metadata.type || 'video/mp4',
        Metadata: {
          originalName: metadata.name,
          uploadTime: new Date().toISOString(),
          category: metadata.category || 'general',
          title: metadata.title || 'Untitled Video'
        }
      });
      
      const createResponse = await s3Client.send(createCommand);
      const uploadId = createResponse.UploadId;
      const partSize = 10 * 1024 * 1024; // 10MB chunks
      const parts = [];

      // Upload parts
      for (let i = 0; i < fileData.length; i += partSize) {
        const partNumber = Math.floor(i / partSize) + 1;
        const partData = fileData.slice(i, i + partSize);

        const uploadPartCommand = new UploadPartCommand({
          Bucket: bucketName,
          Key: fileName,
          PartNumber: partNumber,
          UploadId: uploadId,
          Body: partData
        });

        const uploadPartResponse = await s3Client.send(uploadPartCommand);

        parts.push({
          ETag: uploadPartResponse.ETag,
          PartNumber: partNumber
        });

        console.log(`Uploaded part ${partNumber}/${Math.ceil(fileData.length / partSize)}`);
      }

      // Complete multipart upload
      const completeCommand = new CompleteMultipartUploadCommand({
        Bucket: bucketName,
        Key: fileName,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts }
      });

      const completeResponse = await s3Client.send(completeCommand);

      console.log('Multipart R2 upload successful:', fileName);

      return {
        success: true,
        message: 'Large video uploaded successfully to R2',
        fileId: fileName,
        location: `${process.env.EXPO_PUBLIC_R2_ENDPOINT}/${bucketName}/${fileName}`,
        bucket: bucketName,
        etag: completeResponse.ETag
      };

    } catch (error) {
      console.error('Multipart R2 upload error:', error);
      return {
        success: false,
        message: 'Multipart R2 upload failed',
        error: error.message
      };
    }
  },

  // Get file from R2
  getVideo: async (fileId) => {
    try {
      const bucketName = process.env.EXPO_PUBLIC_BUCKET_VIDEO;
      
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileId
      });
      
      const result = await s3Client.send(command);

      return {
        success: true,
        data: result.Body,
        contentType: result.ContentType,
        metadata: result.Metadata
      };

    } catch (error) {
      console.error('R2 get error:', error);
      return {
        success: false,
        message: 'Failed to get video from R2',
        error: error.message
      };
    }
  }
};

export default r2Server;