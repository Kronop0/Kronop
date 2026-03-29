// Database Index - Central hub for all database operations

// Export individual tool screens for direct navigation
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
};

// Database API Handler
export const DatabaseAPI = {
  getPhotos: async () => {
    try {
      const response = await fetch(`${DATABASE_CONFIG.BASE_URL}${DATABASE_CONFIG.ENDPOINTS.PHOTOS}`);
      return response.json();
    } catch (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }
  },
  
  getVideos: async () => {
    try {
      const response = await fetch(`${DATABASE_CONFIG.BASE_URL}${DATABASE_CONFIG.ENDPOINTS.VIDEOS}`);
      return response.json();
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },
  
  getStories: async () => {
    try {
      const response = await fetch(`${DATABASE_CONFIG.BASE_URL}${DATABASE_CONFIG.ENDPOINTS.STORIES}`);
      return response.json();
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  },
  
  getLiveStreams: async () => {
    try {
      const response = await fetch(`${DATABASE_CONFIG.BASE_URL}${DATABASE_CONFIG.ENDPOINTS.LIVE}`);
      return response.json();
    } catch (error) {
      console.error('Error fetching live streams:', error);
      throw error;
    }
  },
  
  getReels: async () => {
    try {
      const response = await fetch(`${DATABASE_CONFIG.BASE_URL}${DATABASE_CONFIG.ENDPOINTS.REELS}`);
      return response.json();
    } catch (error) {
      console.error('Error fetching reels:', error);
      throw error;
    }
  },
  
  getSongs: async () => {
    try {
      const response = await fetch(`${DATABASE_CONFIG.BASE_URL}${DATABASE_CONFIG.ENDPOINTS.SONGS}`);
      return response.json();
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw error;
    }
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
  }
};
