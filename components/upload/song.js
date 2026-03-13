// Song Upload Handler - Frontend Only
// Calls dedicated R2 server for secure upload

const r2UploadHandler = require('./r2Server');

const songHandler = {
  receiveFile: async (files, metadata) => {
    try {
      console.log('🎵 Song files received:', files);
      console.log('📊 Metadata:', metadata);

      // Get first file as buffer (for now, handle one file at a time)
      let fileBuffer;
      if (files && files.length > 0) {
        const firstFile = files[0];
        if (firstFile.uri) {
          const fileResponse = await fetch(firstFile.uri);
          fileBuffer = await fileResponse.arrayBuffer();
          fileBuffer = Buffer.from(fileBuffer);
        }
      }

      if (!fileBuffer) {
        throw new Error('Failed to read file data');
      }

      // Call R2 server handler directly
      console.log('🚀 Sending to R2 server handler...');
      const result = await r2UploadHandler.uploadSong(fileBuffer, metadata?.fileNames?.[0] || 'song.mp3', metadata);
      
      if (result.success) {
        console.log('✅ R2 upload successful:', result);
        return {
          success: true,
          message: 'Song uploaded successfully to Cloudflare R2',
          fileId: result.fileId,
          fileName: result.fileName,
          publicUrl: result.publicUrl,
          uploadTime: result.uploadTime
        };
      } else {
        throw new Error(result.message || 'Upload failed');
      }

    } catch (error) {
      console.error('❌ Song upload error:', error);
      return {
        success: false,
        message: 'Song upload failed to Cloudflare R2',
        error: error.message,
        fileId: null,
        publicUrl: null
      };
    }
  }
};

module.exports = songHandler;
