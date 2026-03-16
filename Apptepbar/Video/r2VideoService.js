const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');

console.log('🚀 R2 Video Service Loading...');

// R2 Storage Configuration
const r2Config = {
  credentials: {
    accessKeyId: process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY,
  },
  region: 'auto', // R2 uses 'auto' region
  endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT,
};

console.log('🔧 R2 Config:', {
  hasAccessKeyId: !!process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID,
  hasSecretKey: !!process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY,
  endpoint: process.env.EXPO_PUBLIC_R2_ENDPOINT,
  region: r2Config.region
});

// Initialize R2 S3 client
const r2Client = new S3Client(r2Config);
console.log('✅ R2 Client Initialized');

const videoBucket = process.env.EXPO_PUBLIC_BUCKET_VIDEO || 'kronop-video';
console.log('📦 Using bucket:', videoBucket);

/**
 * List all video files from R2 bucket
 * Uses ListObjectsV2 to scan bucket directly
 */
async function listVideosFromR2() {
  try {
    console.log('🔍 Scanning R2 bucket for videos...');
    console.log('🎯 Bucket:', videoBucket);
    console.log('🌐 Endpoint:', r2Config.endpoint);
    
    const params = {
      Bucket: videoBucket,
      Prefix: '', // List all objects
      MaxKeys: 1000, // Limit to 1000 objects
    };

    console.log('📤 Sending ListObjectsV2 request...');
    const command = new ListObjectsV2Command(params);
    const data = await r2Client.send(command);
    
    console.log('📥 R2 Response received');
    console.log('📊 Total objects found:', data.Contents?.length || 0);
    
    if (!data.Contents || data.Contents.length === 0) {
      console.log('📭 No videos found in R2 bucket');
      return [];
    }

    console.log('📁 All files in bucket:');
    data.Contents.forEach((obj, index) => {
      console.log(`  ${index + 1}. ${obj.Key} (${obj.Size} bytes)`);
    });

    // Filter for video files (.mp4, .mov, .avi, etc.)
    const videoFiles = data.Contents.filter(obj => {
      const key = obj.Key.toLowerCase();
      return key.endsWith('.mp4') || key.endsWith('.mov') || key.endsWith('.avi') || key.endsWith('.mkv');
    });

    console.log(`🎬 Found ${videoFiles.length} video files in R2 bucket`);
    videoFiles.forEach((video, index) => {
      console.log(`  🎥 Video ${index + 1}: ${video.Key} (${video.Size} bytes)`);
    });

    // Generate direct URLs and video metadata
    const videos = videoFiles.map((file, index) => {
      console.log(`🔧 Processing video ${index + 1}: ${file.Key}`);
      
      const fileName = file.Key.split('/').pop(); // Get filename
      const fileExtension = fileName.split('.').pop().toLowerCase();
      const thumbnailKey = file.Key.replace(/\.(mp4|mov|avi|mkv)$/i, '.jpg'); // Guess thumbnail name

      const video = {
        id: `r2_${file.Key.replace(/[^a-zA-Z0-9]/g, '_')}`,
        title: fileName.replace(/\.[^/.]+$/, ""), // Remove extension
        description: `Video uploaded: ${new Date(file.LastModified).toLocaleDateString()}`,
        duration: '0:00', // Will be updated when video loads
        views: 0,
        likes: 0,
        comments: 0,
        category: 'entertainment',
        videoKey: file.Key,
        thumbnailKey: thumbnailKey,
        url: `https://pub-ec9340c906bd4c20a0d2640524d276fe.r2.dev/${file.Key}`,
        thumbnailUrl: `https://pub-ec9340c906bd4c20a0d2640524d276fe.r2.dev/${thumbnailKey}`,
        user: {
          name: 'Cloud Upload',
          avatarKey: 'avatars/default.jpg',
          isSupported: false,
          supporters: 0,
        },
        createdAt: file.LastModified.toISOString(),
        updatedAt: file.LastModified.toISOString(),
        size: file.Size,
        lastModified: file.LastModified,
      };

      console.log(`✅ Video processed: ${video.title}`);
      console.log(`🔗 Video URL: ${video.url}`);
      console.log(`🖼️ Thumbnail URL: ${video.thumbnailUrl}`);
      
      return video;
    });

    // Sort by last modified (newest first)
    videos.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    console.log(`✅ Processed ${videos.length} videos from R2 bucket`);
    console.log('📋 Final video list:');
    videos.forEach((video, index) => {
      console.log(`  ${index + 1}. ${video.title} (${video.size} bytes)`);
    });

    return videos;

  } catch (error) {
    console.error('❌ Error listing R2 videos:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
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
    console.error('❌ Missing R2 configuration:', missing);
    return false;
  }

  console.log('✅ R2 configuration verified');
  console.log('🔧 R2 Endpoint:', process.env.EXPO_PUBLIC_R2_ENDPOINT);
  console.log('🔧 R2 Bucket:', process.env.EXPO_PUBLIC_BUCKET_VIDEO);
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
