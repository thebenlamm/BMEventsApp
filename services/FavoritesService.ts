/**
 * Favorites Service for Burning Man Events
 * Handles persistent storage and management of favorite events
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { FavoriteEvent, EventTypeAbbr } from '../types/events';
import { notificationService } from './NotificationService';

const FAVORITES_STORAGE_KEY = 'bm_favorites_v1';

export class FavoritesService {
  private favorites: Set<string> = new Set(); // Event IDs for quick lookup
  private favoriteEvents: FavoriteEvent[] = [];
  private isInitialized = false;

  /**
   * Initialize favorites from storage
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        this.favoriteEvents = JSON.parse(storedFavorites);
        this.favorites = new Set(this.favoriteEvents.map(fav => fav.id));
      }
      this.isInitialized = true;
    } catch (error) {
      console.error('Error loading favorites from storage:', error);
      this.favoriteEvents = [];
      this.favorites = new Set();
      this.isInitialized = true;
    }
  }

  /**
   * Save favorites to persistent storage
   */
  private async saveFavorites(): Promise<void> {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(this.favoriteEvents));
    } catch (error) {
      console.error('Error saving favorites to storage:', error);
      throw new Error('Failed to save favorites');
    }
  }

  /**
   * Add event to favorites
   */
  async addFavorite(event: {
    id: string;
    eventUid: string;
    title: string;
    start: Date;
    end: Date;
    type: string;
    typeAbbr: string;
    locLabel: string;
  }): Promise<void> {
    await this.initialize();

    if (this.favorites.has(event.id)) {
      return; // Already favorited
    }

    const favorite: FavoriteEvent = {
      id: event.id,
      eventUid: event.eventUid,
      title: event.title,
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      type: event.type,
      typeAbbr: event.typeAbbr as EventTypeAbbr,
      locLabel: event.locLabel,
      addedAt: new Date().toISOString(),
    };

    this.favoriteEvents.push(favorite);
    this.favorites.add(event.id);
    await this.saveFavorites();
    
    // Schedule notification for the new favorite (don't fail the entire operation)
    try {
      await notificationService.scheduleEventNotification(favorite);
    } catch (error) {
      console.warn('Favorite saved but notification scheduling failed:', error);
    }
  }

  /**
   * Remove event from favorites
   */
  async removeFavorite(eventId: string): Promise<void> {
    await this.initialize();

    if (!this.favorites.has(eventId)) {
      return; // Not favorited
    }

    this.favoriteEvents = this.favoriteEvents.filter(fav => fav.id !== eventId);
    this.favorites.delete(eventId);
    await this.saveFavorites();
    
    // Cancel notification for the removed favorite (don't fail the entire operation)
    try {
      await notificationService.cancelEventNotification(eventId);
    } catch (error) {
      console.warn('Favorite removed but notification cancelation failed:', error);
    }
  }

  /**
   * Toggle favorite status of an event
   */
  async toggleFavorite(event: {
    id: string;
    eventUid: string;
    title: string;
    start: Date;
    end: Date;
    type: string;
    typeAbbr: string;
    locLabel: string;
  }): Promise<boolean> {
    await this.initialize();

    if (this.favorites.has(event.id)) {
      await this.removeFavorite(event.id);
      return false; // No longer favorited
    } else {
      await this.addFavorite(event);
      return true; // Now favorited
    }
  }

  /**
   * Check if an event is favorited
   */
  async isFavorite(eventId: string): Promise<boolean> {
    await this.initialize();
    return this.favorites.has(eventId);
  }

  /**
   * Get all favorite events
   */
  async getFavorites(): Promise<FavoriteEvent[]> {
    await this.initialize();
    return [...this.favoriteEvents].sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );
  }

  /**
   * Get favorites count
   */
  async getFavoritesCount(): Promise<number> {
    await this.initialize();
    return this.favoriteEvents.length;
  }

  /**
   * Get favorite event IDs for filtering
   */
  async getFavoriteIds(): Promise<Set<string>> {
    await this.initialize();
    return new Set(this.favorites);
  }

  /**
   * Clear all favorites
   */
  async clearAllFavorites(): Promise<void> {
    this.favoriteEvents = [];
    this.favorites = new Set();
    await this.saveFavorites();
  }

  /**
   * Get favorites by event type
   */
  async getFavoritesByType(typeAbbr: string): Promise<FavoriteEvent[]> {
    await this.initialize();
    return this.favoriteEvents.filter(fav => fav.typeAbbr === typeAbbr);
  }

  /**
   * Get upcoming favorites (events that haven't ended)
   */
  async getUpcomingFavorites(): Promise<FavoriteEvent[]> {
    await this.initialize();
    const now = new Date();
    return this.favoriteEvents.filter(fav => new Date(fav.end) > now);
  }

  /**
   * Export favorites for backup
   */
  async exportFavorites(): Promise<string> {
    await this.initialize();
    return JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      favorites: this.favoriteEvents,
    }, null, 2);
  }

  /**
   * Import favorites from backup
   */
  async importFavorites(jsonData: string, merge: boolean = true): Promise<number> {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.favorites || !Array.isArray(data.favorites)) {
        throw new Error('Invalid favorites data format');
      }

      await this.initialize();

      if (!merge) {
        await this.clearAllFavorites();
      }

      let importedCount = 0;
      for (const favorite of data.favorites) {
        // Validate favorite object structure
        if (favorite.id && favorite.title && favorite.start && favorite.end) {
          if (!this.favorites.has(favorite.id)) {
            this.favoriteEvents.push(favorite);
            this.favorites.add(favorite.id);
            importedCount++;
          }
        }
      }

      await this.saveFavorites();
      return importedCount;
    } catch (error) {
      console.error('Error importing favorites:', error);
      throw new Error('Failed to import favorites: Invalid data format');
    }
  }

  /**
   * Clean up expired favorites (events that ended over 30 days ago)
   */
  async cleanupExpiredFavorites(): Promise<number> {
    await this.initialize();
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const originalCount = this.favoriteEvents.length;
    
    this.favoriteEvents = this.favoriteEvents.filter(fav => 
      new Date(fav.end) > thirtyDaysAgo
    );
    
    // Rebuild favorites set
    this.favorites = new Set(this.favoriteEvents.map(fav => fav.id));
    
    const removedCount = originalCount - this.favoriteEvents.length;
    
    if (removedCount > 0) {
      await this.saveFavorites();
    }
    
    return removedCount;
  }
}

// Export singleton instance
export const favoritesService = new FavoritesService();
export default favoritesService;