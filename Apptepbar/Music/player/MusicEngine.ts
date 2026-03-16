import TrackPlayer, { Capability, AppKilledPlaybackBehavior, type Track } from 'react-native-track-player';

export const setupPlayer = async () => {
  try {
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
  } catch (error) {
    console.error('Error setting up player:', error);
    throw error;
  }
};

export const addTrack = async (url: string, title: string, artist?: string) => {
  try {
    const track: Track = {
      id: url, // Use URL as unique ID
      url,
      title,
      artist: artist || 'Unknown',
    };
    await TrackPlayer.add(track);
    console.log('✅ Track added successfully:', title);
  } catch (error) {
    console.error('Error adding track:', error);
    throw error;
  }
};

export const play = async () => {
  try {
    await TrackPlayer.play();
    console.log('✅ Playback started');
  } catch (error) {
    console.error('Error playing:', error);
    throw error;
  }
};

export const pause = async () => {
  try {
    await TrackPlayer.pause();
    console.log('✅ Playback paused');
  } catch (error) {
    console.error('Error pausing:', error);
    throw error;
  }
};

export const skipToNext = async () => {
  try {
    await TrackPlayer.skipToNext();
    console.log('✅ Skipped to next track');
  } catch (error) {
    console.error('Error skipping to next:', error);
    throw error;
  }
};

export const skipToPrevious = async () => {
  try {
    await TrackPlayer.skipToPrevious();
    console.log('✅ Skipped to previous track');
  } catch (error) {
    console.error('Error skipping to previous:', error);
    throw error;
  }
};

export const getCurrentTrack = async () => {
  try {
    return await TrackPlayer.getCurrentTrack();
  } catch (error) {
    console.error('Error getting current track:', error);
    return null;
  }
};

export const getState = async () => {
  try {
    return await TrackPlayer.getState();
  } catch (error) {
    console.error('Error getting state:', error);
    return null;
  }
};
