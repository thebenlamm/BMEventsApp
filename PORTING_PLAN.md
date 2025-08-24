# Burning Man Events - React Native Porting Plan

## Overview
This plan outlines the step-by-step process for porting the HTML/JavaScript Burning Man Events web app to React Native using Expo.

## Phase 1: Foundation Setup
1. **Install required React Native dependencies** - AsyncStorage, location, notifications, NetInfo
2. **Create project constants file** - Burning Man colors and theme
3. **Port geospatial engine** - brc-geo-2025.js to React Native
4. **Create data service layer** - JSON loading and caching
5. **Build event data types and interfaces** - TypeScript definitions

## Phase 2: Core UI Components
6. **Create main event listing screen** - Navigation setup
7. **Build event card component** - Status indicators, countdown timers, progress bars
8. **Implement filtering system** - Event types, distance, time filters

## Phase 3: Advanced Features
9. **Add location services integration** - GPS with distance calculations
10. **Create favorites system** - AsyncStorage persistence
11. **Implement real-time countdown timers** - Live updates
12. **Add quick action buttons** - Find Parties, Food Hunt, Art Walk, Chill Zone
13. **Implement push notifications** - Upcoming event alerts
14. **Create offline data caching strategy** - Complete offline functionality
15. **Add sorting functionality** - Distance, time, type, ending soon, title
16. **Create settings screen** - Advanced filters and preferences

## Phase 4: Polish & Optimization
17. **Implement accessibility features** - Screen reader support, large touch targets
18. **Add desert-optimized styling** - High contrast, Playa-ready design
19. **Test app functionality and performance** - Unit tests, integration testing
20. **Copy event data files** - Migrate JSON data from HTML app

## Key Technical Migrations
- **Service Workers** → AsyncStorage + NetInfo for offline detection
- **DOM Manipulation** → React state management
- **CSS** → StyleSheet with Burning Man color scheme
- **Local Storage** → AsyncStorage for favorites/settings
- **Geolocation API** → expo-location
- **Web notifications** → expo-notifications

## Success Criteria
The React Native app should maintain all core functionality from the HTML version:
- Event discovery with real-time status updates
- Location-based filtering and distance calculations
- Offline operation with cached data
- Quick action shortcuts for common searches
- Favorites management with persistence
- Push notifications for upcoming events
- Desert-optimized UI for harsh conditions

## File Structure Plan
```
BMEvents/
├── assets/
│   └── data/           # JSON event/art/camp data
├── components/
│   ├── EventCard.tsx   # Event display component
│   ├── FilterPanel.tsx # Filtering controls
│   └── QuickActions.tsx # Quick search buttons
├── services/
│   ├── DataService.ts  # JSON loading & caching
│   ├── LocationService.ts # GPS & geospatial
│   └── NotificationService.ts # Push notifications
├── utils/
│   ├── brcGeo.ts      # Geospatial engine port
│   └── timeUtils.ts   # Time formatting & calculations
├── constants/
│   └── Theme.ts       # Colors, styles, dimensions
└── screens/
    ├── EventsScreen.tsx # Main event listing
    └── SettingsScreen.tsx # Advanced filters
```

## Status
- [x] Plan creation
- [ ] Implementation (ready to begin)