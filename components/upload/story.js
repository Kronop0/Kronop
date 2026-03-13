// Story Upload Handler
// Receives story files from StoryUpload.tsx component

const storyHandler = {
  receiveFile: async (fileData, metadata) => {
    try {
      console.log('Story file received:', fileData);
      console.log('Metadata:', metadata);
      
      // Mock response for now
      return {
        success: true,
        message: 'Upload successful for Story',
        fileId: `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fileName: metadata?.name || 'unknown_story.jpg',
        fileSize: metadata?.size || 0,
        storyType: metadata?.type || 'photo',
        duration: metadata?.duration || 15,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Story upload error:', error);
      return {
        success: false,
        message: 'Upload failed for Story',
        error: error.message
      };
    }
  }
};

module.exports = storyHandler;
