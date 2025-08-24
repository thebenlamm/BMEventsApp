/**
 * Event Filters Component
 * Desert-optimized filtering UI for events, art, and camps
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors, Spacing, Typography, TouchTargets, AppConfig } from '../constants/Theme';

export interface FilterOptions {
  eventTypes: string[];
  radius: number;
  timeWindow: number;
  showOnlyActive: boolean;
  showOnlyUpcoming: boolean;
  showOnlyFavorites: boolean;
  sortBy: 'default' | 'distance' | 'time' | 'type';
}

interface EventFiltersProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  hasLocation: boolean;
}

const EVENT_TYPES = [
  { key: 'prty', label: 'Party', color: Colors.eventParty, icon: '🎉' },
  { key: 'food', label: 'Food', color: Colors.eventFood, icon: '🍕' },
  { key: 'tea', label: 'Drinks', color: Colors.eventDrinks, icon: '☕' },
  { key: 'arts', label: 'Arts', color: Colors.eventArts, icon: '🎨' },
  { key: 'work', label: 'Workshop', color: Colors.eventWork, icon: '🔨' },
  { key: 'kid', label: 'Kids', color: Colors.eventKid, icon: '👶' },
  { key: 'adlt', label: 'Adult', color: Colors.eventAdult, icon: '🔞' },
  { key: 'othr', label: 'Other', color: Colors.eventOther, icon: '🌟' },
];

const RADIUS_OPTIONS = [
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
  { value: 2000, label: '2km' },
  { value: 5000, label: '5km' },
  { value: 10000, label: '10km' },
  { value: 999999, label: 'All' },
];

const TIME_WINDOW_OPTIONS = [
  { value: 1, label: '1 hour' },
  { value: 3, label: '3 hours' },
  { value: 6, label: '6 hours' },
  { value: 12, label: '12 hours' },
  { value: 24, label: '24 hours' },
  { value: 999999, label: 'All time' },
];

const SORT_OPTIONS = [
  { value: 'default', label: 'Smart Sort', icon: '✨' },
  { value: 'distance', label: 'Distance', icon: '📍' },
  { value: 'time', label: 'Time', icon: '⏰' },
  { value: 'type', label: 'Type', icon: '🏷️' },
];

export function EventFilters({
  visible,
  onClose,
  filters,
  onFiltersChange,
  hasLocation,
}: EventFiltersProps) {
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);

  const handleEventTypeToggle = useCallback((typeKey: string) => {
    setTempFilters(prev => ({
      ...prev,
      eventTypes: prev.eventTypes.includes(typeKey)
        ? prev.eventTypes.filter(t => t !== typeKey)
        : [...prev.eventTypes, typeKey],
    }));
  }, []);

  const handleSelectAllTypes = useCallback(() => {
    setTempFilters(prev => ({
      ...prev,
      eventTypes: EVENT_TYPES.map(t => t.key),
    }));
  }, []);

  const handleClearAllTypes = useCallback(() => {
    setTempFilters(prev => ({
      ...prev,
      eventTypes: [],
    }));
  }, []);

  const handleApplyFilters = useCallback(() => {
    if (tempFilters.eventTypes.length === 0) {
      Alert.alert(
        'No Event Types',
        'Please select at least one event type to show results.',
        [{ text: 'OK' }]
      );
      return;
    }

    onFiltersChange(tempFilters);
    onClose();
  }, [tempFilters, onFiltersChange, onClose]);

  const handleResetFilters = useCallback(() => {
    const defaultFilters: FilterOptions = {
      eventTypes: EVENT_TYPES.map(t => t.key),
      radius: AppConfig.defaultRadius,
      timeWindow: AppConfig.defaultTimeWindow,
      showOnlyActive: false,
      showOnlyUpcoming: false,
      showOnlyFavorites: false,
      sortBy: 'default',
    };
    setTempFilters(defaultFilters);
  }, []);

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
            🔍 Filters
          </ThemedText>
          
          <TouchableOpacity onPress={handleResetFilters} style={styles.resetButton}>
            <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Event Types Section */}
          <ThemedView style={styles.section}>
            <ThemedView style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Event Types
              </ThemedText>
              <ThemedView style={styles.selectButtons}>
                <TouchableOpacity onPress={handleSelectAllTypes} style={styles.selectButton}>
                  <ThemedText style={styles.selectButtonText}>All</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleClearAllTypes} style={styles.selectButton}>
                  <ThemedText style={styles.selectButtonText}>None</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.typeGrid}>
              {EVENT_TYPES.map((type) => {
                const isSelected = tempFilters.eventTypes.includes(type.key);
                return (
                  <TouchableOpacity
                    key={type.key}
                    onPress={() => handleEventTypeToggle(type.key)}
                    style={[
                      styles.typeButton,
                      isSelected && { backgroundColor: type.color },
                      !isSelected && styles.typeButtonInactive,
                    ]}
                  >
                    <ThemedText style={styles.typeIcon}>{type.icon}</ThemedText>
                    <ThemedText style={[
                      styles.typeLabel,
                      isSelected && styles.typeLabelSelected,
                    ]}>
                      {type.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ThemedView>
          </ThemedView>

          {/* Distance Section */}
          {hasLocation && (
            <ThemedView style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                📍 Distance Range
              </ThemedText>
              <ThemedView style={styles.optionGrid}>
                {RADIUS_OPTIONS.map((option) => {
                  const isSelected = tempFilters.radius === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setTempFilters(prev => ({ ...prev, radius: option.value }))}
                      style={[
                        styles.optionButton,
                        isSelected && styles.optionButtonSelected,
                      ]}
                    >
                      <ThemedText style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}>
                        {option.label}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </ThemedView>
            </ThemedView>
          )}

          {/* Time Window Section */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              ⏰ Time Window
            </ThemedText>
            <ThemedView style={styles.optionGrid}>
              {TIME_WINDOW_OPTIONS.map((option) => {
                const isSelected = tempFilters.timeWindow === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setTempFilters(prev => ({ ...prev, timeWindow: option.value }))}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonSelected,
                    ]}
                  >
                    <ThemedText style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}>
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ThemedView>
          </ThemedView>

          {/* Quick Filters Section */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              🎯 Quick Filters
            </ThemedText>
            <ThemedView style={styles.quickFilters}>
              <TouchableOpacity
                onPress={() => setTempFilters(prev => ({ ...prev, showOnlyActive: !prev.showOnlyActive }))}
                style={[
                  styles.quickFilterButton,
                  tempFilters.showOnlyActive && styles.quickFilterButtonActive,
                ]}
              >
                <ThemedText style={[
                  styles.quickFilterText,
                  tempFilters.showOnlyActive && styles.quickFilterTextActive,
                ]}>
                  🔴 Active Now
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setTempFilters(prev => ({ ...prev, showOnlyUpcoming: !prev.showOnlyUpcoming }))}
                style={[
                  styles.quickFilterButton,
                  tempFilters.showOnlyUpcoming && styles.quickFilterButtonActive,
                ]}
              >
                <ThemedText style={[
                  styles.quickFilterText,
                  tempFilters.showOnlyUpcoming && styles.quickFilterTextActive,
                ]}>
                  📅 Upcoming
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setTempFilters(prev => ({ ...prev, showOnlyFavorites: !prev.showOnlyFavorites }))}
                style={[
                  styles.quickFilterButton,
                  tempFilters.showOnlyFavorites && styles.quickFilterButtonActive,
                ]}
              >
                <ThemedText style={[
                  styles.quickFilterText,
                  tempFilters.showOnlyFavorites && styles.quickFilterTextActive,
                ]}>
                  ⭐ Favorites
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          {/* Sort Options Section */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              📋 Sort By
            </ThemedText>
            <ThemedView style={styles.optionGrid}>
              {SORT_OPTIONS.map((option) => {
                const isSelected = tempFilters.sortBy === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setTempFilters(prev => ({ ...prev, sortBy: option.value as any }))}
                    style={[
                      styles.sortButton,
                      isSelected && styles.sortButtonSelected,
                    ]}
                  >
                    <ThemedText style={styles.sortIcon}>{option.icon}</ThemedText>
                    <ThemedText style={[
                      styles.sortText,
                      isSelected && styles.sortTextSelected,
                    ]}>
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ThemedView>
          </ThemedView>
        </ScrollView>

        {/* Apply Button */}
        <ThemedView style={styles.footer}>
          <TouchableOpacity
            onPress={handleApplyFilters}
            style={styles.applyButton}
          >
            <ThemedText style={styles.applyButtonText}>
              Apply Filters ({tempFilters.eventTypes.length} types)
            </ThemedText>
          </TouchableOpacity>
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

  resetButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: Colors.dustGray,
  },

  resetButtonText: {
    fontSize: Typography.bodyMedium,
    color: Colors.brightWhite,
    fontWeight: '600',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: Spacing.lg,
  },

  section: {
    marginBottom: Spacing.xl,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  sectionTitle: {
    fontSize: Typography.titleSmall,
    color: Colors.brightWhite,
    fontWeight: 'bold',
  },

  selectButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  selectButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.overlay,
    borderRadius: 16,
  },

  selectButtonText: {
    fontSize: Typography.bodySmall,
    color: Colors.brightWhite,
    fontWeight: '500',
  },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    minHeight: TouchTargets.minButton,
    gap: Spacing.xs,
  },

  typeButtonInactive: {
    backgroundColor: Colors.overlay,
    borderWidth: 1,
    borderColor: Colors.dustGray,
  },

  typeIcon: {
    fontSize: Typography.bodyMedium,
  },

  typeLabel: {
    fontSize: Typography.bodyMedium,
    color: Colors.dustGray,
    fontWeight: '500',
  },

  typeLabelSelected: {
    color: Colors.brightWhite,
    fontWeight: 'bold',
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

  quickFilters: {
    gap: Spacing.sm,
  },

  quickFilterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    backgroundColor: Colors.overlay,
    borderWidth: 1,
    borderColor: Colors.dustGray,
    minHeight: TouchTargets.minButton,
    alignItems: 'center',
  },

  quickFilterButtonActive: {
    backgroundColor: Colors.playaOrange,
    borderColor: Colors.playaOrange,
  },

  quickFilterText: {
    fontSize: Typography.bodyLarge,
    color: Colors.dustGray,
    fontWeight: '500',
  },

  quickFilterTextActive: {
    color: Colors.brightWhite,
    fontWeight: 'bold',
  },

  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
    backgroundColor: Colors.overlay,
    borderWidth: 1,
    borderColor: Colors.dustGray,
    minHeight: TouchTargets.minButton,
    gap: Spacing.xs,
    flex: 1,
    justifyContent: 'center',
  },

  sortButtonSelected: {
    backgroundColor: Colors.playaGold,
    borderColor: Colors.playaGold,
  },

  sortIcon: {
    fontSize: Typography.bodyMedium,
  },

  sortText: {
    fontSize: Typography.bodyMedium,
    color: Colors.dustGray,
    fontWeight: '500',
  },

  sortTextSelected: {
    color: Colors.nightBlack,
    fontWeight: 'bold',
  },

  footer: {
    padding: Spacing.lg,
    backgroundColor: Colors.playaPurple,
    borderTopWidth: 1,
    borderTopColor: Colors.overlay,
  },

  applyButton: {
    backgroundColor: Colors.playaOrange,
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: TouchTargets.minButton,
  },

  applyButtonText: {
    fontSize: Typography.titleSmall,
    color: Colors.brightWhite,
    fontWeight: 'bold',
  },
});

export default EventFilters;