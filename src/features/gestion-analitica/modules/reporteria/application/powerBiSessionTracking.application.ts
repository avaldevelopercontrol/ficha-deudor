import {
  closePowerBiSession,
  openPowerBiSession,
  updatePowerBiSessionActivity,
} from '../api/powerBiSession.api';
import type {
  PowerBiSessionActivityInput,
  PowerBiSessionCloseInput,
  PowerBiSessionOpenInput,
  PowerBiSessionOpened,
} from '../domain/powerBiSession.types';

interface PowerBiSessionTrackingDependencies {
  open: (
    input: PowerBiSessionOpenInput,
    signal?: AbortSignal
  ) => Promise<PowerBiSessionOpened>;
  updateActivity: (
    sessionId: string,
    input: PowerBiSessionActivityInput
  ) => Promise<void>;
  close: (
    sessionId: string,
    input: PowerBiSessionCloseInput,
    keepalive?: boolean
  ) => Promise<void>;
}

const defaultDependencies: PowerBiSessionTrackingDependencies = {
  open: openPowerBiSession,
  updateActivity: updatePowerBiSessionActivity,
  close: closePowerBiSession,
};

export const POWER_BI_SESSION_HEARTBEAT_MS = 30_000;

export const toVisibleSeconds = (
  accumulatedVisibleMs: number,
  visibleSinceMs: number | null,
  nowMs: number
): number => {
  const currentSegmentMs =
    visibleSinceMs === null
      ? 0
      : Math.max(0, nowMs - visibleSinceMs);

  return Math.max(
    0,
    Math.floor(
      (Math.max(0, accumulatedVisibleMs) + currentSegmentMs) /
        1000
    )
  );
};

export const accumulateVisibleTime = (
  accumulatedVisibleMs: number,
  visibleSinceMs: number | null,
  nowMs: number
): number => {
  if (visibleSinceMs === null) {
    return Math.max(0, accumulatedVisibleMs);
  }

  return Math.max(0, accumulatedVisibleMs) +
    Math.max(0, nowMs - visibleSinceMs);
};

export const startPowerBiSession = (
  input: PowerBiSessionOpenInput,
  signal?: AbortSignal,
  dependencies: PowerBiSessionTrackingDependencies =
    defaultDependencies
): Promise<PowerBiSessionOpened> =>
  dependencies.open(input, signal);

export const reportPowerBiSessionActivity = (
  sessionId: string,
  input: PowerBiSessionActivityInput,
  dependencies: PowerBiSessionTrackingDependencies =
    defaultDependencies
): Promise<void> =>
  dependencies.updateActivity(sessionId, input);

export const finishPowerBiSession = (
  sessionId: string,
  input: PowerBiSessionCloseInput,
  keepalive = false,
  dependencies: PowerBiSessionTrackingDependencies =
    defaultDependencies
): Promise<void> =>
  dependencies.close(sessionId, input, keepalive);
