/**
 * Video AI Cloud Upload Manager - React Native Compatible
 * Direct R2 upload without crypto dependencies
 */

import Config from 'react-native-config';

class VideoAICloudUploader {
  constructor() {
    this.config = {
      accountId: Config.R2_ACCOUNT_ID,
      accessKeyId: Config.R2_ACCESS_KEY_ID,
      secretAccessKey: Config.R2_SECRET_ACCESS_KEY,
      endpoint: Config.R2_ENDPOINT,
      bucketVideo: Config.BUCKET_VIDEO || 'kronop-video'
    };
  }

  /**
   * Direct upload to R2 using fetch and FormData
   */
  async uploadProcessedVideo(finalVideoPath) {
    try {
      const fileName = finalVideoPath.split('/').pop();
      const uniqueFileName = `ai_processed_${Date.now()}_${fileName}`;
      const uploadUrl = `https://${this.config.accountId}.r2.cloudflarestorage.com/${this.config.bucketVideo}/${uniqueFileName}`;

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', {
        uri: finalVideoPath,
        type: 'video/mp4',
        name: uniqueFileName
      });

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'video/mp4',
          'x-amz-meta-ai-processed': 'true',
          'x-amz-meta-upload-time': new Date().toISOString()
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`R2 Upload Failed: ${response.status} ${response.statusText}`);
      }

      const publicUrl = `https://pub-${this.config.accountId}.r2.dev/${this.config.bucketVideo}/${uniqueFileName}`;

      return {
        success: true,
        url: publicUrl,
        fileName: uniqueFileName,
        bucketName: this.config.bucketVideo,
        uploadTime: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
}

// Export singleton
const videoAIUploader = new VideoAICloudUploader();
export default videoAIUploader;
