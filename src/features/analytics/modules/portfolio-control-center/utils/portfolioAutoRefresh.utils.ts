export const PORTFOLIO_AUTO_REFRESH_MS = 5 * 60 * 1000;
export const PORTFOLIO_AUTO_REFRESH_JITTER_MS = 30_000;

export interface PortfolioAutoRefreshTimers {
  setTimeout: (callback: () => void, delayMs: number) => number;
  clearTimeout: (timerId: number) => void;
  setInterval: (callback: () => void, delayMs: number) => number;
  clearInterval: (timerId: number) => void;
}

interface SchedulePortfolioAutoRefreshParams {
  refetch: () => void;
  isVisible: () => boolean;
  timers: PortfolioAutoRefreshTimers;
  random?: () => number;
  intervalMs?: number;
  jitterMaxMs?: number;
}

export const schedulePortfolioAutoRefresh = ({
  refetch,
  isVisible,
  timers,
  random = Math.random,
  intervalMs = PORTFOLIO_AUTO_REFRESH_MS,
  jitterMaxMs = PORTFOLIO_AUTO_REFRESH_JITTER_MS,
}: SchedulePortfolioAutoRefreshParams): (() => void) => {
  const jitterMs = Math.floor(random() * jitterMaxMs);
  let intervalId: number | null = null;

  const timeoutId = timers.setTimeout(() => {
    intervalId = timers.setInterval(() => {
      if (isVisible()) {
        refetch();
      }
    }, intervalMs);
  }, jitterMs);

  return () => {
    timers.clearTimeout(timeoutId);

    if (intervalId !== null) {
      timers.clearInterval(intervalId);
    }
  };
};
