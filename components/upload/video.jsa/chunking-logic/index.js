// Traffic Police - Routes video uploads to appropriate chunking handler
// VideoUpload.tsx sends data here, this routes to correct handler
// Then handles upload to r2Server

import HighLevelJumping from './HighLevelJumping';
import MediumLevelJumping from './MediumLevelJumping';
import LowLevelJumping from './LowLevelJumping';
import r2Server from '../r2Server';

const ChunkingTrafficPolice = {
  // Route video to appropriate chunking handler based on size
  routeVideoUpload: async function(fileUri, metadata) {
    try {
      const fileSize = metadata.size || 0;
      console.log(`Traffic Police: Routing video of size ${(fileSize / 1024 / 1024).toFixed(2)}MB`);

      // Rule: If file is <5MB, upload directly without chunking
      if (fileSize < 5 * 1024 * 1024) {
        console.log('Traffic Police: File <5MB, uploading directly without chunking');
        return await this.uploadDirectly(fileUri, metadata);
      }

      let handler;
      let handlerName;

      if (fileSize > 50 * 1024 * 1024) { // > 50MB
        handler = HighLevelJumping;
        handlerName = 'HighLevelJumping';
      } else if (fileSize > 10 * 1024 * 1024) { // 10MB - 50MB
        handler = MediumLevelJumping;
        handlerName = 'MediumLevelJumping';
      } else { // 5MB - 10MB
        handler = LowLevelJumping;
        handlerName = 'LowLevelJumping';
      }

      console.log(`Traffic Police: Routing to ${handlerName}`);

      // Get chunks from appropriate handler
      const chunkResult = await handler.createVideoChunks(fileUri, {
        ...metadata,
        routedBy: 'ChunkingTrafficPolice',
        handlerUsed: handlerName
      });

      if (!chunkResult.success) {
        return chunkResult;
      }

      // Validate that all chunks (except last) are >=5MB
      for (let i = 0; i < chunkResult.chunks.length - 1; i++) {
        if (chunkResult.chunks[i].data.length < 5 * 1024 * 1024) {
          throw new Error(`Chunk ${i + 1} is smaller than 5MB minimum requirement`);
        }
      }

      // Initiate multipart upload first
      console.log('Traffic Police: Initiating multipart upload');
      const initiateResult = await r2Server.initiateChunkedUpload({
        fileName: metadata.name,
        totalChunks: chunkResult.totalChunks,
        chunkSize: chunkResult.chunkSize,
        category: metadata.category,
        title: metadata.title
      });

      if (!initiateResult.success) {
        return initiateResult;
      }

      const uploadId = initiateResult.uploadId;
      const fileName = initiateResult.fileName;

      console.log(`Traffic Police: Uploading ${chunkResult.chunks.length} chunks to r2Server with uploadId: ${uploadId}`);
      
      // Upload chunks sequentially to avoid overwhelming the server
      const uploadedParts = [];
      for (let index = 0; index < chunkResult.chunks.length; index++) {
        const chunk = chunkResult.chunks[index];
        console.log(`Uploading chunk ${index + 1}/${chunkResult.chunks.length}`);
        
        const uploadResult = await r2Server.uploadChunk(
          uploadId,
          fileName,
          index,
          chunk.data,
          chunk.metadata
        );

        if (uploadResult.success) {
          uploadedParts.push({
            ETag: uploadResult.etag,
            PartNumber: index + 1
          });
        } else {
          throw new Error(`Failed to upload chunk ${index}: ${uploadResult.message}`);
        }
      }

      // Complete the multipart upload
      console.log('Traffic Police: Completing multipart upload');
      const completeResult = await r2Server.completeChunkedUpload(uploadId, fileName, uploadedParts);

      if (!completeResult.success) {
        return completeResult;
      }

      return {
        success: true,
        message: `Video uploaded successfully in ${chunkResult.totalChunks} chunks using ${handlerName}`,
        totalChunks: chunkResult.totalChunks,
        chunkSize: chunkResult.chunkSize,
        level: chunkResult.level,
        fileId: completeResult.fileId,
        location: completeResult.location,
        uploadedParts
      };

    } catch (error) {
      console.error('Traffic Police routing failed:', error);
      return {
        success: false,
        message: `Video upload routing failed: ${error.message}`,
        error
      };
    }
  },

  // Direct upload for files <5MB
  uploadDirectly: async function(fileUri, metadata) {
    try {
      console.log('Traffic Police: Starting direct upload for small file');
      
      // Read entire file
      const fileData = await require('expo-file-system/legacy').readAsStringAsync(fileUri, {
        encoding: require('expo-file-system/legacy').EncodingType.Base64
      });
      
      const binaryData = Buffer.from(fileData, 'base64');
      
      const result = await r2Server.uploadVideo(binaryData, metadata);
      
      if (result.success) {
        return {
          success: true,
          message: 'Small video uploaded directly without chunking',
          totalChunks: 1,
          chunkSize: metadata.size,
          level: 'direct',
          fileId: result.fileId,
          location: result.location
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Direct upload failed:', error);
      return {
        success: false,
        message: `Direct upload failed: ${error.message}`,
        error
      };
    }
  }
};

export default ChunkingTrafficPolice;
