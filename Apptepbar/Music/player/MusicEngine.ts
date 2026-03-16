import TrackPlayer, { Capability, AppKilledPlaybackBehavior, type Track } from 'react-native-track-player';

// Safety check for TrackPlayer availability
const isTrackPlayerAvailable = () => {
  try {
    return TrackPlayer && typeof TrackPlayer.setupPlayer === 'function';
  } catch (error) {
    console.warn('⚠️ TrackPlayer not available:', error);
    return false;
  }
};

export const setupPlayer = async () => {
  try {
    if (!isTrackPlayerAvailable()) {
      console.warn('⚠️ TrackPlayer not available, skipping setup');
      return false;
    }
    
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
      ],
    });
    console.log('✅ TrackPlayer setup successful');
    return true;
  } catch (error) {
    console.error('Error setting up player:', error);
    return false;
  }
};

export const addTrack = async (url: string, title: string, artist: string) => {
  try {
    if (!isTrackPlayerAvailable()) {
      console.warn('⚠️ TrackPlayer not available, cannot add track');
      return false;
    }
    
    const track: Track = {
      id: url, // Use URL as unique ID
      url,
      title,
      artist: artist || 'Unknown',
    };
    
    await TrackPlayer.add(track);
    console.log('✅ Track added:', title);
    return true;
  } catch (error) {
    console.error('❌ Error adding track:', error);
    return false;
  }
};

export const play = async () => {
  try {
    if (!isTrackPlayerAvailable()) {
      console.warn('⚠️ TrackPlayer not available, cannot play');
      return false;
    }
    
    await TrackPlayer.play();
    console.log('▶️ Playing track');
    return true;
  } catch (error) {
    console.error('❌ Error playing track:', error);
    return false;
  }
};

export const pause = async () => {
  try {
    if (!isTrackPlayerAvailable()) {
      console.warn('⚠️ TrackPlayer not available, cannot pause');
      return false;
    }
    
    await TrackPlayer.pause();
    console.log('⏸️ Paused track');
    return true;
  } catch (error) {
    console.error('❌ Error pausing track:', error);
    return false;
  }
};

export const skipToNext = async () => {
  try {
    if (!isTrackPlayerAvailable()) {
      console.warn('⚠️ TrackPlayer not available, cannot skip to next');
      return false;
    }
    
    await TrackPlayer.skipToNext();
    console.log('⏭️ Skipped to next track');
    return true;
  } catch (error) {
    console.error('❌ Error skipping to next track:', error);
    return false;
  }
};

export const skipToPrevious = async () => {
  try {
    if (!isTrackPlayerAvailable()) {
      console.warn('⚠️ TrackPlayer not available, cannot skip to previous');
      return false;
    }
    
    await TrackPlayer.skipToPrevious();
    console.log('⏮️ Skipped to previous track');
    return true;
  } catch (error) {
    console.error('❌ Error skipping to previous track:', error);
    return false;
  }
};

export const getCurrentTrack = async () => {
  try {
    if (!isTrackPlayerAvailable()) {
      console.warn('⚠️ TrackPlayer not available, cannot get current track');
      return null;
    }
    
    const track = await TrackPlayer.getCurrentTrack() as Track | null;
    console.log('🎵 Current track:', track?.title || 'Unknown');
    return track;
  } catch (error) {
    console.error('❌ Error getting current track:', error);
    return null;
  }
};

export const getState = async () => {
  try {
    if (!isTrackPlayerAvailable()) {
      console.warn('⚠️ TrackPlayer not available, cannot get state');
      return null;
    }
    
    return await TrackPlayer.getState();
  } catch (error) {
    console.error('❌ Error getting player state:', error);
    return null;
  }
};
