/**
 * Event Processing Service
 * Handles complex event filtering, processing, and location resolution
 * Ported from the original web app logic
 */

import { coordOf, haversineMeters } from '../utils/brcGeo';
import dataService from './DataService';
import favoritesService from './FavoritesService';
import { AppConfig } from '../constants/Theme';
import {
  RawEvent,
  ProcessedEvent,
  EventFilters,
  EventStatus,
  SortType,
  LocationInfo,
  EventTypeAbbr,
  SearchParams,
} from '../types/events';

export class EventProcessor {
  private artMapCache: Map<string, any> | null = null;
  private campMapCache: Map<string, any> | null = null;
  private originalEvents: RawEvent[] = [];

  /**
   * Process raw events into displayable format with filtering
   */
  async processEvents(searchParams: SearchParams): Promise<ProcessedEvent[]> {
    const {
      lat,
      lon,
      radius = AppConfig.defaultRadius,
      window: timeWindow = AppConfig.defaultTimeWindow,
      year = AppConfig.defaultYear,
      now = new Date(),
      eventTypes = ['prty', 'food', 'tea', 'arts', 'work', 'kid', 'adlt', 'othr'],
      showOnlyActive = false,
      showOnlyUpcoming = false,
      showOnlyFavorites = false,
    } = searchParams;

    // Load data
    const events = await dataService.loadEvents(year);
    this.originalEvents = events;
    this.artMapCache = await dataService.getArtMap();
    this.campMapCache = await dataService.getCampMap();

    const hasGPS = typeof lat === 'number' && typeof lon === 'number' &&
                   Number.isFinite(lat) && Number.isFinite(lon);
    const upcomingCutoff = new Date(now.getTime() + timeWindow * 60 * 1000);

    // Pre-fetch favorite IDs when filtering by favorites to avoid repeated async calls
    const favoriteIds = showOnlyFavorites
      ? await favoritesService.getFavoriteIds()
      : null;

    const processedEvents: ProcessedEvent[] = [];

    for (const event of events) {
      const occurrences = event.occurrence_set || [];
      
      for (const occurrence of occurrences) {
        const start = occurrence.start_time ? new Date(occurrence.start_time) : null;
        const end = occurrence.end_time ? new Date(occurrence.end_time) : null;
        
        if (!start || !end) continue;

        // Determine event status
        const status = this.determineEventStatus(start, end, now);
        
        // Apply time filtering
        if (!this.passesTimeFilter(start, end, now, upcomingCutoff, status)) {
          continue;
        }

        // Resolve location
        const locationInfo = await this.resolveEventLocation(event);
        
        // Apply distance filtering if GPS available
        let distance: number | null = null;
        if (hasGPS && locationInfo.lat && locationInfo.lon) {
          distance = haversineMeters(lat!, lon!, locationInfo.lat, locationInfo.lon);
          if (distance > radius) {
            continue; // Skip events outside radius
          }
        }

        // Apply event type filtering
        if (!eventTypes.includes(event.event_type?.abbr || 'othr')) {
          continue;
        }

        // Apply status-based filters
        if (showOnlyActive && status !== 'NOW') {
          continue;
        }
        
        if (showOnlyUpcoming && (status === 'ENDED' || status === 'NOW')) {
          continue;
        }

        // Apply favorites filter
        if (showOnlyFavorites) {
          const eventId = `${event.uid}_${occurrence.start_time}`;
          if (!favoriteIds?.has(eventId)) {
            continue;
          }
        }

        // Create processed event
        const processedEvent: ProcessedEvent = {
          id: `${event.uid}_${occurrence.start_time}`,
          eventUid: event.uid,
          title: event.title || 'Untitled Event',
          description: event.description || '',
          type: event.event_type?.label || 'Other',
          typeAbbr: event.event_type?.abbr || 'othr',
          start,
          end,
          status,
          distance,
          lat: locationInfo.lat,
          lon: locationInfo.lon,
          locLabel: locationInfo.label,
          isRecurring: occurrences.length > 1,
          futureOccurrences: this.getFutureOccurrences(event.uid, start),
          url: event.url,
          contactEmail: event.contact_email,
          allDay: event.all_day,
        };

        processedEvents.push(processedEvent);
      }
    }

    return processedEvents;
  }

