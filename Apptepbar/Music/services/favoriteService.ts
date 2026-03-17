// Favorites Management Service
import { Favorite } from '../types';

class FavoriteService {
  private favorites: Map<string, Favorite> = new Map();

  // Add to favorites
  addFavorite(userId: string, songId: string): void {
    const key = `${userId}-${songId}`;
    this.favorites.set(key, {
      userId,
      songId,
      addedAt: Date.now(),
    });
  }

  // Remove from favorites
  removeFavorite(userId: string, songId: string): void {
    const key = `${userId}-${songId}`;
    this.favorites.delete(key);
  }

  // Check if favorited
  isFavorite(userId: string, songId: string): boolean {
    const key = `${userId}-${songId}`;
    return this.favorites.has(key);
  }

  // Get all favorites for user
  getUserFavorites(userId: string): Favorite[] {
    return Array.from(this.favorites.values()).filter(
      fav => fav.userId === userId
    );
  }

  // Get favorite song IDs for user
  getFavoriteSongIds(userId: string): string[] {
    return this.getUserFavorites(userId).map(fav => fav.songId);
  }

  // Get favorites count
  getFavoritesCount(userId: string): number {
    return this.getUserFavorites(userId).length;
  }
}

export const favoriteService = new FavoriteService();
