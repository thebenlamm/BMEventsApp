/**
 * useNotifications Hook
 * React hook for managing push notifications
 */

import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { notificationService, NotificationSettings } from '../services/NotificationService';

export interface NotificationState {
  settings: NotificationSettings;
  scheduledCount: number;
  permissionStatus: Notifications.PermissionStatus | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseNotificationsResult extends NotificationState {
  // Actions
  requestPermissions: () => Promise<boolean>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  scheduleAllNotifications: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
  refreshState: () => Promise<void>;
  
  // Utilities
  isNotificationsSupported: boolean;
}

export function useNotifications(): UseNotificationsResult {
  const [state, setState] = useState<NotificationState>({
    settings: {
      enabled: false,
      reminderMinutes: 30,
      favoriteEventsOnly: true,
      soundEnabled: true,
      vibrationEnabled: true,
      badge: true,
    },
    scheduledCount: 0,
    permissionStatus: null,
    isLoading: true,
    error: null,
  });

  /**
   * Load current state from notification service
   */
  const loadState = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [settings, scheduledCount, permissionStatus] = await Promise.all([
        notificationService.getSettings(),
        notificationService.getScheduledNotificationsCount(),
        Notifications.getPermissionsAsync().then(result => result.status),
      ]);

      setState(prev => ({
        ...prev,
        settings,
        scheduledCount,
        permissionStatus,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load notification state',
        isLoading: false,
      }));
    }
  }, []);

  /**
   * Request notification permissions
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await notificationService.requestPermissions();
      await loadState(); // Refresh state
      return granted;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to request permissions',
      }));
      return false;
    }
  }, [loadState]);

  /**
   * Update notification settings
   */
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    try {
      await notificationService.updateSettings(newSettings);
      await loadState(); // Refresh state
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update settings',
      }));
    }
  }, [loadState]);

  /**
   * Schedule all notifications
   */
  const scheduleAllNotifications = useCallback(async () => {
    try {
      await notificationService.scheduleAllNotifications();
      await loadState(); // Refresh state
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to schedule notifications',
      }));
    }
  }, [loadState]);

  /**
   * Cancel all notifications
   */
  const cancelAllNotifications = useCallback(async () => {
    try {
      await notificationService.cancelAllNotifications();
      await loadState(); // Refresh state
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to cancel notifications',
      }));
    }
  }, [loadState]);

  /**
   * Send test notification
   */
  const sendTestNotification = useCallback(async () => {
    try {
      await notificationService.sendTestNotification();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to send test notification',
      }));
      throw error;
    }
  }, []);

  /**
   * Refresh state manually
   */
  const refreshState = useCallback(async () => {
    await loadState();
  }, [loadState]);

  // Load initial state
  useEffect(() => {
    loadState();
  }, [loadState]);

  // Set up notification listeners
  useEffect(() => {
    // Listen for notifications received while app is open
    const receivedSubscription = Notifications.addNotificationReceivedListener(
      notificationService.handleNotificationReceived
    );

    // Listen for user tapping notifications
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      notificationService.handleNotificationResponse
    );

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  // Cleanup expired notifications periodically
  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      try {
        const removedCount = await notificationService.cleanupExpiredNotifications();
        if (removedCount > 0) {
          console.log(`Cleaned up ${removedCount} expired notifications`);
          await loadState(); // Refresh count
        }
      } catch (error) {
        console.error('Error during notification cleanup:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, [loadState]);

  return {
    // State
    ...state,
    
    // Actions
    requestPermissions,
    updateSettings,
    scheduleAllNotifications,
    cancelAllNotifications,
    sendTestNotification,
    refreshState,
    
    // Utilities
    isNotificationsSupported: true, // Expo notifications are supported on all platforms
  };
}

export default useNotifications;