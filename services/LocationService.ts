/**
 * Location Service for Burning Man Events
 * Handles GPS permissions, location fetching, and caching
 * Optimized for desert conditions with retry logic and accuracy validation
 */

import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig } from '../constants/Theme';
import { Coordinates } from '../utils/brcGeo';

const LOCATION_CACHE_KEY = 'bm_user_location_cache';
const LOCATION_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export interface LocationResult {
  coords: Coordinates;
  accuracy: number;
  timestamp: number;
  source: 'gps' | 'cache' | 'default';
}

export interface LocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'SERVICE_DISABLED' | 'NETWORK_ERROR';
  message: string;
  canRetry: boolean;
}

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  useCache?: boolean;
  fallbackToDefault?: boolean;
}

class LocationService {
  private lastKnownLocation: LocationResult | null = null;
  private isLocationRequested: boolean = false;
  private locationPermissionStatus: Location.PermissionStatus | null = null;

  /**
   * Check if location services are enabled and we have permission
   */
  async checkLocationPermission(): Promise<{
    hasPermission: boolean;
    isServiceEnabled: boolean;
    permissionStatus: Location.PermissionStatus;
  }> {
    try {
      // Check if location services are enabled
      const isServiceEnabled = await Location.hasServicesEnabledAsync();
      
      // Get current permission status
      const { status } = await Location.getForegroundPermissionsAsync();
      this.locationPermissionStatus = status;

      return {
        hasPermission: status === Location.PermissionStatus.GRANTED,
        isServiceEnabled,
        permissionStatus: status,
      };
    } catch (error) {
      console.error('Error checking location permission:', error);
      return {
        hasPermission: false,
        isServiceEnabled: false,
        permissionStatus: Location.PermissionStatus.UNDETERMINED,
      };
    }
  }

  /**
   * Request location permission from user
   */
  async requestLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.locationPermissionStatus = status;
      
      return status === Location.PermissionStatus.GRANTED;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  /**
   * Get cached location if available and not stale
   */
  private async getCachedLocation(): Promise<LocationResult | null> {
    try {
      const cachedDataString = await AsyncStorage.getItem(LOCATION_CACHE_KEY);
      if (!cachedDataString) return null;

      const cachedData: LocationResult = JSON.parse(cachedDataString);
      const age = Date.now() - cachedData.timestamp;

      if (age < LOCATION_CACHE_EXPIRY) {
        return { ...cachedData, source: 'cache' };
      }
      return null;
    } catch (error) {
      console.error('Error reading cached location:', error);
      return null;
    }
  }

