import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  useNavigate,
} from 'react-router-dom';

import {
  APPLICATION_OPTION_IDS,
  useAccessControl,
  type AuthorizedOption,
} from '@features/access-control';

import {
  getAnalyticsOptionGroupAccess,
  getAnalyticsReportClients,
} from '../access/api/analyticsAccess.api';

import type {
  AnalyticsReportClientOption,
} from '../access/types/analyticsAccess.types';


import {
  buildReporteriaBiRoute,
} from '../constants/reporteriaRoutes.constants';

import PowerBiReportCard from '../modules/reporteria/components/PowerBiReportCard';
import PowerBiReportClientModal from '../modules/reporteria/components/PowerBiReportClientModal';
import PowerBiReportFilter from '../modules/reporteria/components/PowerBiReportFilter';

import {
  findAuthorizedOptionById,
  getAuthorizedPowerBiReports,
} from '../modules/reporteria/utils/reporteria.utils';

import '../styles/33-reporteria.css';

type ReportClientModalState = {
  report: AuthorizedOption | null;
  clients: AnalyticsReportClientOption[];
  isLoading: boolean;
  error: string | null;
};

const EMPTY_REPORT_CLIENT_MODAL_STATE: ReportClientModalState = {
  report: null,
  clients: [],
  isLoading: false,
  error: null,
};

