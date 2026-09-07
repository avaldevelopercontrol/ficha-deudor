import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  PORTFOLIO_AUTO_REFRESH_JITTER_MS,
  PORTFOLIO_AUTO_REFRESH_MS,
  schedulePortfolioAutoRefresh,
  type PortfolioAutoRefreshTimers,
} from './portfolioAutoRefresh.utils';

interface TimerFixture {
  timers: PortfolioAutoRefreshTimers;
  getTimeoutCallback: () => (() => void) | null;
  getIntervalCallback: () => (() => void) | null;
  timeoutDelays: number[];
  intervalDelays: number[];
  clearedTimeouts: number[];
  clearedIntervals: number[];
}

const createTimerFixture = (): TimerFixture => {
  let timeoutCallback: (() => void) | null = null;
  let intervalCallback: (() => void) | null = null;
  const timeoutDelays: number[] = [];
  const intervalDelays: number[] = [];
  const clearedTimeouts: number[] = [];
  const clearedIntervals: number[] = [];

  return {
    timers: {
      setTimeout: (callback, delayMs) => {
        timeoutCallback = callback;
        timeoutDelays.push(delayMs);
        return 101;
      },
      clearTimeout: (timerId) => {
        clearedTimeouts.push(timerId);
      },
      setInterval: (callback, delayMs) => {
        intervalCallback = callback;
        intervalDelays.push(delayMs);
        return 202;
      },
      clearInterval: (timerId) => {
        clearedIntervals.push(timerId);
      },
    },
    getTimeoutCallback: () => timeoutCallback,
    getIntervalCallback: () => intervalCallback,
    timeoutDelays,
    intervalDelays,
    clearedTimeouts,
    clearedIntervals,
  };
};

export const suite = defineSuite(
  'portfolioAutoRefresh.utils',
  [
    test(
      'programa jitter e intervalo con la cadencia operativa existente',
      () => {
        const fixture = createTimerFixture();

        schedulePortfolioAutoRefresh({
          refetch: () => undefined,
          isVisible: () => true,
          timers: fixture.timers,
          random: () => 0.5,
        });

        assert.deepEqual(fixture.timeoutDelays, [
          Math.floor(PORTFOLIO_AUTO_REFRESH_JITTER_MS * 0.5),
        ]);

        fixture.getTimeoutCallback()?.();

        assert.deepEqual(fixture.intervalDelays, [
          PORTFOLIO_AUTO_REFRESH_MS,
        ]);
      }
    ),
    test(
      'refresca únicamente cuando la aplicación está visible',
      () => {
        const fixture = createTimerFixture();
        let visible = false;
        let refreshCount = 0;

        schedulePortfolioAutoRefresh({
          refetch: () => {
            refreshCount += 1;
          },
          isVisible: () => visible,
          timers: fixture.timers,
          random: () => 0,
        });

        fixture.getTimeoutCallback()?.();
        fixture.getIntervalCallback()?.();
        assert.equal(refreshCount, 0);

        visible = true;
        fixture.getIntervalCallback()?.();
        assert.equal(refreshCount, 1);
      }
    ),
    test(
      'limpia timeout e intervalo al desmontar el consumidor',
      () => {
        const fixture = createTimerFixture();
        const cleanup = schedulePortfolioAutoRefresh({
          refetch: () => undefined,
          isVisible: () => true,
          timers: fixture.timers,
          random: () => 0,
        });

        fixture.getTimeoutCallback()?.();
        cleanup();

        assert.deepEqual(fixture.clearedTimeouts, [101]);
        assert.deepEqual(fixture.clearedIntervals, [202]);
      }
    ),
  ]
);
