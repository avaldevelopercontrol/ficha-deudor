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
  AuthorizedOption,
} from '@features/access-control';

import {
  getAnalyticsReportClients,
} from '../../../access/api/analyticsAccess.api';

import type {
  AnalyticsReportClientOption,
} from '../../../access/types/analyticsAccess.types';

import {
  buildReporteriaBiRoute,
} from '../../../constants/reporteriaRoutes.constants';

export interface ReportClientModalState {
  report: AuthorizedOption | null;
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
    async (report: AuthorizedOption) => {
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
        const clients =
          await getAnalyticsReportClients(
            report.id,
            controller.signal
          );

        if (
          controller.signal.aborted ||
          requestRef.current !== controller
        ) {
          return;
        }

        requestRef.current = null;

        if (clients.length === 1) {
          setModal(
            EMPTY_REPORT_CLIENT_MODAL_STATE
          );
          navigate(
            buildReporteriaBiRoute(
              report.id,
              clients[0]
            )
          );
          return;
        }

        setModal({
          report,
          clients,
          isLoading: false,
          error:
            clients.length === 0
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
    (report: AuthorizedOption) => {
      if (clientScopedReportIds.has(report.id)) {
        void openClientScopedReport(report);
        return;
      }

      cancelPendingRequest();
      navigate(buildReporteriaBiRoute(report.id));
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
        buildReporteriaBiRoute(report.id, client)
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
