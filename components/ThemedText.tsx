import React from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  accessibilityRole?: 'header' | 'link' | 'text' | 'button';
  accessibilityLevel?: 1 | 2 | 3 | 4 | 5 | 6;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  accessibilityRole,
  accessibilityLevel,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  // Set default accessibility properties based on text type
  const getAccessibilityProps = () => {
    if (accessibilityRole || accessibilityLevel) {
      return {
        accessibilityRole: accessibilityRole || (type === 'title' || type === 'subtitle' ? 'header' : 'text'),
        ...(accessibilityLevel && { accessibilityLevel }),
      };
    }

    switch (type) {
      case 'title':
        return { accessibilityRole: 'header' as const, accessibilityLevel: 1 };
      case 'subtitle':
        return { accessibilityRole: 'header' as const, accessibilityLevel: 2 };
      case 'link':
        return { accessibilityRole: 'link' as const };
      default:
        return { accessibilityRole: 'text' as const };
    }
  };

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      allowFontScaling={true}
      maxFontSizeMultiplier={2.0}
      {...getAccessibilityProps()}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});
