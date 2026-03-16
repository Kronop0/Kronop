// Cloudflare R2 Data Handler
// ONLY handles data upload/download to/from Cloudflare R2
// No streaming logic - pure data operations

const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');

// Initialize R2 client using environment variables - React Native compatible
let envVars = {};
try {
  // For React Native, use hardcoded values (in production, these would come from app.config.js or expo-constants)
  envVars = {
    EXPO_PUBLIC_R2_ENDPOINT: 'https://f9bb6756691d33713172b3bf9afdd0f4.r2.cloudflarestorage.com',
    EXPO_PUBLIC_R2_ACCESS_KEY_ID: '465983939146a7cbb7167537d9d4ebd1',
    EXPO_PUBLIC_R2_SECRET_ACCESS_KEY: '7386255bccd5111ddd8bd3057bbe8995e2c02a74b3ef579cd6b0daf4c1500c94',
    EXPO_PUBLIC_BUCKET_LIVE: 'kronop-live',
    EXPO_PUBLIC_BASE_URL: 'https://kronop-76zy.onrender.com'
  };
} catch (error) {
  console.warn('Failed to load environment variables:', error);
}

const r2Client = new S3Client({
  region: 'auto',
  endpoint: envVars.EXPO_PUBLIC_R2_ENDPOINT,
  credentials: {
    accessKeyId: envVars.EXPO_PUBLIC_R2_ACCESS_KEY_ID,
    secretAccessKey: envVars.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = envVars.EXPO_PUBLIC_BUCKET_LIVE;
const R2_PUBLIC_URL = envVars.EXPO_PUBLIC_R2_ENDPOINT;

class R2DataHandler {
  constructor() {
    this.bucket = BUCKET_NAME;
    this.publicUrl = R2_PUBLIC_URL;
  }

  // Upload file to R2
  async uploadFile(key, body, contentType = 'application/octet-stream', isPublic = true) {
    try {
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        ACL: isPublic ? 'public-read' : 'private',
      });

      await r2Client.send(uploadCommand);
      
      console.log(`File uploaded: ${key}`);
      return { 
        success: true, 
        key, 
        url: `${this.publicUrl}/${key}`,
        contentType 
      };
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  }

  // Upload large file with multipart upload
  async uploadLargeFile(key, body, contentType = 'application/octet-stream', isPublic = true) {
    try {
      const upload = new Upload({
        client: r2Client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
          ACL: isPublic ? 'public-read' : 'private',
        },
      });

      await upload.done();
      
      console.log(`Large file uploaded: ${key}`);
      return { 
        success: true, 
        key, 
        url: `${this.publicUrl}/${key}`,
        contentType 
      };
    } catch (error) {
      console.error('Failed to upload large file:', error);
      throw error;
    }
  }

  // Upload JSON data
  async uploadJSON(key, data, isPublic = false) {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      return await this.uploadFile(key, jsonString, 'application/json', isPublic);
    } catch (error) {
      console.error('Failed to upload JSON:', error);
      throw error;
    }
  }

  // Upload video segment to R2 - DIRECT VIDEO FILE
  async uploadVideoSegment(streamId, segmentData, segmentIndex) {
    try {
      // NO MORE SEGMENTS - Direct video file
      const key = `live/${streamId}/video.mp4`;
      
      // Upload as direct video file (overwrite or create)
      const result = await this.uploadFile(key, segmentData, 'video/mp4', true);
      
      console.log(`📹 Direct video file uploaded: ${key}`);
      return result;
    } catch (error) {
      console.error('Failed to upload direct video file:', error);
      throw error;
    }
  }

  // Upload thumbnail
  async uploadThumbnail(streamId, thumbnailBuffer) {
    const key = `live/${streamId}/thumbnail.jpg`;
    return await this.uploadFile(key, thumbnailBuffer, 'image/jpeg', true);
  }

  // Upload HLS manifest
  async uploadHLSManifest(streamId, manifestContent) {
    const key = `live/${streamId}/index.m3u8`;
    return await this.uploadFile(key, manifestContent, 'application/x-mpegURL', true);
  }

  // Upload low latency playlist
  async uploadLowLatencyPlaylist(streamId, playlistContent) {
    const key = `live/${streamId}/playlist.m3u8`;
    return await this.uploadFile(key, playlistContent, 'application/x-mpegURL', true);
  }

  // Upload complete stream recording
  async uploadStreamRecording(streamId, streamBuffer) {
    const key = `recordings/${streamId}/stream.mp4`;
    return await this.uploadLargeFile(key, streamBuffer, 'video/mp4', true);
  }

  // Upload stream metadata
  async uploadStreamMetadata(streamId, metadata) {
    const key = `live/${streamId}/metadata.json`;
    return await this.uploadJSON(key, metadata, false);
  }

  // Upload recording metadata
  async uploadRecordingMetadata(streamId, metadata) {
    const key = `recordings/${streamId}/metadata.json`;
    return await this.uploadJSON(key, metadata, false);
  }

  // Upload WebRTC configuration
  async uploadWebRTCConfig(streamId, config) {
    const key = `live/${streamId}/webrtc-config.json`;
    return await this.uploadJSON(key, config, false);
  }

  // Get file URL
  getFileUrl(key) {
    return `${this.publicUrl}/${key}`;
  }

  // Get stream URL patterns
  getStreamUrls(streamId) {
    return {
      hlsUrl: this.getFileUrl(`live/${streamId}/index.m3u8`),
      lowLatencyUrl: this.getFileUrl(`live/${streamId}/playlist.m3u8`),
      thumbnailUrl: this.getFileUrl(`live/${streamId}/thumbnail.jpg`),
      recordingUrl: this.getFileUrl(`recordings/${streamId}/stream.mp4`),
      metadataUrl: this.getFileUrl(`live/${streamId}/metadata.json`)
    };
  }
}

module.exports = new R2DataHandler();
