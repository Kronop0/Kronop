// Powered by OnSpace.AI
// useStreamStore - Zustand store for managing WebRTC streaming state
// Tracks connection status, latency, bitrate, and stream quality in real-time
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type StreamConnectionState = 
  | 'idle' 
  | 'connecting' 
  | 'connected' 
  | 'reconnecting' 
  | 'disconnected' 
  | 'failed';

export type ConnectionQuality = 'excellent' | 'good' | 'poor' | 'lost';

export interface StreamStats {
  currentBitrate: number;      // kbps
  packetLoss: number;          // percentage
  latency: number;             // ms (round trip time)
  connectionQuality: ConnectionQuality;
  viewerCount: number;
  liveDuration: number;        // seconds
}

export interface StreamState {
  // Connection State
  connectionState: StreamConnectionState;
  isLive: boolean;
  roomName: string | null;
  participantName: string | null;
  
  // Media State
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  isCameraFront: boolean;
  
  // Stream Stats
  stats: StreamStats;
  
  // Error State
  lastError: string | null;
  
  // Actions
  setConnectionState: (state: StreamConnectionState) => void;
  setLive: (isLive: boolean) => void;
  setRoomInfo: (roomName: string, participantName: string) => void;
  
  // Media Actions
  toggleCamera: () => void;
  toggleMicrophone: () => void;
  switchCamera: () => void;
  setCameraEnabled: (enabled: boolean) => void;
  setMicrophoneEnabled: (enabled: boolean) => void;
  
  // Stats Actions
  updateStats: (stats: Partial<StreamStats>) => void;
  resetStats: () => void;
  incrementLiveDuration: () => void;
  setViewerCount: (count: number) => void;
  
  // Error Actions
  setError: (error: string | null) => void;
  
  // Reset
  reset: () => void;
}

const initialStats: StreamStats = {
  currentBitrate: 0,
  packetLoss: 0,
  latency: 0,
  connectionQuality: 'good',
  viewerCount: 0,
  liveDuration: 0,
};

const initialState = {
  connectionState: 'idle' as StreamConnectionState,
  isLive: false,
  roomName: null,
  participantName: null,
  isCameraEnabled: true,
  isMicrophoneEnabled: true,
  isCameraFront: true,
  stats: { ...initialStats },
  lastError: null,
};

/**
 * Zustand store for stream state management
 * Uses subscribeWithSelector for optimized re-renders
 */
export const useStreamStore = create<StreamState>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // Connection Actions
    setConnectionState: (connectionState) => {
      console.log('[StreamStore] Connection state:', connectionState);
      set({ connectionState });
    },

    setLive: (isLive) => {
      console.log('[StreamStore] Live status:', isLive);
      set({ isLive });
    },

    setRoomInfo: (roomName, participantName) => {
      set({ roomName, participantName });
    },

    // Media Actions
    toggleCamera: () => {
      const newState = !get().isCameraEnabled;
      console.log('[StreamStore] Toggle camera:', newState);
      set({ isCameraEnabled: newState });
    },

    toggleMicrophone: () => {
      const newState = !get().isMicrophoneEnabled;
      console.log('[StreamStore] Toggle microphone:', newState);
      set({ isMicrophoneEnabled: newState });
    },

    switchCamera: () => {
      const newFacing = !get().isCameraFront;
      console.log('[StreamStore] Switch camera:', newFacing ? 'front' : 'back');
      set({ isCameraFront: newFacing });
    },

    setCameraEnabled: (enabled) => {
      set({ isCameraEnabled: enabled });
    },

    setMicrophoneEnabled: (enabled) => {
      set({ isMicrophoneEnabled: enabled });
    },

    // Stats Actions
    updateStats: (newStats) => {
      set((state) => ({
        stats: { ...state.stats, ...newStats },
      }));
    },

    resetStats: () => {
      set({ stats: { ...initialStats } });
    },

    incrementLiveDuration: () => {
      set((state) => ({
        stats: {
          ...state.stats,
          liveDuration: state.stats.liveDuration + 1,
        },
      }));
    },

    setViewerCount: (count) => {
      set((state) => ({
        stats: {
          ...state.stats,
          viewerCount: count,
        },
      }));
    },

    // Error Actions
    setError: (error) => {
      console.log('[StreamStore] Error:', error);
      set({ lastError: error });
    },

    // Reset All
    reset: () => {
      console.log('[StreamStore] Reset state');
      set({ ...initialState });
    },
  }))
);

// Selector hooks for optimized re-renders
export const useConnectionState = () => 
  useStreamStore((state) => state.connectionState);

export const useIsLive = () => 
  useStreamStore((state) => state.isLive);

export const useStreamStats = () => 
  useStreamStore((state) => state.stats);

export const useStreamError = () => 
  useStreamStore((state) => state.lastError);

export default useStreamStore;
