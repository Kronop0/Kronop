// Video Chunks Handler
// Handles video file chunking for large uploads
// Sits between video.js and r2Server.js

import * as FileSystem from 'expo-file-system/legacy';
import r2Server from './r2Server';

// Default chunk size (5MB)
const CHUNK_SIZE = 5 * 1024 * 1024;

const videoChunksHandler = {
  // Process video file with chunking
  processVideoUpload: async (fileUri, metadata) => {
    try {
      console.log('Starting video chunks processing:', {
        file: fileUri,
        size: metadata.size,
        chunkSize: CHUNK_SIZE
      });

      // Read the file first
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Read file as Base64
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert Base64 to Uint8Array (React Native compatible)
      const binaryString = atob(base64Data);
      const fileBuffer = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        fileBuffer[i] = binaryString.charCodeAt(i);
      }
      const fileSize = fileBuffer.length;
      
      console.log('File read successfully:', {
        originalSize: metadata.size,
        bufferSize: fileSize,
        sizeMatch: metadata.size === fileSize
      });

      // Update metadata with actual file size
      const updatedMetadata = {
        ...metadata,
        size: fileSize
      };
      
      // Determine if chunking is needed
      if (fileSize <= CHUNK_SIZE) {
        console.log('Small file, direct upload');
        return await r2Server.uploadVideo(fileBuffer, updatedMetadata);
      }

      // Process large file with chunks
      console.log('Large file detected, starting chunked upload');
      return await this.uploadVideoInChunks(fileUri, updatedMetadata);
      
    } catch (error) {
      console.error('Video chunks handler error:', error);
      return {
        success: false,
        message: 'Chunked upload failed',
        error: error.message
      };
    }
  },

  // Upload video in chunks
  uploadVideoInChunks: async (fileUri, metadata) => {
    try {
      console.log('Starting chunked upload for:', fileUri);
      
      // Read the file as Base64
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      console.log('File info:', {
        size: fileInfo.size,
        uri: fileInfo.uri
      });

      // Read file as Base64
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert Base64 to Uint8Array (React Native compatible)
      const binaryString = atob(base64Data);
      const fileBuffer = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        fileBuffer[i] = binaryString.charCodeAt(i);
      }
      
      // Create chunks
      const chunks = this.createChunks(fileBuffer);
      console.log(`Created ${chunks.length} chunks from ${fileBuffer.length} bytes`);

      // Upload chunks to R2
      const result = await r2Server.uploadLargeVideo(fileBuffer, {
        ...metadata,
        totalChunks: chunks.length,
        chunkSize: CHUNK_SIZE
      });

      return result;

    } catch (error) {
      console.error('Chunked upload error:', error);
      return {
        success: false,
        message: 'Chunked upload failed',
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
