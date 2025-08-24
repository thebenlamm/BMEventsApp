/**
 * useLocation Hook
 * React hook for managing location state and GPS functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { locationService, LocationResult, LocationError, LocationOptions } from '../services/LocationService';

export interface LocationState {
  location: LocationResult | null;
  isLoading: boolean;
  isWatching: boolean;
  error: LocationError | null;
  hasPermission: boolean | null;
  lastUpdated: number | null;
}

export interface UseLocationOptions extends LocationOptions {
  autoFetch?: boolean;
  watchLocation?: boolean;
  onLocationUpdate?: (location: LocationResult) => void;
  onError?: (error: LocationError) => void;
}

export function useLocation(options: UseLocationOptions = {}) {
  const {
    autoFetch = false,
    watchLocation = false,
    onLocationUpdate,
    onError,
    ...locationOptions
  } = options;

  const [state, setState] = useState<LocationState>({
    location: null,
    isLoading: false,
    isWatching: false,
    error: null,
    hasPermission: null,
    lastUpdated: null,
  });

  const watchSubscriptionRef = useRef<{ remove: () => void } | null>(null);

  /**
   * Update location state
   */
  const updateLocation = useCallback((location: LocationResult) => {
    setState(prev => ({
      ...prev,
      location,
      error: null,
      lastUpdated: Date.now(),
    }));
    onLocationUpdate?.(location);
  }, [onLocationUpdate]);

  /**
   * Handle location errors
   */
  const handleError = useCallback((error: LocationError) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
      isWatching: false,
    }));
    onError?.(error);
  }, [onError]);

  /**
   * Fetch current location
   */
  const fetchLocation = useCallback(async (options?: LocationOptions) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const location = await locationService.getCurrentLocation({
        ...locationOptions,
        ...options,
      });
      
      updateLocation(location);
    } catch (error) {
      handleError(error as LocationError);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [locationOptions, updateLocation, handleError]);

  /**
   * Fetch location with fallback to default BRC location
   */
  const fetchLocationWithFallback = useCallback(async (options?: LocationOptions) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const location = await locationService.getLocationWithFallback({
        ...locationOptions,
        ...options,
      });
      
      updateLocation(location);
    } catch (error) {
      handleError(error as LocationError);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [locationOptions, updateLocation, handleError]);

  /**
   * Start watching location changes
   */
  const startWatching = useCallback(async () => {
    if (state.isWatching) return;

    setState(prev => ({ ...prev, isWatching: true, error: null }));

    const subscription = await locationService.watchLocation(
      updateLocation,
      (error) => {
        handleError(error);
        setState(prev => ({ ...prev, isWatching: false }));
      },
      locationOptions
    );

    if (subscription) {
      watchSubscriptionRef.current = subscription;
    } else {
      setState(prev => ({ ...prev, isWatching: false }));
    }
  }, [state.isWatching, updateLocation, handleError, locationOptions]);

  /**
   * Stop watching location changes
   */
  const stopWatching = useCallback(() => {
    if (watchSubscriptionRef.current) {
      watchSubscriptionRef.current.remove();
      watchSubscriptionRef.current = null;
    }
    setState(prev => ({ ...prev, isWatching: false }));
  }, []);

  /**
   * Check location permission
   */
  const checkPermission = useCallback(async () => {
    const permissionInfo = await locationService.checkLocationPermission();
    setState(prev => ({
      ...prev,
      hasPermission: permissionInfo.hasPermission,
    }));
    return permissionInfo;
  }, []);

  /**
   * Request location permission
   */
  const requestPermission = useCallback(async () => {
    const granted = await locationService.requestLocationPermission();
    setState(prev => ({
      ...prev,
      hasPermission: granted,
    }));
    return granted;
  }, []);

  /**
   * Clear location cache
   */
  const clearCache = useCallback(async () => {
    await locationService.clearLocationCache();
    setState(prev => ({
      ...prev,
      location: null,
      error: null,
      lastUpdated: null,
    }));
  }, []);

  /**
   * Get default BRC location
   */
  const getDefaultLocation = useCallback(() => {
    const defaultLocation = locationService.getDefaultLocation();
    updateLocation(defaultLocation);
    return defaultLocation;
  }, [updateLocation]);

  // Auto-fetch location on mount if requested
  useEffect(() => {
    if (autoFetch) {
      fetchLocationWithFallback();
    }
  }, [autoFetch, fetchLocationWithFallback]);

  // Start watching location if requested
  useEffect(() => {
    if (watchLocation) {
      startWatching();
    }

    return () => {
      if (watchLocation) {
        stopWatching();
      }
    };
  }, [watchLocation, startWatching, stopWatching]);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    // State
    ...state,
    
    // Actions
    fetchLocation,
    fetchLocationWithFallback,
    startWatching,
    stopWatching,
    checkPermission,
    requestPermission,
    clearCache,
    getDefaultLocation,
    
    // Utilities
    formatLocation: (location?: LocationResult) => 
      locationService.formatLocation(location || state.location!),
    isLocationInBRC: (location?: LocationResult) =>
      locationService.isLocationInBRC((location || state.location)?.coords!),
    
    // Computed values
    hasLocation: state.location !== null,
    isDefaultLocation: state.location?.source === 'default',
    isCachedLocation: state.location?.source === 'cache',
    isGPSLocation: state.location?.source === 'gps',
    locationAge: state.lastUpdated ? Date.now() - state.lastUpdated : null,
  };
}

export default useLocation;