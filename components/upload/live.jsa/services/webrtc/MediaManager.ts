// Powered by OnSpace.AI
// MediaManager - Handles local camera and microphone streams for WebRTC
// Uses react-native-webrtc for MediaStream access
import {
  mediaDevices,
  MediaStream,
  MediaStreamTrack,
  RTCView,
} from '@livekit/react-native-webrtc';

export type CameraFacing = 'front' | 'back';

export interface VideoConfig {
  width: number;
  height: number;
  frameRate: number;
  facingMode: CameraFacing;
}

export interface AudioConfig {
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  sampleRate: number;
}

export class MediaManager {
  private stream: MediaStream | null = null;
  private videoTrack: MediaStreamTrack | null = null;
  private audioTrack: MediaStreamTrack | null = null;
  private facingMode: CameraFacing = 'front';
  private isVideoEnabled: boolean = true;
  private isAudioEnabled: boolean = true;
  private currentVideoConfig: VideoConfig;

  // Event callbacks
  public onStreamError?: (error: Error) => void;
  public onStreamStarted?: (stream: MediaStream) => void;
  public onCameraSwitched?: (facing: CameraFacing) => void;
  public onVideoToggle?: (enabled: boolean) => void;
  public onAudioToggle?: (enabled: boolean) => void;

  constructor() {
    this.currentVideoConfig = {
      width: 1280,
      height: 720,
      frameRate: 30,
      facingMode: 'front',
    };
  }

  /**
   * Start camera and microphone stream using react-native-webrtc
   * Returns MediaStream that can be used with LiveKit
   */
  async startStream(
    videoConfig?: Partial<VideoConfig>,
    audioConfig?: Partial<AudioConfig>
  ): Promise<MediaStream> {
    try {
      // Merge with default config
      this.currentVideoConfig = {
        ...this.currentVideoConfig,
        ...videoConfig,
      };

      const constraints = {
        video: {
          width: this.currentVideoConfig.width,
          height: this.currentVideoConfig.height,
          frameRate: this.currentVideoConfig.frameRate,
          facingMode: this.currentVideoConfig.facingMode,
        },
        audio: true, // LiveKit handles audio processing
      };

      // Get user media using react-native-webrtc
      this.stream = await mediaDevices.getUserMedia(constraints);

      this.videoTrack = this.stream.getVideoTracks()[0] || null;
      this.audioTrack = this.stream.getAudioTracks()[0] || null;

      console.log('[MediaManager] Stream started:', {
        video: this.videoTrack?.getSettings(),
        audio: this.audioTrack?.getSettings(),
      });

      this.onStreamStarted?.(this.stream);
      return this.stream;
    } catch (error) {
      console.error('[MediaManager] Failed to start stream:', error);
      this.onStreamError?.(error as Error);
      throw error;
    }
  }

  /**
   * Stop all media tracks and release devices
   */
  stopStream(): void {
    console.log('[MediaManager] Stopping stream');

    this.videoTrack?.stop();
    this.audioTrack?.stop();
    this.stream?.getTracks().forEach((track) => track.stop());

    this.stream = null;
    this.videoTrack = null;
    this.audioTrack = null;
  }

  /**
   * Switch between front and back camera
   */
  async switchCamera(): Promise<void> {
    try {
      const newFacing: CameraFacing =
        this.facingMode === 'front' ? 'back' : 'front';

      console.log('[MediaManager] Switching camera to:', newFacing);

      // Stop current video track
      this.videoTrack?.stop();

      // Get new stream with switched camera
      const newConstraints = {
        video: {
          width: this.currentVideoConfig.width,
          height: this.currentVideoConfig.height,
          frameRate: this.currentVideoConfig.frameRate,
          facingMode: newFacing,
        },
        audio: false, // Keep existing audio
      };

      const newStream = await mediaDevices.getUserMedia(newConstraints);
      const newVideoTrack = newStream.getVideoTracks()[0];

      // Replace track in existing stream
      if (this.stream && newVideoTrack) {
        const oldVideoTrack = this.stream.getVideoTracks()[0];
        if (oldVideoTrack) {
          this.stream.removeTrack(oldVideoTrack);
        }
        this.stream.addTrack(newVideoTrack);
        this.videoTrack = newVideoTrack;
      }

      this.currentVideoConfig.facingMode = newFacing;
      this.facingMode = newFacing;
      this.onCameraSwitched?.(newFacing);
    } catch (error) {
      console.error('[MediaManager] Failed to switch camera:', error);
      this.onStreamError?.(error as Error);
      throw error;
    }
  }

  /**
   * Toggle camera on/off
   */
  toggleVideo(enabled?: boolean): void {
    const newState = enabled !== undefined ? enabled : !this.isVideoEnabled;

    if (this.videoTrack) {
      this.videoTrack.enabled = newState;
    }

    this.isVideoEnabled = newState;
    console.log('[MediaManager] Video toggled:', newState);
    this.onVideoToggle?.(newState);
  }

  /**
   * Toggle microphone on/off
   */
  toggleAudio(enabled?: boolean): void {
    const newState = enabled !== undefined ? enabled : !this.isAudioEnabled;

    if (this.audioTrack) {
      this.audioTrack.enabled = newState;
    }

    this.isAudioEnabled = newState;
    console.log('[MediaManager] Audio toggled:', newState);
    this.onAudioToggle?.(newState);
  }

  /**
   * Get current MediaStream for WebRTC connection
   */
  getStream(): MediaStream | null {
    return this.stream;
  }

  /**
   * Get video track
   */
  getVideoTrack(): MediaStreamTrack | null {
    return this.videoTrack;
  }

  /**
   * Get audio track
   */
  getAudioTrack(): MediaStreamTrack | null {
    return this.audioTrack;
  }

  /**
   * Get current camera facing mode
   */
  getFacingMode(): CameraFacing {
    return this.facingMode;
  }

  /**
   * Check if video is enabled
   */
  isVideoOn(): boolean {
    return this.isVideoEnabled && (this.videoTrack?.enabled ?? false);
  }

  /**
   * Check if audio is enabled
   */
  isAudioOn(): boolean {
    return this.isAudioEnabled && (this.audioTrack?.enabled ?? false);
  }

  /**
   * Apply video constraints for adaptive bitrate
   */
  async applyVideoConstraints(constraints: {
    width?: number;
    height?: number;
    frameRate?: number;
  }): Promise<void> {
    try {
      await this.videoTrack?.applyConstraints(constraints);
      console.log('[MediaManager] Applied video constraints:', constraints);
    } catch (error) {
      console.error('[MediaManager] Failed to apply video constraints:', error);
    }
  }

  /**
   * Get available cameras
   */
  async getAvailableCameras(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await mediaDevices.enumerateDevices() as MediaDeviceInfo[];
      return devices.filter((device: MediaDeviceInfo) => device.kind === 'videoinput');
    } catch (error) {
      console.error('[MediaManager] Failed to enumerate cameras:', error);
      return [];
    }
  }

  /**
   * Get available microphones
   */
  async getAvailableMicrophones(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await mediaDevices.enumerateDevices() as MediaDeviceInfo[];
      return devices.filter((device: MediaDeviceInfo) => device.kind === 'audioinput');
    } catch (error) {
      console.error('[MediaManager] Failed to enumerate microphones:', error);
      return [];
    }
  }

  /**
   * Get RTCView component for rendering local stream
   */
  getRTCView(): typeof RTCView {
    return RTCView;
  }
}

export default MediaManager;
