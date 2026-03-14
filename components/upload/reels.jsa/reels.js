// Reels Upload Handler - Frontend Only
// Calls dedicated R2 server for secure upload

import r2UploadHandler from './r2Server.js';

const reelsHandler = {
  receiveFile: async (fileUri, metadata) => {
    try {
      console.log('🎬 Reels file received:', fileUri);
      console.log('📊 Metadata:', metadata);

      // Check if R2 is configured - use EXPO_PUBLIC variables
      console.log('🔍 Checking R2 config...');
      console.log('EXPO_PUBLIC_R2_ACCESS_KEY_ID exists:', !!process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID);
      console.log('EXPO_PUBLIC_R2_SECRET_ACCESS_KEY exists:', !!process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY);
      console.log('EXPO_PUBLIC_BUCKET_REELS exists:', !!process.env.EXPO_PUBLIC_BUCKET_REELS);
      console.log('EXPO_PUBLIC_R2_ENDPOINT exists:', !!process.env.EXPO_PUBLIC_R2_ENDPOINT);

      if (!process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || !process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || !process.env.EXPO_PUBLIC_BUCKET_REELS || !process.env.EXPO_PUBLIC_R2_ENDPOINT) {
        console.log('⚠️ R2 not configured, using local fallback');
        
        const mockFileId = `reel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const mockPublicUrl = `https://kronop-app.com/reels/${mockFileId}.mp4`;
        
        return {
          success: true,
          message: 'Reel uploaded successfully (DEMO MODE - No cloud upload)',
          fileId: mockFileId,
          fileName: metadata?.name || 'reel.mp4',
          publicUrl: mockPublicUrl,
          uploadTime: new Date().toISOString(),
          metadata: {
            title: metadata?.title || '',
            category: metadata?.category || '',
            tags: metadata?.tags || [],
            description: metadata?.description || ''
          },
          isDemo: true // Always demo mode
        };
      } else {
        // If R2 is configured, attempt real upload
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
