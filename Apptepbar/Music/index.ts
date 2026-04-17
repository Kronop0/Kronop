// Music Mini App - John SE Integration Entry Point
// Export all components, hooks, services, types, and constants

// Types
export type { Song } from './types';
export type { Category } from './data/categories';

// Data
export { categories } from './data/categories';

// Constants
export { colors, spacing, typography, borderRadius, shadows } from './constants/theme';
export { R2_SONG_CONFIG, isR2Configured } from './constants/r2Config';

// Services
export { r2SongService, clearUrlCache } from './services/r2Service';
export { getCachedSongs, cacheSongs, clearSongCache } from './services/songCacheService';
export {
  showMediaNotification,
  dismissMediaNotification,
  showMediaNotificationImmediate,
  requestNotificationPermission,
} from './services/notificationService';

// Hooks
export { useAudioPlayer } from './hooks/useAudioPlayer';
export { useFavorites } from './hooks/useFavorites';
export { useThemeColor } from './hooks/useThemeColor';

// Components
export {
  SongListItem,
  SearchBar,
  CategoryBar,
  NowPlayingBar,
  StarButton,
} from './components';

// Main Screen (for direct use)
export { default as MusicLibrary } from './app/index';
