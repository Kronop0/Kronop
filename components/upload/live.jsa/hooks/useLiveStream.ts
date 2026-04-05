// Powered by OnSpace.AI
// useLiveStream - Backend hook that connects existing UI to LiveKit WebRTC
// Fits into existing button onPress functions without changing UI
import { useCallback, useRef, useEffect, useState } from 'react';
import { LiveKitClient, ConnectionState } from '../services/webrtc/LiveKitClient';
import { MediaManager, CameraFacing } from '../services/webrtc/MediaManager';
import { useStreamStore, StreamConnectionState } from '../services/streaming/useStreamStore';

interface UseLiveStreamOptions {
  roomName: string;
  participantName: string;
  onError?: (error: Error) => void;
}

interface UseLiveStreamReturn {
  // State (for UI binding)
  isLive: boolean;
  connectionState: StreamConnectionState;
  isConnecting: boolean;
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  isCameraFront: boolean;
  localStream: any | null;
  stats: {
    currentBitrate: number;
    packetLoss: number;
    latency: number;
    connectionQuality: 'excellent' | 'good' | 'poor' | 'lost';
    viewerCount: number;
    liveDuration: number;
  };
  
  // Actions (fit existing button onPress)
  startStream: () => Promise<void>;      // For Go Live button
  stopStream: () => void;               // For End Stream button
  toggleCamera: () => void;              // For camera mute button
  toggleMicrophone: () => void;          // For mic mute button
  switchCamera: () => Promise<void>;     // For flip camera button
}

/**
 * useLiveStream - Backend hook for WebRTC streaming
 * 
 * Integrates with existing UI buttons:
 * - Go Live button → startStream()
 * - End Stream button → stopStream()
 * - Mic button → toggleMicrophone()
 * - Flip button → switchCamera()
 * 
 * Keeps all existing UI styling, only changes internal tech to WebRTC
 */
