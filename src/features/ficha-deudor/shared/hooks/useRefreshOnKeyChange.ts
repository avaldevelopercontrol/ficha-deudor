import { useEffect, useRef } from 'react';

interface UseRefreshOnKeyChangeParams {
  refreshKey: number;
  onRefresh: () => void;
  ignoreInitialValue?: boolean;
}

export const useRefreshOnKeyChange = ({
  refreshKey,
  onRefresh,
  ignoreInitialValue = true,
}: UseRefreshOnKeyChangeParams) => {
  const lastRefreshKeyRef = useRef(refreshKey);

  useEffect(() => {
    const isInitialRefreshKey = ignoreInitialValue && refreshKey === 0;
    const hasNotChanged = refreshKey === lastRefreshKeyRef.current;

    if (isInitialRefreshKey || hasNotChanged) {
      return;
    }

    lastRefreshKeyRef.current = refreshKey;
    onRefresh();
  }, [refreshKey, onRefresh, ignoreInitialValue]);
};