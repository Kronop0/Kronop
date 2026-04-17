// Database Index - Central hub for all database operations
import { Platform } from 'react-native';

// Export individual tool screens for direct navigation
export { default as PhotoToolScreen } from './PhotoToolScreen';
export { default as VideoToolScreen } from './VideoToolScreen';
export { default as StoryToolScreen } from './StoryToolScreen';
export { default as LiveToolScreen } from './LiveToolScreen';
export { default as ReelsToolScreen } from './ReelsToolScreen';
export { default as SongToolScreen } from './SongToolScreen';
export { default as NotesToolScreen } from './NotesToolScreen';
export { default as BankAccountScreen } from './BankAccount';

// Database API Configuration
const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, '').replace(/\/api$/, '');

const getBaseUrl = () => {
  // Check for production env first (Render deployment URL)
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);
  }
  if (process.env.EXPO_PUBLIC_API_URL) {
    return normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
  }
  if (process.env.EXPO_PUBLIC_BASE_URL) {
    return normalizeBaseUrl(process.env.EXPO_PUBLIC_BASE_URL);
  }
  
  // Production fallback - always use cloud URL for real builds
  return normalizeBaseUrl('https://kronop-76zy.onrender.com');
};

export const DATABASE_CONFIG = {
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    // Server exposes direct content endpoints under /api/*
    PHOTOS: '/api/photos',
    VIDEOS: '/api/videos',
    STORIES: '/api/stories',
    LIVE: '/api/live',
    REELS: '/api/reels',
    SONGS: '/api/songs',
    NOTES: '/api/notes',
  }
};

// Debug: Log the actual URL being used
console.log('📡 API Base URL:', DATABASE_CONFIG.BASE_URL);

// Database API Handler
export const DatabaseAPI = {
  getPhotos: async () => {
    try {
      const url = `${DATABASE_CONFIG.BASE_URL}${DATABASE_CONFIG.ENDPOINTS.PHOTOS}`;
      console.log('[DatabaseAPI] Fetching photos from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`[DatabaseAPI] Photos API error: ${response.status} - ${response.statusText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[DatabaseAPI] Photos API returned non-JSON:', contentType);
        throw new Error('Invalid response format: expected JSON');
      }
      return response.json();
    } catch (error) {
      console.error('[DatabaseAPI] Network error fetching photos:', error);
      throw error;
    }
  },
  
  getVideos: async () => {
    try {
      const url = `${DATABASE_CONFIG.BASE_URL}${DATABASE_CONFIG.ENDPOINTS.VIDEOS}`;
      console.log('[DatabaseAPI] Fetching videos from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`[DatabaseAPI] Videos API error: ${response.status} - ${response.statusText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[DatabaseAPI] Videos API returned non-JSON:', contentType);
        throw new Error('Invalid response format: expected JSON');
      }
      return response.json();
    } catch (error) {
      console.error('[DatabaseAPI] Network error fetching videos:', error);
      throw error;
    }
  },
  
  getStories: async () => {
    try {
      const url = `${DATABASE_CONFIG.BASE_URL}${DATABASE_CONFIG.ENDPOINTS.STORIES}`;
      console.log('[DatabaseAPI] Fetching stories from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`[DatabaseAPI] Stories API error: ${response.status} - ${response.statusText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[DatabaseAPI] Stories API returned non-JSON:', contentType);
        throw new Error('Invalid response format: expected JSON');
      }
      return response.json();
    } catch (error) {
      console.error('[DatabaseAPI] Network error fetching stories:', error);
      throw error;
    }
  },
  
  getLiveStreams: async () => {
    try {
      const url = `${DATABASE_CONFIG.BASE_URL}${DATABASE_CONFIG.ENDPOINTS.LIVE}`;
      console.log('[DatabaseAPI] Fetching live streams from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`[DatabaseAPI] Live API error: ${response.status} - ${response.statusText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[DatabaseAPI] Live API returned non-JSON:', contentType);
        throw new Error('Invalid response format: expected JSON');
      }
      return response.json();
    } catch (error) {
      console.error('[DatabaseAPI] Network error fetching live streams:', error);
      throw error;
    }
  },
  
  getReels: async () => {
    try {
      const url = `${DATABASE_CONFIG.BASE_URL}${DATABASE_CONFIG.ENDPOINTS.REELS}`;
      console.log('[DatabaseAPI] Fetching reels from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`[DatabaseAPI] Reels API error: ${response.status} - ${response.statusText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[DatabaseAPI] Reels API returned non-JSON:', contentType);
        throw new Error('Invalid response format: expected JSON');
      }
      return response.json();
    } catch (error) {
      console.error('[DatabaseAPI] Network error fetching reels:', error);
      throw error;
    }
  },
  
  getSongs: async () => {
    try {
      const url = `${DATABASE_CONFIG.BASE_URL}${DATABASE_CONFIG.ENDPOINTS.SONGS}`;
      console.log('[DatabaseAPI] Fetching songs from:', url);
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`[DatabaseAPI] Songs API error: ${response.status} - ${response.statusText}`);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('[DatabaseAPI] Songs API returned non-JSON:', contentType);
        throw new Error('Invalid response format: expected JSON');
      }
      return response.json();
    } catch (error) {
      console.error('[DatabaseAPI] Network error fetching songs:', error);
      throw error;
    }
  },

  getNotes: async () => {
    console.log('[DatabaseAPI] Returning mock notes data (no API call)');
    return {
      success: true,
      data: []
    };
  }
};

