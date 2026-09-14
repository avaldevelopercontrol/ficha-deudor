import {
  useMemo,
  useState,
} from 'react';

import type {
  SesionesBiTrendPoint,
} from '../domain/sesionesBi.types';
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

export const SesionesBiTrend = ({
  points,
  granularity,
}: SesionesBiTrendProps) => {
  const [metric, setMetric] = useState<TrendMetric>('sessions');

  const geometry = useMemo(() => {
    const values = points.map((point) =>
      metric === 'sessions' ? point.sessions : point.visibleSeconds
    );
    const max = Math.max(1, ...values);
    const innerWidth = WIDTH - PAD_X * 2;
    const innerHeight = HEIGHT - PAD_Y * 2;

    const coordinates = values.map((value, index) => {
      const x = points.length <= 1
        ? WIDTH / 2
        : PAD_X + (index / (points.length - 1)) * innerWidth;
      const y = PAD_Y + innerHeight - (value / max) * innerHeight;
      return { x, y, value };
    });

    return {
      coordinates,
      polyline: coordinates.map(({ x, y }) => `${x},${y}`).join(' '),
      max,
    };
  }, [metric, points]);

  return (
    <section className="sessions-bi-panel sessions-bi-trend">
      <header className="sessions-bi-panel__header sessions-bi-panel__header--trend">
        <div>
          <span className="sessions-bi-eyebrow">Evolución</span>
          <h2>Actividad durante el período</h2>
          <p>
            {granularity.toUpperCase().includes('HORA') || granularity.toUpperCase().includes('HOUR')
              ? 'Distribución por hora del día.'
              : 'Evolución diaria del uso registrado.'}
          </p>
        </div>
        <div className="sessions-bi-segmented">
          <button
            type="button"
            className={metric === 'sessions' ? 'is-active' : ''}
            onClick={() => setMetric('sessions')}
          >
            Sesiones
          </button>
          <button
            type="button"
            className={metric === 'time' ? 'is-active' : ''}
            onClick={() => setMetric('time')}
          >
            Tiempo visible
          </button>
        </div>
      </header>

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
    </section>
  );
};