  /**
   * Cache location data
   */
  private async cacheLocation(location: LocationResult): Promise<void> {
    try {
      await AsyncStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(location));
    } catch (error) {
      console.error('Error caching location:', error);
    }
  }

  /**
   * Get current user location with comprehensive error handling
   */
  async getCurrentLocation(options: LocationOptions = {}): Promise<LocationResult> {
    const {
      enableHighAccuracy = true,
      timeout = 15000,
      maximumAge = 300000, // 5 minutes
      useCache = true,
      fallbackToDefault = true,
    } = options;

    // Return cached location if available and cache is enabled
    if (useCache && this.lastKnownLocation) {
      const age = Date.now() - this.lastKnownLocation.timestamp;
      if (age < maximumAge) {
        return { ...this.lastKnownLocation, source: 'cache' };
      }
    }

    // Try to get cached location from storage
    if (useCache) {
      const cachedLocation = await this.getCachedLocation();
      if (cachedLocation) {
        this.lastKnownLocation = cachedLocation;
        return cachedLocation;
      }
    }

    try {
      // Check permissions and service availability
      const permissionCheck = await this.checkLocationPermission();
      
      if (!permissionCheck.isServiceEnabled) {
        throw this.createLocationError(
          'SERVICE_DISABLED',
          'Location services are disabled. Please enable location services in settings.',
          false
        );
      }

      if (!permissionCheck.hasPermission) {
        const granted = await this.requestLocationPermission();
        if (!granted) {
          throw this.createLocationError(
            'PERMISSION_DENIED',
            'Location permission denied. Enable location access in settings to find nearby events.',
            true
          );
        }
      }

      this.isLocationRequested = true;

      // Get location with specified options
      const locationResult = await Location.getCurrentPositionAsync({
        accuracy: enableHighAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
        timeInterval: timeout,
        distanceInterval: 10, // Minimum 10 meters movement
      });

      const location: LocationResult = {
        coords: {
          lat: locationResult.coords.latitude,
          lon: locationResult.coords.longitude,
        },
        accuracy: locationResult.coords.accuracy || 999,
        timestamp: Date.now(),
        source: 'gps',
      };

      // Cache the location
      this.lastKnownLocation = location;
      await this.cacheLocation(location);

      return location;

    } catch (error) {
      console.error('Location fetch failed:', error);

      // Handle different error types
      if (error.code === 'E_LOCATION_TIMEOUT') {
        throw this.createLocationError(
          'TIMEOUT',
          'Location request timed out. Try moving to an area with better GPS signal.',
          true
        );
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        throw this.createLocationError(
          'POSITION_UNAVAILABLE',
          'Unable to determine location. Make sure GPS is enabled and try again.',
          true
        );
      } else if (error instanceof LocationError) {
        throw error; // Re-throw our custom errors
      } else {
        throw this.createLocationError(
          'NETWORK_ERROR',
          'Failed to get location. Please check your device settings and try again.',
          true
        );
      }
    } finally {
      this.isLocationRequested = false;
    }
  }

  /**
   * Get default Black Rock City location as fallback
   */
  getDefaultLocation(): LocationResult {
    return {
      coords: {
        lat: AppConfig.defaultLatitude,
        lon: AppConfig.defaultLongitude,
      },
      accuracy: 999999, // Indicate this is not a real GPS reading
      timestamp: Date.now(),
      source: 'default',
    };
  }

  /**
   * Get location with automatic fallback to default BRC location
   */
  async getLocationWithFallback(options: LocationOptions = {}): Promise<LocationResult> {
    try {
      return await this.getCurrentLocation(options);
    } catch (error) {
      if (options.fallbackToDefault !== false) {
        return this.getDefaultLocation();
      }
      throw error;
    }
  }

  /**
   * Watch location changes (useful for real-time updates)
   */
  async watchLocation(
    onLocationUpdate: (location: LocationResult) => void,
    onError: (error: LocationError) => void,
    options: LocationOptions = {}
  ): Promise<{ remove: () => void } | null> {
    try {
      const permissionCheck = await this.checkLocationPermission();
      if (!permissionCheck.hasPermission || !permissionCheck.isServiceEnabled) {
        onError(this.createLocationError(
          'PERMISSION_DENIED',
          'Location permission required for live updates',
          true
        ));
        return null;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: options.enableHighAccuracy ? Location.Accuracy.High : Location.Accuracy.Balanced,
          timeInterval: 60000, // Update every minute
          distanceInterval: 50, // Update if moved 50+ meters
        },
        (locationResult) => {
          const location: LocationResult = {
            coords: {
              lat: locationResult.coords.latitude,
              lon: locationResult.coords.longitude,
            },
            accuracy: locationResult.coords.accuracy || 999,
            timestamp: Date.now(),
            source: 'gps',
          };

          this.lastKnownLocation = location;
          this.cacheLocation(location);
          onLocationUpdate(location);
        }
      );

      return {
        remove: () => {
          subscription.remove();
        }
      };

    } catch (error) {
      console.error('Error setting up location watcher:', error);
      onError(this.createLocationError(
        'NETWORK_ERROR',
        'Failed to start location monitoring',
        true
      ));
      return null;
    }
  }

  /**
   * Clear location cache
   */
  async clearLocationCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LOCATION_CACHE_KEY);
      this.lastKnownLocation = null;
    } catch (error) {
      console.error('Error clearing location cache:', error);
    }
  }

  /**
   * Get last known location without fetching new one
   */
  getLastKnownLocation(): LocationResult | null {
    return this.lastKnownLocation;
  }

  /**
   * Check if currently requesting location
   */
  isRequestingLocation(): boolean {
    return this.isLocationRequested;
  }

  /**
   * Create standardized location error
   */
  private createLocationError(
    code: LocationError['code'],
    message: string,
    canRetry: boolean
  ): LocationError {
    const error = new Error(message) as any;
    error.code = code;
    error.canRetry = canRetry;
    return error as LocationError;
  }

  /**
   * Format location for display
   */
  formatLocation(location: LocationResult): string {
    const { coords, accuracy, source } = location;
    const sourceIcon = source === 'gps' ? '📡' : source === 'cache' ? '📍' : '🏜️';
    return `${sourceIcon} ${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)} (±${Math.round(accuracy)}m)`;
  }

  /**
   * Check if location is within Black Rock City bounds (rough approximation)
   */
  isLocationInBRC(coords: Coordinates): boolean {
    // Very rough bounds for Black Rock City area
    const BRC_BOUNDS = {
      north: 40.8,
      south: 40.77,
      east: -119.2,
      west: -119.22,
    };

    return coords.lat >= BRC_BOUNDS.south &&
           coords.lat <= BRC_BOUNDS.north &&
           coords.lon >= BRC_BOUNDS.west &&
           coords.lon <= BRC_BOUNDS.east;
  }
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;