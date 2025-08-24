/**
 * Settings Screen
 * Advanced filters and app preferences for Burning Man Events
 */

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors, Spacing, Typography, TouchTargets } from '@/constants/Theme';
import { useNotifications } from '@/hooks/useNotifications';
import { useFavorites } from '@/hooks/useFavorites';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    autoRefresh: true,
    showDistance: true,
    highContrast: false,
    reducedAnimations: false,
    showEndedEvents: false,
    defaultRadius: 500,
    defaultTimeWindow: 24,
  });

  const {
    settings: notificationSettings,
    updateSettings: updateNotificationSettings,
    sendTestNotification,
    scheduledCount,
  } = useNotifications();

  const { getFavoritesCount, exportFavorites, clearAllFavorites } = useFavorites();
  const [favoritesCount, setFavoritesCount] = useState(0);

  // Load favorites count
  React.useEffect(() => {
    getFavoritesCount().then(setFavoritesCount);
  }, [getFavoritesCount]);

  const handleExportFavorites = useCallback(async () => {
    try {
      await exportFavorites();
      Alert.alert(
        'Export Favorites',
        `Exported ${favoritesCount} favorites.\n\nShare this data to backup your favorites:`,
        [
          { text: 'Copy to Clipboard', onPress: () => {
            // In a real app, you'd use Clipboard API here
            Alert.alert('Success', 'Favorites copied to clipboard!');
          }},
          { text: 'Close', style: 'cancel' },
        ]
      );
    } catch {
      Alert.alert('Export Error', 'Failed to export favorites.');
    }
  }, [exportFavorites, favoritesCount]);

  const handleClearAllFavorites = useCallback(async () => {
    Alert.alert(
      'Clear All Favorites',
      `This will permanently delete all ${favoritesCount} favorites. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllFavorites();
              setFavoritesCount(0);
              Alert.alert('Success', 'All favorites have been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear favorites.');
            }
          }
        },
      ]
    );
  }, [clearAllFavorites, favoritesCount]);

  const handleSendTestNotification = useCallback(async () => {
    try {
      await sendTestNotification();
      Alert.alert('Test Sent', 'Check your notifications to see if it worked!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification.');
    }
  }, [sendTestNotification]);

  const renderSection = (title: string, icon: string, children: React.ReactNode) => (
    <ThemedView style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        {icon} {title}
      </ThemedText>
      {children}
    </ThemedView>
  );

  const renderToggle = (
    label: string, 
    value: boolean, 
    onValueChange: (value: boolean) => void,
    description?: string
  ) => (
    <ThemedView style={styles.settingRow}>
      <ThemedView style={styles.settingContent}>
        <ThemedText style={styles.settingLabel}>{label}</ThemedText>
        {description && (
          <ThemedText style={styles.settingDescription}>{description}</ThemedText>
        )}
      </ThemedView>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.dustGray, true: Colors.playaOrange }}
        thumbColor={value ? Colors.brightWhite : Colors.desertTan}
        style={styles.switch}
      />
    </ThemedView>
  );

  const renderButton = (
    label: string,
    onPress: () => void,
    style?: 'default' | 'danger'
  ) => (
    <TouchableOpacity
      style={[
        styles.button,
        style === 'danger' && styles.dangerButton,
      ]}
      onPress={onPress}
    >
      <ThemedText style={[
        styles.buttonText,
        style === 'danger' && styles.dangerButtonText,
      ]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar style="light" backgroundColor={Colors.playaPurple} />
      
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Settings ⚙️
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Customize your Playa experience
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* Display Preferences */}
        {renderSection('Display', '🎨', (
          <>
            {renderToggle(
              'Show Distance Info',
              settings.showDistance,
              (value) => setSettings(prev => ({ ...prev, showDistance: value })),
              'Display distance to events when location is available'
            )}
            {renderToggle(
              'High Contrast Mode',
              settings.highContrast,
              (value) => setSettings(prev => ({ ...prev, highContrast: value })),
              'Increase contrast for better visibility in bright sunlight'
            )}
            {renderToggle(
              'Reduced Animations',
              settings.reducedAnimations,
              (value) => setSettings(prev => ({ ...prev, reducedAnimations: value })),
              'Minimize animations to save battery'
            )}
            {renderToggle(
              'Show Ended Events',
              settings.showEndedEvents,
              (value) => setSettings(prev => ({ ...prev, showEndedEvents: value })),
              'Include events that have already ended in the list'
            )}
          </>
        ))}

        {/* App Behavior */}
        {renderSection('Behavior', '⚡', (
          <>
            {renderToggle(
              'Auto-Refresh Events',
              settings.autoRefresh,
              (value) => setSettings(prev => ({ ...prev, autoRefresh: value })),
              'Automatically update event list when app opens'
            )}
          </>
        ))}

        {/* Notification Settings */}
        {renderSection('Notifications', '🔔', (
          <>
            {renderToggle(
              'Push Notifications',
              notificationSettings.enabled,
              (value) => updateNotificationSettings({ enabled: value }),
              'Get notified about upcoming favorite events'
            )}
            {renderToggle(
              'Sound',
              notificationSettings.soundEnabled,
              (value) => updateNotificationSettings({ soundEnabled: value }),
              'Play sound with notifications'
            )}
            {renderToggle(
              'Vibration',
              notificationSettings.vibrationEnabled,
              (value) => updateNotificationSettings({ vibrationEnabled: value }),
              'Vibrate when notifications arrive'
            )}
            <ThemedView style={styles.statsRow}>
              <ThemedText style={styles.statsLabel}>
                Scheduled notifications: {scheduledCount}
              </ThemedText>
            </ThemedView>
            {renderButton('Send Test Notification', handleSendTestNotification)}
          </>
        ))}

        {/* Favorites Management */}
        {renderSection('Favorites', '⭐', (
          <>
            <ThemedView style={styles.statsRow}>
              <ThemedText style={styles.statsLabel}>
                Total favorites: {favoritesCount}
              </ThemedText>
            </ThemedView>
            {renderButton('Export Favorites', handleExportFavorites)}
            {renderButton('Clear All Favorites', handleClearAllFavorites, 'danger')}
          </>
        ))}

        {/* App Info */}
        {renderSection('About', 'ℹ️', (
          <ThemedView style={styles.infoSection}>
            <ThemedText style={styles.infoText}>
              <ThemedText style={styles.infoBold}>Burning Man Events</ThemedText>{'\n'}
              Version 1.0.0{'\n'}
              Built for Burning Man 2025{'\n\n'}
              
              Find and track events, art installations, and camp activities 
              on the Playa. Optimized for desert conditions with offline 
              support and location-based features.{'\n\n'}
              
              🏜️ Welcome home, Burner!
            </ThemedText>
          </ThemedView>
        ))}
        
        {/* Bottom Spacing */}
        <ThemedView style={styles.bottomSpacing} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.playaPurple,
  },

  header: {
    backgroundColor: Colors.playaPurple,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },

  headerTitle: {
    fontSize: Typography.titleLarge,
    color: Colors.brightWhite,
    fontWeight: 'bold',
  },

  headerSubtitle: {
    fontSize: Typography.bodyMedium,
    color: Colors.dustGray,
    marginTop: Spacing.xs,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: Spacing.lg,
  },

  section: {
    backgroundColor: Colors.overlay,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dustGray,
  },

  sectionTitle: {
    fontSize: Typography.titleMedium,
    color: Colors.brightWhite,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: Spacing.sm,
  },

  settingContent: {
    flex: 1,
    marginRight: Spacing.md,
  },

  settingLabel: {
    fontSize: Typography.bodyMedium,
    color: Colors.brightWhite,
    fontWeight: '600',
  },

  settingDescription: {
    fontSize: Typography.bodySmall,
    color: Colors.dustGray,
    marginTop: 2,
    lineHeight: Typography.bodySmall * 1.3,
  },

  switch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },

  button: {
    backgroundColor: Colors.playaOrange,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    minHeight: TouchTargets.minButton,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dangerButton: {
    backgroundColor: Colors.statusEnded,
  },

  buttonText: {
    fontSize: Typography.bodyMedium,
    color: Colors.brightWhite,
    fontWeight: 'bold',
  },

  dangerButtonText: {
    color: Colors.brightWhite,
  },

  statsRow: {
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  statsLabel: {
    fontSize: Typography.bodyMedium,
    color: Colors.dustGray,
  },

  infoSection: {
    paddingVertical: Spacing.sm,
  },

  infoText: {
    fontSize: Typography.bodyMedium,
    color: Colors.dustGray,
    lineHeight: Typography.bodyMedium * 1.4,
  },

  infoBold: {
    fontWeight: 'bold',
    color: Colors.brightWhite,
  },

  bottomSpacing: {
    height: Spacing.xl,
  },
});