// Reels Upload Handler - Frontend Only
// Calls dedicated R2 server for secure upload

import r2UploadHandler from './r2Server.js';

const reelsHandler = {
  receiveFile: async (fileUri, metadata) => {
    try {
      console.log('🎬 Reels file received:', fileUri);
      console.log('📊 Metadata:', metadata);

      // Call R2 server handler directly with file URI
      console.log('🚀 Sending to R2 server handler...');
      const result = await r2UploadHandler.uploadReel(fileUri, metadata?.name || 'reel.mp4', metadata);
      
      if (result.success) {
        console.log('✅ R2 upload successful:', result);
        return {
          success: true,
          message: 'Reel uploaded successfully to Cloudflare R2',
          fileId: result.fileId,
          fileName: result.fileName,
          publicUrl: result.publicUrl,
          uploadTime: result.uploadTime,
          metadata: {
            title: metadata?.title || '',
            category: metadata?.category || '',
            tags: metadata?.tags || [],
            description: metadata?.description || ''
          }
        };
      } else {
        throw new Error(result.message || 'Upload failed');
      }

    } catch (error) {
      console.error('❌ Reels upload error:', error);
      return {
        success: false,
        message: 'Reel upload failed',
        error: error.message,
        fileId: null,
        publicUrl: null
      };
    }
  }
};

export default reelsHandler;
