const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

const r2Config = {
  credentials: {
    accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY,
  },
  region: 'auto',
  endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT,
};

const r2Client = new S3Client(r2Config);
const videoBucket = process.env.EXPO_PUBLIC_BUCKET_VIDEO || 'kronop-video';

/**
 * List all video files from R2 bucket
 * Uses ListObjectsV2 to scan bucket directly
 */
async function listVideosFromR2() {
  try {
    const params = {
      Bucket: videoBucket,
      Prefix: '',
      MaxKeys: 1000,
    };

    const command = new ListObjectsV2Command(params);
    const data = await r2Client.send(command);
    
    if (!data.Contents || data.Contents.length === 0) {
      return [];
    }

    // Get all thumbnails first
    const thumbnailFiles = data.Contents.filter(obj => {
      const key = obj.Key.toLowerCase();
      return key.startsWith('thumbnails/') && (key.endsWith('.jpg') || key.endsWith('.jpeg'));
    });

    const videoFiles = data.Contents.filter(obj => {
      const key = obj.Key.toLowerCase();
      return key.endsWith('.mp4') || key.endsWith('.mov') || key.endsWith('.avi') || key.endsWith('.mkv');
    });

    const videos = videoFiles.map((file) => {
      const fileName = file.Key.split('/').pop();
      const videoBaseName = fileName.replace(/\.[^/.]+$/, '');
      
      // Find matching thumbnail - look for thumbnail with video name in it
      let thumbnailKey = null;
      let thumbnailUrl = null;
      
      // Try to find thumbnail that matches video base name
      const matchingThumbnail = thumbnailFiles.find(thumb => {
        const thumbName = thumb.Key.split('/').pop().toLowerCase();
        return thumbName.includes(videoBaseName.toLowerCase());
      });
      
      if (matchingThumbnail) {
        thumbnailKey = matchingThumbnail.Key;
        thumbnailUrl = `https://pub-ec9340c906bd4c20a0d2640524d276fe.r2.dev/${thumbnailKey}`;
      }
      
      console.log(`[R2VideoService] Video: ${fileName}, Thumbnail: ${thumbnailKey || 'NOT FOUND'}`);

      const video = {
        id: `r2_${file.Key.replace(/[^a-zA-Z0-9]/g, '_')}`,
        title: fileName.replace(/\.[^/.]+$/, ""),
        description: `Video uploaded: ${new Date(file.LastModified).toLocaleDateString()}`,
        duration: '0:00',
        views: 0,
        likes: 0,
        comments: 0,
        category: 'entertainment',
        videoKey: file.Key,
        thumbnailKey: thumbnailKey,
        url: `https://pub-ec9340c906bd4c20a0d2640524d276fe.r2.dev/${file.Key}`,
        thumbnailUrl: thumbnailUrl,
        user: {
          name: 'Cloud Upload',
          avatarKey: 'avatars/default.jpeg',
          isSupported: false,
          supporters: 0,
        },
        createdAt: file.LastModified.toISOString(),
        updatedAt: file.LastModified.toISOString(),
        size: file.Size,
        lastModified: file.LastModified,
      };
      
      return video;
    });

    videos.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    return videos;

  } catch (error) {
    console.error('Error listing R2 videos:', error);
    throw new Error(`Failed to list R2 videos: ${error.message}`);
  }
}

/**
 * Get direct streaming URL for a video
 */
function getVideoStreamUrl(videoKey) {
  return `https://pub-ec9340c906bd4c20a0d2640524d276fe.r2.dev/${videoKey}`;
}

/**
 * Get thumbnail URL for a video
 */
function getThumbnailUrl(thumbnailKey) {
  return `https://pub-ec9340c906bd4c20a0d2640524d276fe.r2.dev/${thumbnailKey}`;
}

/**
 * Check if R2 is properly configured
 */
function checkR2Configuration() {
  const required = ['EXPO_PUBLIC_R2_ACCESS_KEY_ID', 'EXPO_PUBLIC_R2_SECRET_ACCESS_KEY', 'EXPO_PUBLIC_R2_ENDPOINT'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing R2 configuration:', missing);
    return false;
  }

  return true;
}

module.exports = {
  listVideosFromR2,
  getVideoStreamUrl,
  getThumbnailUrl,
  checkR2Configuration,
  r2Client,
  videoBucket
};
