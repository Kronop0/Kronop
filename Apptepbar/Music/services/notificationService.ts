// Media Notification Service — Ultra-fast with debouncing
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Song } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

// Notification state
let currentNotifId: string | null = null;
let pendingUpdate: { song: Song; isPlaying: boolean } | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 150; // 150ms debounce for rapid play/pause

// Android channel setup
const CHANNEL_ID = 'media-player';

async function setupAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Media Player',
    importance: Notifications.AndroidImportance.LOW,
    vibrationPattern: [],
    lightColor: '#8B2BE2',
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status === 'granted') {
      await setupAndroidChannel();
    }
    
    return status === 'granted';
  } catch (error) {
    console.warn('[Notif] Permission request failed:', error);
    return false;
  }
}

// Debounced notification update - prevents UI lag on rapid toggles
function debouncedShowNotification(song: Song, isPlaying: boolean): void {
  pendingUpdate = { song, isPlaying };
  
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  debounceTimer = setTimeout(() => {
    if (pendingUpdate) {
      executeShowNotification(pendingUpdate.song, pendingUpdate.isPlaying);
      pendingUpdate = null;
    }
    debounceTimer = null;
  }, DEBOUNCE_MS);
}

// Execute notification show immediately
async function executeShowNotification(song: Song, isPlaying: boolean): Promise<void> {
  try {
    // Platform-specific options optimized for speed
    const androidOptions = Platform.OS === 'android'
      ? {
          vibrate: [] as number[],
          priority: Notifications.AndroidNotificationPriority.LOW,
          color: '#8B2BE2',
          ongoing: true,
          channelId: CHANNEL_ID,
          autoCancel: false,
        }
      : {};

    const notificationContent = {
      title: song.title || 'Unknown Title',
      body: `${song.artist || 'Unknown Artist'} • ${isPlaying ? '▶ Playing' : '⏸ Paused'}`,
      data: { songId: song.id, isPlaying },
      ...androidOptions,
    };

    // Use scheduleNotificationAsync with trigger: null for immediate display
    const id = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: null, // null trigger = show immediately
    });

    // Dismiss old notification only after new one is showing
    // This prevents "flicker" in notification bar
    if (currentNotifId && currentNotifId !== id) {
      try {
        await Notifications.dismissNotificationAsync(currentNotifId);
      } catch {
        // Ignore dismiss errors
      }
    }

    currentNotifId = id;
  } catch (error) {
    console.warn('[Notif] Failed to show media notification:', error);
  }
}

// Public API with debouncing
export function showMediaNotification(song: Song, isPlaying: boolean): void {
  debouncedShowNotification(song, isPlaying);
}

// Immediate update for when user needs instant feedback
export async function showMediaNotificationImmediate(song: Song, isPlaying: boolean): Promise<void> {
  // Cancel any pending debounced update
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  pendingUpdate = null;
  
  await executeShowNotification(song, isPlaying);
}

export async function dismissMediaNotification(): Promise<void> {
  try {
    // Cancel pending updates
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    pendingUpdate = null;
    
    if (currentNotifId) {
      await Notifications.dismissNotificationAsync(currentNotifId);
      currentNotifId = null;
    }
  } catch (error) {
    console.warn('[Notif] Failed to dismiss media notification:', error);
    currentNotifId = null;
  }
}
