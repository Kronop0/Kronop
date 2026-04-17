import { useState, useCallback, useEffect } from 'react';
import { getLongVideos, initializeChunkManager, cleanupVideoResources, preloadVideoChunks, Video } from '../services/videoService';

export function useLongVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedVideos = await getLongVideos();
      
      console.log(`Loaded ${fetchedVideos.length} videos from cloud`);
      
      // Preload first few chunks for better performance (DISABLED)
      // for (const video of fetchedVideos) {
      //   if (video.chunkManager) {
      //     await preloadVideoChunks(video, 0, 2);
      //   }
      // }
      
      setVideos(fetchedVideos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos');
      console.error('Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggleLike = useCallback((videoId: string) => {
    setVideos(prevVideos => {
      const updatedVideos = prevVideos.map(video => {
        if (video.id === videoId) {
          return {
            ...video,
            isLiked: !video.isLiked,
            likes: video.isLiked ? video.likes - 1 : video.likes + 1,
          };
        }
        return video;
      });
      return updatedVideos;
    });
  }, []);

  const handlePreloadVideo = useCallback(async (videoId: string) => {
    // DISABLED - Chunk manager not available
    // setVideos(prevVideos => {
    //   const video = prevVideos.find(v => v.id === videoId);
    //   if (video && video.chunkManager) {
    //     preloadVideoChunks(video, 0, 5); // Preload more chunks for selected video
    //   }
    //   return prevVideos;
    // });
  }, []);

  useEffect(() => {
    loadVideos();
    
    // Cleanup function
    return () => {
      if (videos.length > 0) {
        cleanupVideoResources(videos);
      }
    };
  }, []);

  return { 
    videos, 
    loading, 
    error, 
    toggleLike: handleToggleLike, 
    refreshVideos: loadVideos,
    preloadVideo: handlePreloadVideo
  };
}
