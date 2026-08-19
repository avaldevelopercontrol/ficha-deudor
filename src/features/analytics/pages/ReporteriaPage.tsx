import {
  useMemo,
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
  buildReporteriaBiRoute,
} from '../constants/reporteriaRoutes.constants';

import PowerBiReportCard from '../modules/reporteria/components/PowerBiReportCard';
import PowerBiReportFilter from '../modules/reporteria/components/PowerBiReportFilter';

import {
  findAuthorizedOptionById,
  getAuthorizedPowerBiReports,
} from '../modules/reporteria/utils/reporteria.utils';

import '../styles/33-reporteria.css';

export const ReporteriaPage = (): ReactNode => {
  const navigate = useNavigate();

  const {
    status,
    error,
    menuTree,
  } = useAccessControl();

  const [selectedReportIds, setSelectedReportIds] =
    useState<number[]>([]);

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

  const effectiveSelectedReportIds = useMemo(
    () => {
      const availableIds = new Set(
        reports.map((report) => report.id)
      );

      return selectedReportIds.filter((id) =>
        availableIds.has(id)
      );
    },
    [reports, selectedReportIds]
  );

  const filteredReports = useMemo(() => {
    if (effectiveSelectedReportIds.length === 0) {
      return reports;
    }

    const selectedIds = new Set(
      effectiveSelectedReportIds
    );

    return reports.filter((report) =>
      selectedIds.has(report.id)
    );
  }, [effectiveSelectedReportIds, reports]);

  const handleOpen = (
    report: AuthorizedOption
  ) => {
    navigate(
      buildReporteriaBiRoute(
        report.id
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
            <strong>{reports.length}</strong>
            <span>
              {reports.length === 1
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
                Los reportes mostrados corresponden a los permisos configurados en SISGES.
              </p>
            </div>

            {reports.length > 1 && (
              <PowerBiReportFilter
                reports={reports}
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
    </main>
  );
};

export default ReporteriaPage;
