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

// High Contrast Colors for desert conditions
export const HighContrastColors = {
  // Enhanced contrast versions
  playaOrange: '#ff4500', // More vivid orange
  playaGold: '#ffd700',   // Brighter gold
  playaPurple: '#1a0530', // Darker purple for better contrast
  
  // Enhanced desert colors
  desertTan: '#deb887',   // Lighter tan
  dustGray: '#696969',    // Higher contrast gray
  nightBlack: '#000000',  // Pure black
  brightWhite: '#ffffff', // Pure white
  
  // Enhanced status colors
  statusLive: '#ff0000',     // Pure red for maximum visibility
  statusSoon: '#ffff00',     // Pure yellow
  statusUpcoming: '#00ff00', // Pure green
  statusEnded: '#808080',    // Standard gray
  
  // Enhanced event type colors (high contrast versions)
  eventParty: '#8a2be2',     // Blue violet
  eventFood: '#ff8c00',      // Dark orange
  eventDrinks: '#00ced1',    // Dark turquoise
  eventArts: '#ff1493',      // Deep pink
  eventWork: '#00bfff',      // Deep sky blue
  eventKid: '#ffd700',       // Gold
  eventAdult: '#dc143c',     // Crimson
  eventOther: '#808080',     // Gray
  
  // Utility colors (high contrast)
  success: '#00ff00',        // Pure green
  warning: '#ffff00',        // Pure yellow
  danger: '#ff0000',         // Pure red
  info: '#00bfff',           // Deep sky blue
  
  // High contrast overlays
  overlay: 'rgba(0, 0, 0, 0.9)',              // Darker overlay
  cardBackground: 'rgba(255, 255, 255, 1.0)', // Solid white
  darkOverlay: 'rgba(0, 0, 0, 0.8)',          // Darker overlay
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

// Touch Targets (desert-optimized for harsh conditions & accessibility)
export const TouchTargets = {
  // Minimum touch target sizes (WCAG AAA compliant)
  minButton: 60,        // Exceeds WCAG minimum of 44px
  minTab: 48,          // Meets WCAG minimum
  minCheckbox: 44,     // Meets WCAG minimum
  
  // Recommended sizes for desert conditions
  primaryButton: 80,    // Large for gloved fingers
  secondaryButton: 60,  // Standard for desert use
  iconButton: 48,       // Minimum for precise touch
  
  // Accessibility-focused sizes
  accessibleButton: 88, // Extra large for motor impairments
  accessibleTab: 60,    // Larger tab targets
  
  // Spacing for touch targets
  minSpacing: 8,        // Minimum space between targets
  recommendedSpacing: 16, // Recommended space for accuracy
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

// Accessibility Configuration (WCAG AAA compliant)
export const AccessibilityConfig = {
  // Text and content accessibility
  text: {
    minContrastRatio: 7.1,    // WCAG AAA standard
    maxFontSizeMultiplier: 2.0, // Maximum font scaling
    defaultFontSizeMultiplier: 1.0,
    minLineHeight: 1.5,       // WCAG recommendation
    maxLineLength: 80,        // Characters per line for readability
  },
  
  // Touch and interaction accessibility  
  touch: {
    minTargetSize: 44,        // WCAG minimum (we use 60+ for desert conditions)
    minSpacing: 8,            // Minimum space between targets
    hapticFeedback: true,     // Vibration for touch confirmation
    longPressTimeout: 500,    // Milliseconds for long press
    doubleTapTimeout: 300,    // Milliseconds for double tap
  },
  
  // Visual accessibility
  visual: {
    animationDuration: {
      none: 0,                // For reduced motion
      short: 150,             // Quick transitions
      normal: 250,            // Standard animations
      long: 350,              // Extended animations
    },
    focusIndicator: {
      width: 3,               // Focus ring width
      color: Colors.playaOrange, // High contrast focus color
      offset: 2,              // Distance from element
    },
    transparency: {
      none: 1.0,              // Opaque for reduced transparency
      light: 0.9,             // Slight transparency
      medium: 0.7,            // Standard transparency
      heavy: 0.5,             // High transparency
    },
  },
  
  // Screen reader optimization
  screenReader: {
    speakingRate: 'normal',   // Speech rate preference
    announceChanges: true,    // Announce dynamic content changes
    groupRelatedContent: true, // Group related elements
    provideLandmarks: true,   // Use semantic landmarks
  },
};

// Desert Optimization Settings
export const DesertOptimization = {
  // High contrast mode settings
  highContrast: {
    enabled: false, // Can be toggled in settings
    textShadowStrength: 3, // Stronger text shadows for sunlight readability
    borderWidths: 2, // Thicker borders for better definition
    minContrastRatio: 7, // WCAG AAA standard
  },
  
  // Touch target enhancements for dusty/gloved fingers
  touchEnhancements: {
    minTouchSize: 60, // Already implemented in TouchTargets
    spacing: 8, // Minimum space between touch targets
    hapticFeedback: true, // Enable vibration feedback
  },
  
  // Battery optimization for desert conditions
  batteryOptimization: {
    reducedAnimations: false, // Can be toggled in settings
    lowerFrameRate: false, // Reduce to 30fps if needed
    backgroundTaskLimiting: true, // Limit background processing
  },
  
  // Visual enhancements for harsh sunlight
  sunlightReadability: {
    maxBrightness: true, // Force max brightness for outdoor use
    antiGlareColors: true, // Use matte colors instead of glossy
    largeTextMode: false, // Can be toggled for vision assistance
    iconEnhancements: true, // Use high-contrast icons
  },
  
  // Dust/weather resistance UI patterns
  weatherResistance: {
    simplifiedNavigation: true, // Reduce complex gestures
    quickActions: true, // Prominently display quick actions
    offlineFirst: true, // Prioritize cached data
    errorTolerance: 'high', // Be forgiving with user interactions
  },
};

export default {
  Colors,
  HighContrastColors,
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
  AccessibilityConfig,
  DesertOptimization,
};