  /**
   * Determine event status based on current time
   */
  private determineEventStatus(start: Date, end: Date, now: Date): EventStatus {
    const buffer = 15 * 60 * 1000; // 15 minutes in milliseconds
    
    if (start <= now && now <= end && (end.getTime() - now.getTime() >= buffer)) {
      return 'NOW';
    }
    
    if (now < start) {
      const timeUntilStart = start.getTime() - now.getTime();
      if (timeUntilStart <= buffer) {
        return 'SOON';
      }
      return 'UPCOMING';
    }
    
    return 'ENDED';
  }

  /**
   * Check if event passes time filtering criteria
   */
  private passesTimeFilter(
    start: Date,
    end: Date,
    now: Date,
    upcomingCutoff: Date,
    status: EventStatus
  ): boolean {
    const buffer = 15 * 60 * 1000; // 15 minutes

    // Active events (happening now with buffer)
    const isActive = start <= now && now <= end && (end.getTime() - now.getTime() >= buffer);
    
    // Upcoming events within time window
    const isUpcoming = now < start && start <= upcomingCutoff;
    
    return isActive || isUpcoming;
  }

  /**
   * Resolve event location to GPS coordinates and display string
   */
  private async resolveEventLocation(event: RawEvent): Promise<LocationInfo> {
    // Priority 1: Art installation location
    if (event.located_at_art && this.artMapCache) {
      const art = this.artMapCache.get(event.located_at_art);
      if (art) {
        const lat = art.location?.gps_latitude ?? null;
        const lon = art.location?.gps_longitude ?? null;
        const label = art.name ? `@ ${art.name}` : 'Art Location';
        
        return {
          lat: Number.isFinite(lat) ? lat : null,
          lon: Number.isFinite(lon) ? lon : null,
          label,
          source: 'art',
        };
      }
    }

    // Priority 2: Camp location
    if (event.hosted_by_camp && this.campMapCache) {
      const camp = this.campMapCache.get(event.hosted_by_camp);
      if (camp && camp.location_string) {
        try {
          const coords = coordOf(camp.location_string);
          return {
            lat: coords.lat,
            lon: coords.lon,
            label: `@ [${camp.location_string}]`,
            source: 'camp',
          };
        } catch (error) {
          console.warn(`Failed to parse camp location: ${camp.location_string}`, error);
          return {
            lat: null,
            lon: null,
            label: `@ [${camp.location_string}]`,
            source: 'camp',
          };
        }
      }
    }

    // Priority 3: Other location string
    if (event.other_location) {
      try {
        const coords = coordOf(event.other_location);
        return {
          lat: coords.lat,
          lon: coords.lon,
          label: event.other_location,
          source: 'other',
        };
      } catch (error) {
        // Not a BRC address, treat as free-form location
        return {
          lat: null,
          lon: null,
          label: event.other_location,
          source: 'other',
        };
      }
    }

    // Default: Unknown location
    return {
      lat: null,
      lon: null,
      label: 'Location TBD',
      source: 'unknown',
    };
  }

