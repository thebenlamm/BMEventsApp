import React from 'react';
import { render, screen } from '@testing-library/react-native';
import CountdownTimer from '../components/CountdownTimer';

// The component uses timers internally, so use fake timers to control time
beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});

describe('CountdownTimer', () => {
  it('shows start time when event has not started', () => {
    const start = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    const end = new Date(Date.now() + 70 * 60 * 1000); // 70 minutes from now

    render(<CountdownTimer start={start} end={end} />);

    expect(screen.getByText(/Starts in 10m/)).toBeTruthy();
  });

  it('shows remaining time when event is active', () => {
    const start = new Date(Date.now() - 10 * 60 * 1000); // started 10m ago
    const end = new Date(Date.now() + 50 * 60 * 1000); // ends in 50m

    render(<CountdownTimer start={start} end={end} />);

    expect(screen.getByText(/Ends in 50m/)).toBeTruthy();
    const timer = screen.getByA11yRole('timer');
    expect(timer.props.accessibilityLabel).toContain('Event is happening now');
  });

  it('shows ended state when event is over', () => {
    const start = new Date(Date.now() - 120 * 60 * 1000); // started 2h ago
    const end = new Date(Date.now() - 60 * 60 * 1000); // ended 1h ago

    render(<CountdownTimer start={start} end={end} />);

    expect(screen.getByText(/Ended/)).toBeTruthy();
  });
});
