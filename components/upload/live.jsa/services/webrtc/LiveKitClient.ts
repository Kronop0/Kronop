// DOMException polyfill for LiveKit client in React Native
class DOMExceptionPolyfill extends Error {
  constructor(message: string = '', name: string = 'Error') {
    super(message);
    this.name = name;

    // Map name to code
    const nameToCode: Record<string, number> = {
      'IndexSizeError': 1,
      'DOMStringSizeError': 2,
      'HierarchyRequestError': 3,
      'WrongDocumentError': 4,
      'InvalidCharacterError': 5,
      'NoDataAllowedError': 6,
      'NoModificationAllowedError': 7,
      'NotFoundError': 8,
      'NotSupportedError': 9,
      'InUseAttributeError': 10,
      'InvalidStateError': 11,
      'SyntaxError': 12,
      'InvalidModificationError': 13,
      'NamespaceError': 14,
      'InvalidAccessError': 15,
      'ValidationError': 16,
      'TypeMismatchError': 17,
      'SecurityError': 18,
      'NetworkError': 19,
      'AbortError': 20,
      'URLMismatchError': 21,
      'QuotaExceededError': 22,
      'TimeoutError': 23,
      'InvalidNodeTypeError': 24,
      'DataCloneError': 25,
    };

    (this as any).code = nameToCode[name] || 0;
  }

  // Instance code property
  get code(): number {
    return (this as any).code;
  }
}

// Set DOMException globally immediately
globalThis.DOMException = DOMExceptionPolyfill as any;
if (typeof global !== 'undefined') {
  global.DOMException = DOMExceptionPolyfill as any;
}

// Powered by OnSpace.AI
// LiveKit WebRTC Client - Ultra Low Latency Streaming (<500ms)
// Uses LiveKit React Native SDK for real-time streaming

import {
  Room,
  RoomEvent,
  ConnectionState as LiveKitConnectionState,
  LocalVideoTrack,
  LocalAudioTrack,
  VideoPreset,
  AudioPreset,
  type RoomConnectOptions,
  type RoomOptions,
} from 'livekit-client';
import { MediaStream } from '@livekit/react-native-webrtc';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed';

export interface LiveKitConfig {
  url: string;
  apiKey: string;
  secret: string;
  roomName: string;
  participantName: string;
}

export interface StreamStats {
  currentBitrate: number;
  packetLoss: number;
  latency: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'lost';
}

/**
 * LiveKitClient - Main WebRTC streaming client with LiveKit SDK
 * 
 * Responsibilities:
 * - Connect to LiveKit SFU server
 * - Publish camera and microphone tracks with Simulcast
 * - Handle connection state changes
 * - Monitor stream quality and stats
 * - Reconnection logic
 * - Adaptive Bitrate control
 */
export class LiveKitClient {
  private config: LiveKitConfig;
  private connectionState: ConnectionState = 'disconnected';
  private room: Room | null = null;
  private localVideoTrack: LocalVideoTrack | null = null;
  private localAudioTrack: LocalAudioTrack | null = null;
  private statsInterval: ReturnType<typeof setInterval> | null = null;

  // Event callbacks
  public onConnectionStateChanged?: (state: ConnectionState) => void;
  public onStreamPublished?: (trackType: 'video' | 'audio') => void;
  public onStreamError?: (error: Error) => void;
  public onStatsUpdated?: (stats: StreamStats) => void;
  public onReconnecting?: () => void;
  public onReconnected?: () => void;

  constructor(config: LiveKitConfig) {
    this.config = config;
  }

  /**
   * Connect to LiveKit room and initialize WebRTC connection
   * Enables Simulcast and Adaptive Bitrate by default
   */
  async connect(token?: string): Promise<void> {
    try {
      this.setConnectionState('connecting');
      
      // Use provided token or generate one
      const authToken = token || await this.fetchToken();
      
      if (!authToken) {
        throw new Error('No authentication token provided');
      }

      // Room options with Simulcast enabled for adaptive bitrate
      // Note: adaptiveStream and dynacast are handled at publish time in LiveKit client v2
      const roomOptions: RoomOptions = {
        publishDefaults: {
          videoCodec: 'vp8', // Use VP8 for better compatibility
          videoEncoding: {
            maxBitrate: 2500000, // 2.5 Mbps max
            priority: 'high',
          },
          simulcast: true, // Enable simulcast for adaptive streaming
          videoSimulcastLayers: [
            VideoPreset.h180,
            VideoPreset.h360,
            VideoPreset.h720,
          ],
        },
      };

      // Create and connect to room
      this.room = new Room(roomOptions);
      this.setupRoomListeners();

      const connectOptions: RoomConnectOptions = {
        autoSubscribe: true,
      };

      await this.room.connect(this.config.url, authToken, connectOptions);
      
      this.setConnectionState('connected');
      console.log('[LiveKitClient] Connected to room:', this.config.roomName);
      
      // Start stats collection
      this.startStatsCollection();
      
    } catch (error) {
      this.setConnectionState('failed');
      console.error('[LiveKitClient] Connection failed:', error);
      this.onStreamError?.(error as Error);
      throw error;
    }
  }

