// Story Upload Handler - Frontend Only
// Calls dedicated R2 server for secure upload

const r2UploadHandler = require('./r2Server');

const storyHandler = {
  receiveFile: async (fileData, metadata) => {
    try {
      console.log('📖 Story file received:', fileData);
      console.log('📊 Metadata:', metadata);

      // Get file as buffer
      let fileBuffer;
      if (fileData && fileData.uri) {
        const fileResponse = await fetch(fileData.uri);
        fileBuffer = await fileResponse.arrayBuffer();
        fileBuffer = Buffer.from(fileBuffer);
      }

      if (!fileBuffer) {
        throw new Error('Failed to read file data');
      }

      // Call R2 server handler directly
      console.log('🚀 Sending to R2 server handler...');
      const result = await r2UploadHandler.uploadStory(fileBuffer, metadata?.name || 'story.jpg', metadata);
      
      if (result.success) {
        console.log('✅ R2 upload successful:', result);
        return {
          success: true,
          message: 'Story uploaded successfully to Cloudflare R2',
          fileId: result.fileId,
          fileName: result.fileName,
          publicUrl: result.publicUrl,
          uploadTime: result.uploadTime,
          storyType: metadata?.type || 'photo',
          duration: metadata?.duration || 15
        };
      } else {
        throw new Error(result.message || 'Upload failed');
      }

    } catch (error) {
      console.error('❌ Story upload error:', error);
      return {
        success: false,
        message: 'Story upload failed to Cloudflare R2',
        error: error.message,
        fileId: null,
        publicUrl: null
      };
    }
  }
};

module.exports = storyHandler;