// Common Types
export interface ContentStats {
  total: number;
  stars: number;
  comments: number;
  shares: number;
  views?: number;
  viewers?: number;
  plays?: number;
}

export interface PhotoItem {
  id: string;
  title: string;
  stars: number;
  comments: number;
  shares: number;
  views: number;
}

export interface VideoItem {
  id: string;
  title: string;
  stars: number;
  comments: number;
  shares: number;
  views: number;
  duration: string;
}

export interface StoryItem {
  id: string;
  title: string;
  stars: number;
  comments: number;
  shares: number;
  views: number;
  expires: string;
}

export interface LiveItem {
  id: string;
  title: string;
  stars: number;
  comments: number;
  shares: number;
  viewers: number;
  status: 'live' | 'ended';
}

export interface ReelItem {
  id: string;
  title: string;
  stars: number;
  comments: number;
  shares: number;
  views: number;
  duration: string;
}

export interface SongItem {
  id: string;
  title: string;
  artist: string;
  stars: number;
  comments: number;
  shares: number;
  plays: number;
  duration: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  stars: number;
  comments: number;
  shares: number;
  views: number;
}

// Data Processors
export const DataProcessor = {
  processPhotos: (data: any) => {
    const photos = Array.isArray(data) ? data : data.data || [];
    return photos.map((item: any, index: number) => ({
      id: item.id || `photo_${index}`,
      title: item.title || `Photo ${index + 1}`,
      stars: item.stars || Math.floor(Math.random() * 100),
      comments: item.comments || Math.floor(Math.random() * 50),
      shares: item.shares || Math.floor(Math.random() * 30),
      views: item.views || Math.floor(Math.random() * 1000),
    }));
  },
  
  processVideos: (data: any) => {
    const videos = Array.isArray(data) ? data : data.data || [];
    return videos.map((item: any, index: number) => ({
      id: item.id || `video_${index}`,
      title: item.title || `Video ${index + 1}`,
      stars: item.stars || Math.floor(Math.random() * 100),
      comments: item.comments || Math.floor(Math.random() * 50),
      shares: item.shares || Math.floor(Math.random() * 30),
      views: item.views || Math.floor(Math.random() * 1000),
      duration: item.duration || `${Math.floor(Math.random() * 10)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    }));
  },
  
  processStories: (data: any) => {
    const stories = Array.isArray(data) ? data : data.data || [];
    return stories.map((item: any, index: number) => ({
      id: item.id || `story_${index}`,
      title: item.title || `Story ${index + 1}`,
      stars: item.stars || Math.floor(Math.random() * 100),
      comments: item.comments || Math.floor(Math.random() * 50),
      shares: item.shares || Math.floor(Math.random() * 30),
      views: item.views || Math.floor(Math.random() * 1000),
      expires: item.expires || '24h',
    }));
  },
  
  processLiveStreams: (data: any) => {
    const liveStreams = Array.isArray(data) ? data : data.data || [];
    return liveStreams.map((item: any, index: number) => ({
      id: item.id || `live_${index}`,
      title: item.title || `Live Stream ${index + 1}`,
      stars: item.stars || Math.floor(Math.random() * 100),
      comments: item.comments || Math.floor(Math.random() * 50),
      shares: item.shares || Math.floor(Math.random() * 30),
      viewers: item.viewers || Math.floor(Math.random() * 1000),
      status: item.status || 'live',
    }));
  },
  
  processReels: (data: any) => {
    const reels = Array.isArray(data) ? data : data.data || [];
    return reels.map((item: any, index: number) => ({
      id: item.id || `reel_${index}`,
      title: item.title || `Reel ${index + 1}`,
      stars: item.stars || Math.floor(Math.random() * 100),
      comments: item.comments || Math.floor(Math.random() * 50),
      shares: item.shares || Math.floor(Math.random() * 30),
      views: item.views || Math.floor(Math.random() * 1000),
      duration: item.duration || `0:${String(Math.floor(Math.random() * 59) + 1).padStart(2, '0')}`,
    }));
  },
  
  processSongs: (data: any) => {
    const songs = Array.isArray(data) ? data : data.data || [];
    return songs.map((item: any, index: number) => ({
      id: item.id || `song_${index}`,
      title: item.title || `Song ${index + 1}`,
      artist: item.artist || `Artist ${index + 1}`,
      stars: item.stars || Math.floor(Math.random() * 100),
      comments: item.comments || Math.floor(Math.random() * 50),
      shares: item.shares || Math.floor(Math.random() * 30),
      plays: item.plays || Math.floor(Math.random() * 1000),
      duration: item.duration || `${Math.floor(Math.random() * 3) + 1}:${String(Math.floor(Math.random() * 59) + 1).padStart(2, '0')}`,
    }));
  },

  processNotes: (data: any) => {
    const notes = Array.isArray(data) ? data : data.data || [];
    return notes.map((item: any, index: number) => ({
      id: item._id || item.id || `note_${index}`,
      title: item.title || `Note ${index + 1}`,
      content: item.content || '',
      tags: item.tags || [],
      category: item.category || 'General',
      stars: item.stars || Math.floor(Math.random() * 100),
      comments: item.comments || Math.floor(Math.random() * 50),
      shares: item.shares || Math.floor(Math.random() * 30),
      views: item.views || Math.floor(Math.random() * 1000),
    }));
  }
};

// Statistics Calculator
export const StatsCalculator = {
  calculatePhotoStats: (photos: PhotoItem[]) => {
    return photos.reduce(
      (acc: { total: number; stars: number; comments: number; shares: number; views: number }, photo: PhotoItem) => {
        acc.stars += photo.stars;
        acc.comments += photo.comments;
        acc.shares += photo.shares;
        acc.views += photo.views;
        return acc;
      },
      { total: photos.length, stars: 0, comments: 0, shares: 0, views: 0 }
    );
  },
  
  calculateVideoStats: (videos: VideoItem[]) => {
    return videos.reduce(
      (acc: { total: number; stars: number; comments: number; shares: number; views: number }, video: VideoItem) => {
        acc.stars += video.stars;
        acc.comments += video.comments;
        acc.shares += video.shares;
        acc.views += video.views;
        return acc;
      },
      { total: videos.length, stars: 0, comments: 0, shares: 0, views: 0 }
    );
  },
  
  calculateStoryStats: (stories: StoryItem[]) => {
    return stories.reduce(
      (acc: { total: number; stars: number; comments: number; shares: number; views: number }, story: StoryItem) => {
        acc.stars += story.stars;
        acc.comments += story.comments;
        acc.shares += story.shares;
        acc.views += story.views;
        return acc;
      },
      { total: stories.length, stars: 0, comments: 0, shares: 0, views: 0 }
    );
  },
  
  calculateLiveStats: (liveStreams: LiveItem[]) => {
    return liveStreams.reduce(
      (acc: { total: number; stars: number; comments: number; shares: number; viewers: number }, live: LiveItem) => {
        acc.stars += live.stars;
        acc.comments += live.comments;
        acc.shares += live.shares;
        acc.viewers += live.viewers;
        return acc;
      },
      { total: liveStreams.length, stars: 0, comments: 0, shares: 0, viewers: 0 }
    );
  },
  
  calculateReelStats: (reels: ReelItem[]) => {
    return reels.reduce(
      (acc: { total: number; stars: number; comments: number; shares: number; views: number }, reel: ReelItem) => {
        acc.stars += reel.stars;
        acc.comments += reel.comments;
        acc.shares += reel.shares;
        acc.views += reel.views;
        return acc;
      },
      { total: reels.length, stars: 0, comments: 0, shares: 0, views: 0 }
    );
  },
  
  calculateSongStats: (songs: SongItem[]) => {
    return songs.reduce(
      (acc: { total: number; stars: number; comments: number; shares: number; plays: number }, song: SongItem) => {
        acc.stars += song.stars;
        acc.comments += song.comments;
        acc.shares += song.shares;
        acc.plays += song.plays;
        return acc;
      },
      { total: songs.length, stars: 0, comments: 0, shares: 0, plays: 0 }
    );
  },

  calculateNoteStats: (notes: NoteItem[]) => {
    return notes.reduce(
      (acc: { total: number; stars: number; comments: number; shares: number; views: number }, note: NoteItem) => {
        acc.stars += note.stars;
        acc.comments += note.comments;
        acc.shares += note.shares;
        acc.views += note.views;
        return acc;
      },
      { total: notes.length, stars: 0, comments: 0, shares: 0, views: 0 }
    );
  }
};
