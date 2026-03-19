// Video Upload Handler - Frontend Only
// Calls dedicated R2 server for secure upload

const r2UploadHandler = require('./r2Server');
const FileSystem = require('expo-file-system/legacy');

const videoHandler = {
  receiveFile: async (fileData, metadata) => {
    try {
      console.log('🎥 Video file received:', fileData);
      console.log('📊 Metadata:', metadata);

      // Get file as buffer - React Native ImagePicker handling
      let fileBuffer;
      if (fileData) {
        try {
          // Handle React Native file URI
          const fileResponse = await fetch(fileData);
          if (!fileResponse.ok) {
            throw new Error(`Failed to fetch file: ${fileResponse.status} ${fileResponse.statusText}`);
          }
          fileBuffer = await fileResponse.arrayBuffer();
          fileBuffer = Buffer.from(fileBuffer);
        } catch (fetchError) {
          console.error('❌ File fetch error:', fetchError);
          throw new Error(`Failed to read file from URI: ${fetchError.message}`);
        }
      }

      if (!fileBuffer) {
        throw new Error('Failed to read file data');
      }

      // Call R2 server handler directly
      console.log('🚀 Sending to R2 server handler...');
      const result = await r2UploadHandler.uploadVideo(fileBuffer, metadata?.name || 'video.mp4', metadata);
      
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
