import {
  getAccesoAnalitica,
} from '../api/accesoAnalitica.api';
import type {
  AccesoAnaliticaContext,
} from '../domain/accesoAnalitica.types';
import {
  cancelPendingAccesoAnalitica,
  createAccesoAnaliticaRequestController,
  getPendingAccesoAnalitica,
  releaseAccesoAnaliticaRequestController,
} from '../services/accesoAnalitica.prefetch';
import {
  clearSelectedCrmClientId,
  getSelectedCrmClientId,
  setSelectedCrmClientId,
} from '../store/seleccionClienteCrmAnalitica.storage';
import {
  accesoAnaliticaStore,
} from '../store/accesoAnalitica.store';

export interface AccesoAnaliticaSnapshot {
  access: AccesoAnaliticaContext | null;
  selectedCrmClientId: number | null;
}

export interface AccesoAnaliticaRequest {
  controller: AbortController;
  promise: Promise<AccesoAnaliticaContext>;
}

export type AccesoAnaliticaLoadOperation =
  | {
      kind: 'cache';
      access: AccesoAnaliticaContext;
    }
  | {
      kind: 'request';
      request: AccesoAnaliticaRequest;
    };

export const isAnalyticsAbortError = (
  reason: unknown
): boolean =>
  typeof reason === 'object' &&
  reason !== null &&
  'name' in reason &&
  reason.name === 'AbortError';

export const resolveSeleccionClienteCrmAnalitica = (
  access: AccesoAnaliticaContext,
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

const persistSeleccionClienteCrmAnalitica = (
  selectedCrmClientId: number | null
): void => {
  if (selectedCrmClientId === null) {
    clearSelectedCrmClientId();
    return;
  }

  setSelectedCrmClientId(selectedCrmClientId);
};

export const getAccesoAnaliticaSnapshot = (
  optionId: number
): AccesoAnaliticaSnapshot => {
  const access = accesoAnaliticaStore.getAccess(
    optionId
  );

  return {
    access,
    selectedCrmClientId: access
      ? resolveSeleccionClienteCrmAnalitica(
          access,
          getSelectedCrmClientId()
        )
      : null,
  };
};

export const commitAccesoAnalitica = (
  optionId: number,
  access: AccesoAnaliticaContext
): number | null => {
  accesoAnaliticaStore.setAccess(optionId, access);

  const selectedCrmClientId =
    resolveSeleccionClienteCrmAnalitica(
      access,
      getSelectedCrmClientId()
    );

  persistSeleccionClienteCrmAnalitica(
    selectedCrmClientId
  );

  return selectedCrmClientId;
};

const createNetworkRequest = (
  optionId: number,
  force: boolean
): AccesoAnaliticaRequest => {
  if (force) {
    cancelPendingAccesoAnalitica(optionId);
  }

  const controller =
    createAccesoAnaliticaRequestController();

  const promise = (async () => {
    const pendingPrefetch = !force
      ? getPendingAccesoAnalitica(optionId)
      : null;

    if (!pendingPrefetch) {
      return getAccesoAnalitica(
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
      return getAccesoAnalitica(
        optionId,
        controller.signal
      );
    }
  })().finally(() => {
    releaseAccesoAnaliticaRequestController(
      controller
    );
  });

  return {
    controller,
    promise,
  };
};

export const prepareAccesoAnaliticaLoad = (
  optionId: number,
  force = false
): AccesoAnaliticaLoadOperation => {
  if (!force) {
    const cached =
      accesoAnaliticaStore.getFreshAccess(optionId);

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

export const cancelAccesoAnaliticaRequest = (
  request: AccesoAnaliticaRequest
): void => {
  request.controller.abort();
  releaseAccesoAnaliticaRequestController(
    request.controller
  );
};

export const isAccesoAnaliticaStale = (
  optionId: number
): boolean =>
  accesoAnaliticaStore.isStale(optionId);

export const selectAnalyticsCrmClient = (
  access: AccesoAnaliticaContext | null,
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
