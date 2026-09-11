import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import type {
  AnalyticsReportClientOption,
} from '../../../access/domain/analyticsAccess.types';
import {
  buildPowerBiReportRoute,
  resolvePowerBiReportOpen,
} from '../application/reporteriaNavigation.application';
import type {
  PowerBiReport,
} from '../domain/reporteria.types';

export interface ReportClientModalState {
  report: PowerBiReport | null;
  clients: readonly AnalyticsReportClientOption[];
  isLoading: boolean;
  error: string | null;
}

const EMPTY_REPORT_CLIENT_MODAL_STATE: ReportClientModalState = {
  report: null,
  clients: [],
  isLoading: false,
  error: null,
};

interface UsePowerBiReportClientSelectionParams {
  clientScopedReportIds: ReadonlySet<number>;
}

export const usePowerBiReportClientSelection = ({
  clientScopedReportIds,
}: UsePowerBiReportClientSelectionParams) => {
  const navigate = useNavigate();

  const [modal, setModal] =
    useState<ReportClientModalState>(
      EMPTY_REPORT_CLIENT_MODAL_STATE
    );

  const requestRef =
    useRef<AbortController | null>(null);

  const cancelPendingRequest = useCallback(() => {
    requestRef.current?.abort();
    requestRef.current = null;
  }, []);

  useEffect(
    () => () => {
      cancelPendingRequest();
    },
    [cancelPendingRequest]
  );

  const close = useCallback(() => {
    cancelPendingRequest();
    setModal(EMPTY_REPORT_CLIENT_MODAL_STATE);
  }, [cancelPendingRequest]);

  const openClientScopedReport = useCallback(
    async (report: PowerBiReport) => {
      cancelPendingRequest();

      const controller = new AbortController();
      requestRef.current = controller;

      setModal({
        report,
        clients: [],
        isLoading: true,
        error: null,
      });

      try {
        const resolution =
          await resolvePowerBiReportOpen(
            report,
            true,
            controller.signal
          );

        if (
          controller.signal.aborted ||
          requestRef.current !== controller
        ) {
          return;
        }

        requestRef.current = null;

        if (resolution.kind === 'navigate') {
          setModal(
            EMPTY_REPORT_CLIENT_MODAL_STATE
          );
          navigate(resolution.route);
          return;
        }

        setModal({
          report,
          clients: resolution.clients,
          isLoading: false,
          error:
            resolution.clients.length === 0
              ? 'No tienes carteras habilitadas para consultar este reporte.'
              : null,
        });
      } catch {
        if (
          controller.signal.aborted ||
          requestRef.current !== controller
        ) {
          return;
        }

        requestRef.current = null;

        setModal({
          report,
          clients: [],
          isLoading: false,
          error:
            'No se pudieron cargar las carteras autorizadas. Intenta nuevamente.',
        });
      }
    },
    [cancelPendingRequest, navigate]
  );

  const open = useCallback(
    (report: PowerBiReport) => {
      if (
        clientScopedReportIds.has(report.id)
      ) {
        void openClientScopedReport(report);
        return;
      }

      cancelPendingRequest();
      navigate(buildPowerBiReportRoute(report));
    },
    [
      cancelPendingRequest,
      clientScopedReportIds,
      navigate,
      openClientScopedReport,
    ]
  );

  const continueWithClient = useCallback(
    (client: AnalyticsReportClientOption) => {
      const report = modal.report;

      if (!report) {
        return;
      }

      cancelPendingRequest();
      setModal(EMPTY_REPORT_CLIENT_MODAL_STATE);
      navigate(
        buildPowerBiReportRoute(
          report,
          client
        )
      );
    },
    [cancelPendingRequest, modal.report, navigate]
  );

  return {
    modal,
    open,
    close,
    continueWithClient,
  };
};
