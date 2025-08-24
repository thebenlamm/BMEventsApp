/**
 * TypeScript interfaces and types for Burning Man Events data
 * Based on the original web app data structures
 */

import { Coordinates } from '../utils/brcGeo';

// Event Types
export type EventTypeAbbr = 'prty' | 'food' | 'tea' | 'arts' | 'work' | 'kid' | 'adlt' | 'othr';

export type EventStatus = 'NOW' | 'SOON' | 'UPCOMING' | 'ENDED';

export type SortType = 'default' | 'distance' | 'time' | 'ending' | 'type' | 'title';

export interface EventType {
  label: string;
  abbr: EventTypeAbbr;
}

export interface EventOccurrence {
  start_time: string; // ISO 8601 datetime string
  end_time: string;   // ISO 8601 datetime string
}

// Raw event data from API
export interface RawEvent {
  uid: string;
  title: string;
  description?: string;
  year: number;
  event_type?: EventType;
  occurrence_set: EventOccurrence[];
  located_at_art?: string; // UID of art installation
  hosted_by_camp?: string; // UID of camp
  other_location?: string; // Free-form location string
  url?: string;
  contact_email?: string;
  all_day?: boolean;
}

// Processed event for display (flattened occurrences)
export interface ProcessedEvent {
  id: string; // Unique ID combining event UID and occurrence time
  eventUid: string; // Original event UID for recurring event analysis
  title: string;
  description: string;
  type: string; // Human-readable type label
  typeAbbr: EventTypeAbbr;
  start: Date;
  end: Date;
  status: EventStatus;
  distance: number | null; // Distance in meters from user location
  lat: number | null;
  lon: number | null;
  locLabel: string; // Formatted location string
  isRecurring: boolean;
  futureOccurrences?: string; // Day abbreviations for future occurrences
  url?: string;
  contactEmail?: string;
  allDay?: boolean;
}

// Art Installation
export interface ArtInstallation {
  uid: string;
  name: string;
  artist?: string;
  description?: string;
  year: number;
  url?: string;
  contact_email?: string;
  location?: {
    gps_latitude?: number;
    gps_longitude?: number;
    string?: string; // BRC address string
  };
  images?: Array<{
    gallery_ref?: number;
    thumbnail_url?: string;
    }>;
}

// Camp
export interface Camp {
  uid: string;
  name: string;
  description?: string;
  year: number;
  url?: string;
  contact_email?: string;
  location_string?: string; // BRC address
  hometown?: string;
}

// Location Resolution Result
export interface LocationInfo {
  lat: number | null;
  lon: number | null;
  label: string;
  source: 'art' | 'camp' | 'other' | 'unknown';
}

// Filter Configuration
export interface EventFilters {
  eventTypes: EventTypeAbbr[];
  maxDistance?: number; // meters
  timeWindow: number; // minutes from now
  showActiveOnly?: boolean;
  showUpcomingOnly?: boolean;
  year: number;
  userLocation?: Coordinates;
}

// Sort Configuration
export interface SortConfig {
  type: SortType;
  ascending: boolean;
}

// Search Parameters
export interface SearchParams {
  lat?: number;
  lon?: number;
  radius?: number; // meters
  window?: number; // minutes
  year?: number;
  now?: Date; // Override current time for testing
  eventTypes?: EventTypeAbbr[];
  showOnlyActive?: boolean;
  showOnlyUpcoming?: boolean;
  showOnlyFavorites?: boolean;
}

// Time formatting utilities
export interface TimeDisplay {
  compact: string; // "2:30 PM"
  full: string; // "Mon, 8/28 2:30 PM"
  relative: string; // "in 2h 15m" or "started 30m ago"
}

// Countdown timer state
export interface CountdownState {
  minutesUntilStart: number; // Positive for future, negative for past
  minutesUntilEnd: number;
  isStartingSoon: boolean; // < 15 minutes
  isEndingSoon: boolean; // < 15 minutes
  isActive: boolean;
  isEnded: boolean;
}

// Recurring event info
export interface RecurringInfo {
  hasMultipleOccurrences: boolean;
  futureDays: string[]; // Day abbreviations: ['M', 'Tu', 'W']
  nextOccurrence?: Date;
  totalOccurrences: number;
}

// Favorite event (serializable for storage)
export interface FavoriteEvent {
  id: string;
  eventUid: string;
  title: string;
  start: string; // ISO string for storage
  end: string;   // ISO string for storage
  type: string;
  typeAbbr: EventTypeAbbr;
  locLabel: string;
  addedAt: string; // ISO string
}

// App Settings
export interface AppSettings {
  // Location preferences
  defaultLocation?: Coordinates;
  useGPS: boolean;
  
  // Filter preferences
  defaultRadius: number;
  defaultTimeWindow: number;
  preferredEventTypes: EventTypeAbbr[];
  
  // Display preferences
  defaultSort: SortType;
  showDistance: boolean;
  showCountdowns: boolean;
  showRecurringBadges: boolean;
  
  // Notification preferences
  notificationsEnabled: boolean;
  notifyMinutesBefore: number;
  favoriteNotificationsOnly: boolean;
  
  // Accessibility
  highContrastMode: boolean;
  largeTextMode: boolean;
  reducedMotion: boolean;
  
  // Power saving
  powerSavingMode: boolean;
  
  // Data preferences
  preloadData: boolean;
  maxCacheAge: number; // milliseconds
}

// API Response Types
export interface EventsResponse {
  events: RawEvent[];
  lastUpdated: string;
  version: string;
}

export interface ArtResponse {
  art: ArtInstallation[];
  lastUpdated: string;
  version: string;
}

export interface CampsResponse {
  camps: Camp[];
  lastUpdated: string;
  version: string;
}

// Error Types
export interface DataError {
  type: 'network' | 'parse' | 'cache' | 'permission';
  message: string;
  details?: any;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  isRefreshing: boolean;
  error?: DataError;
  progress?: number; // 0-1 for progress indication
}

// Statistics and Analytics
export interface EventStats {
  totalEvents: number;
  activeEvents: number;
  upcomingEvents: number;
  eventsByType: Record<EventTypeAbbr, number>;
  averageDistance?: number;
  nearbyEvents?: number; // Within user's radius
}

// Quick Action Configurations
export interface QuickAction {
  id: string;
  title: string;
  icon: string;
  description: string;
  filters: Partial<EventFilters>;
  gradient: [string, string]; // CSS gradient colors
}

// Navigation and UI State
export interface ViewState {
  currentView: 'cards' | 'favorites' | 'settings';
  showAdvancedFilters: boolean;
  showQuickActions: boolean;
  searchQuery: string;
}

// All types are already exported above