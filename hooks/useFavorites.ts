/**
 * useFavorites Hook
 * React hook for managing favorites state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { favoritesService } from '../services/FavoritesService';
import { FavoriteEvent } from '../types/events';

export interface FavoritesState {
  favorites: FavoriteEvent[];
  favoriteIds: Set<string>;
  isLoading: boolean;
  error: string | null;
  count: number;
}

export interface UseFavoritesResult extends FavoritesState {
  // Actions
  addFavorite: (event: {
    id: string;
    eventUid: string;
    title: string;
    start: Date;
    end: Date;
    type: string;
    typeAbbr: string;
    locLabel: string;
  }) => Promise<void>;
  removeFavorite: (eventId: string) => Promise<void>;
  toggleFavorite: (event: {
    id: string;
    eventUid: string;
    title: string;
    start: Date;
    end: Date;
    type: string;
    typeAbbr: string;
    locLabel: string;
  }) => Promise<boolean>;
  clearAllFavorites: () => Promise<void>;
  refreshFavorites: () => Promise<void>;

  // Utilities
  isFavorite: (eventId: string) => boolean;
  getFavoritesByType: (typeAbbr: string) => FavoriteEvent[];
  getUpcomingFavorites: () => FavoriteEvent[];
  getFavoritesCount: () => Promise<number>;
  exportFavorites: () => Promise<string>;
}

export function useFavorites(): UseFavoritesResult {
  const [state, setState] = useState<FavoritesState>({
    favorites: [],
    favoriteIds: new Set(),
    isLoading: true,
    error: null,
    count: 0,
  });

  /**
   * Load favorites from storage
   */
  const loadFavorites = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const favorites = await favoritesService.getFavorites();
      const favoriteIds = await favoritesService.getFavoriteIds();
      
      setState(prev => ({
        ...prev,
        favorites,
        favoriteIds,
        count: favorites.length,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load favorites',
        isLoading: false,
      }));
    }
  }, []);

  /**
   * Add event to favorites
   */
  const addFavorite = useCallback(async (event: {
    id: string;
    eventUid: string;
    title: string;
    start: Date;
    end: Date;
    type: string;
    typeAbbr: string;
    locLabel: string;
  }) => {
    try {
      await favoritesService.addFavorite(event);
      await loadFavorites(); // Refresh state
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to add favorite',
      }));
    }
  }, [loadFavorites]);

  /**
   * Remove event from favorites
   */
  const removeFavorite = useCallback(async (eventId: string) => {
    try {
      await favoritesService.removeFavorite(eventId);
      await loadFavorites(); // Refresh state
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to remove favorite',
      }));
    }
  }, [loadFavorites]);

  /**
   * Toggle favorite status
   */
  const toggleFavorite = useCallback(async (event: {
    id: string;
    eventUid: string;
    title: string;
    start: Date;
    end: Date;
    type: string;
    typeAbbr: string;
    locLabel: string;
  }): Promise<boolean> => {
    try {
      const isFavorited = await favoritesService.toggleFavorite(event);
      await loadFavorites(); // Refresh state
      return isFavorited;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to toggle favorite',
      }));
      return false;
    }
  }, [loadFavorites]);

  /**
   * Clear all favorites
   */
  const clearAllFavorites = useCallback(async () => {
    try {
      await favoritesService.clearAllFavorites();
      setState(prev => ({
        ...prev,
        favorites: [],
        favoriteIds: new Set(),
        count: 0,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to clear favorites',
      }));
    }
  }, []);

  /**
   * Refresh favorites
   */
  const refreshFavorites = useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);

  /**
   * Check if event is favorited
   */
  const isFavorite = useCallback((eventId: string): boolean => {
    return state.favoriteIds.has(eventId);
  }, [state.favoriteIds]);

  /**
   * Get favorites by type
   */
  const getFavoritesByType = useCallback((typeAbbr: string): FavoriteEvent[] => {
    return state.favorites.filter(fav => fav.typeAbbr === typeAbbr);
  }, [state.favorites]);

  /**
   * Get upcoming favorites
   */
  const getUpcomingFavorites = useCallback((): FavoriteEvent[] => {
    const now = new Date();
    return state.favorites.filter(fav => new Date(fav.end) > now);
  }, [state.favorites]);

  /**
   * Get count of favorites
   */
  const getFavoritesCount = useCallback((): Promise<number> => {
    return favoritesService.getFavoritesCount();
  }, []);

  /**
   * Export favorites
   */
  const exportFavorites = useCallback((): Promise<string> => {
    return favoritesService.exportFavorites();
  }, []);

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    // State
    ...state,
    
    // Actions
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearAllFavorites,
    refreshFavorites,
    
    // Utilities
    isFavorite,
    getFavoritesByType,
    getUpcomingFavorites,
    getFavoritesCount,
    exportFavorites,
  };
}

export default useFavorites;
