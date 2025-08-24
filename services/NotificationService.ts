/**
 * Notification Service for Burning Man Events
 * Handles push notifications for upcoming favorite events
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { favoritesService } from './FavoritesService';
import { FavoriteEvent } from '../types/events';

const NOTIFICATION_SETTINGS_KEY = 'bm_notification_settings';

export interface NotificationSettings {
  enabled: boolean;
  reminderMinutes: number; // How many minutes before event to notify
  favoriteEventsOnly: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  badge: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  reminderMinutes: 30, // 30 minutes before
  favoriteEventsOnly: true,
  soundEnabled: true,
  vibrationEnabled: true,
  badge: true,
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  private settings: NotificationSettings = DEFAULT_SETTINGS;
  private isInitialized = false;

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load saved settings
      await this.loadSettings();
      
      // Request permissions if notifications are enabled
      if (this.settings.enabled) {
        await this.requestPermissions();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      this.isInitialized = true;
    }
  }

  /**
   * Load notification settings from storage
   */
  private async loadSettings(): Promise<void> {
    try {
      const settingsJson = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (settingsJson) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) };
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
      this.settings = DEFAULT_SETTINGS;
    }
  }

  /**
   * Save notification settings to storage
   */
  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.warn('Notifications require a physical device');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }

      // Configure notification categories for different types
      await Notifications.setNotificationCategoryAsync('event-reminder', [
        {
          identifier: 'view',
          buttonTitle: 'View Event',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'dismiss',
          buttonTitle: 'Dismiss',
          options: { isDestructive: true },
        },
      ]);

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Get current notification settings
   */
  async getSettings(): Promise<NotificationSettings> {
    await this.initialize();
    return { ...this.settings };
  }

  /**
   * Update notification settings
   */
  async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    await this.initialize();
    
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();

    // Request permissions if enabled
    if (this.settings.enabled) {
      await this.requestPermissions();
    }

    // Reschedule all notifications with new settings
    await this.scheduleAllNotifications();
  }

  /**
   * Schedule notification for a specific event
   */
  async scheduleEventNotification(event: FavoriteEvent): Promise<string | null> {
    if (!this.settings.enabled) return null;

    try {
      const eventStart = new Date(event.start);
      const notificationTime = new Date(eventStart.getTime() - (this.settings.reminderMinutes * 60 * 1000));

      // Don't schedule if notification time is in the past
      if (notificationTime <= new Date()) {
        return null;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔥 ${event.title}`,
          body: `Starting ${this.settings.reminderMinutes === 1 ? 'in 1 minute' : `in ${this.settings.reminderMinutes} minutes`} at ${event.locLabel}`,
          data: {
            eventId: event.id,
            eventUid: event.eventUid,
            type: 'event-reminder',
          },
          categoryIdentifier: 'event-reminder',
          sound: this.settings.soundEnabled ? 'default' : undefined,
          badge: this.settings.badge ? 1 : undefined,
        },
        trigger: {
          date: notificationTime,
        },
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling event notification:', error);
      return null;
    }
  }

  /**
   * Schedule notifications for all favorite events
   */
  async scheduleAllNotifications(): Promise<void> {
    if (!this.settings.enabled) return;

    try {
      // Cancel all existing scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Get upcoming favorite events
      const favorites = await favoritesService.getUpcomingFavorites();
      
      let scheduledCount = 0;
      for (const favorite of favorites) {
        const notificationId = await this.scheduleEventNotification(favorite);
        if (notificationId) {
          scheduledCount++;
        }
      }

      console.log(`Scheduled ${scheduledCount} event notifications`);
    } catch (error) {
      console.error('Error scheduling all notifications:', error);
    }
  }

  /**
   * Cancel notification for specific event
   */
  async cancelEventNotification(eventId: string): Promise<void> {
    try {
      // Get all scheduled notifications and find ones for this event
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        if (notification.content.data?.eventId === eventId) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Error canceling event notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Send immediate notification (for testing)
   */
  async sendTestNotification(): Promise<void> {
    if (!this.settings.enabled) {
      throw new Error('Notifications are disabled');
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔥 Burning Man Events',
          body: 'Notifications are working! You\'ll get reminders for your favorite events.',
          data: { type: 'test' },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  }

  /**
   * Get scheduled notifications count
   */
  async getScheduledNotificationsCount(): Promise<number> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      return scheduled.filter(n => n.content.data?.type === 'event-reminder').length;
    } catch (error) {
      console.error('Error getting scheduled notifications count:', error);
      return 0;
    }
  }

  /**
   * Handle notification received while app is open
   */
  async handleNotificationReceived(notification: Notifications.Notification): Promise<void> {
    const data = notification.request.content.data;
    
    if (data?.type === 'event-reminder') {
      console.log('Event reminder notification received:', data.eventId);
      // Could trigger app-specific actions like highlighting the event
    }
  }

  /**
   * Handle notification tap (when user taps notification)
   */
  async handleNotificationResponse(response: Notifications.NotificationResponse): Promise<void> {
    const data = response.notification.request.content.data;
    
    if (data?.type === 'event-reminder') {
      console.log('User tapped event reminder notification:', data.eventId);
      // Could navigate to specific event or favorites screen
    }
  }

  /**
   * Clean up expired notifications
   */
  async cleanupExpiredNotifications(): Promise<number> {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const now = new Date();
      let removedCount = 0;

      for (const notification of scheduled) {
        if (notification.trigger && 'date' in notification.trigger) {
          const triggerDate = new Date(notification.trigger.date!);
          if (triggerDate <= now) {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
            removedCount++;
          }
        }
      }

      return removedCount;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;