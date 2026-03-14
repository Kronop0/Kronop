// SongHandler.ts - Main handler that orchestrates processing and uploading
const r2UploadHandler = require('./r2Server');
const { processSongFile } = require('./SongProcessor');
const { extractSongMetadata } = require('./SongMetadata');

const songHandler = {
  receiveFile: async (files, metadata) => {
    try {
      console.log('🎵 Song files received:', files);
      console.log('📊 Metadata:', metadata);

      if (!files || files.length === 0) {
        throw new Error('No files provided');
      }

      // Process first file (handle one file at a time for now)
      const firstFile = files[0];
      const mimeType = firstFile.mimeType || firstFile.type;

      console.log('🔄 Processing file with SongProcessor...');
      const processedResult = await processSongFile(firstFile.uri, mimeType);

      console.log('📁 Processing result:', processedResult);

      // Extract complete metadata from processed file
      console.log('📊 Extracting metadata from processed file...');
      const completeMetadata = await extractSongMetadata(processedResult.processedUri, {
        ...metadata,
        wasProcessed: processedResult.wasProcessed,
        originalFileName: processedResult.wasProcessed ? firstFile.name : undefined,
        processedFileName: processedResult.wasProcessed ? 'converted_audio.mp3' : undefined
      });

      console.log('📋 Complete metadata:', completeMetadata);

      // No need to read buffer here - r2Server.js will handle it
      console.log('☁️ Uploading to R2 via r2Server.js...');
      const uploadResult = await r2UploadHandler.uploadSongToR2(
        processedResult.processedUri,
        processedResult.wasProcessed ? 'converted_audio.mp3' : (metadata?.fileNames?.[0] || 'song.mp3'),
        completeMetadata
      );

      if (uploadResult.success) {
        console.log('✅ Song upload pipeline completed successfully:', uploadResult);
        return {
          success: true,
          message: processedResult.wasProcessed
            ? 'Video converted to audio and uploaded successfully to Cloudflare R2'
            : 'Song uploaded successfully to Cloudflare R2',
          fileId: uploadResult.fileId,
          fileName: uploadResult.fileName,
          publicUrl: uploadResult.publicUrl,
          uploadTime: uploadResult.uploadTime,
          wasProcessed: processedResult.wasProcessed,
          originalUri: processedResult.originalUri,
          processedUri: processedResult.processedUri
        };
      } else {
        throw new Error(uploadResult.message || 'Upload failed');
      }

    } catch (error) {
      console.error('❌ Song handler error:', error);
      return {
        success: false,
        message: 'Song processing and upload failed',
        error: error.message,
        fileId: null,
        publicUrl: null
      };
    }
  }
};

module.exports = songHandler;
