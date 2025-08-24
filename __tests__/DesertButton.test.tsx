import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { DesertButton } from '../components/DesertButton';

// Mock theme constants used by the component
jest.mock('@/constants/Theme', () => ({
  TouchTargets: {},
  Spacing: { sm: 8, md: 16, lg: 24 },
  AccessibilityConfig: {
    touch: { hapticFeedback: false },
    visual: { animationDuration: { short: 100 } },
  },
}), { virtual: true });

// Mock useDesertTheme hook to provide minimal theme values
jest.mock('../components/DesertThemeProvider', () => ({
  useDesertTheme: () => ({
    colors: {
      playaOrange: 'orange',
      overlay: 'rgba(0,0,0,0.1)',
      dustGray: 'gray',
      statusEnded: 'maroon',
      brightWhite: '#fff',
      nightBlack: '#000',
    },
    shouldUseHighContrast: false,
    getFontScale: () => 1,
    getAnimationDuration: (d:number) => d,
    getOpacity: (o:number) => o,
    getColorScheme: () => 'light' as const,
    isScreenReaderActive: false,
    shouldReduceMotion: false,
    shouldReduceTransparency: false,
    textShadowStyle: {},
    focusStyle: { borderWidth: 1, borderColor: '#000' },
  }),
}));

// Mock useThemeColor used by ThemedText inside button
jest.mock('@/hooks/useThemeColor', () => ({
  useThemeColor: () => '#000',
}), { virtual: true });

describe('DesertButton', () => {
  it('fires onPress when pressed', () => {
    const onPress = jest.fn();
    render(<DesertButton title="Press me" onPress={onPress} />);
    fireEvent.press(screen.getByText('Press me'));
    expect(onPress).toHaveBeenCalled();
  });

  it('does not fire onPress when disabled', () => {
    const onPress = jest.fn();
    render(<DesertButton title="Press me" onPress={onPress} disabled />);
    fireEvent.press(screen.getByText('Press me'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not fire onPress when loading', () => {
    const onPress = jest.fn();
    render(<DesertButton title="Press me" onPress={onPress} loading />);
    fireEvent.press(screen.getByText('Press me'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
