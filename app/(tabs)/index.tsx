/**
 * Burning Man Events - Main Events Screen
 * Desert-optimized event discovery interface
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import EventFilters, { FilterOptions } from '@/components/EventFilters';
import CountdownTimer from '@/components/CountdownTimer';
import QuickActions from '@/components/QuickActions';
import NotificationSettings from '@/components/NotificationSettings';
import { Colors, Spacing, Typography, TouchTargets, AppConfig } from '@/constants/Theme';
import { eventProcessor } from '@/services/EventProcessor';
import { formatTimeRange, getCountdownInfo } from '@/utils/timeUtils';
import { formatDistance } from '@/utils/brcGeo';
import { useLocation } from '@/hooks/useLocation';
import { useFavorites } from '@/hooks/useFavorites';
import { ProcessedEvent, LoadingState, DataError, SearchParams } from '@/types/events';

export default function EventsScreen() {
  const [events, setEvents] = useState<ProcessedEvent[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    isRefreshing: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    eventTypes: ['prty', 'food', 'tea', 'arts', 'work', 'kid', 'adlt', 'othr'],
    radius: AppConfig.defaultRadius,
    timeWindow: AppConfig.defaultTimeWindow,
    showOnlyActive: false,
    showOnlyUpcoming: false,
    showOnlyFavorites: false,
    sortBy: 'default',
  });

  // Location services integration
  const {
    location,
    isLoading: isLocationLoading,
    fetchLocationWithFallback,
    hasLocation,
    isDefaultLocation,
  } = useLocation({
    autoFetch: true,
    fallbackToDefault: true,
  });

  // Favorites integration
  const { isFavorite, toggleFavorite } = useFavorites();


  // Load events function that doesn't depend on location state
  const loadEventsWithLocation = useCallback(async (refreshing = false, userLocation?: any) => {
    try {
      setLoadingState(prev => ({
        ...prev,
        isLoading: !refreshing,
        isRefreshing: refreshing,
        error: undefined,
      }));

      // Use provided location or get current location from hook
      const currentLocation = userLocation || location;
      
      const searchParams: SearchParams = {
        lat: currentLocation?.coords.lat,
        lon: currentLocation?.coords.lon,
        radius: filters.radius,
        window: filters.timeWindow,
        year: AppConfig.defaultYear,
        now: new Date(),
        eventTypes: filters.eventTypes,
        showOnlyActive: filters.showOnlyActive,
        showOnlyUpcoming: filters.showOnlyUpcoming,
        showOnlyFavorites: filters.showOnlyFavorites,
      };

      const processedEvents = await eventProcessor.processEvents(searchParams);

      // Sort events based on selected criteria
      const sortedEvents = eventProcessor.sortEvents(processedEvents, filters.sortBy);
      
      // Take first 20 events for initial display
      setEvents(sortedEvents.slice(0, 20));

    } catch (error) {
      console.error('Error loading events:', error);
      const dataError: DataError = {
        type: 'network',
        message: error instanceof Error ? error.message : 'Failed to load events',
        details: error,
      };
      
      setLoadingState(prev => ({
        ...prev,
        error: dataError,
      }));

      Alert.alert(
        'Loading Error',
        'Failed to load events. Please check your connection and try again.',
        [
          { text: 'Retry', onPress: () => loadEventsWithLocation(refreshing, userLocation) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } finally {
      setLoadingState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
      }));
    }
  }, [filters, location]); // Depend on filters and location to reload when they change

  // Load events on component mount and when location changes
  useEffect(() => {
    if (hasLocation || isDefaultLocation) {
      loadEventsWithLocation();
    }
  }, [hasLocation, isDefaultLocation, loadEventsWithLocation]);


  const handleRefresh = useCallback(() => {
    loadEventsWithLocation(true);
  }, [loadEventsWithLocation]);

  const handleFiltersChange = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
  }, []);

  const handleQuickAction = useCallback((quickFilters: Partial<FilterOptions>) => {
    const mergedFilters: FilterOptions = {
      ...filters,
      ...quickFilters,
    };
    setFilters(mergedFilters);
  }, [filters]);

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.showOnlyActive) count++;
    if (filters.showOnlyUpcoming) count++;
    if (filters.showOnlyFavorites) count++;
    if (filters.eventTypes.length < 8) count++; // Not all types selected
    if (filters.radius < 999999) count++; // Not "All" distance
    if (filters.timeWindow < 999999) count++; // Not "All time"
    if (filters.sortBy !== 'default') count++; // Not default sort
    return count;
  }, [filters]);

  // Helper functions for UI display
  const getEventTypeColor = (typeAbbr: string) => {
    const colorMap = {
      'prty': Colors.eventParty,
      'food': Colors.eventFood,
      'tea': Colors.eventDrinks,
      'arts': Colors.eventArts,
      'work': Colors.eventWork,
      'kid': Colors.eventKid,
      'adlt': Colors.eventAdult,
      'othr': Colors.eventOther,
    };
    return colorMap[typeAbbr as keyof typeof colorMap] || Colors.eventOther;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      'NOW': Colors.statusLive,
      'SOON': Colors.statusSoon,
      'UPCOMING': Colors.statusUpcoming,
      'ENDED': Colors.statusEnded,
    };
    return colorMap[status as keyof typeof colorMap] || Colors.statusUpcoming;
  };

  const getStatusIcon = (status: string) => {
    const iconMap = {
      'NOW': '🔴',
      'SOON': '⚡',
      'UPCOMING': '📅',
      'ENDED': '⏹️',
    };
    return iconMap[status as keyof typeof iconMap] || '📅';
  };

  const getStatusLabel = (status: string) => {
    const labelMap = {
      'NOW': 'LIVE',
      'SOON': 'Soon',
      'UPCOMING': 'Upcoming',
      'ENDED': 'Ended',
    };
    return labelMap[status as keyof typeof labelMap] || 'Upcoming';
  };


  if (loadingState.isLoading) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar style="light" backgroundColor={Colors.playaPurple} />
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Playa Events 🔥
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Burning Man 2025
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.playaOrange} />
          <ThemedText style={styles.loadingText}>
            Loading events from the Playa...
          </ThemedText>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" backgroundColor={Colors.playaPurple} />
      
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Playa Events 🔥
        </ThemedText>
        <ThemedView style={styles.headerRow}>
          <ThemedText style={styles.headerSubtitle}>
            Burning Man 2025 • {events.length} events
          </ThemedText>
          <ThemedView style={styles.headerButtons}>
            <TouchableOpacity
              onPress={() => setShowNotifications(true)}
              style={styles.notificationButton}
            >
              <ThemedText style={styles.notificationButtonText}>🔔</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowFilters(true)}
              style={[
                styles.filterButton,
                getActiveFiltersCount() > 0 && styles.filterButtonActive,
              ]}
            >
              <ThemedText style={[
                styles.filterButtonText,
                getActiveFiltersCount() > 0 && styles.filterButtonTextActive,
              ]}>
                🔍 {getActiveFiltersCount() > 0 ? `${getActiveFiltersCount()}` : 'Filter'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
        
        {/* Location Status */}
        <ThemedView style={styles.locationStatus}>
          <ThemedView style={styles.locationRow}>
            {isLocationLoading ? (
              <ThemedText style={styles.locationText}>
                📡 Getting location...
              </ThemedText>
            ) : hasLocation ? (
              <ThemedText style={styles.locationText}>
                {location?.source === 'gps' ? '📡' : location?.source === 'cache' ? '📍' : '🏜️'}{' '}
                {location && `±${Math.round(location.accuracy)}m`}
                {isDefaultLocation && ' (Default BRC)'}
              </ThemedText>
            ) : (
              <ThemedText style={[styles.locationText, styles.locationError]}>
                ❌ No location
              </ThemedText>
            )}
            
            <TouchableOpacity
              onPress={async () => {
                try {
                  const newLocation = await fetchLocationWithFallback();
                  loadEventsWithLocation(true, newLocation); // Reload events with new location
                } catch {
                  Alert.alert(
                    'Location Error',
                    'Failed to get location. Using default Black Rock City location.',
                    [{ text: 'OK' }]
                  );
                }
              }}
              style={styles.locationRefreshButton}
              disabled={isLocationLoading}
            >
              <ThemedText style={styles.locationRefreshText}>
                {isLocationLoading ? '⏳' : '🔄'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>

      {/* Quick Actions */}
      <QuickActions onActionPress={handleQuickAction} />

      {/* Events List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loadingState.isRefreshing}
            onRefresh={handleRefresh}
            colors={[Colors.playaOrange, Colors.playaGold]}
            tintColor={Colors.playaOrange}
            title="Pull to refresh events"
            titleColor={Colors.brightWhite}
          />
        }
      >
        {events.map((event) => {
          const countdown = getCountdownInfo(event.start, event.end);
          const eventTypeColor = getEventTypeColor(event.typeAbbr);
          const statusColor = getStatusColor(event.status);
          
          return (
            <ThemedView key={event.id} style={[
              styles.eventCard,
              event.status === 'NOW' && styles.eventCardActive,
              countdown.isStartingSoon && styles.eventCardSoon,
            ]}>
              <ThemedView style={styles.eventHeader}>
                <ThemedText type="defaultSemiBold" style={styles.eventTitle}>
                  {event.title}
                </ThemedText>
                <ThemedView style={[
                  styles.eventTypeBadge,
                  { backgroundColor: eventTypeColor }
                ]}>
                  <ThemedText style={styles.eventTypeText}>
                    {event.type}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
              
              {/* Status and countdown */}
              <ThemedView style={styles.statusRow}>
                <ThemedView style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor }
                ]}>
                  <ThemedText style={styles.statusText}>
                    {getStatusIcon(event.status)} {getStatusLabel(event.status)}
                  </ThemedText>
                </ThemedView>
                
                <CountdownTimer
                  start={event.start}
                  end={event.end}
                  textStyle={styles.countdownText}
                  urgentStyle={styles.countdownUrgent}
                />
              </ThemedView>
              
              <ThemedText style={styles.eventLocation}>
                📍 {event.locLabel}
                {event.distance !== null && (
                  <ThemedText style={styles.distanceText}>
                    {' • '}{formatDistance(event.distance)}
                  </ThemedText>
                )}
              </ThemedText>
              
              <ThemedText style={styles.eventDescription} numberOfLines={3}>
                {event.description}
              </ThemedText>
              
              <ThemedView style={styles.eventFooter}>
                <ThemedText style={styles.eventTime}>
                  ⏰ {formatTimeRange(event.start, event.end, true)}
                </ThemedText>
                <ThemedView style={styles.eventFooterRight}>
                  {event.isRecurring && event.futureOccurrences && (
                    <ThemedView style={styles.recurringBadge}>
                      <ThemedText style={styles.recurringText}>
                        🔄 {event.futureOccurrences}
                      </ThemedText>
                    </ThemedView>
                  )}
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        await toggleFavorite({
                          id: event.id,
                          eventUid: event.eventUid,
                          title: event.title,
                          start: event.start,
                          end: event.end,
                          type: event.type,
                          typeAbbr: event.typeAbbr,
                          locLabel: event.locLabel,
                        });
                      } catch (error) {
                        Alert.alert('Error', 'Failed to update favorite');
                      }
                    }}
                    style={[
                      styles.favoriteButton,
                      isFavorite(event.id) && styles.favoriteButtonActive,
                    ]}
                  >
                    <ThemedText style={[
                      styles.favoriteButtonText,
                      isFavorite(event.id) && styles.favoriteButtonTextActive,
                    ]}>
                      {isFavorite(event.id) ? '⭐' : '☆'}
                    </ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          );
        })}
        
        {events.length === 0 && !loadingState.isLoading && (
          <ThemedView style={styles.emptyState}>
            <ThemedText type="title" style={styles.emptyTitle}>
              🏜️ No Events Found
            </ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Try adjusting your filters or pull to refresh
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>

      {/* Event Filters Modal */}
      <EventFilters
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        hasLocation={hasLocation}
      />

      {/* Notification Settings Modal */}
      <NotificationSettings
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.playaPurple,
  },
  
  header: {
    backgroundColor: Colors.playaPurple,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: Typography.titleLarge,
    fontWeight: 'bold',
    color: Colors.playaGold,
    textAlign: 'center',
    textShadowColor: Colors.nightBlack,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    width: '100%',
  },

  headerSubtitle: {
    fontSize: Typography.bodyMedium,
    color: Colors.brightWhite,
    opacity: 0.9,
    flex: 1,
  },

  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  notificationButton: {
    width: TouchTargets.minButton,
    height: TouchTargets.minButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: TouchTargets.minButton / 2,
    backgroundColor: Colors.overlay,
    borderWidth: 1,
    borderColor: Colors.dustGray,
  },

  notificationButtonText: {
    fontSize: Typography.bodyMedium,
    color: Colors.dustGray,
  },

  filterButton: {
    backgroundColor: Colors.overlay,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dustGray,
  },

  filterButtonActive: {
    backgroundColor: Colors.playaOrange,
    borderColor: Colors.playaOrange,
  },

  filterButtonText: {
    fontSize: Typography.bodySmall,
    color: Colors.dustGray,
    fontWeight: '600',
  },

  filterButtonTextActive: {
    color: Colors.brightWhite,
    fontWeight: 'bold',
  },
  
  locationStatus: {
    marginTop: Spacing.xs,
    alignItems: 'center',
  },
  
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  
  locationText: {
    fontSize: Typography.bodySmall,
    color: Colors.desertTan,
    textAlign: 'center',
    opacity: 0.8,
  },
  
  locationError: {
    color: Colors.danger,
  },
  
  locationRefreshButton: {
    backgroundColor: Colors.overlay,
    borderRadius: 16,
    padding: Spacing.xs,
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  locationRefreshText: {
    fontSize: Typography.labelMedium,
    color: Colors.brightWhite,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  
  loadingText: {
    marginTop: Spacing.lg,
    fontSize: Typography.bodyLarge,
    color: Colors.brightWhite,
    textAlign: 'center',
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  
  eventCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.playaOrange,
    shadowColor: Colors.nightBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  eventCardActive: {
    borderLeftColor: Colors.statusLive,
    backgroundColor: 'rgba(255, 255, 255, 1)',
  },
  
  eventCardSoon: {
    borderLeftColor: Colors.statusSoon,
  },
  
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  
  eventTitle: {
    flex: 1,
    fontSize: Typography.titleSmall,
    color: Colors.nightBlack,
    marginRight: Spacing.sm,
    lineHeight: Typography.lineHeightTight * Typography.titleSmall,
  },
  
  eventTypeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: 12,
    minHeight: TouchTargets.minCheckbox / 2,
  },
  
  eventTypeText: {
    fontSize: Typography.labelSmall,
    color: Colors.brightWhite,
    fontWeight: 'bold',
  },
  
  eventLocation: {
    fontSize: Typography.bodySmall,
    color: Colors.dustGray,
    marginBottom: Spacing.sm,
  },
  
  eventDescription: {
    fontSize: Typography.bodyMedium,
    color: Colors.nightBlack,
    lineHeight: Typography.lineHeightNormal * Typography.bodyMedium,
    marginBottom: Spacing.sm,
  },
  
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  eventFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  
  eventTime: {
    fontSize: Typography.bodySmall,
    color: Colors.dustGray,
    fontWeight: '500',
  },
  
  recurringBadge: {
    backgroundColor: Colors.statusUpcoming,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: 8,
  },
  
  recurringText: {
    fontSize: Typography.labelSmall,
    color: Colors.brightWhite,
    fontWeight: 'bold',
  },
  
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: 12,
    minHeight: TouchTargets.minCheckbox / 2,
  },
  
  statusText: {
    fontSize: Typography.labelSmall,
    color: Colors.brightWhite,
    fontWeight: 'bold',
  },
  
  countdownText: {
    fontSize: Typography.bodySmall,
    color: Colors.dustGray,
    fontWeight: '600',
  },
  
  countdownUrgent: {
    color: Colors.statusLive,
    fontWeight: 'bold',
  },
  
  distanceText: {
    color: Colors.info,
    fontWeight: '500',
  },

  favoriteButton: {
    width: TouchTargets.minButton,
    height: TouchTargets.minButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: TouchTargets.minButton / 2,
    backgroundColor: Colors.overlay,
    borderWidth: 1,
    borderColor: Colors.dustGray,
  },

  favoriteButtonActive: {
    backgroundColor: Colors.playaGold,
    borderColor: Colors.playaGold,
  },

  favoriteButtonText: {
    fontSize: Typography.titleSmall,
    color: Colors.dustGray,
  },

  favoriteButtonTextActive: {
    color: Colors.nightBlack,
  },
  
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  
  emptyTitle: {
    fontSize: Typography.titleMedium,
    color: Colors.brightWhite,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  
  emptySubtitle: {
    fontSize: Typography.bodyMedium,
    color: Colors.desertTan,
    textAlign: 'center',
    lineHeight: Typography.lineHeightNormal * Typography.bodyMedium,
  },
});