export const ReporteriaPage = (): ReactNode => {
  const navigate = useNavigate();

  const {
    status,
    error,
    menuTree,
  } = useAccessControl();

  const [selectedReportIds, setSelectedReportIds] =
    useState<number[]>([]);

  const [
    reportClientModal,
    setReportClientModal,
  ] = useState<ReportClientModalState>(
    EMPTY_REPORT_CLIENT_MODAL_STATE
  );

  const reportClientRequestRef =
    useRef<AbortController | null>(null);

  const reporteriaOption = useMemo(
    () =>
      findAuthorizedOptionById(
        menuTree,
        APPLICATION_OPTION_IDS.REPORTERIA
      ),
    [menuTree]
  );

  const parentOption = useMemo(
    () =>
      reporteriaOption
        ? findAuthorizedOptionById(
            menuTree,
            reporteriaOption.parentId
          )
        : null,
    [menuTree, reporteriaOption]
  );

  const reporteriaName =
    reporteriaOption?.name ||
    'Reportería';

  const reports = useMemo(
    () =>
      getAuthorizedPowerBiReports(
        menuTree
      ),
    [menuTree]
  );

  const reportAccessKey = useMemo(
    () =>
      reports
        .map((report) => report.id)
        .sort((a, b) => a - b)
        .join(','),
    [reports]
  );

  const [
    analyticsAccessResult,
    setAnalyticsAccessResult,
  ] = useState<{
    key: string;
    allowedReportIds: number[];
    clientScopedReportIds: number[];
    hasErrors: boolean;
  } | null>(null);

  useEffect(() => {
    if (
      status !== 'ready' ||
      reports.length === 0
    ) {
      return;
    }

    let active = true;

    void Promise.allSettled(
      reports.map(async (report) => ({
        reportId: report.id,
        access:
          await getAnalyticsOptionGroupAccess(
            report.id
          ),
      }))
    ).then((results) => {
      if (!active) {
        return;
      }

      const fulfilledResults =
        results.flatMap((result) =>
          result.status === 'fulfilled'
            ? [result.value]
            : []
        );

      const allowedReportIds =
        fulfilledResults.flatMap(
          ({ reportId, access }) =>
            access.allowed
              ? [reportId]
              : []
        );

      const clientScopedReportIds =
        fulfilledResults.flatMap(
          ({ reportId, access }) =>
            access.allowed &&
            access.requiresClientSelection
              ? [reportId]
              : []
        );

      setAnalyticsAccessResult({
        key: reportAccessKey,
        allowedReportIds,
        clientScopedReportIds,
        hasErrors: results.some(
          (result) =>
            result.status === 'rejected'
        ),
      });
    });

    return () => {
      active = false;
    };
  }, [
    reportAccessKey,
    reports,
    status,
  ]);

  useEffect(
    () => () => {
      reportClientRequestRef.current?.abort();
    },
    []
  );

  const isAnalyticsAccessLoading =
    status === 'ready' &&
    reports.length > 0 &&
    analyticsAccessResult?.key !==
      reportAccessKey;

  const analyticsReports = useMemo(
    () => {
      if (
        analyticsAccessResult?.key !==
        reportAccessKey
      ) {
        return [];
      }

      const allowedIds = new Set(
        analyticsAccessResult
          .allowedReportIds
      );

      return reports.filter((report) =>
        allowedIds.has(report.id)
      );
    },
    [
      analyticsAccessResult,
      reportAccessKey,
      reports,
    ]
  );

  const clientScopedReportIds = useMemo(
    () =>
      new Set(
        analyticsAccessResult?.key ===
          reportAccessKey
          ? analyticsAccessResult
              .clientScopedReportIds
          : []
      ),
    [
      analyticsAccessResult,
      reportAccessKey,
    ]
  );

  const effectiveSelectedReportIds = useMemo(
    () => {
      const availableIds = new Set(
        analyticsReports.map(
          (report) => report.id
        )
      );

      return selectedReportIds.filter((id) =>
        availableIds.has(id)
      );
    },
    [
      analyticsReports,
      selectedReportIds,
    ]
  );

  const filteredReports = useMemo(() => {
    if (effectiveSelectedReportIds.length === 0) {
      return analyticsReports;
    }

    const selectedIds = new Set(
      effectiveSelectedReportIds
    );

    return analyticsReports.filter(
      (report) =>
        selectedIds.has(report.id)
    );
  }, [
    analyticsReports,
    effectiveSelectedReportIds,
  ]);

  const closeReportClientModal = () => {
    reportClientRequestRef.current?.abort();
    reportClientRequestRef.current = null;
    setReportClientModal(
      EMPTY_REPORT_CLIENT_MODAL_STATE
    );
  };

  const openClientScopedReport = async (
    report: AuthorizedOption
  ) => {
    reportClientRequestRef.current?.abort();

    const controller =
      new AbortController();

    reportClientRequestRef.current =
      controller;

    setReportClientModal({
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

      if (controller.signal.aborted) {
        return;
      }

      reportClientRequestRef.current = null;

      if (clients.length === 1) {
        setReportClientModal(
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

      setReportClientModal({
        report,
        clients,
        isLoading: false,
        error:
          clients.length === 0
            ? 'No tienes carteras habilitadas para consultar este reporte.'
            : null,
      });
    } catch {
      if (controller.signal.aborted) {
        return;
      }

      reportClientRequestRef.current = null;

      setReportClientModal({
        report,
        clients: [],
        isLoading: false,
        error:
          'No se pudieron cargar las carteras autorizadas. Intenta nuevamente.',
      });
    }
  };

  const handleOpen = (
    report: AuthorizedOption
  ) => {
    if (
      clientScopedReportIds.has(
        report.id
      )
    ) {
      void openClientScopedReport(report);
      return;
    }

    navigate(
      buildReporteriaBiRoute(
        report.id
      )
    );
  };

  const handleClientContinue = (
    client: AnalyticsReportClientOption
  ) => {
    const report =
      reportClientModal.report;

    if (!report) {
      return;
    }

    setReportClientModal(
      EMPTY_REPORT_CLIENT_MODAL_STATE
    );

    navigate(
      buildReporteriaBiRoute(
        report.id,
        client
      )
    );
  };

  return (
    <main className="reporteria-page">
      <div className="reporteria-page__content">
        <section className="reporteria-page__hero">
          <div>
            <span className="reporteria-page__eyebrow">
              {parentOption?.name ?? 'Gestión Analítica'}
            </span>
            <h1>{reporteriaName}</h1>
            <p>
              {reporteriaOption?.description ||
                'Consulta los tableros Power BI habilitados para tu acceso.'}
            </p>
          </div>

          <div
            className="reporteria-page__summary"
            aria-label="Cantidad de reportes disponibles"
          >
            <strong>{analyticsReports.length}</strong>
            <span>
              {analyticsReports.length === 1
                ? 'reporte disponible'
                : 'reportes disponibles'}
            </span>
          </div>
        </section>

        <section className="reporteria-page__catalog">
          <div className="reporteria-page__catalog-header">
            <div>
              <h2>
                Reportes disponibles
              </h2>
              <p>
                Los reportes mostrados respetan los permisos de SISGES y los grupos autorizados en Analytics.
              </p>
            </div>

            {analyticsReports.length > 1 && (
              <PowerBiReportFilter
                reports={analyticsReports}
                selectedReportIds={
                  effectiveSelectedReportIds
                }
                filteredResults={
                  filteredReports.length
                }
                onChange={setSelectedReportIds}
              />
            )}
          </div>

          {status === 'loading' && (
            <div
              className="reporteria-page__state"
              role="status"
            >
              Cargando reportes...
            </div>
          )}

          {status === 'error' && (
            <div
              className="reporteria-page__state reporteria-page__state--error"
              role="alert"
            >
              {error ??
                'No se pudieron cargar los reportes.'}
            </div>
          )}

          {isAnalyticsAccessLoading && (
            <div
              className="reporteria-page__state"
              role="status"
            >
              Validando grupos autorizados...
            </div>
          )}

          {status === 'ready' &&
            !isAnalyticsAccessLoading &&
            analyticsAccessResult?.key ===
              reportAccessKey &&
            analyticsAccessResult.hasErrors && (
              <div
                className="reporteria-page__state reporteria-page__state--error"
                role="alert"
              >
                No se pudo validar el acceso a uno o más reportes. Por seguridad, esos reportes se mantienen ocultos.
              </div>
            )}

          {status === 'ready' &&
            reports.length === 0 && (
              <div
                className="reporteria-page__state"
                role="status"
              >
                <strong>
                  No hay reportes Power BI disponibles.
                </strong>
                <span>
                  Cuando se registren opciones Power BI debajo de Reportería y se asignen permisos, aparecerán aquí automáticamente.
                </span>
              </div>
            )}

          {status === 'ready' &&
            reports.length > 0 &&
            !isAnalyticsAccessLoading &&
            analyticsAccessResult?.key ===
              reportAccessKey &&
            !analyticsAccessResult.hasErrors &&
            analyticsReports.length === 0 && (
              <div
                className="reporteria-page__state"
                role="status"
              >
                <strong>
                  No tienes reportes Power BI habilitados para tus grupos asignados.
                </strong>
                <span>
                  Solicita la asociación del reporte con uno de tus grupos asignados.
                </span>
              </div>
            )}

          {status === 'ready' &&
            analyticsReports.length > 0 &&
            filteredReports.length === 0 && (
              <div
                className="reporteria-page__state"
                role="status"
              >
                No hay reportes seleccionados. Selecciona uno o varios títulos en el filtro, o limpia la selección para volver a mostrar todos los reportes.
              </div>
            )}

          {status === 'ready' &&
            filteredReports.length > 0 && (
              <div className="reporteria-page__grid">
                {filteredReports.map(
                  (report) => (
                    <PowerBiReportCard
                      key={report.id}
                      report={report}
                      onOpen={handleOpen}
                    />
                  )
                )}
              </div>
            )}
        </section>
      </div>

      <PowerBiReportClientModal
        key={reportClientModal.report?.id ?? 'closed'}
        report={reportClientModal.report}
        clients={reportClientModal.clients}
        isLoading={reportClientModal.isLoading}
        error={reportClientModal.error}
        onClose={closeReportClientModal}
        onContinue={handleClientContinue}
      />
    </main>
  );
};

export default ReporteriaPage;
