// Story Upload Handler - The Decision Maker
// Routes files to appropriate handlers based on type

const photoHandler = require('./photo.js');
const videoHandler = require('./video.js');

const storyHandler = {
  receiveFile: async (fileData, metadata) => {
    try {
      console.log('📖 Story file received:', fileData);
      console.log('📊 Metadata:', metadata);

      // Check file type from metadata or file extension
      const fileType = metadata?.type || '';
      const fileName = metadata?.name || '';
      const isVideo = fileType.includes('video') || fileName.toLowerCase().endsWith('.mp4') || fileName.toLowerCase().endsWith('.mov') || fileName.toLowerCase().endsWith('.avi');
      
      console.log('🔍 File type detected:', isVideo ? 'Video' : 'Photo');

      if (isVideo) {
        console.log('🎥 Routing to video handler...');
        const result = await videoHandler.receiveFile(fileData, metadata);
        return {
          ...result,
          storyType: 'video',
          routedTo: 'video.js'
        };
      } else {
        console.log('📷 Routing to photo handler...');
        const result = await photoHandler.receiveFile(fileData, metadata);
        return {
          ...result,
          storyType: 'photo',
          routedTo: 'photo.js'
        };
      }

    } catch (error) {
      console.error('❌ Story upload error:', error);
      return {
        success: false,
        message: 'Story upload failed - routing error',
        error: error.message,
        fileId: null,
        publicUrl: null
      };
    }
  }
};

module.exports = storyHandler;
