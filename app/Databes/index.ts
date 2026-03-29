// Database Index - Central hub for all database operations
export { default as PhotoToolScreen } from './PhotoToolScreen';
export { default as VideoToolScreen } from './VideoToolScreen';
export { default as StoryToolScreen } from './StoryToolScreen';
export { default as LiveToolScreen } from './LiveToolScreen';
export { default as ReelsToolScreen } from './ReelsToolScreen';
export { default as SongToolScreen } from './SongToolScreen';
export { default as BankAccountScreen } from './BankAccount';

// Database API Configuration
export const DATABASE_CONFIG = {
  BASE_URL: process.env.KOYEB_API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  ENDPOINTS: {
    PHOTOS: '/content/photos',
    VIDEOS: '/content/videos', 
    STORIES: '/content/stories',
    LIVE: '/content/live',
    REELS: '/content/reels',
    SONGS: '/content/songs',
  }
} as const;

// Common Database Types
export interface BaseContentItem {
  id: string;
  title: string;
  stars: number;
  comments: number;
  shares: number;
}

export interface PhotoItem extends BaseContentItem {
  views: number;
}

export interface VideoItem extends BaseContentItem {
  views: number;
  duration: string;
}

export interface StoryItem extends BaseContentItem {
  views: number;
  expires: string;
}

export interface LiveItem extends BaseContentItem {
  viewers: number;
  status: 'live' | 'ended';
}

export interface ReelItem extends BaseContentItem {
  views: number;
  duration: string;
}

export interface SongItem extends BaseContentItem {
  plays: number;
  artist: string;
  duration: string;
}

export interface ContentStats {
  total: number;
  stars: number;
  comments: number;
  shares: number;
  views?: number;
  viewers?: number;
  plays?: number;
}

// Generic API Handler
export class DatabaseAPI {
  private static async fetchData<T>(endpoint: string): Promise<T[]> {
    try {
      const response = await fetch(`${DATABASE_CONFIG.BASE_URL}${endpoint}`);
      const data = await response.json();
      return Array.isArray(data) ? data : data.data || [];
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      return [];
    }
  }

  static async getPhotos(): Promise<PhotoItem[]> {
    return this.fetchData<PhotoItem>(DATABASE_CONFIG.ENDPOINTS.PHOTOS);
  }

  static async getVideos(): Promise<VideoItem[]> {
    return this.fetchData<VideoItem>(DATABASE_CONFIG.ENDPOINTS.VIDEOS);
  }

  static async getStories(): Promise<StoryItem[]> {
    return this.fetchData<StoryItem>(DATABASE_CONFIG.ENDPOINTS.STORIES);
  }

  static async getLiveStreams(): Promise<LiveItem[]> {
    return this.fetchData<LiveItem>(DATABASE_CONFIG.ENDPOINTS.LIVE);
  }

  static async getReels(): Promise<ReelItem[]> {
    return this.fetchData<ReelItem>(DATABASE_CONFIG.ENDPOINTS.REELS);
  }

  static async getSongs(): Promise<SongItem[]> {
    return this.fetchData<SongItem>(DATABASE_CONFIG.ENDPOINTS.SONGS);
  }
}

// Data Processing Utilities
export class DataProcessor {
  static processPhotos(data: any[]): PhotoItem[] {
    return data.map((item, index) => ({
      id: item.id || `photo_${index}`,
      title: item.title || `Photo ${index + 1}`,
      stars: item.stars || Math.floor(Math.random() * 100),
      comments: item.comments || Math.floor(Math.random() * 50),
      shares: item.shares || Math.floor(Math.random() * 30),
      views: item.views || Math.floor(Math.random() * 1000),
    }));
  }

