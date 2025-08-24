/**
 * Quick Actions Component
 * Desert-optimized quick action buttons for common event searches
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors, Spacing, Typography, TouchTargets } from '../constants/Theme';
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
];

export function QuickActions({ onActionPress }: QuickActionsProps) {
  const screenWidth = Dimensions.get('window').width;
  const actionWidth = (screenWidth - (Spacing.lg * 2) - Spacing.md) / 2; // 2 columns with spacing

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        ⚡ Quick Actions
      </ThemedText>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((action, index) => {
            const isOddRow = Math.floor(index / 2) % 2 === 1;
            const isSecondColumn = index % 2 === 1;
            
            return (
              <TouchableOpacity
                key={action.id}
                onPress={() => onActionPress(action.filters)}
                style={[
                  styles.actionButton,
                  {
                    width: actionWidth,
                    backgroundColor: action.gradient[0],
                  },
                  // Stagger the layout for visual interest
                  isOddRow && isSecondColumn && styles.actionButtonOffset,
                ]}
                activeOpacity={0.8}
              >
                {/* Background gradient effect */}
                <View 
                  style={[
                    styles.gradientOverlay,
                    { backgroundColor: action.gradient[1] }
                  ]} 
                />
                
                <View style={styles.actionContent}>
                  <ThemedText style={styles.actionIcon}>
                    {action.icon}
                  </ThemedText>
                  
                  <ThemedText type="defaultSemiBold" style={styles.actionTitle}>
                    {action.title}
                  </ThemedText>
                  
                  <ThemedText style={styles.actionDescription} numberOfLines={2}>
                    {action.description}
                  </ThemedText>
                </View>
                
                {/* Subtle border for depth */}
                <View style={styles.actionBorder} />
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingVertical: Spacing.md,
  },

  sectionTitle: {
    fontSize: Typography.titleSmall,
    color: Colors.brightWhite,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.lg,
  },

  scrollView: {
    flexGrow: 0,
  },

  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    width: 800, // Fixed width for horizontal scrolling
  },

  actionButton: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Colors.nightBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minHeight: TouchTargets.minButton * 2.5,
  },

  actionButtonOffset: {
    marginTop: -20, // Create staggered effect
  },

  gradientOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: '50%',
    opacity: 0.3,
  },

  actionContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
    zIndex: 2,
  },

  actionIcon: {
    fontSize: Typography.titleLarge,
    textAlign: 'left',
    lineHeight: Typography.titleLarge * 1.2,
  },

  actionTitle: {
    fontSize: Typography.titleSmall,
    color: Colors.brightWhite,
    fontWeight: 'bold',
    textShadowColor: Colors.nightBlack,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginTop: Spacing.xs,
  },

  actionDescription: {
    fontSize: Typography.bodySmall,
    color: Colors.brightWhite,
    opacity: 0.9,
    textShadowColor: Colors.nightBlack,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    lineHeight: Typography.bodySmall * 1.3,
    marginTop: Spacing.xs,
  },

  actionBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    pointerEvents: 'none',
  },
});

export default QuickActions;