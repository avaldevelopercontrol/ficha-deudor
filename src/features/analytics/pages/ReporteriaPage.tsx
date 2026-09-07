import {
  type ReactNode,
} from 'react';

import {
  useAccessControl,
} from '@features/access-control';

import PowerBiReportCard from '../modules/reporteria/components/PowerBiReportCard';
import PowerBiReportClientModal from '../modules/reporteria/components/PowerBiReportClientModal';
import PowerBiReportFilter from '../modules/reporteria/components/PowerBiReportFilter';

import {
  usePowerBiReportCatalog,
} from '../modules/reporteria/hooks/usePowerBiReportCatalog';
import {
  usePowerBiReportClientSelection,
} from '../modules/reporteria/hooks/usePowerBiReportClientSelection';

import '../styles/33-reporteria.css';

export const ReporteriaPage = (): ReactNode => {
  const {
    status,
    error,
    menuTree,
  } = useAccessControl();

  const {
    reporteriaOption,
    parentOption,
    reporteriaName,
    reports,
    analyticsReports,
    clientScopedReportIds,
    selectedReportIds,
    filteredReports,
    hasAnalyticsAccessErrors,
    isAnalyticsAccessReady,
    isAnalyticsAccessLoading,
    setSelectedReportIds,
  } = usePowerBiReportCatalog({
    status,
    menuTree,
  });

  const {
    modal: reportClientModal,
    open: handleOpen,
    close: closeReportClientModal,
    continueWithClient: handleClientContinue,
  } = usePowerBiReportClientSelection({
    clientScopedReportIds,
  });

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
                  selectedReportIds
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
            isAnalyticsAccessReady &&
            hasAnalyticsAccessErrors && (
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
            isAnalyticsAccessReady &&
            !hasAnalyticsAccessErrors &&
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
