import {
  getAccesoAnalitica,
} from '../api/accesoAnalitica.api';
import {
  accesoAnaliticaStore,
} from '../store/accesoAnalitica.store';
import type {
  AccesoAnaliticaContext,
} from '../domain/accesoAnalitica.types';

interface PendingAccesoAnaliticaState {
  invalidated: boolean;
}

interface PendingAccesoAnaliticaRequest {
  controller: AbortController;
  promise: Promise<AccesoAnaliticaContext>;
  state: PendingAccesoAnaliticaState;
}

let sessionGeneration = 0;

const pendingAccessByOption = new Map<
  number,
  PendingAccesoAnaliticaRequest
>();

const activeRequestControllers =
  new Set<AbortController>();

export const createAccesoAnaliticaRequestController =
  (): AbortController => {
    const controller = new AbortController();
    activeRequestControllers.add(controller);
    return controller;
  };

export const releaseAccesoAnaliticaRequestController = (
  controller: AbortController
): void => {
  activeRequestControllers.delete(controller);
};

export const getPendingAccesoAnalitica = (
  optionId: number
): Promise<AccesoAnaliticaContext> | null =>
  pendingAccessByOption.get(optionId)?.promise ??
  null;

export const cancelPendingAccesoAnalitica = (
  optionId: number
): void => {
  const pending = pendingAccessByOption.get(
    optionId
  );

  if (!pending) {
    return;
  }

  pending.state.invalidated = true;
  pending.controller.abort();
  releaseAccesoAnaliticaRequestController(
    pending.controller
  );

  if (
    pendingAccessByOption.get(optionId) ===
    pending
  ) {
    pendingAccessByOption.delete(optionId);
  }
};

export const prefetchAccesoAnalitica = (
  optionId: number
): Promise<AccesoAnaliticaContext> => {
  const cached =
    accesoAnaliticaStore.getFreshAccess(
      optionId
    );

  if (cached) {
    return Promise.resolve(cached);
  }

  const pending = pendingAccessByOption.get(
    optionId
  );

  if (pending) {
    return pending.promise;
  }

  const requestGeneration = sessionGeneration;
  const controller =
    createAccesoAnaliticaRequestController();
  const state: PendingAccesoAnaliticaState = {
    invalidated: false,
  };

  const promise = getAccesoAnalitica(
    optionId,
    controller.signal
  )
    .then((result) => {
      if (
        !state.invalidated &&
        !controller.signal.aborted &&
        requestGeneration === sessionGeneration
      ) {
        accesoAnaliticaStore.setAccess(
          optionId,
          result
        );
      }

      return result;
    })
    .finally(() => {
      releaseAccesoAnaliticaRequestController(
        controller
      );

      const current =
        pendingAccessByOption.get(optionId);

      if (current?.promise === promise) {
        pendingAccessByOption.delete(optionId);
      }
    });

  pendingAccessByOption.set(optionId, {
    controller,
    promise,
    state,
  });

  return promise;
};

export const clearAccesoAnaliticaSession = (): void => {
  sessionGeneration += 1;

  for (const pending of pendingAccessByOption.values()) {
    pending.state.invalidated = true;
  }

  for (const controller of activeRequestControllers) {
    controller.abort();
  }

  activeRequestControllers.clear();
  pendingAccessByOption.clear();
  accesoAnaliticaStore.clear();
};