  /**
   * Get future occurrence days for recurring events
   */
  private getFutureOccurrences(eventUid: string, currentStart: Date): string {
    const event = this.originalEvents.find(e => e.uid === eventUid);
    if (!event || !event.occurrence_set || event.occurrence_set.length <= 1) {
      return '';
    }

    const now = new Date();
    const currentTime = currentStart.getTime();

    const futureDays = event.occurrence_set
      .filter(occ => {
        const occStart = new Date(occ.start_time);
        return occStart.getTime() > now.getTime() && occStart.getTime() !== currentTime;
      })
      .map(occ => {
        const occStart = new Date(occ.start_time);
        const dayAbbr = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'S'][occStart.getDay()];
        return dayAbbr;
      })
      .filter((day, index, arr) => arr.indexOf(day) === index) // Remove duplicates
      .sort((a, b) => {
        const order = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'S'];
        return order.indexOf(a) - order.indexOf(b);
      });

    return futureDays.join(',');
  }

  /**
   * Sort processed events
   */
  sortEvents(events: ProcessedEvent[], sortType: SortType, currentTime = new Date()): ProcessedEvent[] {
    const sortedEvents = [...events];

    switch (sortType) {
      case 'distance':
        return sortedEvents.sort((a, b) => {
          if (a.distance === null && b.distance === null) return 0;
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return a.distance - b.distance;
        });

      case 'time':
        return sortedEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

      case 'ending':
        return sortedEvents.sort((a, b) => {
          if (a.status === 'NOW' && b.status === 'NOW') {
            return a.end.getTime() - b.end.getTime();
          }
          if (a.status === 'NOW' && b.status !== 'NOW') return -1;
          if (a.status !== 'NOW' && b.status === 'NOW') return 1;
          return a.start.getTime() - b.start.getTime();
        });

      case 'type':
        return sortedEvents.sort((a, b) => {
          if (a.typeAbbr !== b.typeAbbr) {
            return a.typeAbbr.localeCompare(b.typeAbbr);
          }
          return a.start.getTime() - b.start.getTime();
        });

      case 'title':
        return sortedEvents.sort((a, b) => {
          if (a.title !== b.title) {
            return a.title.localeCompare(b.title);
          }
          return a.start.getTime() - b.start.getTime();
        });

      case 'default':
      default:
        return sortedEvents.sort((a, b) => {
          // Status priority: NOW > SOON > UPCOMING > ENDED
          const statusPriority = { 'NOW': 0, 'SOON': 1, 'UPCOMING': 2, 'ENDED': 3 };
          const aPriority = statusPriority[a.status] ?? 3;
          const bPriority = statusPriority[b.status] ?? 3;
          
          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }
          
          // Within same status, sort by time
          if (a.status === 'NOW') {
            return a.end.getTime() - b.end.getTime(); // Ending soonest first
          }
          
          return a.start.getTime() - b.start.getTime(); // Starting soonest first
        });
    }
  }

  /**
   * Format time for display
   */
  formatTime(date: Date, compact = false): string {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'America/Los_Angeles',
      hour: '2-digit',
      minute: '2-digit',
    };

    if (!compact) {
      options.weekday = 'short';
      options.month = 'numeric';
      options.day = 'numeric';
    }

    return date.toLocaleString([], options);
  }

  /**
   * Format countdown time
   */
  formatCountdown(minutes: number): string {
    if (Math.abs(minutes) < 60) {
      return `${Math.abs(minutes)}m`;
    }
    
    const hours = Math.floor(Math.abs(minutes) / 60);
    const remainingMinutes = Math.abs(minutes) % 60;
    const sign = minutes < 0 ? '-' : '';
    
    if (remainingMinutes === 0) {
      return `${sign}${hours}h`;
    }
    
    return `${sign}${hours}h ${remainingMinutes}m`;
  }

  /**
   * Get countdown information for an event
   */
  getCountdownInfo(event: ProcessedEvent, currentTime = new Date()) {
    const minutesToStart = Math.round((event.start.getTime() - currentTime.getTime()) / 60000);
    const minutesToEnd = Math.round((event.end.getTime() - currentTime.getTime()) / 60000);

    return {
      minutesUntilStart: minutesToStart,
      minutesUntilEnd: minutesToEnd,
      isStartingSoon: minutesToStart > 0 && minutesToStart <= 15,
      isEndingSoon: event.status === 'NOW' && minutesToEnd <= 15,
      isActive: event.status === 'NOW',
      isEnded: event.status === 'ENDED',
    };
  }

  /**
   * Get statistics about processed events
   */
  getEventStats(events: ProcessedEvent[], userRadius?: number) {
    const stats = {
      totalEvents: events.length,
      activeEvents: events.filter(e => e.status === 'NOW').length,
      upcomingEvents: events.filter(e => e.status === 'UPCOMING' || e.status === 'SOON').length,
      eventsByType: {} as Record<EventTypeAbbr, number>,
      averageDistance: 0,
      nearbyEvents: 0,
    };

    // Count by type
    events.forEach(event => {
      const type = event.typeAbbr;
      stats.eventsByType[type] = (stats.eventsByType[type] || 0) + 1;
    });

    // Distance statistics
    const eventsWithDistance = events.filter(e => e.distance !== null);
    if (eventsWithDistance.length > 0) {
      const totalDistance = eventsWithDistance.reduce((sum, e) => sum + (e.distance || 0), 0);
      stats.averageDistance = Math.round(totalDistance / eventsWithDistance.length);
      
      if (userRadius) {
        stats.nearbyEvents = eventsWithDistance.filter(e => (e.distance || 0) <= userRadius).length;
      }
    }

    return stats;
  }
}

// Export singleton instance
export const eventProcessor = new EventProcessor();
export default eventProcessor;