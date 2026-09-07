import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { getAnalyticsAccess } from '../api/analyticsAccess.api';
import {
  cancelPendingAnalyticsAccess,
  createAnalyticsAccessRequestController,
  getPendingAnalyticsAccess,
  releaseAnalyticsAccessRequestController,
} from '../services/analyticsAccess.prefetch';
import {
  getSelectedCrmClientId,
  setSelectedCrmClientId,
  clearSelectedCrmClientId,
} from '../store/analyticsCrmSelection.storage';
import { analyticsAccessStore } from '../store/analyticsAccess.store';
import type {
  AnalyticsAccessContext,
} from '../types/analyticsAccess.types';

const isAbortError = (reason: unknown): boolean =>
  typeof reason === 'object' &&
  reason !== null &&
  'name' in reason &&
  reason.name === 'AbortError';

const resolveSelection = (
  access: AnalyticsAccessContext
): number | null => {
  const stored =
    getSelectedCrmClientId();

  if (
    stored !== null &&
    access.scopes.some(
      (scope) =>
        scope.crmClientId === stored
    )
  ) {
    return stored;
  }

  return (
    access.scopes[0]?.crmClientId ??
    null
  );
};

export function useAnalyticsAccess(
  optionId: number
) {
  const cachedAccess =
    analyticsAccessStore.getAccess(
      optionId
    );

  const [access, setAccess] =
    useState<AnalyticsAccessContext | null>(
      cachedAccess
    );

  const accessRef =
    useRef<AnalyticsAccessContext | null>(
      cachedAccess
    );

  const [selectedCrmClientId, setSelection] =
    useState<number | null>(() =>
      cachedAccess
        ? resolveSelection(cachedAccess)
        : null
    );

  const [loading, setLoading] =
    useState(!cachedAccess);

  const [error, setError] =
    useState<unknown>(null);

  const requestControllerRef =
    useRef<AbortController | null>(null);

  const applyAccess = useCallback(
    (result: AnalyticsAccessContext) => {
      analyticsAccessStore.setAccess(
        optionId,
        result
      );
      accessRef.current = result;

      const nextSelection =
        resolveSelection(result);

      if (nextSelection === null) {
        clearSelectedCrmClientId();
      } else {
        setSelectedCrmClientId(
          nextSelection
        );
      }

      setSelection(nextSelection);
      setAccess(result);
      setError(null);
    },
    [optionId]
  );

  const load = useCallback(
    async (
      force = false,
      background = false
    ) => {
      if (!force) {
        const cached =
          analyticsAccessStore.getFreshAccess(
            optionId
          );

        if (cached) {
          applyAccess(cached);
          setLoading(false);
          return;
        }
      }

      if (
        background &&
        requestControllerRef.current
      ) {
        return;
      }

      if (force) {
        cancelPendingAnalyticsAccess(optionId);
      }

      const previousController =
        requestControllerRef.current;
      previousController?.abort();

      if (previousController) {
        releaseAnalyticsAccessRequestController(
          previousController
        );
      }

      const controller =
        createAnalyticsAccessRequestController();
      requestControllerRef.current = controller;

      if (!background) {
        setLoading(true);
        setError(null);
      }

      try {
        const pendingPrefetch =
          !force
            ? getPendingAnalyticsAccess(
                optionId
              )
            : null;

        let result: AnalyticsAccessContext;

        if (pendingPrefetch) {
          try {
            result = await pendingPrefetch;
          } catch (reason) {
            if (
              !isAbortError(reason) ||
              controller.signal.aborted
            ) {
              throw reason;
            }

            // Otro consumidor puede forzar una revalidación y cancelar el
            // prefetch compartido. Si este hook sigue activo, continúa con
            // una solicitud propia en lugar de quedar sin datos ni error.
            result = await getAnalyticsAccess(
              optionId,
              controller.signal
            );
          }
        } else {
          result = await getAnalyticsAccess(
            optionId,
            controller.signal
          );
        }

        if (
          !controller.signal.aborted &&
          requestControllerRef.current === controller
        ) {
          applyAccess(result);
        }
      } catch (reason) {
        if (
          !controller.signal.aborted &&
          !background &&
          !isAbortError(reason)
        ) {
          setError(reason);
        }
      } finally {
        releaseAnalyticsAccessRequestController(
          controller
        );

        if (
          requestControllerRef.current === controller
        ) {
          requestControllerRef.current = null;

          if (
            !controller.signal.aborted &&
            !background
          ) {
            setLoading(false);
          }
        }
      }
    },
    [applyAccess, optionId]
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
      const controller =
        requestControllerRef.current;
      controller?.abort();

      if (controller) {
        releaseAnalyticsAccessRequestController(
          controller
        );
      }

      requestControllerRef.current = null;
    };
  }, [load]);

  useEffect(() => {
    const revalidateIfStale = () => {
      if (
        document.visibilityState !== 'visible' ||
        !analyticsAccessStore.isStale(optionId)
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

  const selectCrmClientId =
    useCallback(
      (crmClientId: number) => {
        if (
          !access?.scopes.some(
            (scope) =>
              scope.crmClientId ===
              crmClientId
          )
        ) {
          throw new Error(
            'La cartera seleccionada no está autorizada.'
          );
        }

        setSelectedCrmClientId(
          crmClientId
        );
        setSelection(crmClientId);
      },
      [access]
    );

  return {
    access,
    loading,
    error,
    scopes:
      access?.scopes ?? [],
    selectedCrmClientId,
    selectCrmClientId,
    refresh: () => load(true),
  };
}
