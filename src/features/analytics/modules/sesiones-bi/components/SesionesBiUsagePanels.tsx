import {
  useMemo,
  useState,
} from 'react';

import { Paginacion, SegmentedControl } from '@shared/components/ui';

import { AnalyticsPanel } from '../../../shared/components';
import type {
  SesionesBiReportUsage,
  SesionesBiUserUsage,
} from '../domain/sesionesBi.types';
import { formatSesionesBiDuration } from '../utils/sesionesBi.utils';

interface SesionesBiUsagePanelsProps {
  reports: readonly SesionesBiReportUsage[];
  users: readonly SesionesBiUserUsage[];
}

type ReportMetric = 'sessions' | 'time';

const RANKING_PAGE_SIZE = 5;

const REPORT_METRIC_OPTIONS = [
  { value: 'time', label: 'Tiempo' },
  { value: 'sessions', label: 'Sesiones' },
] as const;

export const SesionesBiUsagePanels = ({
  reports,
  users,
}: SesionesBiUsagePanelsProps) => {
  const [metric, setMetric] = useState<ReportMetric>('time');
  const [reportPage, setReportPage] = useState(1);
  const [userPage, setUserPage] = useState(1);

  const reportTotalPages = Math.max(1, Math.ceil(reports.length / RANKING_PAGE_SIZE));
  const userTotalPages = Math.max(1, Math.ceil(users.length / RANKING_PAGE_SIZE));
  const currentReportPage = Math.min(reportPage, reportTotalPages);
  const currentUserPage = Math.min(userPage, userTotalPages);
  const reportStartIndex = (currentReportPage - 1) * RANKING_PAGE_SIZE;
  const userStartIndex = (currentUserPage - 1) * RANKING_PAGE_SIZE;
  const visibleReports = reports.slice(
    reportStartIndex,
    reportStartIndex + RANKING_PAGE_SIZE
  );
  const visibleUsers = users.slice(
    userStartIndex,
    userStartIndex + RANKING_PAGE_SIZE
  );

  const maxValue = useMemo(
    () => Math.max(
      1,
      ...reports.map((row) =>
        metric === 'time' ? row.visibleSeconds : row.sessions
      )
    ),
    [metric, reports]
  );

  return (
    <section className="sessions-bi-insights-grid">
      <AnalyticsPanel
        as="article"
        className="sessions-bi-panel--reports"
        eyebrow="Adopción"
        title="Uso de reportes BI"
        description="Compara qué reportes concentran uso real en el período."
        actions={(
          <SegmentedControl
            value={metric}
            options={REPORT_METRIC_OPTIONS}
            onChange={setMetric}
            ariaLabel="Métrica del ranking"
          />
        )}
      >
        {reports.length === 0 ? (
          <div className="sessions-bi-empty">No hay uso de reportes para los filtros seleccionados.</div>
        ) : (
          <div className="sessions-bi-report-ranking">
            {visibleReports.map((report, index) => {
              const value = metric === 'time' ? report.visibleSeconds : report.sessions;
              const width = Math.max(4, (value / maxValue) * 100);

              return (
                <div className="sessions-bi-report-row" key={report.reportId}>
                  <span className="sessions-bi-report-row__rank">{reportStartIndex + index + 1}</span>
                  <div className="sessions-bi-report-row__main">
                    <div className="sessions-bi-report-row__labels">
                      <strong title={report.reportName}>{report.reportName}</strong>
                      <span>
                        {metric === 'time'
                          ? formatSesionesBiDuration(report.visibleSeconds)
                          : `${report.sessions.toLocaleString('es-PE')} sesiones`}
                      </span>
                    </div>
                    <div className="sessions-bi-report-row__bar" aria-hidden="true">
                      <span style={{ width: `${width}%` }} />
                    </div>
                    <small>
                      {report.uniqueUsers.toLocaleString('es-PE')} usuarios · {report.sessions.toLocaleString('es-PE')} sesiones
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {reports.length > 0 && (
          <Paginacion
            className="sessions-bi-ranking-pagination"
            variant="compact"
            paginaActual={currentReportPage}
            totalPaginas={reportTotalPages}
            totalRegistros={reports.length}
            indiceInicio={reportStartIndex}
            indiceFin={reportStartIndex + visibleReports.length}
            summaryNoun="reportes"
            onPaginaAnterior={() => setReportPage(Math.max(1, currentReportPage - 1))}
            onPaginaSiguiente={() =>
              setReportPage(Math.min(reportTotalPages, currentReportPage + 1))
            }
            onIrAPagina={setReportPage}
          />
        )}
      </AnalyticsPanel>

      <AnalyticsPanel
        as="article"
        className="sessions-bi-panel--users"
        eyebrow="Participación"
        title="Usuarios con mayor uso"
        description="Ranking por tiempo visible acumulado."
      >
        {users.length === 0 ? (
          <div className="sessions-bi-empty">No hay usuarios con sesiones en el período.</div>
        ) : (
          <div className="sessions-bi-user-ranking">
            {visibleUsers.map((user, index) => (
              <div className="sessions-bi-user-row" key={user.userId}>
                <span className={`sessions-bi-user-row__rank sessions-bi-user-row__rank--${Math.min(userStartIndex + index + 1, 4)}`}>
                  {userStartIndex + index + 1}
                </span>
                <div className="sessions-bi-user-row__identity">
                  <strong>{user.userName}</strong>
                  <span>{user.userLogin}</span>
                </div>
                <div className="sessions-bi-user-row__metric">
                  <strong>{formatSesionesBiDuration(user.visibleSeconds)}</strong>
                  <span>{user.sessions} sesiones · {user.uniqueReports} BI</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {users.length > 0 && (
          <Paginacion
            className="sessions-bi-ranking-pagination"
            variant="compact"
            paginaActual={currentUserPage}
            totalPaginas={userTotalPages}
            totalRegistros={users.length}
            indiceInicio={userStartIndex}
            indiceFin={userStartIndex + visibleUsers.length}
            summaryNoun="usuarios"
            onPaginaAnterior={() => setUserPage(Math.max(1, currentUserPage - 1))}
            onPaginaSiguiente={() =>
              setUserPage(Math.min(userTotalPages, currentUserPage + 1))
            }
            onIrAPagina={setUserPage}
          />
        )}
      </AnalyticsPanel>
    </section>
  );
};
