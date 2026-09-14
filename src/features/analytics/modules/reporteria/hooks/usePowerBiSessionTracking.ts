import {
  useEffect,
  useRef,
} from 'react';

import type {
  AnalyticsReportClientOption,
} from '../../../acceso/domain/accesoAnalitica.types';
import {
  accumulateVisibleTime,
  finishPowerBiSession,
  POWER_BI_SESSION_HEARTBEAT_MS,
  reportPowerBiSessionActivity,
  startPowerBiSession,
  toVisibleSeconds,
} from '../application/powerBiSessionTracking.application';
import type {
  PowerBiSessionCloseReason,
} from '../domain/powerBiSession.types';

interface UsePowerBiSessionTrackingParams {
  enabled: boolean;
  optionId: number | null;
  client: AnalyticsReportClientOption | null;
}

const now = (): number => Date.now();

export const usePowerBiSessionTracking = ({
  enabled,
  optionId,
  client,
}: UsePowerBiSessionTrackingParams): void => {
  const sessionIdRef = useRef<string | null>(null);
  const accumulatedVisibleMsRef = useRef(0);
  const visibleSinceMsRef = useRef<number | null>(null);
  const closedRef = useRef(false);
  const activityQueueRef = useRef<Promise<void>>(
    Promise.resolve()
  );

  useEffect(() => {
    if (
      !enabled ||
      optionId === null ||
      !Number.isSafeInteger(optionId) ||
      optionId <= 0
    ) {
      return;
    }

    let active = true;
    const openController = new AbortController();
    let heartbeatIntervalId: number | null = null;

    sessionIdRef.current = null;
    accumulatedVisibleMsRef.current = 0;
    visibleSinceMsRef.current = null;
    closedRef.current = false;
    activityQueueRef.current = Promise.resolve();

    const getVisibleSeconds = (): number =>
      toVisibleSeconds(
        accumulatedVisibleMsRef.current,
        visibleSinceMsRef.current,
        now()
      );

    const stopVisibleSegment = (): void => {
      const currentTime = now();

      accumulatedVisibleMsRef.current =
        accumulateVisibleTime(
          accumulatedVisibleMsRef.current,
          visibleSinceMsRef.current,
          currentTime
        );
      visibleSinceMsRef.current = null;
    };

    const startVisibleSegment = (): void => {
      if (visibleSinceMsRef.current === null) {
        visibleSinceMsRef.current = now();
      }
    };

    const enqueueActivity = (
      visible: boolean
    ): void => {
      const sessionId = sessionIdRef.current;

      if (!sessionId || closedRef.current) {
        return;
      }

      const visibleSeconds = getVisibleSeconds();

      activityQueueRef.current =
        activityQueueRef.current
          .catch(() => undefined)
          .then(() =>
            reportPowerBiSessionActivity(
              sessionId,
              {
                visibleSeconds,
                visible,
              }
            )
          )
          .catch(() => undefined);
    };

    const closeSession = (
      reason: PowerBiSessionCloseReason,
      keepalive: boolean
    ): void => {
      const sessionId = sessionIdRef.current;

      if (!sessionId || closedRef.current) {
        return;
      }

      if (visibleSinceMsRef.current !== null) {
        stopVisibleSegment();
      }

      closedRef.current = true;
      sessionIdRef.current = null;

      void finishPowerBiSession(
        sessionId,
        {
          visibleSeconds: getVisibleSeconds(),
          reason,
        },
        keepalive
      ).catch(() => undefined);
    };

    const handleVisibilityChange = (): void => {
      if (!sessionIdRef.current || closedRef.current) {
        return;
      }

      if (document.visibilityState === 'hidden') {
        stopVisibleSegment();
        enqueueActivity(false);
        return;
      }

      startVisibleSegment();
      enqueueActivity(true);
    };

    const handlePageHide = (
      event: PageTransitionEvent
    ): void => {
      if (event.persisted) {
        if (visibleSinceMsRef.current !== null) {
          stopVisibleSegment();
        }
        enqueueActivity(false);
        return;
      }

      closeSession('PAGEHIDE', true);
    };

    const handlePageShow = (
      event: PageTransitionEvent
    ): void => {
      if (
        !event.persisted ||
        !sessionIdRef.current ||
        closedRef.current
      ) {
        return;
      }

      if (document.visibilityState === 'visible') {
        startVisibleSegment();
        enqueueActivity(true);
      }
    };

    const startHeartbeat = (): void => {
      if (heartbeatIntervalId !== null) {
        return;
      }

      heartbeatIntervalId = window.setInterval(() => {
        if (
          document.visibilityState === 'visible' &&
          sessionIdRef.current &&
          !closedRef.current
        ) {
          enqueueActivity(true);
        }
      }, POWER_BI_SESSION_HEARTBEAT_MS);
    };

    const start = async (): Promise<void> => {
      try {
        const session = await startPowerBiSession(
          {
            optionId,
            client,
          },
          openController.signal
        );

        if (!active || openController.signal.aborted) {
          return;
        }

        sessionIdRef.current = session.sessionId;

        if (document.visibilityState === 'visible') {
          startVisibleSegment();
        } else {
          enqueueActivity(false);
        }

        startHeartbeat();
      } catch {
        // La telemetría nunca debe impedir que el usuario consulte el BI.
      }
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);

    void start();

    return () => {
      active = false;
      openController.abort();

      if (heartbeatIntervalId !== null) {
        window.clearInterval(heartbeatIntervalId);
      }

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
      window.removeEventListener(
        'pagehide',
        handlePageHide
      );
      window.removeEventListener(
        'pageshow',
        handlePageShow
      );

      closeSession('NAVEGACION', true);
    };
  }, [
    client,
    enabled,
    optionId,
  ]);
};
