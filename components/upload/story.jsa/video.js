// Video Upload Handler - Frontend Only
// Calls dedicated R2 server for secure upload

const r2UploadHandler = require('./r2Server');
const FileSystem = require('expo-file-system/legacy');

const videoHandler = {
  receiveFile: async (fileData, metadata) => {
    try {
      console.log('🎥 Video file received:', fileData);
      console.log('📊 Metadata:', metadata);

      // Call R2 server handler directly with file URI
      console.log('🚀 Sending to R2 server handler...');
      const result = await r2UploadHandler.uploadVideo(fileData, metadata?.name || 'video.mp4', metadata);
      
      if (result.success) {
        console.log('✅ R2 upload successful:', result);
        return {
          success: true,
          message: 'Video uploaded successfully to Cloudflare R2',
          fileId: result.fileId,
          fileName: result.fileName,
          publicUrl: result.publicUrl,
          uploadTime: result.uploadTime,
          duration: metadata?.duration || 0,
          category: metadata?.category || 'general',
          tags: metadata?.tags || []
        };
      } else {
        throw new Error(result.message || 'Upload failed');
      }

    } catch (error) {
      console.error('❌ Video upload error:', error);
      return {
        success: false,
        message: 'Video upload failed to Cloudflare R2',
        error: error.message,
        fileId: null,
        publicUrl: null
      };
    }
  }
};

module.exports = videoHandler;
