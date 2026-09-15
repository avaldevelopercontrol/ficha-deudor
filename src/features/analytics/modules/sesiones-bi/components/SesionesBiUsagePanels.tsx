import {
  useMemo,
  useState,
} from 'react';

import { SegmentedControl } from '@shared/components/ui';

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

const REPORT_METRIC_OPTIONS = [
  { value: 'time', label: 'Tiempo' },
  { value: 'sessions', label: 'Sesiones' },
] as const;

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
      </AnalyticsPanel>
    </section>
  );
};
