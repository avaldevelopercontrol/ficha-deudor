import {
  useMemo,
  useState,
} from 'react';

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

export const SesionesBiUsagePanels = ({
  reports,
  users,
}: SesionesBiUsagePanelsProps) => {
  const [metric, setMetric] = useState<ReportMetric>('time');

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
      <article className="sessions-bi-panel sessions-bi-panel--reports">
        <header className="sessions-bi-panel__header">
          <div>
            <span className="sessions-bi-eyebrow">Adopción</span>
            <h2>Uso de reportes BI</h2>
            <p>Compara qué reportes concentran uso real en el período.</p>
          </div>
          <div className="sessions-bi-segmented" aria-label="Métrica del ranking">
            <button
              type="button"
              className={metric === 'time' ? 'is-active' : ''}
              onClick={() => setMetric('time')}
            >
              Tiempo
            </button>
            <button
              type="button"
              className={metric === 'sessions' ? 'is-active' : ''}
              onClick={() => setMetric('sessions')}
            >
              Sesiones
            </button>
          </div>
        </header>

        {reports.length === 0 ? (
          <div className="sessions-bi-empty">No hay uso de reportes para los filtros seleccionados.</div>
        ) : (
          <div className="sessions-bi-report-ranking">
            {reports.slice(0, 7).map((report, index) => {
              const value = metric === 'time' ? report.visibleSeconds : report.sessions;
              const width = Math.max(4, (value / maxValue) * 100);

              return (
                <div className="sessions-bi-report-row" key={report.reportId}>
                  <span className="sessions-bi-report-row__rank">{index + 1}</span>
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
      </article>

      <article className="sessions-bi-panel sessions-bi-panel--users">
        <header className="sessions-bi-panel__header">
          <div>
            <span className="sessions-bi-eyebrow">Participación</span>
            <h2>Usuarios con mayor uso</h2>
            <p>Ranking por tiempo visible acumulado.</p>
          </div>
        </header>

        {users.length === 0 ? (
          <div className="sessions-bi-empty">No hay usuarios con sesiones en el período.</div>
        ) : (
          <div className="sessions-bi-user-ranking">
            {users.slice(0, 6).map((user, index) => (
              <div className="sessions-bi-user-row" key={user.userId}>
                <span className={`sessions-bi-user-row__rank sessions-bi-user-row__rank--${Math.min(index + 1, 4)}`}>
                  {index + 1}
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
      </article>
    </section>
  );
};
