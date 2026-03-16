// Video Upload Handler
// Receives video files from VideoUpload.tsx component

import videoChunksHandler from './videoChunksHandler';

const videoHandler = {
  receiveFile: async (fileUri, metadata) => {
    try {
      console.log('Video file received:', fileUri);
      console.log('Metadata:', metadata);
      
      // Process through chunks handler
      const result = await videoChunksHandler.processVideoUpload(fileUri, metadata);
      
      if (result.success) {
        console.log('Video upload pipeline completed successfully');
        return {
          success: true,
          message: 'Video uploaded successfully',
          fileId: result.fileId,
          location: result.location,
          bucket: result.bucket,
          fileName: metadata.name || 'unknown_video.mp4',
          fileSize: metadata.size || 0,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(result.message);
      }
      
    } catch (error) {
      console.error('Video upload pipeline error:', error);
      return {
        success: false,
        message: 'Video upload failed',
        error: error.message
      };
    }
  }
};

export default videoHandler;
