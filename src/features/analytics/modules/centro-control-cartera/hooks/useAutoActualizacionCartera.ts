import { useEffect } from 'react';

import {
  scheduleAutoActualizacionCartera,
} from '../utils/autoActualizacionCartera.utils';

interface UseAutoActualizacionCarteraParams {
  refetch: () => Promise<void>;
}

export const useAutoActualizacionCartera = ({
  refetch,
}: UseAutoActualizacionCarteraParams) => {
  useEffect(() => {
    return scheduleAutoActualizacionCartera({
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
