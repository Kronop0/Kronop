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

// Clean metadata validator - only allows essential data
const validateCleanMetadata = (metadata) => {
  const allowedKeys = [
    'title', 'description', 'thumbnail', 'tags', 'category', 'userInfo',
    'fileName', 'fileSize', 'fileType', 'uploadTime',
    'originalName', 'category', 'title' // For backward compatibility
  ];
  
  const clean = {};
  Object.keys(metadata).forEach(key => {
    if (allowedKeys.includes(key)) {
      clean[key] = metadata[key];
    } else {
      console.warn(`r2Server: Filtering out unauthorized metadata: ${key}`);
    }
  });
  
  return clean;
};

const r2Server = {
  // Upload video to R2 bucket
  uploadVideo: async (fileData, metadata) => {
    try {
      const bucketName = process.env.EXPO_PUBLIC_BUCKET_VIDEO;
      const fileName = `videos/${Date.now()}_${metadata.fileName || metadata.name || 'video.mp4'}`;
      
      // Validate and clean metadata
      const cleanMetadata = validateCleanMetadata(metadata);
      
      console.log('Starting R2 upload:', {
        bucket: bucketName,
        file: fileName,
        size: cleanMetadata.fileSize || metadata.size
      });

      // Create upload parameters with clean metadata
      const uploadParams = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileData,
        ContentType: cleanMetadata.fileType || metadata.type || 'video/mp4',
        Metadata: {
          originalName: cleanMetadata.fileName || metadata.name || 'video.mp4',
          uploadTime: cleanMetadata.uploadTime || new Date().toISOString(),
          category: cleanMetadata.category || 'general',
          title: cleanMetadata.title || 'Untitled Video',
          description: cleanMetadata.description || '',
          tags: JSON.stringify(cleanMetadata.tags || []),
          userInfo: JSON.stringify(cleanMetadata.userInfo || {}),
          thumbnail: cleanMetadata.thumbnail || ''
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
      
      // Use smaller part size for mobile devices (5MB instead of 10MB)
      const partSize = 5 * 1024 * 1024; // 5MB chunks
      const parts = [];
      const totalParts = Math.ceil(fileData.length / partSize);

      console.log(`Uploading ${totalParts} parts of ${partSize} bytes each`);

      // Upload parts with memory management
      for (let i = 0; i < fileData.length; i += partSize) {
        const partNumber = Math.floor(i / partSize) + 1;
        const partData = fileData.slice(i, i + partSize);

        console.log(`Uploading part ${partNumber}/${totalParts} (${partData.length} bytes)`);

        try {
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

          console.log(`✅ Part ${partNumber}/${totalParts} uploaded successfully`);
          
          // Add a small delay to allow garbage collection
          if (partNumber % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
        } catch (partError) {
          console.error(`❌ Failed to upload part ${partNumber}:`, partError);
          throw partError;
        }
      }

      // Complete multipart upload
      console.log('Completing multipart upload...');
      const completeCommand = new CompleteMultipartUploadCommand({
        Bucket: bucketName,
        Key: fileName,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts }
      });

      const completeResponse = await s3Client.send(completeCommand);

      console.log('✅ Multipart R2 upload successful:', fileName);

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
  },

  // Initiate chunked upload
  initiateChunkedUpload: async (metadata) => {
    try {
      const bucketName = process.env.EXPO_PUBLIC_BUCKET_VIDEO;
      const fileName = `videos/${Date.now()}_${metadata.fileName || 'video.mp4'}`;
      
      console.log('Initiating chunked upload:', {
        bucket: bucketName,
        file: fileName,
        totalChunks: metadata.totalChunks,
        chunkSize: metadata.chunkSize
      });

      const createCommand = new CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: fileName,
        ContentType: 'video/mp4',
        Metadata: {
          originalName: metadata.fileName,
          uploadTime: new Date().toISOString(),
          category: metadata.category || 'general',
          title: metadata.title || 'Untitled Video',
          totalChunks: metadata.totalChunks.toString(),
          chunkSize: metadata.chunkSize.toString()
        }
      });
      
      const createResponse = await s3Client.send(createCommand);
      
      return {
        success: true,
        uploadId: createResponse.UploadId,
        fileName: fileName,
        bucket: bucketName
      };

    } catch (error) {
      console.error('Failed to initiate chunked upload:', error);
      return {
        success: false,
        message: 'Failed to initiate chunked upload',
        error: error.message
      };
    }
  },

  // Upload individual chunk
  uploadChunk: async (uploadId, fileName, chunkIndex, chunkData, metadata) => {
    try {
      const bucketName = process.env.EXPO_PUBLIC_BUCKET_VIDEO;
      
      console.log(`Uploading chunk ${chunkIndex + 1}/${metadata.totalChunks}:`, {
        uploadId,
        fileName,
        chunkSize: chunkData.length,
        bucket: bucketName
      });

      // chunkData is now already binary Buffer from the chunking logic
      const uploadPartCommand = new UploadPartCommand({
        Bucket: bucketName,
        Key: fileName,
        PartNumber: chunkIndex + 1,
        UploadId: uploadId,
        Body: chunkData
      });

      const uploadPartResponse = await s3Client.send(uploadPartCommand);

      return {
        success: true,
        partNumber: chunkIndex + 1,
        etag: uploadPartResponse.ETag
      };

    } catch (error) {
      console.error(`Failed to upload chunk ${chunkIndex}:`, error);
      return {
        success: false,
        message: `Failed to upload chunk ${chunkIndex}`,
        error: error.message
      };
    }
  },

  // Complete chunked upload
  completeChunkedUpload: async (uploadId, fileName, uploadedParts) => {
    try {
      const bucketName = process.env.EXPO_PUBLIC_BUCKET_VIDEO;
      
      console.log('Completing chunked upload:', {
        uploadId,
        fileName,
        partsCount: uploadedParts.length,
        bucket: bucketName,
        uploadedParts: uploadedParts.map(p => ({ PartNumber: p.PartNumber, ETag: p.ETag }))
      });

      // Validate all parts have ETags
      const missingETags = uploadedParts.filter(part => !part.ETag);
      if (missingETags.length > 0) {
        throw new Error(`${missingETags.length} parts are missing ETags`);
      }

      // Sort parts by PartNumber to ensure correct order
      const sortedParts = uploadedParts.sort((a, b) => a.PartNumber - b.PartNumber);

      console.log('Sorted parts for completion:', sortedParts);

      const completeCommand = new CompleteMultipartUploadCommand({
        Bucket: bucketName,
        Key: fileName,
        UploadId: uploadId,
        MultipartUpload: { Parts: sortedParts }
      });

      const completeResponse = await s3Client.send(completeCommand);

      console.log('✅ Chunked upload completed successfully:', fileName);

      return {
        success: true,
        message: 'Chunked upload completed',
        fileId: fileName,
        location: `${process.env.EXPO_PUBLIC_R2_ENDPOINT}/${bucketName}/${fileName}`,
        bucket: bucketName,
        etag: completeResponse.ETag
      };

    } catch (error) {
      console.error('Failed to complete chunked upload:', error);
      return {
        success: false,
        message: 'Failed to complete chunked upload',
        error: error.message
      };
    }
  }
};

export default r2Server;