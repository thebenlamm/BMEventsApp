/**
 * Theme constants for Burning Man Events app
 * Desert-optimized colors and styling based on the original web app
 */

// Burning Man Color Palette (from original CSS)
export const Colors = {
  // Primary Brand Colors
  playaOrange: '#ff6b35',
  playaGold: '#f7931e',
  playaPurple: '#2a0845',
  
  // Desert-inspired Colors
  desertTan: '#c4996c',
  dustGray: '#8b7355',
  nightBlack: '#000000',
  brightWhite: '#ffffff',
  
  // Status Colors
  statusLive: '#dc3545',
  statusSoon: '#ffc107',
  statusUpcoming: '#28a745',
  statusEnded: '#6c757d',
  
  // Event Type Colors (gradients represented as solid colors for React Native)
  eventParty: '#6f42c1',
  eventFood: '#fd7e14',
  eventDrinks: '#20c997',
  eventArts: '#e83e8c',
  eventWork: '#17a2b8',
  eventKid: '#ffc107',
  eventAdult: '#dc3545',
  eventOther: '#6c757d',
  
  // Utility Colors
  success: '#28a745',
  warning: '#ffc107',
  danger: '#dc3545',
  info: '#17a2b8',
  
  // Transparency Overlays
  overlay: 'rgba(42, 8, 69, 0.8)',
  cardBackground: 'rgba(255, 255, 255, 0.95)',
  darkOverlay: 'rgba(0, 0, 0, 0.5)',
};

// Typography
export const Typography = {
  // Font Families
  primary: 'System',
  
  // Font Sizes (optimized for desert readability)
  titleLarge: 32,
  titleMedium: 24,
  titleSmall: 20,
  
  bodyLarge: 18,
  bodyMedium: 16,
  bodySmall: 14,
  
  labelLarge: 16,
  labelMedium: 14,
  labelSmall: 12,
  
  // Line Heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.4,
  lineHeightRelaxed: 1.6,
};

// Spacing (consistent 8px grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

// Touch Targets (desert-optimized for harsh conditions)
export const TouchTargets = {
  // Minimum touch target sizes
  minButton: 60,
  minTab: 48,
  minCheckbox: 44,
  
  // Recommended sizes
  primaryButton: 80,
  secondaryButton: 60,
  iconButton: 48,
};

// Shadows (subtle for high contrast readability)
export const Shadows = {
  small: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Screen Dimensions
export const Layout = {
  // Breakpoints
  mobileBreakpoint: 768,
  
  // Container widths
  maxContentWidth: 600,
  
  // Grid
  gridGap: Spacing.md,
};

// Animation Durations (reduced for battery saving)
export const Animation = {
  fast: 150,
  normal: 250,
  slow: 350,
};

// Event Type Mapping
export const EventTypeConfig = {
  prty: {
    label: 'Parties',
    icon: '🎉',
    color: Colors.eventParty,
  },
  food: {
    label: 'Food',
    icon: '🍕',
    color: Colors.eventFood,
  },
  tea: {
    label: 'Drinks',
    icon: '🍹',
    color: Colors.eventDrinks,
  },
  arts: {
    label: 'Arts',
    icon: '🎨',
    color: Colors.eventArts,
  },
  work: {
    label: 'Classes',
    icon: '📚',
    color: Colors.eventWork,
  },
  kid: {
    label: 'Kids',
    icon: '👶',
    color: Colors.eventKid,
  },
  adlt: {
    label: 'Adult',
    icon: '🔞',
    color: Colors.eventAdult,
  },
  othr: {
    label: 'Other',
    icon: '🤷',
    color: Colors.eventOther,
  },
};

// Status Configuration
export const StatusConfig = {
  NOW: {
    label: 'LIVE',
    icon: '🔴',
    color: Colors.statusLive,
  },
  SOON: {
    label: 'Starting Soon',
    icon: '⚡',
    color: Colors.statusSoon,
  },
  UPCOMING: {
    label: 'Upcoming',
    icon: '📅',
    color: Colors.statusUpcoming,
  },
  ENDED: {
    label: 'Ended',
    icon: '⏹️',
    color: Colors.statusEnded,
  },
};

// App Configuration
export const AppConfig = {
  // Default coordinates (Black Rock City)
  defaultLatitude: 40.7741,
  defaultLongitude: -119.2137,
  
  // Default search parameters
  defaultRadius: 1000, // meters
  defaultTimeWindow: 90, // minutes
  defaultYear: 2025,
  
  // Update intervals
  countdownUpdateInterval: 60000, // 1 minute
  powerSavingUpdateInterval: 120000, // 2 minutes
  
  // Notification settings
  notificationAdvanceTime: 5, // minutes before event
  
  // Offline settings
  maxCacheAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  TouchTargets,
  Shadows,
  Layout,
  Animation,
  EventTypeConfig,
  StatusConfig,
  AppConfig,
};