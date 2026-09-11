import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  cancelAnalyticsAccessRequest,
  commitAnalyticsAccess,
  getAnalyticsAccessSnapshot,
  isAnalyticsAbortError,
  isAnalyticsAccessStale,
  prepareAnalyticsAccessLoad,
  selectAnalyticsCrmClient,
  type AnalyticsAccessRequest,
} from '../application/analyticsAccess.application';
import type {
  AnalyticsAccessContext,
} from '../domain/analyticsAccess.types';

export function useAnalyticsAccess(
  optionId: number
) {
  const initialSnapshot =
    getAnalyticsAccessSnapshot(optionId);

  const [access, setAccess] =
    useState<AnalyticsAccessContext | null>(
      initialSnapshot.access
    );

  const accessRef =
    useRef<AnalyticsAccessContext | null>(
      initialSnapshot.access
    );

  const [selectedCrmClientId, setSelection] =
    useState<number | null>(
      initialSnapshot.selectedCrmClientId
    );

  const [loading, setLoading] =
    useState(initialSnapshot.access === null);

  const [error, setError] =
    useState<unknown>(null);

  const requestRef =
    useRef<AnalyticsAccessRequest | null>(null);

  const applyAccess = useCallback(
    (result: AnalyticsAccessContext) => {
      const nextSelection =
        commitAnalyticsAccess(
          optionId,
          result
        );

      accessRef.current = result;
      setSelection(nextSelection);
      setAccess(result);
      setError(null);
    },
    [optionId]
  );

  const cancelCurrentRequest = useCallback(() => {
    const request = requestRef.current;

    if (!request) {
      return;
    }

    cancelAnalyticsAccessRequest(request);
    requestRef.current = null;
  }, []);

  const load = useCallback(
    async (
      force = false,
      background = false
    ) => {
      if (
        background &&
        requestRef.current
      ) {
        return;
      }

      const operation =
        prepareAnalyticsAccessLoad(
          optionId,
          force
        );

      if (operation.kind === 'cache') {
        applyAccess(operation.access);
        setLoading(false);
        return;
      }

      cancelCurrentRequest();

      const { request } = operation;
      requestRef.current = request;

      if (!background) {
        setLoading(true);
        setError(null);
      }

      try {
        const result = await request.promise;

        if (
          !request.controller.signal.aborted &&
          requestRef.current === request
        ) {
          applyAccess(result);
        }
      } catch (reason) {
        if (
          !request.controller.signal.aborted &&
          !background &&
          !isAnalyticsAbortError(reason)
        ) {
          setError(reason);
        }
      } finally {
        if (requestRef.current === request) {
          requestRef.current = null;

          if (
            !request.controller.signal.aborted &&
            !background
          ) {
            setLoading(false);
          }
        }
      }
    },
    [
      applyAccess,
      cancelCurrentRequest,
      optionId,
    ]
  );

  useEffect(() => {
    let active = true;
    const hasCachedAccess =
      accessRef.current !== null;

    queueMicrotask(() => {
      if (active) {
        void load(
          false,
          hasCachedAccess
        );
      }
    });

    return () => {
      active = false;
      cancelCurrentRequest();
    };
  }, [cancelCurrentRequest, load]);

  useEffect(() => {
    const revalidateIfStale = () => {
      if (
        document.visibilityState !== 'visible' ||
        !isAnalyticsAccessStale(optionId)
      ) {
        return;
      }

      void load(true, true);
    };

    window.addEventListener(
      'focus',
      revalidateIfStale
    );
    document.addEventListener(
      'visibilitychange',
      revalidateIfStale
    );

    return () => {
      window.removeEventListener(
        'focus',
        revalidateIfStale
      );
      document.removeEventListener(
        'visibilitychange',
        revalidateIfStale
      );
    };
  }, [load, optionId]);

  const selectCrmClientId = useCallback(
    (crmClientId: number) => {
      const nextSelection =
        selectAnalyticsCrmClient(
          access,
          crmClientId
        );

      setSelection(nextSelection);
    },
    [access]
  );

  return {
    access,
    loading,
    error,
    scopes: access?.scopes ?? [],
    selectedCrmClientId,
    selectCrmClientId,
    refresh: () => load(true),
  };
}
