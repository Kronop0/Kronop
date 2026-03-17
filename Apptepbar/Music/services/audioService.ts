import { Audio, AVPlaybackStatus } from 'expo-av';
import { Song } from '../types';

class AudioService {
  private sound: Audio.Sound | null = null;
  private currentSong: Song | null = null;

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  async loadSong(song: Song): Promise<void> {
    try {
      // Unload previous song
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }

      // Load new song
      const { sound } = await Audio.Sound.createAsync(
        { uri: song.audioUrl },
        { shouldPlay: false }
      );

      this.sound = sound;
      this.currentSong = song;
    } catch (error) {
      console.error('Failed to load song:', error);
      throw error;
    }
  }

  async play(): Promise<void> {
    if (this.sound) {
      await this.sound.playAsync();
    }
  }

  async pause(): Promise<void> {
    if (this.sound) {
      await this.sound.pauseAsync();
    }
  }

  async stop(): Promise<void> {
    if (this.sound) {
      await this.sound.stopAsync();
    }
  }

  async seekTo(positionMillis: number): Promise<void> {
    if (this.sound) {
      await this.sound.setPositionAsync(positionMillis);
    }
  }

  async setVolume(volume: number): Promise<void> {
    if (this.sound) {
      await this.sound.setVolumeAsync(volume);
    }
  }

  setOnPlaybackStatusUpdate(callback: (status: AVPlaybackStatus) => void): void {
    if (this.sound) {
      this.sound.setOnPlaybackStatusUpdate(callback);
    }
  }

  async cleanup(): Promise<void> {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
      this.currentSong = null;
    }
  }

  getCurrentSong(): Song | null {
    return this.currentSong;
  }
}

export const audioService = new AudioService();