export function useLiveStream(options: UseLiveStreamOptions): UseLiveStreamReturn {
  const { roomName, participantName, onError } = options;
  
  // Store refs for persistent instances
  const liveKitClientRef = useRef<LiveKitClient | null>(null);
  const mediaManagerRef = useRef<MediaManager | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Zustand store state
  const {
    connectionState,
    isLive,
    isCameraEnabled,
    isMicrophoneEnabled,
    isCameraFront,
    stats,
    setConnectionState,
    setLive,
    setRoomInfo,
    setCameraEnabled,
    setMicrophoneEnabled,
    switchCamera: switchCameraStore,
    updateStats,
    incrementLiveDuration,
    setViewerCount,
    setError,
    reset,
  } = useStreamStore();

  // Initialize instances once
  useEffect(() => {
    // Validate environment variables
    const livekitUrl = process.env.EXPO_PUBLIC_LIVEKIT_URL;
    const livekitApiKey = process.env.EXPO_PUBLIC_LIVEKIT_API_KEY;
    const livekitSecret = process.env.EXPO_PUBLIC_LIVEKIT_SECRET;

    if (!livekitUrl || !livekitApiKey || !livekitSecret) {
      const missingVars = [];
      if (!livekitUrl) missingVars.push('EXPO_PUBLIC_LIVEKIT_URL');
      if (!livekitApiKey) missingVars.push('EXPO_PUBLIC_LIVEKIT_API_KEY');
      if (!livekitSecret) missingVars.push('EXPO_PUBLIC_LIVEKIT_SECRET');
      
      const errorMsg = `Missing required environment variables: ${missingVars.join(', ')}`;
      console.error('[useLiveStream]', errorMsg);
      setConnectionState('failed');
      setError(errorMsg);
      onError?.(new Error(errorMsg));
      return;
    }
    // Create LiveKit client
    liveKitClientRef.current = new LiveKitClient({
      url: process.env.EXPO_PUBLIC_LIVEKIT_URL || '',
      apiKey: process.env.EXPO_PUBLIC_LIVEKIT_API_KEY || '',
      secret: process.env.EXPO_PUBLIC_LIVEKIT_SECRET || '',
      roomName,
      participantName,
    });

    // Create MediaManager
    mediaManagerRef.current = new MediaManager();

    // Set up LiveKit event handlers
    const client = liveKitClientRef.current;
    client.onConnectionStateChanged = (state: ConnectionState) => {
      setConnectionState(state as StreamConnectionState);
    };
    client.onStreamPublished = (trackType) => {
      console.log('[useLiveStream] Track published:', trackType);
    };
    client.onStreamError = (error) => {
      console.error('[useLiveStream] Stream error:', error);
      setError(error.message);
      onError?.(error);
    };
    client.onStatsUpdated = (newStats) => {
      updateStats({
        currentBitrate: newStats.currentBitrate,
        packetLoss: newStats.packetLoss,
        latency: newStats.latency,
        connectionQuality: newStats.connectionQuality,
      });
    };

    // Set up MediaManager event handlers
    const media = mediaManagerRef.current;
    media.onStreamStarted = (stream) => {
      console.log('[useLiveStream] Media stream started');
    };
    media.onStreamError = (error) => {
      console.error('[useLiveStream] Media error:', error);
      setError(error.message);
      onError?.(error);
    };
    media.onCameraSwitched = (facing) => {
      switchCameraStore();
    };
    media.onVideoToggle = (enabled) => {
      setCameraEnabled(enabled);
    };
    media.onAudioToggle = (enabled) => {
      setMicrophoneEnabled(enabled);
    };

    // Set room info in store
    setRoomInfo(roomName, participantName);

    // Cleanup on unmount
    return () => {
      stopStreamInternal();
    };
  }, [roomName, participantName]);

  /**
   * Start stream - Called by Go Live button
   * 1. Get camera/mic via MediaManager
   * 2. Connect to LiveKit
   * 3. Publish tracks
   * 4. Start stats collection
   */
  const startStream = useCallback(async () => {
    try {
      const media = mediaManagerRef.current;
      const client = liveKitClientRef.current;
      
      if (!media || !client) {
        throw new Error('Stream components not initialized');
      }

      console.log('[useLiveStream] Starting stream...');
      setConnectionState('connecting');

      // Step 1: Start camera and microphone
      const stream = await media.startStream({
        width: 1280,
        height: 720,
        frameRate: 30,
        facingMode: isCameraFront ? 'front' : 'back',
      });

      // Step 2: Connect to LiveKit
      await client.connect();

      // Step 3: Publish tracks to LiveKit
      await client.publishTracks(stream);

      // Step 4: Update state
      setLive(true);
      setConnectionState('connected');

      // Step 5: Start live duration timer
      durationIntervalRef.current = setInterval(() => {
        incrementLiveDuration();
        // Simulate viewer count changes
        setViewerCount(Math.floor(Math.random() * 50) + 10);
      }, 1000);

      console.log('[useLiveStream] Stream started successfully');
    } catch (error) {
      console.error('[useLiveStream] Failed to start stream:', error);
      setConnectionState('failed');
      setError((error as Error).message);
      onError?.(error as Error);
    }
  }, [isCameraFront]);

  /**
   * Stop stream - Called by End Stream button
   * 1. Stop duration timer
   * 2. Disconnect from LiveKit
   * 3. Stop media tracks
   * 4. Reset state
   */
  const stopStreamInternal = useCallback(() => {
    console.log('[useLiveStream] Stopping stream...');

    // Stop duration timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    // Disconnect from LiveKit
    liveKitClientRef.current?.disconnect();

    // Stop media
    mediaManagerRef.current?.stopStream();

    // Reset store
    reset();

    console.log('[useLiveStream] Stream stopped');
  }, []);

  const stopStream = useCallback(() => {
    stopStreamInternal();
  }, [stopStreamInternal]);

  /**
   * Toggle camera - Called by camera mute button
   */
  const toggleCamera = useCallback(() => {
    const media = mediaManagerRef.current;
    const client = liveKitClientRef.current;
    
    if (media) {
      const newState = !media.isVideoOn();
      media.toggleVideo(newState);
      client?.setVideoEnabled(newState);
    }
  }, []);

  /**
   * Toggle microphone - Called by mic button
   */
  const toggleMicrophone = useCallback(() => {
    const media = mediaManagerRef.current;
    const client = liveKitClientRef.current;
    
    if (media) {
      const newState = !media.isAudioOn();
      media.toggleAudio(newState);
      client?.setAudioEnabled(newState);
    }
  }, []);

  /**
   * Switch camera - Called by flip camera button
   */
  const switchCamera = useCallback(async () => {
    const media = mediaManagerRef.current;
    if (media) {
      await media.switchCamera();
    }
  }, []);

  return {
    // State for UI
    isLive,
    connectionState,
    isConnecting: connectionState === 'connecting',
    isCameraEnabled,
    isMicrophoneEnabled,
    isCameraFront,
    localStream: mediaManagerRef.current?.getStream() as any || null,
    stats: {
      currentBitrate: stats.currentBitrate,
      packetLoss: stats.packetLoss,
      latency: stats.latency,
      connectionQuality: stats.connectionQuality,
      viewerCount: stats.viewerCount,
      liveDuration: stats.liveDuration,
    },
    
    // Actions (drop-in replacements for existing buttons)
    startStream,
    stopStream,
    toggleCamera,
    toggleMicrophone,
    switchCamera,
  };
}

export default useLiveStream;
