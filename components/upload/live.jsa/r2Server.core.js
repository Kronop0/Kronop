// Live Streaming Server - Core Functions
// Handles basic stream initialization and segment management

// Load environment variables - React Native compatible way
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

const r2DataHandler = require('./r2DataHandler.js');

// Use a simple object instead of class to avoid 'this' binding issues
const activeStreams = new Map();
const segmentDuration = 2; // 2 seconds for low latency
const maxSegments = 30; // keep last 60 seconds

// Initialize live stream - NO MORE HLS MANIFEST
async function initializeStream(streamId, metadata) {
  try {
    const streamData = {
      id: streamId,
      title: metadata?.title || 'Untitled Stream',
      category: metadata?.category || 'Other',
      audienceType: metadata?.audienceType || 'public',
      startTime: new Date(),
      segments: [],
      directVideoUrl: null, // Direct video URL instead of manifest
      viewerCount: 0,
      isActive: true
    };

    try {
      const urls = r2DataHandler.getStreamUrls?.(streamId);
      if (urls) {
        streamData.rtmpUrl = `rtmp://${envVars.EXPO_PUBLIC_BASE_URL}/live/${streamId}`;
        // NO MORE HLS URL - Direct video URL instead
        streamData.directVideoUrl = `https://f9bb6756691d33713172b3bf9afdd0f4.r2.cloudflarestorage.com/live/${streamId}/video.mp4`;
        streamData.thumbnailUrl = urls.thumbnailUrl;
      }
    } catch (error) {
      console.warn('Failed to get URLs from R2DataHandler:', error.message);
      streamData.rtmpUrl = `rtmp://localhost/live/${streamId}`;
      streamData.directVideoUrl = `https://localhost/live/${streamId}/video.mp4`;
      streamData.thumbnailUrl = `https://localhost/live/${streamId}/thumbnail.jpg`;
    }

    activeStreams.set(streamId, streamData);

    // NO MORE MANIFEST UPDATE - Direct video stream
    console.log(`Stream ${streamId} initialized with direct video URL: ${streamData.directVideoUrl}`);
    return streamData;
  } catch (error) {
    console.error('Failed to initialize stream:', error);
    throw error;
  }
}

// Upload video segment - DIRECT VIDEO FILE
async function uploadSegment(streamId, segmentData, segmentIndex) {
  try {
    const stream = activeStreams.get(streamId);
    if (!stream) throw new Error('Stream not found');

    // NO MORE SEGMENTS - Direct video file upload
    const videoKey = `live/${streamId}/video.mp4`;
    
    // Upload direct video data (append to existing file or create new)
    await r2DataHandler.uploadVideoSegment(streamId, segmentData, 0);
    
    // Update stream with direct video URL
    stream.directVideoUrl = `https://f9bb6756691d33713172b3bf9afdd0f4.r2.cloudflarestorage.com/live/${streamId}/video.mp4`;
    
    console.log(`📹 Direct video uploaded: ${videoKey}`);
    return stream.directVideoUrl;
  } catch (error) {
    console.error('Failed to upload direct video:', error);
    throw error;
  }
}

// Upload stream thumbnail using R2DataHandler
async function uploadThumbnail(streamId, thumbnailData) {
  try {
    const thumbnailKey = `live/${streamId}/thumbnail.jpg`;
    await r2DataHandler.uploadThumbnail(streamId, thumbnailData);
    console.log(`Thumbnail uploaded: ${thumbnailKey}`);
    return thumbnailKey;
  } catch (error) {
    console.error('Failed to upload thumbnail:', error);
    throw error;
  }
}

// Update viewer count
async function updateViewerCount(streamId, count) {
  try {
    const stream = activeStreams.get(streamId);
    if (!stream) return;

    stream.viewerCount = count;
    console.log(`Viewer count updated for ${streamId}: ${count}`);
  } catch (error) {
    console.error('Failed to update viewer count:', error);
  }
}

// Get stream info
function getStreamInfo(streamId) {
  return activeStreams.get(streamId);
}

// Get all active streams
function getActiveStreams() {
  return Array.from(activeStreams.values()).filter(stream => stream.isActive);
}

// Cleanup old streams
function cleanupOldStreams() {
  const now = new Date();
  for (const [streamId, stream] of activeStreams.entries()) {
    const ageMinutes = (now - stream.startTime) / (1000 * 60);
    if (ageMinutes > 60 || !stream.isActive) {
      activeStreams.delete(streamId);
      console.log(`Cleaned up old stream: ${streamId}`);
    }
  }
}

// Export all functions
module.exports = {
  initializeStream,
  uploadSegment,
  uploadThumbnail,
  updateViewerCount,
  getStreamInfo,
  getActiveStreams,
  cleanupOldStreams
};
