// Live Streaming Server - Main Entry Point
// Combines core and advanced functionality

const r2ServerCore = require('./r2Server.core');
const r2ServerAdvanced = require('./r2Server.advanced');

// Combine both core and advanced functionality
const r2Server = {
  // Core functions - explicitly list them
  initializeStream: r2ServerCore.initializeStream,
  uploadSegment: r2ServerCore.uploadSegment,
  updateManifest: r2ServerCore.updateManifest,
  uploadThumbnail: r2ServerCore.uploadThumbnail,
  updateViewerCount: r2ServerCore.updateViewerCount,
  getStreamStatus: r2ServerCore.getStreamStatus,
  cleanupOldStreams: r2ServerCore.cleanupOldStreams,
  
  // Advanced functions
  initializeWebRTCStream: r2ServerAdvanced.initializeWebRTCStream,
  uploadStream: r2ServerAdvanced.uploadStream,
  generateHLSPlaylist: r2ServerAdvanced.generateHLSPlaylist,
  saveMetadata: r2ServerAdvanced.saveMetadata,
  finalizeStream: r2ServerAdvanced.finalizeStream,
  getActiveStreams: r2ServerAdvanced.getActiveStreams,
};

// Periodic cleanup
setInterval(() => {
  r2Server.cleanupOldStreams();
}, 60 * 60 * 1000); // Every hour

module.exports = r2Server;