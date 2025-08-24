/**
 * Desert Style Utilities
 * Helper functions for applying desert-optimized styling
 */

import { Colors, HighContrastColors, AccessibilityConfig, DesertOptimization } from '@/constants/Theme';
import { TextStyle, ViewStyle } from 'react-native';

export interface DesertStyleOptions {
  highContrast?: boolean;
  reduceMotion?: boolean;
  reduceTransparency?: boolean;
  fontScale?: number;
  screenReaderActive?: boolean;
}

/**
 * Get desert-optimized colors based on accessibility settings
 */
export function getDesertColors(highContrast: boolean = false) {
  return highContrast ? HighContrastColors : Colors;
}

/**
 * Apply desert-optimized text shadows for sunlight readability
 */
export function getDesertTextShadow(
  options: DesertStyleOptions = {}
): Pick<TextStyle, 'textShadowColor' | 'textShadowOffset' | 'textShadowRadius'> {
  const colors = getDesertColors(options.highContrast);
  const strength = options.highContrast ? DesertOptimization.highContrast.textShadowStrength : 2;
  
  return {
    textShadowColor: colors.nightBlack,
    textShadowOffset: { width: strength, height: strength },
    textShadowRadius: strength,
  };
}

/**
 * Get accessible font size with scaling
 */
export function getAccessibleFontSize(
  baseFontSize: number,
  fontScale: number = 1.0
): number {
  const scaledSize = baseFontSize * fontScale;
  const maxSize = baseFontSize * AccessibilityConfig.text.maxFontSizeMultiplier;
  return Math.min(scaledSize, maxSize);
}

/**
 * Get animation duration based on motion preferences
 */
export function getDesertAnimationDuration(
  defaultDuration: number,
  reduceMotion: boolean = false
): number {
  return reduceMotion ? 0 : defaultDuration;
}

/**
 * Get opacity value based on transparency preferences
 */
export function getDesertOpacity(
  defaultOpacity: number,
  reduceTransparency: boolean = false
): number {
  if (reduceTransparency) {
    return Math.min(defaultOpacity * 1.5, 1.0);
  }
  return defaultOpacity;
}

/**
 * Create desert-optimized card style
 */
export function createDesertCardStyle(options: DesertStyleOptions = {}): ViewStyle {
  const colors = getDesertColors(options.highContrast);
  const opacity = getDesertOpacity(0.95, options.reduceTransparency);
  
  return {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    borderWidth: options.highContrast ? DesertOptimization.highContrast.borderWidths : 1,
    borderColor: colors.dustGray,
    shadowColor: colors.nightBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: getDesertOpacity(0.15, options.reduceTransparency),
    shadowRadius: 8,
    elevation: 4,
    opacity,
  };
}

/**
 * Create desert-optimized button style
 */
export function createDesertButtonStyle(
  variant: 'primary' | 'secondary' | 'danger' = 'primary',
  options: DesertStyleOptions = {}
): ViewStyle {
  const colors = getDesertColors(options.highContrast);
  
  const baseStyle: ViewStyle = {
    borderRadius: 12,
    borderWidth: options.highContrast ? 2 : 1,
    minHeight: 60, // Desert-optimized touch target
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        backgroundColor: colors.playaOrange,
        borderColor: options.highContrast ? colors.nightBlack : colors.playaOrange,
      };
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: colors.overlay,
        borderColor: colors.dustGray,
      };
    case 'danger':
      return {
        ...baseStyle,
        backgroundColor: colors.statusEnded,
        borderColor: options.highContrast ? colors.nightBlack : colors.statusEnded,
      };
    default:
      return baseStyle;
  }
}

/**
 * Create desert-optimized text style
 */
export function createDesertTextStyle(
  options: DesertStyleOptions = {}
): TextStyle {
  const colors = getDesertColors(options.highContrast);
  const textShadow = getDesertTextShadow(options);
  
  return {
    color: colors.brightWhite,
    fontWeight: options.highContrast ? 'bold' : '600',
    ...textShadow,
  };
}

/**
 * Create focus indicator style for accessibility
 */
export function createFocusIndicatorStyle(
  options: DesertStyleOptions = {}
): ViewStyle {
  const colors = getDesertColors(options.highContrast);
  
  return {
    borderWidth: AccessibilityConfig.visual.focusIndicator.width,
    borderColor: AccessibilityConfig.visual.focusIndicator.color,
    borderRadius: AccessibilityConfig.visual.focusIndicator.offset,
  };
}

/**
 * Apply desert-optimized styling to any component
 */
export function applyDesertOptimization<T extends ViewStyle | TextStyle>(
  baseStyle: T,
  options: DesertStyleOptions = {}
): T {
  const colors = getDesertColors(options.highContrast);
  
  // Apply high contrast enhancements
  if (options.highContrast) {
    const enhanced = { ...baseStyle };
    
    // Enhance borders for better visibility
    if ('borderWidth' in enhanced && enhanced.borderWidth) {
      enhanced.borderWidth = Math.max(enhanced.borderWidth as number, 2);
    }
    
    // Enhance text for readability
    if ('fontSize' in enhanced && enhanced.fontSize) {
      enhanced.fontSize = getAccessibleFontSize(
        enhanced.fontSize as number,
        options.fontScale || 1.0
      );
    }
    
    // Add text shadows for sunlight readability
    if ('color' in enhanced) {
      Object.assign(enhanced, getDesertTextShadow(options));
    }
    
    return enhanced;
  }
  
  return baseStyle;
}

/**
 * Get status-specific desert styling
 */
export function getStatusDesertStyle(
  status: 'NOW' | 'SOON' | 'UPCOMING' | 'ENDED',
  options: DesertStyleOptions = {}
): ViewStyle & TextStyle {
  const colors = getDesertColors(options.highContrast);
  const textShadow = getDesertTextShadow(options);
  
  const statusColors = {
    'NOW': colors.statusLive,
    'SOON': colors.statusSoon,
    'UPCOMING': colors.statusUpcoming,
    'ENDED': colors.statusEnded,
  };
  
  return {
    backgroundColor: statusColors[status],
    borderColor: options.highContrast ? colors.nightBlack : statusColors[status],
    borderWidth: options.highContrast ? 2 : 1,
    color: colors.brightWhite,
    fontWeight: 'bold',
    ...textShadow,
  };
}

export default {
  getDesertColors,
  getDesertTextShadow,
  getAccessibleFontSize,
  getDesertAnimationDuration,
  getDesertOpacity,
  createDesertCardStyle,
  createDesertButtonStyle,
  createDesertTextStyle,
  createFocusIndicatorStyle,
  applyDesertOptimization,
  getStatusDesertStyle,
};