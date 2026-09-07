import { useEffect } from 'react';

import {
  schedulePortfolioAutoRefresh,
} from '../utils/portfolioAutoRefresh.utils';

interface UsePortfolioAutoRefreshParams {
  refetch: () => Promise<void>;
}

export const usePortfolioAutoRefresh = ({
  refetch,
}: UsePortfolioAutoRefreshParams) => {
  useEffect(() => {
    return schedulePortfolioAutoRefresh({
      refetch: () => {
        void refetch();
      },
      isVisible: () => document.visibilityState === 'visible',
      timers: {
        setTimeout: (callback, delayMs) =>
          window.setTimeout(callback, delayMs),
        clearTimeout: (timerId) => {
          window.clearTimeout(timerId);
        },
        setInterval: (callback, delayMs) =>
          window.setInterval(callback, delayMs),
        clearInterval: (timerId) => {
          window.clearInterval(timerId);
        },
      },
    });
  }, [refetch]);
};
