/**
 * Desert Theme Provider
 * Provides desert-optimized styling and high contrast support
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { Colors, HighContrastColors, AccessibilityConfig, DesertOptimization } from '@/constants/Theme';
import { useAccessibility } from '@/hooks/useAccessibility';

interface DesertThemeContextValue {
  colors: typeof Colors;
  shouldUseHighContrast: boolean;
  getFontScale: () => number;
  getAnimationDuration: (defaultDuration: number) => number;
  getOpacity: (defaultOpacity: number) => number;
  getColorScheme: () => 'light' | 'dark' | 'auto';
  isScreenReaderActive: boolean;
  shouldReduceMotion: boolean;
  shouldReduceTransparency: boolean;
  textShadowStyle: {
    textShadowColor: string;
    textShadowOffset: { width: number; height: number };
    textShadowRadius: number;
  };
  focusStyle: {
    borderWidth: number;
    borderColor: string;
  };
}

const DesertThemeContext = createContext<DesertThemeContextValue | null>(null);

interface DesertThemeProviderProps {
  children: ReactNode;
}

export function DesertThemeProvider({ children }: DesertThemeProviderProps) {
  const accessibility = useAccessibility();

  const shouldUseHighContrast = accessibility.shouldUseHighContrast();
  const colors = shouldUseHighContrast ? HighContrastColors : Colors;

  const textShadowStyle = {
    textShadowColor: colors.nightBlack,
    textShadowOffset: { 
      width: shouldUseHighContrast ? DesertOptimization.highContrast.textShadowStrength : 1, 
      height: shouldUseHighContrast ? DesertOptimization.highContrast.textShadowStrength : 1 
    },
    textShadowRadius: shouldUseHighContrast ? DesertOptimization.highContrast.textShadowStrength : 2,
  };

  const focusStyle = {
    borderWidth: AccessibilityConfig.visual.focusIndicator.width,
    borderColor: AccessibilityConfig.visual.focusIndicator.color,
  };

  const contextValue: DesertThemeContextValue = {
    colors,
    shouldUseHighContrast,
    getFontScale: accessibility.getFontScale,
    getAnimationDuration: accessibility.getAnimationDuration,
    getOpacity: accessibility.getOpacity,
    getColorScheme: accessibility.getColorScheme,
    isScreenReaderActive: accessibility.isScreenReaderActive,
    shouldReduceMotion: accessibility.shouldReduceMotion,
    shouldReduceTransparency: accessibility.shouldReduceTransparency,
    textShadowStyle,
    focusStyle,
  };

  return (
    <DesertThemeContext.Provider value={contextValue}>
      {children}
    </DesertThemeContext.Provider>
  );
}

export function useDesertTheme(): DesertThemeContextValue {
  const context = useContext(DesertThemeContext);
  if (!context) {
    throw new Error('useDesertTheme must be used within a DesertThemeProvider');
  }
  return context;
}

export default DesertThemeProvider;