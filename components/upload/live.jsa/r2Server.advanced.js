// Live Streaming Server - Advanced Features
// Handles WebRTC, HLS generation, and stream finalization

const r2DataHandler = require('./r2DataHandler');
const r2ServerCore = require('./r2Server.core');

class LiveStreamServerAdvanced {
  constructor() {
    this.segmentDuration = 2; // 2 seconds for low latency
    this.maxSegments = 30; // keep last 60 seconds
  }

  // Initialize WebRTC stream configuration using R2DataHandler
  async initializeWebRTCStream(streamId, metadata) {
    try {
      const webrtcConfig = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { 
            urls: 'turn:turn.kronop.com:3478',
            username: process.env.EXPO_PUBLIC_TURN_USERNAME || 'kronop',
            credential: process.env.EXPO_PUBLIC_TURN_PASSWORD || 'turnpassword'
          }
        ],
        streamId,
        signalingUrl: `${process.env.EXPO_PUBLIC_BASE_URL}/signal/${streamId}`,
        rtmpUrl: `rtmp://${process.env.EXPO_PUBLIC_BASE_URL}/live/${streamId}`,
        hlsUrl: r2DataHandler.getFileUrl(`live/${streamId}/index.m3u8`),
        lowLatencyUrl: r2DataHandler.getFileUrl(`live/${streamId}/playlist.m3u8`),
        metadata
      };

      // Save WebRTC config using R2DataHandler
      const result = await r2DataHandler.uploadWebRTCConfig(streamId, webrtcConfig);
      console.log(`WebRTC stream initialized for ${streamId}`);
      return webrtcConfig;
    } catch (error) {
      console.error('Failed to initialize WebRTC stream:', error);
      throw error;
    }
  }

  // Upload complete stream using R2DataHandler
  async uploadStream(streamId, streamBuffer, metadata) {
    try {
      const result = await r2DataHandler.uploadStreamRecording(streamId, streamBuffer);
      console.log(`Complete stream uploaded for ${streamId}`);
      return result;
    } catch (error) {
      console.error('Failed to upload stream:', error);
      throw error;
    }
  }

  // Generate HLS playlist with low latency support
  async generateHLSPlaylist(streamId, segments) {
    try {
      let playlist = '#EXTM3U\n';
      playlist += '#EXT-X-VERSION:6\n'; // Version 6 for low latency
      playlist += `#EXT-X-TARGETDURATION:${this.segmentDuration}\n`;
      playlist += '#EXT-X-MEDIA-SEQUENCE:0\n';
      playlist += '#EXT-X-PLAYLIST-TYPE:LIVE\n';
      playlist += '#EXT-X-INDEPENDENT-SEGMENTS\n';
      
      // Low latency settings
      playlist += '#EXT-X-SERVER-CONTROL:CAN-BLOCK-RELOAD=YES,PART-HOLD-BACK=0.5\n';
      playlist += '#EXT-X-PART-INF:PART-TARGET=0.5\n';

      segments.forEach((segment, index) => {
        playlist += `#EXTINF:${segment.duration}.0,\n`;
        playlist += `${r2DataHandler.getFileUrl(segment.key)}\n`;
        
        // Add partial segments for ultra-low latency
        if (index === segments.length - 1) {
          playlist += `#EXT-X-PART:DURATION=0.5,URI="${r2DataHandler.getFileUrl(segment.key.replace('.ts', '_part0.ts'))}"\n`;
        }
      });

      // Upload playlist using R2DataHandler
      const result = await r2DataHandler.uploadLowLatencyPlaylist(streamId, playlist);
      console.log(`HLS playlist generated for ${streamId}`);
      return { success: true, key: result.key, url: result.url };
    } catch (error) {
      console.error('Failed to generate HLS playlist:', error);
      throw error;
    }
  }

  // Save stream metadata using R2DataHandler
  async saveMetadata(streamId, metadata) {
    try {
      const enhancedMetadata = {
        ...metadata,
        streamId,
        uploadTime: new Date().toISOString(),
        platform: 'Kronop',
        version: '1.0',
        latency: 'low', // TikTok/Instagram style
        segmentDuration: this.segmentDuration,
        maxSegments: this.maxSegments,
      };

      const result = await r2DataHandler.uploadStreamMetadata(streamId, enhancedMetadata);
      console.log(`Metadata saved for stream ${streamId}`);
      return result;
    } catch (error) {
      console.error('Failed to save metadata:', error);
      throw error;
    }
  }

  // End live stream and save final recording
  async finalizeStream(streamId) {
    try {
      // Import r2ServerCore to access activeStreams
      const r2ServerCore = require('./r2Server.core');
      const stream = r2ServerCore.activeStreams?.get(streamId);
      if (!stream) throw new Error('Stream not found');

      const endTime = new Date();
      const duration = Math.floor((endTime - stream.startTime) / 1000);

      // Create final manifest
      let finalManifest = '#EXTM3U\n';
      finalManifest += '#EXT-X-VERSION:3\n';
      finalManifest += `#EXT-X-TARGETDURATION:${this.segmentDuration}\n`;
      finalManifest += '#EXT-X-MEDIA-SEQUENCE:0\n';
      finalManifest += '#EXT-X-PLAYLIST-TYPE:VOD\n';
      finalManifest += '#EXT-X-ENDLIST\n';

      stream.segments.forEach(segment => {
        finalManifest += `#EXTINF:${segment.duration}.0,\n`;
        finalManifest += `${r2DataHandler.getFileUrl(segment.key)}\n`;
      });

      // Upload final manifest
      await r2DataHandler.uploadHLSManifest(streamId, finalManifest);

      // Mark stream as inactive
      stream.isActive = false;
      stream.endTime = endTime;
      stream.duration = duration;

      console.log(`Stream ${streamId} finalized successfully`);
      return {
        success: true,
        duration,
        segmentCount: stream.segments.length
      };
    } catch (error) {
      console.error('Failed to finalize stream:', error);
      throw error;
    }
  }

  // Get all active streams
  getActiveStreams() {
    const r2ServerCore = require('./r2Server.core');
    return Array.from(r2ServerCore.activeStreams?.values() || []);
  }
}

module.exports = new LiveStreamServerAdvanced();
