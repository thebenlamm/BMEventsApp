/**
 * Countdown Timer Component
 * Real-time updating countdown with different refresh rates based on urgency
 */

import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors, Typography } from '../constants/Theme';
import { getCountdownInfo } from '../utils/timeUtils';

interface CountdownTimerProps {
  start: Date;
  end: Date;
  style?: any;
  textStyle?: any;
  urgentStyle?: any;
  showIcon?: boolean;
}

export function CountdownTimer({
  start,
  end,
  style,
  textStyle,
  urgentStyle,
  showIcon = true,
}: CountdownTimerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Calculate countdown info
  const countdown = useMemo(() => 
    getCountdownInfo(start, end, currentTime), 
    [start, end, currentTime]
  );

  // Determine update frequency based on how close the event is
  const updateInterval = useMemo(() => {
    if (countdown.isStartingSoon || countdown.isEndingSoon) {
      return 15000; // 15 seconds for events starting/ending soon
    } else if (countdown.isActive) {
      return 30000; // 30 seconds for active events
    } else if (countdown.minutesUntilStart <= 60) {
      return 60000; // 1 minute for events starting within an hour
    } else {
      return 300000; // 5 minutes for all other events
    }
  }, [countdown]);

  // Update timer effect with dynamic interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);

    return () => clearInterval(timer);
  }, [updateInterval]);

  // Get countdown text
  const getCountdownText = () => {
    if (countdown.isActive) {
      return `Ends ${countdown.endsIn.text}`;
    } else if (countdown.hasStarted && countdown.hasEnded) {
      return 'Ended';
    } else {
      return `Starts ${countdown.startsIn.text}`;
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    if (!showIcon) return '';
    
    if (countdown.isActive) {
      return '🔴 ';
    } else if (countdown.isStartingSoon) {
      return '⚡ ';
    } else if (countdown.hasEnded) {
      return '⏹️ ';
    } else {
      return '⏰ ';
    }
  };

  // Apply urgent styling for events starting/ending soon
  const isUrgent = countdown.isStartingSoon || countdown.isEndingSoon;
  const finalTextStyle = [
    styles.countdownText,
    textStyle,
    isUrgent && styles.urgentText,
    isUrgent && urgentStyle,
  ];

  // Create accessibility label
  const accessibilityLabel = useMemo(() => {
    if (countdown.hasEnded) {
      return 'Event has ended';
    } else if (countdown.isActive) {
      return `Event is happening now, ends in ${getCountdownText().replace(/[⏰🔴⚡⏹️]/g, '').trim()}`;
    } else if (countdown.isStartingSoon) {
      return `Event starting soon, in ${getCountdownText().replace(/[⏰🔴⚡⏹️]/g, '').trim()}`;
    } else {
      return `Event starts in ${getCountdownText().replace(/[⏰🔴⚡⏹️]/g, '').trim()}`;
    }
  }, [countdown, getCountdownText]);

  return (
    <ThemedView 
      style={style}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="timer"
    >
      <ThemedText style={finalTextStyle}>
        {getStatusIcon()}{getCountdownText()}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  countdownText: {
    fontSize: Typography.bodySmall,
    color: Colors.dustGray,
    fontWeight: '600',
  },

  urgentText: {
    color: Colors.statusLive,
    fontWeight: 'bold',
  },
});

export default CountdownTimer;