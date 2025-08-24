/**
 * Notification Settings Component
 * Configure push notifications for favorite events
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors, Spacing, Typography, TouchTargets } from '../constants/Theme';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationSettings as INotificationSettings } from '../services/NotificationService';

interface NotificationSettingsProps {
  visible: boolean;
  onClose: () => void;
}

const REMINDER_OPTIONS = [
  { minutes: 5, label: '5 minutes' },
  { minutes: 15, label: '15 minutes' },
  { minutes: 30, label: '30 minutes' },
  { minutes: 60, label: '1 hour' },
  { minutes: 120, label: '2 hours' },
];

export function NotificationSettings({ visible, onClose }: NotificationSettingsProps) {
  const {
    settings,
    scheduledCount,
    permissionStatus,
    isLoading,
    requestPermissions,
    updateSettings,
    sendTestNotification,
  } = useNotifications();

  const [tempSettings, setTempSettings] = useState<INotificationSettings>(settings);

  // Update temp settings when modal opens
  React.useEffect(() => {
    if (visible) {
      setTempSettings(settings);
    }
  }, [visible, settings]);

  const handleEnableToggle = useCallback(async (enabled: boolean) => {
    if (enabled && permissionStatus !== 'granted') {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive event reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    setTempSettings(prev => ({ ...prev, enabled }));
  }, [permissionStatus, requestPermissions]);

  const handleSave = useCallback(async () => {
    try {
      await updateSettings(tempSettings);
      onClose();
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to save notification settings. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [tempSettings, updateSettings, onClose]);

  const handleTestNotification = useCallback(async () => {
    try {
      await sendTestNotification();
      Alert.alert(
        'Test Sent',
        'Check your notifications! You should see a test notification shortly.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to send test notification. Make sure notifications are enabled.',
        [{ text: 'OK' }]
      );
    }
  }, [sendTestNotification]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <ThemedText style={styles.closeButtonText}>✕</ThemedText>
          </TouchableOpacity>
          
          <ThemedText type="title" style={styles.headerTitle}>
            🔔 Notifications
          </ThemedText>
          
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <ThemedText style={styles.saveButtonText}>Save</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.content}>
          {/* Enable Notifications */}
          <ThemedView style={styles.section}>
            <ThemedView style={styles.settingRow}>
              <ThemedView style={styles.settingLeft}>
                <ThemedText type="defaultSemiBold" style={styles.settingTitle}>
                  Enable Notifications
                </ThemedText>
                <ThemedText style={styles.settingSubtitle}>
                  Get reminders for your favorite events
                </ThemedText>
              </ThemedView>
              <Switch
                value={tempSettings.enabled}
                onValueChange={handleEnableToggle}
                trackColor={{
                  false: Colors.overlay,
                  true: Colors.playaOrange,
                }}
                thumbColor={tempSettings.enabled ? Colors.brightWhite : Colors.dustGray}
              />
            </ThemedView>

            {permissionStatus !== 'granted' && tempSettings.enabled && (
              <ThemedView style={styles.warningBox}>
                <ThemedText style={styles.warningText}>
                  ⚠️ Notification permissions not granted. Tap to enable in Settings.
                </ThemedText>
              </ThemedView>
            )}

            {scheduledCount > 0 && (
              <ThemedText style={styles.statusText}>
                📅 {scheduledCount} notifications scheduled for your favorites
              </ThemedText>
            )}
          </ThemedView>

          {tempSettings.enabled && (
            <>
              {/* Reminder Timing */}
              <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Reminder Timing
                </ThemedText>
                <ThemedText style={styles.sectionSubtitle}>
                  How early do you want to be reminded?
                </ThemedText>
                
                <ThemedView style={styles.optionGrid}>
                  {REMINDER_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.minutes}
                      onPress={() => setTempSettings(prev => ({ ...prev, reminderMinutes: option.minutes }))}
                      style={[
                        styles.optionButton,
                        tempSettings.reminderMinutes === option.minutes && styles.optionButtonSelected,
                      ]}
                    >
                      <ThemedText style={[
                        styles.optionText,
                        tempSettings.reminderMinutes === option.minutes && styles.optionTextSelected,
                      ]}>
                        {option.label}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ThemedView>
              </ThemedView>

              {/* Sound & Vibration */}
              <ThemedView style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Sound & Vibration
                </ThemedText>
                
                <ThemedView style={styles.settingRow}>
                  <ThemedText style={styles.settingTitle}>Sound</ThemedText>
                  <Switch
                    value={tempSettings.soundEnabled}
                    onValueChange={(soundEnabled) => setTempSettings(prev => ({ ...prev, soundEnabled }))}
                    trackColor={{
                      false: Colors.overlay,
                      true: Colors.playaOrange,
                    }}
                    thumbColor={tempSettings.soundEnabled ? Colors.brightWhite : Colors.dustGray}
                  />
                </ThemedView>

                <ThemedView style={styles.settingRow}>
                  <ThemedText style={styles.settingTitle}>Vibration</ThemedText>
                  <Switch
                    value={tempSettings.vibrationEnabled}
                    onValueChange={(vibrationEnabled) => setTempSettings(prev => ({ ...prev, vibrationEnabled }))}
                    trackColor={{
                      false: Colors.overlay,
                      true: Colors.playaOrange,
                    }}
                    thumbColor={tempSettings.vibrationEnabled ? Colors.brightWhite : Colors.dustGray}
                  />
                </ThemedView>

                <ThemedView style={styles.settingRow}>
                  <ThemedText style={styles.settingTitle}>App Badge</ThemedText>
                  <Switch
                    value={tempSettings.badge}
                    onValueChange={(badge) => setTempSettings(prev => ({ ...prev, badge }))}
                    trackColor={{
                      false: Colors.overlay,
                      true: Colors.playaOrange,
                    }}
                    thumbColor={tempSettings.badge ? Colors.brightWhite : Colors.dustGray}
                  />
                </ThemedView>
              </ThemedView>

              {/* Test Notification */}
              <ThemedView style={styles.section}>
                <TouchableOpacity
                  onPress={handleTestNotification}
                  style={styles.testButton}
                  disabled={isLoading}
                >
                  <ThemedText style={styles.testButtonText}>
                    📱 Send Test Notification
                  </ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </>
          )}

          {/* Info Section */}
          <ThemedView style={styles.infoSection}>
            <ThemedText style={styles.infoText}>
              💡 Notifications are only sent for events you've favorited (starred). 
              Star your must-see events to get timely reminders!
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.playaPurple,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.playaPurple,
    borderBottomWidth: 1,
    borderBottomColor: Colors.overlay,
  },

  closeButton: {
    width: TouchTargets.minButton,
    height: TouchTargets.minButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: TouchTargets.minButton / 2,
    backgroundColor: Colors.overlay,
  },

  closeButtonText: {
    fontSize: Typography.titleSmall,
    color: Colors.brightWhite,
    fontWeight: 'bold',
  },

  headerTitle: {
    fontSize: Typography.titleLarge,
    color: Colors.playaGold,
    fontWeight: 'bold',
  },

  saveButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.playaOrange,
  },

  saveButtonText: {
    fontSize: Typography.bodyMedium,
    color: Colors.brightWhite,
    fontWeight: 'bold',
  },

  content: {
    flex: 1,
    padding: Spacing.lg,
  },

  section: {
    marginBottom: Spacing.xl,
  },

  sectionTitle: {
    fontSize: Typography.titleSmall,
    color: Colors.brightWhite,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },

  sectionSubtitle: {
    fontSize: Typography.bodyMedium,
    color: Colors.desertTan,
    marginBottom: Spacing.md,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.overlay,
  },

  settingLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },

  settingTitle: {
    fontSize: Typography.bodyLarge,
    color: Colors.brightWhite,
    fontWeight: '600',
  },

  settingSubtitle: {
    fontSize: Typography.bodySmall,
    color: Colors.desertTan,
    marginTop: Spacing.xs,
  },

  warningBox: {
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderWidth: 1,
    borderColor: Colors.playaOrange,
    borderRadius: 8,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },

  warningText: {
    fontSize: Typography.bodyMedium,
    color: Colors.playaOrange,
    textAlign: 'center',
  },

  statusText: {
    fontSize: Typography.bodySmall,
    color: Colors.playaGold,
    textAlign: 'center',
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },

  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  optionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
    backgroundColor: Colors.overlay,
    borderWidth: 1,
    borderColor: Colors.dustGray,
    minHeight: TouchTargets.minButton,
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionButtonSelected: {
    backgroundColor: Colors.playaOrange,
    borderColor: Colors.playaOrange,
  },

  optionText: {
    fontSize: Typography.bodyMedium,
    color: Colors.dustGray,
    fontWeight: '500',
  },

  optionTextSelected: {
    color: Colors.brightWhite,
    fontWeight: 'bold',
  },

  testButton: {
    backgroundColor: Colors.playaGold,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: TouchTargets.minButton,
  },

  testButtonText: {
    fontSize: Typography.bodyLarge,
    color: Colors.nightBlack,
    fontWeight: 'bold',
  },

  infoSection: {
    backgroundColor: Colors.overlay,
    borderRadius: 12,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },

  infoText: {
    fontSize: Typography.bodyMedium,
    color: Colors.desertTan,
    textAlign: 'center',
    lineHeight: Typography.bodyMedium * 1.4,
  },
});

export default NotificationSettings;