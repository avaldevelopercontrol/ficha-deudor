import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import { getAnalyticsAccess } from '../api/analyticsAccess.api';
import {
  getSelectedCrmClientId,
  setSelectedCrmClientId,
  clearSelectedCrmClientId,
} from '../store/analyticsCrmSelection.storage';
import { analyticsAccessStore } from '../store/analyticsAccess.store';
import type {
  AnalyticsAccessContext,
} from '../types/analyticsAccess.types';

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

  const applyAccess = useCallback(
    (result: AnalyticsAccessContext) => {
      analyticsAccessStore.setAccess(
        optionId,
        result
      );

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
    },
    [optionId]
  );

  const load = useCallback(
    async (force = false) => {
      if (!force) {
        const cached =
          analyticsAccessStore.getAccess(
            optionId
          );

        if (cached) {
          applyAccess(cached);
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const result =
          await getAnalyticsAccess(
            optionId
          );

        applyAccess(result);
      } catch (reason) {
        setError(reason);
      } finally {
        setLoading(false);
      }
    },
    [applyAccess, optionId]
  );

  useEffect(() => {
    if (access) {
      return;
    }

    let active = true;

    void getAnalyticsAccess(
      optionId
    )
      .then((result) => {
        if (!active) {
          return;
        }

        applyAccess(result);
      })
      .catch((reason) => {
        if (active) {
          setError(reason);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [
    access,
    applyAccess,
    optionId,
  ]);

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
    reports:
      access?.reports ?? [],
    selectedCrmClientId,
    selectCrmClientId,
    refresh: () => load(true),
  };
}
