/**
 * Desert-Optimized Button Component
 * High contrast, large touch targets, with accessibility support
 */

import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  Animated,
  Vibration,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { useDesertTheme } from './DesertThemeProvider';
import { TouchTargets, Spacing, AccessibilityConfig } from '@/constants/Theme';

export interface DesertButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large' | 'accessible';
  icon?: string;
  loading?: boolean;
  hapticFeedback?: boolean;
}

export function DesertButton({
  title,
  variant = 'primary',
  size = 'medium',
  icon,
  loading = false,
  hapticFeedback = true,
  style,
  onPress,
  disabled,
  ...props
}: DesertButtonProps) {
  const theme = useDesertTheme();
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const focusValue = React.useRef(new Animated.Value(0)).current;

  // Handle press with animation and haptic feedback
  const handlePressIn = React.useCallback(() => {
    if (disabled) return;

    // Scale down animation for press feedback
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
      tension: 150,
      friction: 4,
    }).start();

    // Haptic feedback for desert conditions
    if (hapticFeedback && AccessibilityConfig.touch.hapticFeedback) {
      Vibration.vibrate(50);
    }
  }, [disabled, scaleValue, hapticFeedback]);

  const handlePressOut = React.useCallback(() => {
    if (disabled) return;

    // Scale back to normal
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      tension: 150,
      friction: 4,
    }).start();
  }, [disabled, scaleValue]);

  const handlePress = React.useCallback((event: any) => {
    if (disabled || loading) return;
    onPress?.(event);
  }, [disabled, loading, onPress]);

  // Focus handling for accessibility
  const handleFocus = React.useCallback(() => {
    Animated.timing(focusValue, {
      toValue: 1,
      duration: theme.getAnimationDuration(AccessibilityConfig.visual.animationDuration.short),
      useNativeDriver: false,
    }).start();
  }, [focusValue, theme]);

  const handleBlur = React.useCallback(() => {
    Animated.timing(focusValue, {
      toValue: 0,
      duration: theme.getAnimationDuration(AccessibilityConfig.visual.animationDuration.short),
      useNativeDriver: false,
    }).start();
  }, [focusValue, theme]);

  // Get button styles based on variant and theme
  const getButtonStyles = () => {
    const baseStyle = {
      minHeight: getButtonHeight(),
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: 12,
      borderWidth: theme.shouldUseHighContrast ? 2 : 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
      gap: Spacing.sm,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.playaOrange,
          borderColor: theme.shouldUseHighContrast ? theme.colors.nightBlack : theme.colors.playaOrange,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.overlay,
          borderColor: theme.colors.dustGray,
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.statusEnded,
          borderColor: theme.shouldUseHighContrast ? theme.colors.nightBlack : theme.colors.statusEnded,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderColor: theme.colors.dustGray,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyles = () => {
    const baseTextStyle = {
      fontSize: 16 * theme.getFontScale(),
      fontWeight: 'bold' as const,
      textAlign: 'center' as const,
      ...theme.textShadowStyle,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseTextStyle,
          color: theme.colors.brightWhite,
        };
      case 'secondary':
        return {
          ...baseTextStyle,
          color: theme.colors.brightWhite,
        };
      case 'danger':
        return {
          ...baseTextStyle,
          color: theme.colors.brightWhite,
        };
      case 'ghost':
        return {
          ...baseTextStyle,
          color: theme.colors.dustGray,
        };
      default:
        return baseTextStyle;
    }
  };

  const getButtonHeight = () => {
    switch (size) {
      case 'small':
        return TouchTargets.minButton;
      case 'medium':
        return TouchTargets.secondaryButton;
      case 'large':
        return TouchTargets.primaryButton;
      case 'accessible':
        return TouchTargets.accessibleButton;
      default:
        return TouchTargets.secondaryButton;
    }
  };

  const buttonStyles = getButtonStyles();
  const textStyles = getTextStyles();

  // Focus ring style for accessibility
  const focusRingStyle = {
    borderWidth: focusValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, theme.focusStyle.borderWidth],
    }),
    borderColor: theme.focusStyle.borderColor,
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleValue }] }, style]}>
      <TouchableOpacity
        style={[
          buttonStyles,
          disabled && styles.disabled,
          loading && styles.loading,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled || loading}
        activeOpacity={theme.shouldReduceTransparency ? 0.9 : 0.7}
        accessibilityRole="button"
        accessibilityState={{ 
          disabled: disabled || loading,
          busy: loading,
        }}
        accessibilityLabel={loading ? `${title}, Loading` : title}
        accessibilityHint={disabled ? 'Button is disabled' : undefined}
        {...props}
      >
        <Animated.View style={[StyleSheet.absoluteFill, focusRingStyle]} />
        
        {icon && !loading && (
          <ThemedText style={[textStyles, { fontSize: textStyles.fontSize * 1.2 }]}>
            {icon}
          </ThemedText>
        )}
        
        {loading && (
          <ThemedText style={[textStyles, { fontSize: textStyles.fontSize * 1.2 }]}>
            ⌛
          </ThemedText>
        )}
        
        <ThemedText 
          style={[
            textStyles,
            disabled && styles.disabledText,
          ]}
          numberOfLines={1}
          allowFontScaling={true}
          maxFontSizeMultiplier={AccessibilityConfig.text.maxFontSizeMultiplier}
        >
          {title}
        </ThemedText>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  
  loading: {
    opacity: 0.8,
  },
  
  disabledText: {
    opacity: 0.6,
  },
});

export default DesertButton;