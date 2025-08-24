/**
 * Time Utilities for Burning Man Events
 * Handles Pacific Time formatting and countdown calculations
 */

/**
 * Get current time in Pacific timezone
 */
export function getCurrentPacificTime(): Date {
  return new Date();
}

/**
 * Format time for display in Pacific timezone
 */
export function formatTime(date: Date, options: {
  compact?: boolean;
  showDate?: boolean;
  showSeconds?: boolean;
} = {}): string {
  const { compact = false, showDate = true, showSeconds = false } = options;

  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Los_Angeles',
    hour: '2-digit',
    minute: '2-digit',
  };

  if (showSeconds) {
    formatOptions.second = '2-digit';
  }

  if (!compact && showDate) {
    formatOptions.weekday = 'short';
    formatOptions.month = 'numeric';
    formatOptions.day = 'numeric';
  }

  return date.toLocaleString([], formatOptions);
}

/**
 * Format time range for display
 */
export function formatTimeRange(start: Date, end: Date, compact = false): string {
  const startStr = formatTime(start, { compact, showDate: !compact });
  const endStr = formatTime(end, { compact: true }); // End time is always compact in range

  if (compact) {
    return `${startStr}-${endStr}`;
  }

  // Check if same day
  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return `${startStr} - ${endStr}`;
  }

  const endWithDate = formatTime(end, { compact: false, showDate: true });
  return `${startStr} - ${endWithDate}`;
}

/**
 * Format countdown time (e.g., "2h 30m", "45m")
 */
export function formatCountdown(minutes: number): string {
  const absMinutes = Math.abs(minutes);
  
  if (absMinutes < 60) {
    return `${absMinutes}m`;
  }
  
  const hours = Math.floor(absMinutes / 60);
  const remainingMinutes = absMinutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Get relative time string (e.g., "in 2h 30m", "started 15m ago")
 */
export function getRelativeTime(targetTime: Date, referenceTime = new Date()): {
  text: string;
  isPast: boolean;
  isNear: boolean; // Within 15 minutes
} {
  const diffMs = targetTime.getTime() - referenceTime.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  const isPast = diffMs < 0;
  const isNear = Math.abs(diffMinutes) <= 15;

  let text: string;
  if (isPast) {
    text = `${formatCountdown(-diffMinutes)} ago`;
  } else {
    text = `in ${formatCountdown(diffMinutes)}`;
  }

  return { text, isPast, isNear };
}

/**
 * Get countdown information for events
 */
export function getCountdownInfo(start: Date, end: Date, now = new Date()) {
  const minutesToStart = Math.round((start.getTime() - now.getTime()) / 60000);
  const minutesToEnd = Math.round((end.getTime() - now.getTime()) / 60000);

  return {
    minutesUntilStart: minutesToStart,
    minutesUntilEnd: minutesToEnd,
    startsIn: getRelativeTime(start, now),
    endsIn: getRelativeTime(end, now),
    isStartingSoon: minutesToStart > 0 && minutesToStart <= 15,
    isEndingSoon: minutesToStart <= 0 && minutesToEnd > 0 && minutesToEnd <= 15,
    isActive: minutesToStart <= 0 && minutesToEnd > 0,
    hasStarted: minutesToStart <= 0,
    hasEnded: minutesToEnd <= 0,
  };
}

/**
 * Convert datetime-local input to Pacific Time ISO string
 */
export function convertLocalToPacificISO(datetimeLocalValue: string): string {
  try {
    // Add seconds if not present
    let fullDateTime = datetimeLocalValue;
    if (fullDateTime.split('T')[1].split(':').length === 2) {
      fullDateTime += ':00';
    }
    
    // Add Pacific timezone offset
    const pacificDateTime = fullDateTime + '-07:00'; // Standard time offset
    const date = new Date(pacificDateTime);
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date created');
    }
    
    return date.toISOString();
  } catch (error) {
    console.error('Pacific conversion failed:', error);
    return new Date().toISOString();
  }
}

/**
 * Get current time as datetime-local string for input fields
 */
export function getCurrentDateTimeLocal(): string {
  const now = new Date();
  
  // Get current time in Pacific timezone
  const pacificTimeString = now.toLocaleString("en-CA", {
    timeZone: "America/Los_Angeles",
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // Convert to datetime-local format: YYYY-MM-DDTHH:mm:ss
  const [datePart, timePart] = pacificTimeString.split(', ');
  return `${datePart}T${timePart}`;
}

/**
 * Check if a date is today in Pacific timezone
 */
export function isToday(date: Date): boolean {
  const now = new Date();
  const todayPacific = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  const datePacific = new Date(date.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  
  return (
    todayPacific.getFullYear() === datePacific.getFullYear() &&
    todayPacific.getMonth() === datePacific.getMonth() &&
    todayPacific.getDate() === datePacific.getDate()
  );
}

/**
 * Check if a date is tomorrow in Pacific timezone
 */
export function isTomorrow(date: Date): boolean {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const tomorrowPacific = new Date(tomorrow.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  const datePacific = new Date(date.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  
  return (
    tomorrowPacific.getFullYear() === datePacific.getFullYear() &&
    tomorrowPacific.getMonth() === datePacific.getMonth() &&
    tomorrowPacific.getDate() === datePacific.getDate()
  );
}

/**
 * Get day abbreviation (Su, M, Tu, W, Th, F, S)
 */
export function getDayAbbreviation(date: Date): string {
  const dayAbbreviations = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'S'];
  return dayAbbreviations[date.getDay()];
}

/**
 * Format duration in a human-readable way
 */
export function formatDuration(startDate: Date, endDate: Date): string {
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationMinutes = Math.round(durationMs / 60000);
  
  if (durationMinutes < 60) {
    return `${durationMinutes}m`;
  }
  
  const hours = Math.floor(durationMinutes / 60);
  const remainingMinutes = durationMinutes % 60;
  
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (remainingHours === 0) {
      return `${days}d`;
    }
    
    return `${days}d ${remainingHours}h`;
  }
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Parse occurrence set and return valid date objects
 */
export function parseOccurrenceSet(occurrenceSet: any[]): Array<{ start: Date; end: Date }> {
  return occurrenceSet
    .map(occ => {
      try {
        const start = new Date(occ.start_time);
        const end = new Date(occ.end_time);
        
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return null;
        }
        
        return { start, end };
      } catch {
        return null;
      }
    })
    .filter(Boolean) as Array<{ start: Date; end: Date }>;
}

export default {
  getCurrentPacificTime,
  formatTime,
  formatTimeRange,
  formatCountdown,
  getRelativeTime,
  getCountdownInfo,
  convertLocalToPacificISO,
  getCurrentDateTimeLocal,
  isToday,
  isTomorrow,
  getDayAbbreviation,
  formatDuration,
  parseOccurrenceSet,
};