  /**
   * Disconnect from LiveKit room and cleanup
   */
  disconnect(): void {
    try {
      console.log('[LiveKitClient] Disconnecting...');
      
      this.stopStatsCollection();
      
      this.localVideoTrack?.stop();
      this.localAudioTrack?.stop();
      
      this.room?.disconnect();
      this.room = null;
      
      this.setConnectionState('disconnected');
      console.log('[LiveKitClient] Disconnected');
    } catch (error) {
      console.error('[LiveKitClient] Disconnect error:', error);
    }
  }

  /**
   * Publish local video track from MediaStream
   * Uses Simulcast for adaptive quality
   */
  async publishVideoTrack(stream: MediaStream): Promise<void> {
    try {
      if (!this.room) {
        throw new Error('Not connected to room');
      }

      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error('No video track found in stream');
      }

      // Create LiveKit video track with simulcast
      this.localVideoTrack = new LocalVideoTrack(videoTrack as any, undefined, true);
      
      await this.room.localParticipant.publishTrack(this.localVideoTrack, {
        simulcast: true,
        videoEncoding: {
          maxBitrate: 2500000,
          priority: 'high',
        },
      });

      console.log('[LiveKitClient] Video track published with simulcast');
      this.onStreamPublished?.('video');
    } catch (error) {
      console.error('[LiveKitClient] Failed to publish video:', error);
      this.onStreamError?.(error as Error);
      throw error;
    }
  }

  /**
   * Publish local audio track from MediaStream
   */
  async publishAudioTrack(stream: MediaStream): Promise<void> {
    try {
      if (!this.room) {
        throw new Error('Not connected to room');
      }

      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) {
        throw new Error('No audio track found in stream');
      }

      // Create LiveKit audio track
      this.localAudioTrack = new LocalAudioTrack(audioTrack as any);
      
      await this.room.localParticipant.publishTrack(this.localAudioTrack);

      console.log('[LiveKitClient] Audio track published');
      this.onStreamPublished?.('audio');
    } catch (error) {
      console.error('[LiveKitClient] Failed to publish audio:', error);
      this.onStreamError?.(error as Error);
      throw error;
    }
  }

  /**
   * Publish both video and audio tracks together
   */
  async publishTracks(stream: MediaStream): Promise<void> {
    await this.publishVideoTrack(stream);
    await this.publishAudioTrack(stream);
  }

  /**
   * Enable/disable video track (camera mute/unmute)
   */
  setVideoEnabled(enabled: boolean): void {
    if (this.localVideoTrack) {
      if (enabled) {
        this.localVideoTrack.unmute();
      } else {
        this.localVideoTrack.mute();
      }
      console.log('[LiveKitClient] Video enabled:', enabled);
    }
  }

  /**
   * Enable/disable audio track (microphone mute/unmute)
   */
  setAudioEnabled(enabled: boolean): void {
    if (this.localAudioTrack) {
      if (enabled) {
        this.localAudioTrack.unmute();
      } else {
        this.localAudioTrack.mute();
      }
      console.log('[LiveKitClient] Audio enabled:', enabled);
    }
  }

  /**
   * Check if currently connected to LiveKit room
   */
  isConnected(): boolean {
    return this.connectionState === 'connected' && this.room?.state === LiveKitConnectionState.Connected;
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Get LiveKit Room instance
   */
  getRoom(): Room | null {
    return this.room;
  }

  /**
   * Set up room event listeners
   */
  private setupRoomListeners(): void {
    if (!this.room) return;

    this.room
      .on(RoomEvent.Reconnecting, () => {
        this.setConnectionState('reconnecting');
        this.onReconnecting?.();
        console.log('[LiveKitClient] Reconnecting...');
      })
      .on(RoomEvent.Reconnected, () => {
        this.setConnectionState('connected');
        this.onReconnected?.();
        console.log('[LiveKitClient] Reconnected');
      })
      .on(RoomEvent.Disconnected, () => {
        this.setConnectionState('disconnected');
        console.log('[LiveKitClient] Disconnected');
      })
      .on(RoomEvent.ConnectionStateChanged, (state: LiveKitConnectionState) => {
        console.log('[LiveKitClient] Connection state:', state);
      })
      .on(RoomEvent.MediaDevicesError, (e: Error) => {
        console.error('[LiveKitClient] Media device error:', e);
        this.onStreamError?.(e);
      });
  }

  /**
   * Update connection state and notify listeners
   */
  private setConnectionState(state: ConnectionState): void {
    this.connectionState = state;
    this.onConnectionStateChanged?.(state);
  }

  /**
   * Fetch authentication token from backend
   * NOTE: Replace with your actual backend URL
   */
  private async fetchToken(): Promise<string> {
    try {
      const response = await fetch('http://localhost:3000/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: this.config.roomName,
          identity: this.config.participantName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.statusText}`);
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('[LiveKitClient] Failed to fetch token:', error);
      throw new Error('Token fetch failed - ensure your backend server is running at http://localhost:3000');
    }
  }

  /**
   * Start collecting connection stats
   */
  startStatsCollection(): void {
    if (this.statsInterval) return;

    this.statsInterval = setInterval(async () => {
      try {
        const stats = await this.collectStats();
        this.onStatsUpdated?.(stats);
      } catch (error) {
        console.error('[LiveKitClient] Stats collection error:', error);
      }
    }, 1000) as unknown as ReturnType<typeof setInterval>;
  }

  /**
   * Stop collecting connection stats
   */
  stopStatsCollection(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }

  /**
   * Collect WebRTC stats from peer connection
   */
  private async collectStats(): Promise<StreamStats> {
    if (!this.room) {
      return {
        currentBitrate: 0,
        packetLoss: 0,
        latency: 0,
        connectionQuality: 'lost',
      };
    }

    try {
      const room = this.room as any;
      const pcManager = room?.engine?.pcManager;
      if (!pcManager) {
        return { currentBitrate: 0, packetLoss: 0, latency: 0, connectionQuality: 'poor' };
      }

      const stats = await pcManager.getStats() as any;
      return this.parseStats(stats);
    } catch (error) {
      console.error('[LiveKitClient] Failed to collect stats:', error);
      return { currentBitrate: 0, packetLoss: 0, latency: 0, connectionQuality: 'poor' };
    }
  }

  /**
   * Parse raw WebRTC stats into StreamStats format
   */
  private parseStats(rawStats: any): StreamStats {
    let currentBitrate = 0;
    let packetLoss = 0;
    let latency = 0;

    try {
      // Parse RTCOutboundRtpVideoStream stats
      rawStats.forEach((stat: any) => {
        if (stat.type === 'outbound-rtp' && stat.mediaType === 'video') {
          const bytesSent = stat.bytesSent || 0;
          const timestamp = stat.timestamp;
          // Calculate bitrate (rough estimate)
          currentBitrate = Math.round((bytesSent * 8) / 1000); // kbps
          
          packetLoss = stat.packetsLost || 0;
        }
        
        if (stat.type === 'candidate-pair' && stat.currentRoundTripTime) {
          latency = Math.round(stat.currentRoundTripTime * 1000); // Convert to ms
        }
      });

      // Determine connection quality
      let connectionQuality: StreamStats['connectionQuality'] = 'good';
      if (packetLoss > 5 || latency > 500) {
        connectionQuality = 'poor';
      } else if (packetLoss > 2 || latency > 200) {
        connectionQuality = 'good';
      } else if (packetLoss === 0 && latency < 100) {
        connectionQuality = 'excellent';
      }

      return {
        currentBitrate,
        packetLoss,
        latency,
        connectionQuality,
      };
    } catch (error) {
      console.error('[LiveKitClient] Failed to parse stats:', error);
      return {
        currentBitrate: 0,
        packetLoss: 0,
        latency: 0,
        connectionQuality: 'poor',
      };
    }
  }
}

export default LiveKitClient;
