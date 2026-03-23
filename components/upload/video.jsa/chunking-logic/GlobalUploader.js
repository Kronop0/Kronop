// Global Uploader - Smart Video Chunking System
// Automatically determines chunk size based on file size
// Handles all video uploads with proper thumbnail integration

import * as FileSystem from 'expo-file-system/legacy';

// Smart chunk size calculation based on file duration and size
const getChunkSize = (fileSize, fileDuration) => {
  // Duration-based logic: Short videos (<30s) get smaller chunks for faster upload
  if (fileDuration > 0 && fileDuration < 30 * 1000) { // <30 seconds
    return 3 * 1024 * 1024; // 3MB chunks for short videos
  }
  
  // Size-based logic for longer videos
  if (fileSize <= 10 * 1024 * 1024) {
    return 5 * 1024 * 1024; // 5MB
  } else if (fileSize <= 50 * 1024 * 1024) {
    return 6 * 1024 * 1024; // 6MB
  } else {
    return 10 * 1024 * 1024; // 10MB
  }
};

const getLevelName = (fileSize, fileDuration) => {
  if (fileDuration > 0 && fileDuration < 30 * 1000) return 'short'; // <30 seconds
  if (fileSize <= 10 * 1024 * 1024) return 'low';
  if (fileSize <= 50 * 1024 * 1024) return 'medium';
  return 'high';
};

const GlobalUploader = {
  // Main function - automatically chunks video based on size and duration
  createVideoChunks: async function(fileUri, metadata) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      const totalSize = fileInfo.size;
      const metadataSize = metadata.size || 0;
      const fileDuration = metadata.duration || 0;
      
      // CRITICAL: Validate file size and duration
      console.log('🔍 GLOBAL UPLOADER DEBUG:', {
        fileInfoSize: totalSize,
        metadataSize: metadataSize,
        fileDuration: fileDuration,
        durationSeconds: fileDuration ? (fileDuration / 1000).toFixed(2) + 's' : 'Unknown',
        fileName: metadata.name,
        fileSizeMB: (totalSize / 1024 / 1024).toFixed(2) + 'MB',
        metadataSizeMB: (metadataSize / 1024 / 1024).toFixed(2) + 'MB'
      });

      // Use actual file size, not metadata
      const actualSize = totalSize > 0 ? totalSize : metadataSize;
      
      if (actualSize === 0) {
        throw new Error('File size is 0 - cannot process empty file');
      }

      const chunkSize = getChunkSize(actualSize, fileDuration);
      const level = getLevelName(actualSize, fileDuration);
      const totalChunks = Math.ceil(actualSize / chunkSize);

      console.log('🚀 GlobalUploader: Smart chunking initialized', {
        file: fileUri,
        size: `${(actualSize / 1024 / 1024).toFixed(2)}MB`,
        duration: fileDuration ? `${(fileDuration / 1000).toFixed(2)}s` : 'Unknown',
        level: level.toUpperCase(),
        chunkSize: `${(chunkSize / 1024 / 1024)}MB`,
        totalChunks,
        thumbnail: metadata.thumbnail ? '✅ Present' : '❌ Missing'
      });

      const chunks = [];
      
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const startByte = chunkIndex * chunkSize;
        const endByte = Math.min(startByte + chunkSize, actualSize);
        const actualChunkSize = endByte - startByte;

        // Read chunk data as binary
        const chunkData = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
          position: startByte,
          length: actualChunkSize
        });

        // Convert to proper binary data for upload
        const binaryString = Buffer.from(chunkData, 'base64').toString('binary');
        const binaryChunk = Buffer.from(binaryString, 'binary');

        // Enhanced metadata with thumbnail integration
        const chunkMetadata = {
          ...metadata,
          chunkIndex,
          totalChunks,
          chunkSize: actualChunkSize,
          startByte,
          endByte,
          isLastChunk: chunkIndex === totalChunks - 1,
          level,
          // Thumbnail data - always included, never lost
          thumbnail: metadata.thumbnail || null,
          thumbnailType: metadata.thumbnail && metadata.thumbnail.startsWith('https://') ? 'cloud' : 'local',
          thumbnailProcessed: false, // Will be set to true in last chunk
          // Upload tracking
          uploadId: metadata.uploadId || `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          timestamp: new Date().toISOString()
        };

        chunks.push({
          data: binaryChunk,
          metadata: chunkMetadata
        });

        console.log(`📦 Chunk ${chunkIndex + 1}/${totalChunks} created (${(actualChunkSize / 1024 / 1024).toFixed(2)}MB)`);
      }

      console.log(`✅ GlobalUploader: ${totalChunks} chunks ready for ${level} level upload`);

      return {
        success: true,
        message: `Video chunked successfully into ${totalChunks} chunks (${level} level)`,
        chunks,
        totalChunks,
        chunkSize,
        level,
        fileSize: actualSize,
        // Thumbnail status for debugging
        thumbnailStatus: {
          present: !!metadata.thumbnail,
          type: metadata.thumbnail && metadata.thumbnail.startsWith('https://') ? 'cloud' : 'local',
          willBeProcessed: 'In last chunk'
        }
      };

    } catch (error) {
      console.error('❌ GlobalUploader: Chunking failed:', error);
      return {
        success: false,
        message: `Video chunking failed: ${error.message}`,
        error
      };
    }
  },

  // Helper function to validate metadata before chunking
  validateMetadata: function(metadata) {
    const required = ['fileName', 'fileSize', 'fileType'];
    const missing = required.filter(key => !metadata[key]);
    
    if (missing.length > 0) {
      console.error('❌ GlobalUploader: Missing required metadata:', missing);
      return {
        valid: false,
        message: `Missing required metadata: ${missing.join(', ')}`
      };
    }

    // Thumbnail validation (optional but recommended)
    if (metadata.thumbnail) {
      if (typeof metadata.thumbnail !== 'string') {
        console.warn('⚠️ GlobalUploader: Invalid thumbnail format');
        metadata.thumbnail = null;
      }
    }

    return {
      valid: true,
      message: 'Metadata validated successfully'
    };
  },

  // Helper function to get upload statistics
  getUploadStats: function(fileSize, fileDuration = 0) {
    const chunkSize = getChunkSize(fileSize, fileDuration);
    const level = getLevelName(fileSize, fileDuration);
    const totalChunks = Math.ceil(fileSize / chunkSize);
    
    return {
      fileSize: `${(fileSize / 1024 / 1024).toFixed(2)}MB`,
      duration: fileDuration ? `${(fileDuration / 1000).toFixed(2)}s` : 'Unknown',
      level: level.toUpperCase(),
      chunkSize: `${(chunkSize / 1024 / 1024)}MB`,
      totalChunks,
      estimatedUploads: totalChunks,
      recommendedFor: level === 'short' ? 'Short videos (<30s)' : 
                      level === 'low' ? 'Small videos (<10MB)' : 
                      level === 'medium' ? 'Medium videos (10-50MB)' : 
                      'Large videos (>50MB)'
    };
  }
};

export default GlobalUploader;
