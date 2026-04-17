// Traffic Police - Smart Video Upload Router
// Routes video uploads to GlobalUploader for intelligent chunking
// Handles all uploads with proper thumbnail integration

import GlobalUploader from './GlobalUploader';
import r2Server from '../r2Server';

const ChunkingTrafficPolice = {
  // Store active uploads for cleanup
  activeUploads: new Map(),
  
  // Route video to GlobalUploader for smart chunking
  routeVideoUpload: async function(fileUri, metadata) {
    try {
      const fileSize = metadata.size || 0;
      const fileDuration = metadata.duration || 0;
      const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      
      console.log(`🚦 Traffic Police: Routing video with duration ${(fileDuration / 1000).toFixed(2)}s, size ${(fileSize / 1024 / 1024).toFixed(2)}MB, uploadId: ${uploadId}`);
      
      // Track this upload for potential cleanup
      this.activeUploads.set(uploadId, {
        fileUri,
        metadata,
        status: 'routing',
        startTime: Date.now()
      });

      // NEW RULE: Duration-based routing - if video is <30 seconds, direct upload
      if (fileDuration > 0 && fileDuration < 30 * 1000) { // 30 seconds in milliseconds
        console.log('⚡ Traffic Police: Video <30 seconds, uploading directly without chunking');
        console.log(`🔍 DURATION CHECK: ${(fileDuration / 1000).toFixed(2)}s < 30s = DIRECT UPLOAD`);
        const result = await this.uploadDirectly(fileUri, metadata);
        this.activeUploads.delete(uploadId);
        return result;
      }

      // FALLBACK: If duration is missing or >=30 seconds, use chunking
      console.log(`🔍 DURATION CHECK: ${fileDuration > 0 ? (fileDuration / 1000).toFixed(2) + 's' : 'Unknown'} >= 30s = CHUNKED UPLOAD`);
      console.log('🧠 Traffic Police: Using GlobalUploader for smart chunking');
      this.activeUploads.get(uploadId).status = 'chunking';

      // Validate metadata before chunking
      const validation = GlobalUploader.validateMetadata(metadata);
      if (!validation.valid) {
        this.activeUploads.delete(uploadId);
        return {
          success: false,
          message: validation.message
        };
      }

      // Get smart chunks from GlobalUploader
      const chunkResult = await GlobalUploader.createVideoChunks(fileUri, {
        ...metadata,
        uploadId, // Pass uploadId for tracking
        routedBy: 'ChunkingTrafficPolice',
        handlerUsed: 'GlobalUploader'
      });

      if (!chunkResult.success) {
        this.activeUploads.delete(uploadId);
        return chunkResult;
      }

      // Validate that all chunks (except last) are >=5MB
      for (let i = 0; i < chunkResult.chunks.length - 1; i++) {
        if (chunkResult.chunks[i].data.length < 5 * 1024 * 1024) {
          this.activeUploads.delete(uploadId);
          throw new Error(`Chunk ${i + 1} is smaller than 5MB minimum requirement`);
        }
      }

      this.activeUploads.get(uploadId).status = 'uploading';
      
      // Initiate multipart upload first
      console.log('📤 Traffic Police: Initiating multipart upload');
      const initiateResult = await r2Server.initiateChunkedUpload({
        fileName: metadata.name,
        totalChunks: chunkResult.totalChunks,
        chunkSize: chunkResult.chunkSize,
        category: metadata.category,
        title: metadata.title,
        // Pass thumbnail info to R2
        thumbnail: metadata.thumbnail || '',
        thumbnailType: metadata.thumbnail && metadata.thumbnail.startsWith('https://') ? 'cloud' : 'local',
        uploadId // Pass uploadId for tracking
      });

      if (!initiateResult.success) {
        this.activeUploads.delete(uploadId);
        return initiateResult;
      }

      const r2UploadId = initiateResult.uploadId;
      const fileName = initiateResult.fileName;

      console.log(`📦 Traffic Police: Uploading ${chunkResult.chunks.length} chunks to R2 with uploadId: ${r2UploadId}`);
      
      // Upload chunks sequentially to avoid overwhelming server
      const uploadedParts = [];
      for (let index = 0; index < chunkResult.chunks.length; index++) {
        const chunk = chunkResult.chunks[index];
        console.log(`📤 Uploading chunk ${index + 1}/${chunkResult.chunks.length} (${(chunk.data.length / 1024 / 1024).toFixed(2)}MB)`);
        
        const uploadResult = await r2Server.uploadChunk(
          r2UploadId,
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
          console.log(`✅ Chunk ${index + 1} uploaded successfully`);
        } else {
          // Cleanup failed upload
          await this.cleanupFailedUpload(r2UploadId, fileName, uploadId);
          throw new Error(`Failed to upload chunk ${index}: ${uploadResult.message}`);
        }
      }

      this.activeUploads.get(uploadId).status = 'completing';

      // Complete multipart upload
      console.log('🏁 Traffic Police: Completing multipart upload');
      const completeResult = await r2Server.completeChunkedUpload(r2UploadId, fileName, uploadedParts);

      if (!completeResult.success) {
        await this.cleanupFailedUpload(r2UploadId, fileName, uploadId);
        return completeResult;
      }

      this.activeUploads.get(uploadId).status = 'completed';
      const finalResult = {
        success: true,
        message: `Video uploaded successfully in ${chunkResult.totalChunks} chunks (${chunkResult.level} level)`,
        totalChunks: chunkResult.totalChunks,
        chunkSize: chunkResult.chunkSize,
        level: chunkResult.level,
        fileId: completeResult.fileId,
        location: completeResult.location,
        uploadedParts,
        uploadId, // Return uploadId for tracking
        // Thumbnail status for verification
        thumbnailProcessed: !!metadata.thumbnail,
        handlerUsed: 'GlobalUploader'
      };

      this.activeUploads.delete(uploadId);
      return finalResult;

    } catch (error) {
      console.error('❌ Traffic Police routing failed:', error);
      // Cleanup any active upload
      const activeUpload = Array.from(this.activeUploads.values()).find(u => u.fileUri === fileUri);
      if (activeUpload) {
        await this.cleanupFailedUpload(activeUpload.r2UploadId, activeUpload.fileName, activeUpload.uploadId);
      }
      
      return {
        success: false,
        message: `Video upload routing failed: ${error.message}`,
        error
      };
    }
  },

  // Cleanup failed multipart upload
  cleanupFailedUpload: async function(r2UploadId, fileName, uploadId) {
    try {
      console.log(`🧹 Traffic Police: Cleaning up failed upload ${uploadId}`);
      // Here you would implement R2 abort multipart upload
      // For now, just remove from tracking
      this.activeUploads.delete(uploadId);
      
      // Clean up any uploaded thumbnail if exists
      if (uploadId && this.activeUploads.has(uploadId)) {
        const metadata = this.activeUploads.get(uploadId).metadata;
        if (metadata.thumbnail) {
          console.log('🗑️ Traffic Police: Cleaning up orphaned thumbnail');
          // Here you could delete the thumbnail from R2
        }
      }
    } catch (cleanupError) {
      console.error('❌ Traffic Police: Cleanup failed:', cleanupError);
    }
  },

  // Direct upload for files <5MB
  uploadDirectly: async function(fileUri, metadata) {
    try {
      console.log('📦 Traffic Police: Starting direct upload for small file');
      
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
          location: result.location,
          thumbnailProcessed: !!metadata.thumbnail
        };
      } else {
        return result;
      }
    } catch (error) {
      console.error('❌ Direct upload failed:', error);
      return {
        success: false,
        message: `Direct upload failed: ${error.message}`,
        error
      };
    }
  },

  // Get upload statistics for debugging
  getUploadStats: function(fileSize) {
    return GlobalUploader.getUploadStats(fileSize);
  }
};

export default ChunkingTrafficPolice;
