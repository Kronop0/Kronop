import { useState, useEffect } from 'react';
import { Video } from '../types';
import { listR2Videos, isR2Configured } from '../services/r2Service';

// In-memory cache for likes/saves (since R2 is read-only for metadata)
const videoInteractions: Map<
  string,
  { isLiked?: boolean; isSaved?: boolean; likes?: number }
> = new Map();

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if R2 is configured
      if (!isR2Configured()) {
        console.warn("R2 not configured. Check .env file for R2 credentials.");
        setVideos([]);
        return;
      }

      console.log("Fetching videos from R2 cloud storage...");
      
      // Fetch list from R2
      const data = await listR2Videos();

      // Apply cached interactions
      data.forEach((video) => {
        const interactions = videoInteractions.get(video.id);
        if (interactions) {
          video.isLiked = interactions.isLiked || false;
          video.isSaved = interactions.isSaved || false;
          if (interactions.likes !== undefined) {
            video.likes = interactions.likes;
          }
        }
      });

      setVideos(data);
    } catch (err) {
      console.error('Error loading videos:', err);
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (videoId: string) => {
    try {
      const interactions = videoInteractions.get(videoId) || {};
      const newIsLiked = !interactions.isLiked;
      const currentLikes =
        interactions.likes || Math.floor(Math.random() * 1000);

      videoInteractions.set(videoId, {
        ...interactions,
        isLiked: newIsLiked,
        likes: newIsLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1),
      });

      // Update local state
      setVideos(prevVideos => 
        prevVideos.map(v => {
          if (v.id === videoId) {
            return {
              ...v,
              isLiked: newIsLiked,
              likes: newIsLiked ? currentLikes + 1 : Math.max(0, currentLikes - 1),
            };
          }
          return v;
        })
      );
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const toggleSave = async (videoId: string) => {
    try {
      const interactions = videoInteractions.get(videoId) || {};

      videoInteractions.set(videoId, {
        ...interactions,
        isSaved: !interactions.isSaved,
      });

      // Update local state
      setVideos(prevVideos => 
        prevVideos.map(v => {
          if (v.id === videoId) {
            return {
              ...v,
              isSaved: !v.isSaved,
            };
          }
          return v;
        })
      );
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  return {
    videos,
    loading,
    error,
    toggleLike,
    toggleSave,
    refresh: loadVideos,
  };
}
