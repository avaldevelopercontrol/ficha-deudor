import {
  getAnalyticsAccess,
} from '../api/analyticsAccess.api';
import {
  analyticsAccessStore,
} from '../store/analyticsAccess.store';
import type {
  AnalyticsAccessContext,
} from '../types/analyticsAccess.types';

interface PendingAnalyticsAccessState {
  invalidated: boolean;
}

interface PendingAnalyticsAccessRequest {
  controller: AbortController;
  promise: Promise<AnalyticsAccessContext>;
  state: PendingAnalyticsAccessState;
}

let sessionGeneration = 0;

const pendingAccessByOption = new Map<
  number,
  PendingAnalyticsAccessRequest
>();

const activeRequestControllers =
  new Set<AbortController>();

export const createAnalyticsAccessRequestController =
  (): AbortController => {
    const controller = new AbortController();
    activeRequestControllers.add(controller);
    return controller;
  };

export const releaseAnalyticsAccessRequestController = (
  controller: AbortController
): void => {
  activeRequestControllers.delete(controller);
};

export const getPendingAnalyticsAccess = (
  optionId: number
): Promise<AnalyticsAccessContext> | null =>
  pendingAccessByOption.get(optionId)?.promise ??
  null;

export const cancelPendingAnalyticsAccess = (
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
  releaseAnalyticsAccessRequestController(
    pending.controller
  );

  if (
    pendingAccessByOption.get(optionId) ===
    pending
  ) {
    pendingAccessByOption.delete(optionId);
  }
};

export const prefetchAnalyticsAccess = (
  optionId: number
): Promise<AnalyticsAccessContext> => {
  const cached =
    analyticsAccessStore.getFreshAccess(
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
    createAnalyticsAccessRequestController();
  const state: PendingAnalyticsAccessState = {
    invalidated: false,
  };

  const promise = getAnalyticsAccess(
    optionId,
    controller.signal
  )
    .then((result) => {
      if (
        !state.invalidated &&
        !controller.signal.aborted &&
        requestGeneration === sessionGeneration
      ) {
        analyticsAccessStore.setAccess(
          optionId,
          result
        );
      }

      return result;
    })
    .finally(() => {
      releaseAnalyticsAccessRequestController(
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

export const clearAnalyticsAccessSession = (): void => {
  sessionGeneration += 1;

  for (const pending of pendingAccessByOption.values()) {
    pending.state.invalidated = true;
  }

  for (const controller of activeRequestControllers) {
    controller.abort();
  }

  activeRequestControllers.clear();
  pendingAccessByOption.clear();
  analyticsAccessStore.clear();
};
