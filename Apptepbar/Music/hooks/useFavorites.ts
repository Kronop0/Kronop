import { useState, useCallback } from 'react';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = useCallback((songId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(songId)) {
        newFavorites.delete(songId);
      } else {
        newFavorites.add(songId);
      }
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback((songId: string) => {
    return favorites.has(songId);
  }, [favorites]);

  const getFavoriteCount = useCallback(() => {
    return favorites.size;
  }, [favorites]);

  return {
    favorites: Array.from(favorites),
    toggleFavorite,
    isFavorite,
    getFavoriteCount,
  };
}