  static processVideos(data: any[]): VideoItem[] {
    return data.map((item, index) => ({
      id: item.id || `video_${index}`,
      title: item.title || `Video ${index + 1}`,
      stars: item.stars || Math.floor(Math.random() * 100),
      comments: item.comments || Math.floor(Math.random() * 50),
      shares: item.shares || Math.floor(Math.random() * 30),
      views: item.views || Math.floor(Math.random() * 1000),
      duration: item.duration || `${Math.floor(Math.random() * 10)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    }));
  }

  static processStories(data: any[]): StoryItem[] {
    return data.map((item, index) => ({
      id: item.id || `story_${index}`,
      title: item.title || `Story ${index + 1}`,
      stars: item.stars || Math.floor(Math.random() * 100),
      comments: item.comments || Math.floor(Math.random() * 50),
      shares: item.shares || Math.floor(Math.random() * 30),
      views: item.views || Math.floor(Math.random() * 1000),
      expires: item.expires || '24h',
    }));
  }

  static processLiveStreams(data: any[]): LiveItem[] {
    return data.map((item, index) => ({
      id: item.id || `live_${index}`,
      title: item.title || `Live Stream ${index + 1}`,
      stars: item.stars || Math.floor(Math.random() * 100),
      comments: item.comments || Math.floor(Math.random() * 50),
      shares: item.shares || Math.floor(Math.random() * 30),
      viewers: item.viewers || Math.floor(Math.random() * 1000),
      status: item.status || 'live',
    }));
  }

  static processReels(data: any[]): ReelItem[] {
    return data.map((item, index) => ({
      id: item.id || `reel_${index}`,
      title: item.title || `Reel ${index + 1}`,
      stars: item.stars || Math.floor(Math.random() * 100),
      comments: item.comments || Math.floor(Math.random() * 50),
      shares: item.shares || Math.floor(Math.random() * 30),
      views: item.views || Math.floor(Math.random() * 1000),
      duration: item.duration || `0:${String(Math.floor(Math.random() * 59) + 1).padStart(2, '0')}`,
    }));
  }

  static processSongs(data: any[]): SongItem[] {
    return data.map((item, index) => ({
      id: item.id || `song_${index}`,
      title: item.title || `Song ${index + 1}`,
      artist: item.artist || `Artist ${index + 1}`,
      stars: item.stars || Math.floor(Math.random() * 100),
      comments: item.comments || Math.floor(Math.random() * 50),
      shares: item.shares || Math.floor(Math.random() * 30),
      plays: item.plays || Math.floor(Math.random() * 1000),
      duration: item.duration || `${Math.floor(Math.random() * 3) + 1}:${String(Math.floor(Math.random() * 59) + 1).padStart(2, '0')}`,
    }));
  }
}

// Statistics Calculator
export class StatsCalculator {
  static calculatePhotoStats(items: PhotoItem[]): Omit<ContentStats, 'viewers' | 'plays'> {
    return items.reduce(
      (acc, item) => {
        acc.stars += item.stars;
        acc.comments += item.comments;
        acc.shares += item.shares;
        acc.views += item.views;
        return acc;
      },
      { total: items.length, stars: 0, comments: 0, shares: 0, views: 0 }
    );
  }

  static calculateVideoStats(items: VideoItem[]): Omit<ContentStats, 'viewers' | 'plays'> {
    return items.reduce(
      (acc, item) => {
        acc.stars += item.stars;
        acc.comments += item.comments;
        acc.shares += item.shares;
        acc.views += item.views;
        return acc;
      },
      { total: items.length, stars: 0, comments: 0, shares: 0, views: 0 }
    );
  }

  static calculateStoryStats(items: StoryItem[]): Omit<ContentStats, 'viewers' | 'plays'> {
    return items.reduce(
      (acc, item) => {
        acc.stars += item.stars;
        acc.comments += item.comments;
        acc.shares += item.shares;
        acc.views += item.views;
        return acc;
      },
      { total: items.length, stars: 0, comments: 0, shares: 0, views: 0 }
    );
  }

  static calculateLiveStats(items: LiveItem[]): Omit<ContentStats, 'views' | 'plays'> {
    return items.reduce(
      (acc, item) => {
        acc.stars += item.stars;
        acc.comments += item.comments;
        acc.shares += item.shares;
        acc.viewers += item.viewers;
        return acc;
      },
      { total: items.length, stars: 0, comments: 0, shares: 0, viewers: 0 }
    );
  }

  static calculateReelStats(items: ReelItem[]): Omit<ContentStats, 'viewers' | 'plays'> {
    return items.reduce(
      (acc, item) => {
        acc.stars += item.stars;
        acc.comments += item.comments;
        acc.shares += item.shares;
        acc.views += item.views;
        return acc;
      },
      { total: items.length, stars: 0, comments: 0, shares: 0, views: 0 }
    );
  }

  static calculateSongStats(items: SongItem[]): Omit<ContentStats, 'views' | 'viewers'> {
    return items.reduce(
      (acc, item) => {
        acc.stars += item.stars;
        acc.comments += item.comments;
        acc.shares += item.shares;
        acc.plays += item.plays;
        return acc;
      },
      { total: items.length, stars: 0, comments: 0, shares: 0, plays: 0 }
    );
  }
}
