// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
}));

// Mock Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {},
}));

jest.mock('expo-device', () => ({
  isDevice: true,
}));

jest.mock('expo-haptics', () => ({
  impact: jest.fn(),
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({
    coords: { latitude: 40.7829, longitude: -119.2070 }
  })),
}));

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
}));

// Mock AccessibilityConfig  
global.AccessibilityConfig = {
  text: {
    maxFontSizeMultiplier: 1.5
  }
};

// Global fetch mock
global.fetch = jest.fn();

// Global React for JSX
global.React = require('react');

// Silence warnings
console.warn = jest.fn();
