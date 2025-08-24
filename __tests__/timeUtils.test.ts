import {
  formatCountdown,
  getRelativeTime,
  getCountdownInfo,
  parseOccurrenceSet,
  formatDuration,
} from '../utils/timeUtils';

describe('timeUtils', () => {
  describe('formatCountdown', () => {
    it('formats minutes under an hour', () => {
      expect(formatCountdown(45)).toBe('45m');
    });

    it('formats full hours', () => {
      expect(formatCountdown(120)).toBe('2h');
    });

    it('formats hours and minutes', () => {
      expect(formatCountdown(150)).toBe('2h 30m');
    });
  });

  describe('getRelativeTime', () => {
    it('returns future times', () => {
      const now = new Date('2025-01-01T00:00:00Z');
      const target = new Date(now.getTime() + 30 * 60000);
      const result = getRelativeTime(target, now);
      expect(result).toEqual({ text: 'in 30m', isPast: false, isNear: false });
    });

    it('returns past times', () => {
      const now = new Date('2025-01-01T00:00:00Z');
      const target = new Date(now.getTime() - 10 * 60000);
      const result = getRelativeTime(target, now);
      expect(result).toEqual({ text: '10m ago', isPast: true, isNear: true });
    });
  });

  describe('getCountdownInfo', () => {
    it('identifies active events', () => {
      const now = new Date('2025-01-01T00:00:00Z');
      const start = new Date(now.getTime() - 5 * 60000);
      const end = new Date(now.getTime() + 5 * 60000);
      const info = getCountdownInfo(start, end, now);
      expect(info.isActive).toBe(true);
      expect(info.isStartingSoon).toBe(false);
      expect(info.isEndingSoon).toBe(true);
    });
  });

  describe('parseOccurrenceSet', () => {
    it('filters invalid entries', () => {
      const occurrences = [
        { start_time: '2025-01-01T00:00:00Z', end_time: '2025-01-01T01:00:00Z' },
        { start_time: 'bad', end_time: 'data' },
      ];
      const parsed = parseOccurrenceSet(occurrences);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].start instanceof Date).toBe(true);
    });
  });

  describe('formatDuration', () => {
    it('formats durations with days and hours', () => {
      const start = new Date('2025-01-01T00:00:00Z');
      const end = new Date('2025-01-03T03:00:00Z');
      expect(formatDuration(start, end)).toBe('2d 3h');
    });
  });
});
