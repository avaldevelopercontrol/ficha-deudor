import { useState, useEffect, useCallback } from 'react';

interface UseApiResourceState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useApiResource<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: unknown[]
) {
  const [state, setState] = useState<UseApiResourceState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const refetch = useCallback(() => {
    const controller = new AbortController();
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    fetcher(controller.signal)
      .then(data => setState({ data, isLoading: false, error: null }))
      .catch(err => {
        if (err.name === 'AbortError') return;
        setState({ data: null, isLoading: false, error: err.message });
      });

    return () => controller.abort();
  }, deps);

  useEffect(() => {
    const cleanup = refetch();
    return cleanup;
  }, [refetch]);

  return { ...state, refetch };
}