// Photo Upload Handler - Frontend Only
// Calls dedicated R2 server for secure upload

const r2UploadHandler = require('./r2Server');
const indexFileService = require('./indexFileService');

const photoHandler = {
  receiveFile: async (fileUri, metadata) => {
    try {
      console.log('📸 Photo file received:', fileUri);
      console.log('📊 Metadata:', metadata);

      // Get file as buffer
      let fileBuffer;
      if (fileUri) {
        const fileResponse = await fetch(fileUri);
        fileBuffer = await fileResponse.arrayBuffer();
        fileBuffer = Buffer.from(fileBuffer);
      }

      if (!fileBuffer) {
        throw new Error('Failed to read file data');
      }

      // Call R2 server handler directly
      console.log('🚀 Sending to R2 server handler...');
      const result = await r2UploadHandler.uploadPhoto(fileBuffer, metadata?.name || 'photo.jpg', metadata);
      
      if (result.success) {
        console.log('✅ R2 upload successful:', result);
        
        // Create personal index file separately after successful upload - FORCED
        console.log('🔥 FORCE: Creating personal index file after photo upload...');
        const selectedCategory = metadata?.selectedCategory || metadata?.category || 'All';
        let indexResult = { success: false, indexFileUrl: null };
        
        try {
          indexResult = await indexFileService.createPersonalIndexFile(
            result.key, 
            metadata, 
            selectedCategory, 
            result.bucket
          );
          
          if (indexResult.success) {
            console.log('✅ SUCCESS: Index file created successfully:', indexResult.indexFileUrl);
          } else {
            console.error('❌ FAILED: Index file creation failed:', indexResult.error);
            // Still continue with upload success but log the error
          }
        } catch (indexError) {
          console.error('❌ CRITICAL: Index file creation threw error:', indexError);
        }
        
        return {
          success: true,
          message: 'Photo uploaded successfully to Cloudflare R2',
          fileId: result.fileId,
          fileName: result.fileName,
          publicUrl: result.publicUrl,
          uploadTime: result.uploadTime,
          indexFileUrl: indexResult.success ? indexResult.indexFileUrl : null,
          folderUrl: indexResult.success ? indexResult.folderUrl : null,
          userFolder: indexResult.success ? indexResult.userFolder : null
        };
      } else {
        throw new Error(result.message || 'Upload failed');
      }

    } catch (error) {
      console.error('❌ Photo upload error:', error);
      return {
        success: false,
        message: 'Photo upload failed to Cloudflare R2',
        error: error.message,
        fileId: null,
        publicUrl: null
      };
    }
  }
};

module.exports = photoHandler;
