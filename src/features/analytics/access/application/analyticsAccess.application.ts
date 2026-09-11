import {
  getAnalyticsAccess,
} from '../api/analyticsAccess.api';
import type {
  AnalyticsAccessContext,
} from '../domain/analyticsAccess.types';
import {
  cancelPendingAnalyticsAccess,
  createAnalyticsAccessRequestController,
  getPendingAnalyticsAccess,
  releaseAnalyticsAccessRequestController,
} from '../services/analyticsAccess.prefetch';
import {
  clearSelectedCrmClientId,
  getSelectedCrmClientId,
  setSelectedCrmClientId,
} from '../store/analyticsCrmSelection.storage';
import {
  analyticsAccessStore,
} from '../store/analyticsAccess.store';

export interface AnalyticsAccessSnapshot {
  access: AnalyticsAccessContext | null;
  selectedCrmClientId: number | null;
}

export interface AnalyticsAccessRequest {
  controller: AbortController;
  promise: Promise<AnalyticsAccessContext>;
}

export type AnalyticsAccessLoadOperation =
  | {
      kind: 'cache';
      access: AnalyticsAccessContext;
    }
  | {
      kind: 'request';
      request: AnalyticsAccessRequest;
    };

export const isAnalyticsAbortError = (
  reason: unknown
): boolean =>
  typeof reason === 'object' &&
  reason !== null &&
  'name' in reason &&
  reason.name === 'AbortError';

export const resolveAnalyticsCrmSelection = (
  access: AnalyticsAccessContext,
  storedCrmClientId: number | null
): number | null => {
  if (
    storedCrmClientId !== null &&
    access.scopes.some(
      (scope) =>
        scope.crmClientId === storedCrmClientId
    )
  ) {
    return storedCrmClientId;
  }

  return access.scopes[0]?.crmClientId ?? null;
};

const persistAnalyticsCrmSelection = (
  selectedCrmClientId: number | null
): void => {
  if (selectedCrmClientId === null) {
    clearSelectedCrmClientId();
    return;
  }

  setSelectedCrmClientId(selectedCrmClientId);
};

export const getAnalyticsAccessSnapshot = (
  optionId: number
): AnalyticsAccessSnapshot => {
  const access = analyticsAccessStore.getAccess(
    optionId
  );

  return {
    access,
    selectedCrmClientId: access
      ? resolveAnalyticsCrmSelection(
          access,
          getSelectedCrmClientId()
        )
      : null,
  };
};

export const commitAnalyticsAccess = (
  optionId: number,
  access: AnalyticsAccessContext
): number | null => {
  analyticsAccessStore.setAccess(optionId, access);

  const selectedCrmClientId =
    resolveAnalyticsCrmSelection(
      access,
      getSelectedCrmClientId()
    );

  persistAnalyticsCrmSelection(
    selectedCrmClientId
  );

  return selectedCrmClientId;
};

const createNetworkRequest = (
  optionId: number,
  force: boolean
): AnalyticsAccessRequest => {
  if (force) {
    cancelPendingAnalyticsAccess(optionId);
  }

  const controller =
    createAnalyticsAccessRequestController();

  const promise = (async () => {
    const pendingPrefetch = !force
      ? getPendingAnalyticsAccess(optionId)
      : null;

    if (!pendingPrefetch) {
      return getAnalyticsAccess(
        optionId,
        controller.signal
      );
    }

    try {
      return await pendingPrefetch;
    } catch (reason) {
      if (
        !isAnalyticsAbortError(reason) ||
        controller.signal.aborted
      ) {
        throw reason;
      }

      // Otro consumidor puede invalidar el prefetch compartido. La carga
      // activa continúa con una solicitud propia mientras siga vigente.
      return getAnalyticsAccess(
        optionId,
        controller.signal
      );
    }
  })().finally(() => {
    releaseAnalyticsAccessRequestController(
      controller
    );
  });

  return {
    controller,
    promise,
  };
};

export const prepareAnalyticsAccessLoad = (
  optionId: number,
  force = false
): AnalyticsAccessLoadOperation => {
  if (!force) {
    const cached =
      analyticsAccessStore.getFreshAccess(optionId);

    if (cached) {
      return {
        kind: 'cache',
        access: cached,
      };
    }
  }

  return {
    kind: 'request',
    request: createNetworkRequest(
      optionId,
      force
    ),
  };
};

export const cancelAnalyticsAccessRequest = (
  request: AnalyticsAccessRequest
): void => {
  request.controller.abort();
  releaseAnalyticsAccessRequestController(
    request.controller
  );
};

export const isAnalyticsAccessStale = (
  optionId: number
): boolean =>
  analyticsAccessStore.isStale(optionId);

export const selectAnalyticsCrmClient = (
  access: AnalyticsAccessContext | null,
  crmClientId: number
): number => {
  if (
    !access?.scopes.some(
      (scope) =>
        scope.crmClientId === crmClientId
    )
  ) {
    throw new Error(
      'La cartera seleccionada no está autorizada.'
    );
  }

  setSelectedCrmClientId(crmClientId);
  return crmClientId;
};
