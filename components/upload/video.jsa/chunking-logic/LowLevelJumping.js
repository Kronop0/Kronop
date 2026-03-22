// Low Level Jumping - For videos <10MB
// Uses 5MB chunks for small video uploads (minimum R2 requirement)

import * as FileSystem from 'expo-file-system/legacy';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks (minimum requirement)

const LowLevelJumping = {
  // Process small video files (<10MB) - return chunks for index.js to handle
  createVideoChunks: async function(fileUri, metadata) {
    try {
      console.log('Creating Low Level chunks for small video:', {
        file: fileUri,
        size: metadata.size,
        chunkSize: CHUNK_SIZE
      });

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      const totalSize = fileInfo.size;
      const totalChunks = Math.ceil(totalSize / CHUNK_SIZE);

      console.log(`File will be split into ${totalChunks} chunks of ${CHUNK_SIZE / 1024 / 1024}MB each`);

      const chunks = [];
      
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const startByte = chunkIndex * CHUNK_SIZE;
        const endByte = Math.min(startByte + CHUNK_SIZE, totalSize);
        const chunkSize = endByte - startByte;

        // Read chunk data as binary
        const chunkData = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
          position: startByte,
          length: chunkSize
        });

        // Convert to proper binary data for upload
        const binaryString = Buffer.from(chunkData, 'base64').toString('binary');
        const binaryChunk = Buffer.from(binaryString, 'binary');

        const chunkMetadata = {
          ...metadata,
          chunkIndex,
          totalChunks,
          chunkSize,
          startByte,
          endByte,
          isLastChunk: chunkIndex === totalChunks - 1,
          level: 'low'
        };

        chunks.push({
          data: binaryChunk,
          metadata: chunkMetadata
        });
      }

      return {
        success: true,
        message: `Small video chunked successfully into ${totalChunks} chunks`,
        chunks,
        totalChunks,
        chunkSize: CHUNK_SIZE,
        level: 'low'
      };

    } catch (error) {
      console.error('Low Level chunking failed:', error);
      return {
        success: false,
        message: `Small video chunking failed: ${error.message}`,
        error
      };
    }
  }
};

export default LowLevelJumping;
