import {
  useMemo,
  useState,
} from 'react';

import { SegmentedControl } from '@shared/components/ui';

import { AnalyticsPanel } from '../../../shared/components';
import { buildLineChartModel } from '../../../shared/utils/lineChart.utils';
import type { SesionesBiTrendPoint } from '../domain/sesionesBi.types';
import {
  formatSesionesBiDuration,
  formatSesionesBiTrendLabel,
} from '../utils/sesionesBi.utils';

type TrendMetric = 'sessions' | 'time';

interface SesionesBiTrendProps {
  points: readonly SesionesBiTrendPoint[];
  granularity: string;
}

const WIDTH = 900;
const HEIGHT = 220;
const PAD_X = 32;
const PAD_Y = 26;

const TREND_METRIC_OPTIONS = [
  { value: 'sessions', label: 'Sesiones' },
  { value: 'time', label: 'Tiempo visible' },
] as const;

export const SesionesBiTrend = ({
  points,
  granularity,
}: SesionesBiTrendProps) => {
  const [metric, setMetric] = useState<TrendMetric>('sessions');

  const geometry = useMemo(
    () => buildLineChartModel(
      points.map((point) =>
        metric === 'sessions' ? point.sessions : point.visibleSeconds
      ),
      {
        width: WIDTH,
        height: HEIGHT,
        paddingX: PAD_X,
        paddingY: PAD_Y,
      }
    ),
    [metric, points]
  );

  return (
    <AnalyticsPanel
      className="sessions-bi-trend"
      headerClassName="sessions-bi-trend__header"
      eyebrow="Evolución"
      title="Actividad durante el período"
      description={
        granularity.toUpperCase().includes('HORA') || granularity.toUpperCase().includes('HOUR')
          ? 'Distribución por hora del día.'
          : 'Evolución diaria del uso registrado.'
      }
      actions={(
        <SegmentedControl
          value={metric}
          options={TREND_METRIC_OPTIONS}
          onChange={setMetric}
          ariaLabel="Métrica de evolución"
        />
      )}
    >
      {points.length === 0 ? (
        <div className="sessions-bi-empty">Todavía no hay actividad para graficar.</div>
      ) : (
        <div className="sessions-bi-trend__body">
          <div className="sessions-bi-trend__summary">
            <strong>
              {metric === 'sessions'
                ? `${points.reduce((total, point) => total + point.sessions, 0).toLocaleString('es-PE')} sesiones`
                : formatSesionesBiDuration(points.reduce((total, point) => total + point.visibleSeconds, 0))}
            </strong>
            <span>acumulado del período filtrado</span>
          </div>

          <div className="sessions-bi-trend__chart-wrap">
            <svg
              className="sessions-bi-trend__chart"
              viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              role="img"
              aria-label="Tendencia de uso de reportes BI"
            >
              {[0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = PAD_Y + (1 - ratio) * (HEIGHT - PAD_Y * 2);
                return (
                  <line
                    key={ratio}
                    x1={PAD_X}
                    x2={WIDTH - PAD_X}
                    y1={y}
                    y2={y}
                    className="sessions-bi-trend__gridline"
                  />
                );
              })}
              <polyline
                points={geometry.polyline}
                className="sessions-bi-trend__line"
              />
              {geometry.coordinates.map((point, index) => (
                <circle
                  key={`${points[index]?.periodUtc}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  className="sessions-bi-trend__dot"
                >
                  <title>
                    {`${formatSesionesBiTrendLabel(points[index]!.periodUtc, granularity)}: ${metric === 'sessions' ? point.value : formatSesionesBiDuration(point.value)}`}
                  </title>
                </circle>
              ))}
            </svg>
            <div className="sessions-bi-trend__labels">
              {points.map((point, index) => {
                const step = Math.max(1, Math.ceil(points.length / 6));
                if (index % step !== 0 && index !== points.length - 1) {
                  return null;
                }
                return (
                  <span
                    key={point.periodUtc}
                    style={{ left: `${points.length <= 1 ? 50 : (index / (points.length - 1)) * 100}%` }}
                  >
                    {formatSesionesBiTrendLabel(point.periodUtc, granularity)}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </AnalyticsPanel>
  );
};
