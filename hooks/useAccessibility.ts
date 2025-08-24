/**
 * Accessibility Hook
 * Manages accessibility settings and preferences
 */

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccessibilityInfo, Appearance } from 'react-native';

interface AccessibilitySettings {
  reduceMotion: boolean;
  reduceTransparency: boolean;
  boldText: boolean;
  largeText: boolean;
  highContrast: boolean;
  screenReader: boolean;
  colorScheme: 'light' | 'dark' | 'auto';
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  reduceMotion: false,
  reduceTransparency: false,
  boldText: false,
  largeText: false,
  highContrast: false,
  screenReader: false,
  colorScheme: 'auto',
};

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem('@accessibility_settings');
        if (stored) {
          setSettings(JSON.parse(stored));
        }
        
        // Check system accessibility settings
        const [
          reduceMotionEnabled,
          reduceTransparencyEnabled,
          boldTextEnabled,
          screenReaderEnabled,
        ] = await Promise.all([
          AccessibilityInfo.isReduceMotionEnabled(),
          AccessibilityInfo.isReduceTransparencyEnabled(),
          AccessibilityInfo.isBoldTextEnabled(),
          AccessibilityInfo.isScreenReaderEnabled(),
        ]);

        setSettings(prev => ({
          ...prev,
          reduceMotion: reduceMotionEnabled,
          reduceTransparency: reduceTransparencyEnabled,
          boldText: boldTextEnabled,
          screenReader: screenReaderEnabled,
          colorScheme: prev.colorScheme === 'auto' ? (Appearance.getColorScheme() || 'light') as 'light' | 'dark' : prev.colorScheme,
        }));
        
      } catch (error) {
        console.warn('Failed to load accessibility settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Listen for system accessibility changes
  useEffect(() => {
    const subscriptions = [
      AccessibilityInfo.addEventListener('reduceMotionChanged', (reduceMotion) => {
        setSettings(prev => ({ ...prev, reduceMotion }));
      }),
      AccessibilityInfo.addEventListener('reduceTransparencyChanged', (reduceTransparency) => {
        setSettings(prev => ({ ...prev, reduceTransparency }));
      }),
      AccessibilityInfo.addEventListener('boldTextChanged', (boldText) => {
        setSettings(prev => ({ ...prev, boldText }));
      }),
      AccessibilityInfo.addEventListener('screenReaderChanged', (screenReader) => {
        setSettings(prev => ({ ...prev, screenReader }));
      }),
      Appearance.addChangeListener(({ colorScheme }) => {
        setSettings(prev => prev.colorScheme === 'auto' ? 
          { ...prev, colorScheme: (colorScheme || 'light') as 'light' | 'dark' } : 
          prev
        );
      }),
    ];

    return () => {
      subscriptions.forEach(subscription => {
        if (typeof subscription?.remove === 'function') {
          subscription.remove();
        }
      });
    };
  }, []);

  // Save settings to AsyncStorage
  const updateSettings = async (newSettings: Partial<AccessibilitySettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      await AsyncStorage.setItem('@accessibility_settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.warn('Failed to save accessibility settings:', error);
    }
  };

  // Get font scale based on accessibility settings
  const getFontScale = () => {
    let scale = 1.0;
    if (settings.largeText) scale *= 1.2;
    if (settings.boldText) scale *= 1.1;
    return Math.min(scale, 2.0); // Cap at 200%
  };

  // Get animation duration based on reduce motion
  const getAnimationDuration = (defaultDuration: number) => {
    return settings.reduceMotion ? 0 : defaultDuration;
  };

  // Get opacity values based on reduce transparency
  const getOpacity = (defaultOpacity: number) => {
    return settings.reduceTransparency ? Math.min(defaultOpacity * 1.5, 1.0) : defaultOpacity;
  };

  // Check if using high contrast colors
  const shouldUseHighContrast = () => {
    return settings.highContrast;
  };

  // Get accessible color scheme
  const getColorScheme = () => {
    return settings.colorScheme;
  };

  return {
    settings,
    isLoading,
    updateSettings,
    getFontScale,
    getAnimationDuration,
    getOpacity,
    shouldUseHighContrast,
    getColorScheme,
    isScreenReaderActive: settings.screenReader,
    shouldReduceMotion: settings.reduceMotion,
    shouldReduceTransparency: settings.reduceTransparency,
    shouldUseBoldText: settings.boldText,
    shouldUseLargeText: settings.largeText,
  };
}

export default useAccessibility;