/**
 * Data Service for Burning Man Events
 * Handles JSON data loading, caching, and offline functionality
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { AppConfig } from '../constants/Theme';

// Cache keys
const CACHE_KEYS = {
  EVENTS: 'bm_events_cache',
  ART: 'bm_art_cache',
  CAMPS: 'bm_camps_cache',
  EVENTS_INDEXED: 'bm_events_indexed_cache',
  ART_INDEXED: 'bm_art_indexed_cache',
  CAMPS_INDEXED: 'bm_camps_indexed_cache',
  LAST_UPDATED: 'bm_data_last_updated',
  FAVORITES: 'bm_favorites',
  SETTINGS: 'bm_settings',
} as const;

// Local asset imports for development
const eventData = require('../assets/data/event.json');
const artData = require('../assets/data/art.json');
const campData = require('../assets/data/camp.json');
const eventIndexedData = require('../assets/data/event-indexed.json');
const artIndexedData = require('../assets/data/art-indexed.json');
const campIndexedData = require('../assets/data/camp-indexed.json');

// Data URLs (these would point to your hosted JSON files in production)
const DATA_URLS = {
  EVENTS: 'https://your-domain.com/resources/event.json',
  ART: 'https://your-domain.com/resources/art.json',
  CAMPS: 'https://your-domain.com/resources/camp.json',
  EVENTS_INDEXED: 'https://your-domain.com/resources/event-indexed.json',
  ART_INDEXED: 'https://your-domain.com/resources/art-indexed.json',
  CAMPS_INDEXED: 'https://your-domain.com/resources/camp-indexed.json',
} as const;

export interface CacheInfo {
  lastUpdated: number;
  isStale: boolean;
  hasCache: boolean;
}

class DataService {
  private artMapCache: Map<string, any> | null = null;
  private campMapCache: Map<string, any> | null = null;
  private eventMapCache: Map<string, any> | null = null;

  /**
   * Check if device is online
   */
  async isOnline(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected === true && netInfo.isInternetReachable === true;
  }

  /**
   * Get cache information
   */
  async getCacheInfo(cacheKey: string): Promise<CacheInfo> {
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      const lastUpdatedStr = await AsyncStorage.getItem(CACHE_KEYS.LAST_UPDATED);
      
      const hasCache = cachedData !== null;
      const lastUpdated = lastUpdatedStr ? parseInt(lastUpdatedStr, 10) : 0;
      const isStale = Date.now() - lastUpdated > AppConfig.maxCacheAge;

      return { lastUpdated, isStale, hasCache };
    } catch (error) {
      console.error('Error checking cache info:', error);
      return { lastUpdated: 0, isStale: true, hasCache: false };
    }
  }

  /**
   * Fetch data from URL with error handling
   */
  private async fetchFromURL(url: string): Promise<any> {
    try {
      // Create timeout with AbortController for broader compatibility
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      throw error;
    }
  }

  /**
   * Load local data (for development)
   */
  private loadLocalData(cacheKey: string): any {
    switch (cacheKey) {
      case CACHE_KEYS.EVENTS:
        return eventData;
      case CACHE_KEYS.ART:
        return artData;
      case CACHE_KEYS.CAMPS:
        return campData;
      case CACHE_KEYS.EVENTS_INDEXED:
        return eventIndexedData;
      case CACHE_KEYS.ART_INDEXED:
        return artIndexedData;
      case CACHE_KEYS.CAMPS_INDEXED:
        return campIndexedData;
      default:
        throw new Error(`Unknown cache key: ${cacheKey}`);
    }
  }

  /**
   * Load data with caching strategy
   */
  private async loadData(
    cacheKey: string, 
    url: string, 
    forceRefresh: boolean = false,
    useLocal: boolean = __DEV__ // Use local data in development
  ): Promise<any> {
    // Use local data in development
    if (useLocal) {
      return this.loadLocalData(cacheKey);
    }

    const cacheInfo = await this.getCacheInfo(cacheKey);
    const isOnline = await this.isOnline();

    // Try to use cached data if available and not stale
    if (cacheInfo.hasCache && !forceRefresh && (!cacheInfo.isStale || !isOnline)) {
      try {
        const cachedData = await AsyncStorage.getItem(cacheKey);
        if (cachedData) {
          return JSON.parse(cachedData);
        }
      } catch (error) {
        console.error(`Error loading cached data for ${cacheKey}:`, error);
      }
    }

    // Try to fetch fresh data if online
    if (isOnline) {
      try {
        const data = await this.fetchFromURL(url);
        
        // Cache the fresh data
        await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
        await AsyncStorage.setItem(CACHE_KEYS.LAST_UPDATED, Date.now().toString());
        
        return data;
      } catch (error) {
        console.error(`Error fetching fresh data for ${cacheKey}:`, error);
        
        // Fall back to cached data if available
        if (cacheInfo.hasCache) {
          const cachedData = await AsyncStorage.getItem(cacheKey);
          if (cachedData) {
            return JSON.parse(cachedData);
          }
        }
        
        throw error;
      }
    } else if (cacheInfo.hasCache) {
      // Offline but has cache
      const cachedData = await AsyncStorage.getItem(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    }

    throw new Error(`No data available for ${cacheKey} and device is offline`);
  }

  /**
   * Load events data
   */
  async loadEvents(year: number = AppConfig.defaultYear, forceRefresh: boolean = false): Promise<any[]> {
    const events = await this.loadData(CACHE_KEYS.EVENTS, DATA_URLS.EVENTS, forceRefresh);
    return events.filter((event: any) => event.year === year);
  }

  /**
   * Load art data
   */
  async loadArt(year: number = AppConfig.defaultYear, forceRefresh: boolean = false): Promise<any[]> {
    const art = await this.loadData(CACHE_KEYS.ART, DATA_URLS.ART, forceRefresh);
    return art.filter((artPiece: any) => artPiece.year === year);
  }

  /**
   * Load camps data
   */
  async loadCamps(year: number = AppConfig.defaultYear, forceRefresh: boolean = false): Promise<any[]> {
    const camps = await this.loadData(CACHE_KEYS.CAMPS, DATA_URLS.CAMPS, forceRefresh);
    return camps.filter((camp: any) => camp.year === year);
  }

  /**
   * Get indexed art data (for O(1) lookups)
   */
  async getArtMap(forceRefresh: boolean = false): Promise<Map<string, any>> {
    if (!forceRefresh && this.artMapCache) {
      return this.artMapCache;
    }

    try {
      const indexed = await this.loadData(CACHE_KEYS.ART_INDEXED, DATA_URLS.ART_INDEXED, forceRefresh);
      this.artMapCache = new Map(Object.entries(indexed));
      return this.artMapCache;
    } catch (error) {
      // Fall back to creating indexed data from regular art data
      const art = await this.loadArt();
      this.artMapCache = new Map();
      art.forEach((item: any) => {
        if (item.uid) {
          this.artMapCache!.set(item.uid, item);
        }
      });
      return this.artMapCache;
    }
  }

  /**
   * Get indexed camp data (for O(1) lookups)
   */
  async getCampMap(forceRefresh: boolean = false): Promise<Map<string, any>> {
    if (!forceRefresh && this.campMapCache) {
      return this.campMapCache;
    }

    try {
      const indexed = await this.loadData(CACHE_KEYS.CAMPS_INDEXED, DATA_URLS.CAMPS_INDEXED, forceRefresh);
      this.campMapCache = new Map(Object.entries(indexed));
      return this.campMapCache;
    } catch (error) {
      // Fall back to creating indexed data from regular camps data
      const camps = await this.loadCamps();
      this.campMapCache = new Map();
      camps.forEach((item: any) => {
        if (item.uid) {
          this.campMapCache!.set(item.uid, item);
        }
      });
      return this.campMapCache;
    }
  }

  /**
   * Get indexed event data (for O(1) lookups)
   */
  async getEventMap(forceRefresh: boolean = false): Promise<Map<string, any>> {
    if (!forceRefresh && this.eventMapCache) {
      return this.eventMapCache;
    }

    try {
      const indexed = await this.loadData(CACHE_KEYS.EVENTS_INDEXED, DATA_URLS.EVENTS_INDEXED, forceRefresh);
      this.eventMapCache = new Map(Object.entries(indexed));
      return this.eventMapCache;
    } catch (error) {
      // Fall back to creating indexed data from regular events data
      const events = await this.loadEvents();
      this.eventMapCache = new Map();
      events.forEach((item: any) => {
        if (item.uid) {
          this.eventMapCache!.set(item.uid, item);
        }
      });
      return this.eventMapCache;
    }
  }

  /**
   * Get art by ID
   */
  async getArtById(uid: string): Promise<any | null> {
    const artMap = await this.getArtMap();
    return artMap.get(uid) || null;
  }

  /**
   * Get camp by ID
   */
  async getCampById(uid: string): Promise<any | null> {
    const campMap = await this.getCampMap();
    return campMap.get(uid) || null;
  }

  /**
   * Get event by ID
   */
  async getEventById(uid: string): Promise<any | null> {
    const eventMap = await this.getEventMap();
    return eventMap.get(uid) || null;
  }

  /**
   * Save favorites to storage
   */
  async saveFavorites(favorites: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.FAVORITES, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
      throw error;
    }
  }

  /**
   * Load favorites from storage
   */
  async loadFavorites(): Promise<any[]> {
    try {
      const favoritesJson = await AsyncStorage.getItem(CACHE_KEYS.FAVORITES);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  }

  /**
   * Save app settings
   */
  async saveSettings(settings: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  /**
   * Load app settings
   */
  async loadSettings(): Promise<Record<string, any>> {
    try {
      const settingsJson = await AsyncStorage.getItem(CACHE_KEYS.SETTINGS);
      return settingsJson ? JSON.parse(settingsJson) : {};
    } catch (error) {
      console.error('Error loading settings:', error);
      return {};
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    try {
      const keys = Object.values(CACHE_KEYS);
      await AsyncStorage.multiRemove(keys);
      
      // Clear in-memory caches
      this.artMapCache = null;
      this.campMapCache = null;
      this.eventMapCache = null;
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw error;
    }
  }

  /**
   * Get cache size information
   */
  async getCacheSize(): Promise<{ totalItems: number; estimatedSizeKB: number }> {
    try {
      const keys = Object.values(CACHE_KEYS);
      const items = await AsyncStorage.multiGet(keys);
      
      let totalSize = 0;
      let totalItems = 0;
      
      items.forEach(([key, value]) => {
        if (value) {
          totalSize += value.length;
          totalItems++;
        }
      });
      
      return {
        totalItems,
        estimatedSizeKB: Math.round(totalSize / 1024)
      };
    } catch (error) {
      console.error('Error calculating cache size:', error);
      return { totalItems: 0, estimatedSizeKB: 0 };
    }
  }

  /**
   * Preload all essential data
   */
  async preloadData(year: number = AppConfig.defaultYear): Promise<void> {
    try {
      // Load all data in parallel
      await Promise.all([
        this.loadEvents(year),
        this.loadArt(year),
        this.loadCamps(year),
        this.getArtMap(),
        this.getCampMap(),
      ]);
    } catch (error) {
      console.error('Error preloading data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dataService = new DataService();
export default dataService;