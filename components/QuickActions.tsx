/**
 * Quick Actions Component
 * Desert-optimized quick action buttons for common event searches
 */

import React from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors, Spacing, Typography } from '../constants/Theme';
import { FilterOptions } from './EventFilters';

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  description: string;
  filters: Partial<FilterOptions>;
  gradient: [string, string];
}

interface QuickActionsProps {
  onActionPress: (filters: Partial<FilterOptions>) => void;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'parties',
    title: 'Find Parties',
    icon: '🎉',
    description: 'Dance floors & celebrations',
    filters: {
      eventTypes: ['prty'],
      showOnlyActive: false,
      showOnlyUpcoming: true,
      sortBy: 'time',
    },
    gradient: [Colors.eventParty, Colors.playaOrange],
  },
  {
    id: 'food',
    title: 'Food Hunt',
    icon: '🍕',
    description: 'Meals & snacks available now',
    filters: {
      eventTypes: ['food'],
      showOnlyActive: true,
      sortBy: 'distance',
    },
    gradient: [Colors.eventFood, Colors.playaGold],
  },
  {
    id: 'drinks',
    title: 'Thirsty?',
    icon: '☕',
    description: 'Tea, coffee & bar services',
    filters: {
      eventTypes: ['tea'],
      showOnlyActive: true,
      sortBy: 'distance',
    },
    gradient: [Colors.eventDrinks, Colors.desertTan],
  },
  {
    id: 'art',
    title: 'Art Tours',
    icon: '🎨',
    description: 'Creative workshops & galleries',
    filters: {
      eventTypes: ['arts'],
      showOnlyUpcoming: true,
      sortBy: 'time',
    },
    gradient: [Colors.eventArts, Colors.playaPurple],
  },
  {
    id: 'workshops',
    title: 'Learn Something',
    icon: '🔨',
    description: 'Skills & workshops',
    filters: {
      eventTypes: ['work'],
      showOnlyUpcoming: true,
      sortBy: 'time',
    },
    gradient: [Colors.eventWork, Colors.dustGray],
  },
  {
    id: 'kids',
    title: 'Family Fun',
    icon: '👶',
    description: 'Kid-friendly activities',
    filters: {
      eventTypes: ['kid'],
      showOnlyUpcoming: true,
      sortBy: 'time',
    },
    gradient: [Colors.eventKid, Colors.playaGold],
  },
  {
    id: 'happening-now',
    title: 'Happening Now',
    icon: '🔴',
    description: 'Live events you can join',
    filters: {
      eventTypes: ['prty', 'food', 'tea', 'arts', 'work', 'kid', 'othr'],
      showOnlyActive: true,
      sortBy: 'distance',
    },
    gradient: [Colors.statusLive, Colors.playaOrange],
  },
  {
    id: 'tonight',
    title: 'Tonight',
    icon: '🌙',
    description: 'Events starting after sunset',
    filters: {
      eventTypes: ['prty', 'food', 'tea', 'arts', 'work', 'adlt', 'othr'],
      timeWindow: 12, // Next 12 hours
      showOnlyUpcoming: true,
      sortBy: 'time',
    },
    gradient: [Colors.nightBlack, Colors.playaPurple],
  },
  {
    id: 'ending-soon',
    title: 'Ending Soon',
    icon: '⏳',
    description: 'Don\'t miss these!',
    filters: {
      eventTypes: ['prty', 'food', 'tea', 'arts', 'work', 'kid', 'adlt', 'othr'],
      showOnlyActive: false,
      showOnlyUpcoming: true,
      sortBy: 'ending',
    },
    gradient: [Colors.statusEnded, Colors.playaPurple],
  },
];

export function QuickActions({ onActionPress }: QuickActionsProps) {
  return (
    <ThemedView style={styles.container}>      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {QUICK_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            onPress={() => onActionPress(action.filters)}
            style={[
              styles.actionButton,
              { backgroundColor: action.gradient[0] },
            ]}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={action.title}
            accessibilityHint={action.description}
          >
            <ThemedText style={styles.actionIcon}>
              {action.icon}
            </ThemedText>
            <ThemedText style={styles.actionTitle} numberOfLines={1}>
              {action.title}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: Spacing.sm,
  },

  scrollView: {
    flexGrow: 0,
  },

  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },

  actionButton: {
    width: 100,
    height: 60,
    borderRadius: 8,
    marginRight: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.nightBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },


  actionIcon: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 2,
  },

  actionTitle: {
    fontSize: Typography.bodySmall,
    color: Colors.brightWhite,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: Colors.nightBlack,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },

});

export default QuickActions;