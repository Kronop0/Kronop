// Video Chunks Handler
// Handles video file chunking for large uploads
// Sits between video.js and r2Server.js

import * as FileSystem from 'expo-file-system/legacy';
import r2Server from './r2Server';

// Default chunk size (5MB to ensure all parts meet R2's minimum size requirements)
const CHUNK_SIZE = 5 * 1024 * 1024;

const videoChunksHandler = {
  // Process video file with chunking
  processVideoUpload: async function(fileUri, metadata) {
    try {
      console.log('Starting video chunks processing:', {
        file: fileUri,
        size: metadata.size,
        chunkSize: CHUNK_SIZE
      });

      // Get file info without reading the entire file
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      const fileSize = fileInfo.size;
      console.log('File info:', {
        originalSize: metadata.size,
        actualSize: fileSize,
        sizeMatch: metadata.size === fileSize
      });

      // Update metadata with actual file size
      const updatedMetadata = {
        ...metadata,
        size: fileSize
      };
      
      // The chunking system can handle large files, so no size limit needed
      // Files will be processed in 1MB chunks to avoid memory issues
      
      // Determine if chunking is needed
      if (fileSize <= CHUNK_SIZE) {
        console.log('Small file, direct upload');
        return await this.uploadSmallFile(fileUri, updatedMetadata);
      }

      // Process large file with chunks
      console.log('Large file detected, starting chunked upload');
      return await this.uploadLargeFileDirect(fileUri, updatedMetadata);
      
    } catch (error) {
      console.error('Video chunks handler error:', error);
      return {
        success: false,
        message: 'Chunked upload failed',
        error: error.message
      };
    }
  },

  // Upload small file directly
  uploadSmallFile: async function(fileUri, metadata) {
    try {
      console.log('Reading small file for direct upload');
      
      // Read file as Base64 for small files only
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert Base64 to Uint8Array
      const binaryString = atob(base64Data);
      const fileBuffer = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        fileBuffer[i] = binaryString.charCodeAt(i);
      }
      
      return await r2Server.uploadVideo(fileBuffer, metadata);
    } catch (error) {
      console.error('Small file upload error:', error);
      throw error;
    }
  },

  // Upload large file using existing multipart upload (more memory efficient)
  uploadLargeFileDirect: async function(fileUri, metadata) {
    try {
      console.log('Starting large file upload using multipart:', fileUri);
      
      // For large files, we need to read in chunks to avoid memory issues
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      const fileSize = fileInfo.size;
      
      console.log(`Processing large file: ${fileSize} bytes`);
      
      // Initialize multipart upload first
      const bucketName = process.env.EXPO_PUBLIC_BUCKET_VIDEO;
      const fileName = `videos/${Date.now()}_${metadata.name || 'video.mp4'}`;
      
      // Create multipart upload
      const { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } = require('@aws-sdk/client-s3');
      const { S3Client: S3ClientImport } = require('@aws-sdk/client-s3');
      
      const s3Client = new S3ClientImport({
        region: 'auto',
        endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT,
        credentials: {
          accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY,
        },
        forcePathStyle: true,
      });
      
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
      
      // Use 5MB part size to meet R2's minimum requirements
      const partSize = 5 * 1024 * 1024; // 5MB chunks
      const parts = [];
      const totalParts = Math.ceil(fileSize / partSize);
      
      console.log(`Uploading ${totalParts} parts of ${partSize} bytes each`);
      
      // Process file in chunks to avoid memory issues
      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const start = (partNumber - 1) * partSize;
        const end = Math.min(start + partSize, fileSize);
        const chunkSize = end - start;
        
        console.log(`Processing part ${partNumber}/${totalParts} (${chunkSize} bytes)`);
        
        try {
          // Read only this chunk from the file
          const chunkData = await this.readFileChunk(fileUri, start, chunkSize);
          
          // Upload this part
          const uploadPartCommand = new UploadPartCommand({
            Bucket: bucketName,
            Key: fileName,
            PartNumber: partNumber,
            UploadId: uploadId,
            Body: chunkData
          });
          
          const uploadPartResponse = await s3Client.send(uploadPartCommand);
          
          parts.push({
            ETag: uploadPartResponse.ETag,
            PartNumber: partNumber
          });
          
          console.log(`✅ Part ${partNumber}/${totalParts} uploaded successfully`);
          
          // Add delay for garbage collection after every part
          await new Promise(resolve => setTimeout(resolve, 300));
          
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
      
      console.log('✅ Large file upload successful:', fileName);
      
      return {
        success: true,
        message: 'Large video uploaded successfully to R2',
        fileId: fileName,
        location: `${process.env.EXPO_PUBLIC_R2_ENDPOINT}/${bucketName}/${fileName}`,
        bucket: bucketName,
        etag: completeResponse.ETag
      };
      
    } catch (error) {
      console.error('Large file upload error:', error);
      return {
        success: false,
        message: 'Large file upload failed',
        error: error.message
      };
    }
  },

  // Read a specific chunk from file (memory efficient for React Native)
  readFileChunk: async function(fileUri, start, size) {
    try {
      console.log(`Reading chunk: start=${start}, size=${size}`);
      
      // Use expo-file-system to read only the specific bytes we need
      // This is more memory efficient than reading the entire file
      const chunkData = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
        position: start,
        length: size
      });
      
      // Convert Base64 to Uint8Array
      const binaryString = atob(chunkData);
      const chunkBuffer = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        chunkBuffer[i] = binaryString.charCodeAt(i);
      }
      
      console.log(`✅ Chunk read using expo-file-system: ${chunkBuffer.length} bytes`);
      return chunkBuffer;
      
    } catch (error) {
      console.error('Error reading chunk:', error);
      throw new Error(`Failed to read file chunk: ${error.message}`);
    }
  },

  // Streaming upload for very large files (placeholder for future implementation)
  uploadLargeFileStreaming: async function(fileUri, metadata) {
    try {
      console.log('Streaming upload not yet implemented, falling back to multipart');
      return await this.uploadLargeFileDirect(fileUri, metadata);
    } catch (error) {
      console.error('Streaming upload error:', error);
      return {
        success: false,
        message: 'Streaming upload failed',
        error: error.message
      };
    }
  },

  // Create chunks from file data (for buffer-based processing)
  createChunks: (fileData) => {
    const chunks = [];
    const totalChunks = Math.ceil(fileData.length / CHUNK_SIZE);
    
    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, fileData.length);
      chunks.push({
        index: i,
        data: fileData.slice(start, end),
        size: end - start
      });
    }
    
    return chunks;
  },

  // Validate chunk integrity
  validateChunk: (chunk, expectedIndex, expectedSize) => {
    return chunk && 
           chunk.index === expectedIndex && 
           chunk.data && 
           chunk.size === expectedSize;
  },

  // Get upload progress
  getUploadProgress: (uploadedChunks, totalChunks) => {
    return {
      percentage: Math.round((uploadedChunks / totalChunks) * 100),
      uploadedChunks,
      totalChunks,
      remainingChunks: totalChunks - uploadedChunks
    };
  }
};

export default videoChunksHandler;
