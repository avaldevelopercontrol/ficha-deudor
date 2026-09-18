import type React from 'react';
import { useMemo, useState } from 'react';

import { SegmentedControl } from '@shared/components/ui';
import { SisgesIcon } from '@shared/icons/sisges';

import { AnalyticsPanel } from '../../../shared/components';

import type {
  EvolucionCarteraPoint,
} from '../domain/panoramaCartera.types';
import {
  formatPortfolioCompactCurrency,
  formatPortfolioCurrency,
  formatPortfolioPercentage,
  formatPortfolioPeriod,
} from '../utils/centroControlCartera.formatters';
import {
  buildEvolucionCarteraChartModel,
  EVOLUCION_CARTERA_VIEWBOX,
  type EvolucionCarteraMetric,
} from '../utils/evolucionCarteraChart.utils';
import {
  EstadoRecursoCartera,
} from './EstadoRecursoCartera';

interface EvolucionCarteraChartProps {
  evolution: readonly EvolucionCarteraPoint[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const METRIC_OPTIONS = [
  {
    value: 'progress',
    label: 'Avance de cartera',
  },
  {
    value: 'recovery',
    label: 'Recuperación',
  },
] as const;

const formatMetricValue = (
  metric: EvolucionCarteraMetric,
  value: number,
  compact = false
): string => {
  if (metric === 'progress') {
    return formatPortfolioPercentage(value);
  }

  return compact
    ? formatPortfolioCompactCurrency(value)
    : formatPortfolioCurrency(value);
};

const formatDelta = (
  metric: EvolucionCarteraMetric,
  value: number
): string => {
  const prefix = value > 0 ? '+' : '';

  if (metric === 'progress') {
    return `${prefix}${value.toFixed(2)} pp`;
  }

  return `${prefix}${formatPortfolioCurrency(value)}`;
};

export const EvolucionCarteraChart: React.FC<
  EvolucionCarteraChartProps
> = ({
  evolution,
  isLoading,
  error,
  onRetry,
}) => {
  const [metric, setMetric] =
    useState<EvolucionCarteraMetric>('progress');

  const model = useMemo(
    () =>
      buildEvolucionCarteraChartModel(
        evolution,
        metric
      ),
    [evolution, metric]
  );

  const metricLabel =
    metric === 'progress'
      ? 'Avance actual'
      : 'Recuperado acumulado';

  return (
    <AnalyticsPanel
      variant="integrated"
      className="portfolio-control-center__section portfolio-evolution-panel"
      headerClassName="portfolio-evolution-panel__header portfolio-control-center__section-heading portfolio-control-center__section-heading--compact"
      iconClassName="analytics-heading-icon analytics-heading-icon--info"
      icon={<SisgesIcon name="analytics" />}
      title="Evolución operativa"
      description="Seguimiento temporal del avance de cartera y recuperación."
      actions={(
        <SegmentedControl
          value={metric}
          options={METRIC_OPTIONS}
          onChange={setMetric}
          ariaLabel="Métrica de evolución"
          className="portfolio-evolution-metric-tabs"
        />
      )}
    >
      <EstadoRecursoCartera
        isLoading={isLoading}
        error={error}
        isEmpty={evolution.length === 0}
        onRetry={onRetry}
      >
        <div className="portfolio-evolution-chart-wrap">
          <div className="portfolio-evolution-chart__summary">
            <div className="portfolio-evolution-chart__current">
              <span>{metricLabel}</span>
              <strong>
                {formatMetricValue(
                  metric,
                  model.currentValue
                )}
              </strong>
            </div>
            <span className="portfolio-evolution-chart__delta">
              {formatDelta(
                metric,
                model.deltaValue
              )}{' '}
              vs. inicio del período
            </span>
          </div>

          <div className="portfolio-evolution-chart__canvas">
            <svg
              viewBox={`0 0 ${EVOLUCION_CARTERA_VIEWBOX.width} ${EVOLUCION_CARTERA_VIEWBOX.height}`}
              role="img"
              aria-label={`Evolución de ${metric === 'progress' ? 'avance de cartera' : 'recuperación'}`}
            >
              {model.ticks.map((tick) => (
                <g key={tick.value}>
                  <line
                    className="portfolio-evolution-chart__grid-line"
                    x1={EVOLUCION_CARTERA_VIEWBOX.left}
                    x2={
                      EVOLUCION_CARTERA_VIEWBOX.width -
                      EVOLUCION_CARTERA_VIEWBOX.right
                    }
                    y1={tick.y}
                    y2={tick.y}
                  />
                  <text
                    className="portfolio-evolution-chart__axis-label"
                    x={
                      EVOLUCION_CARTERA_VIEWBOX.left -
                      10
                    }
                    y={tick.y + 4}
                    textAnchor="end"
                  >
                    {formatMetricValue(
                      metric,
                      tick.value,
                      true
                    )}
                  </text>
                </g>
              ))}

              <path
                className={`portfolio-evolution-chart__area portfolio-evolution-chart__area--${metric}`}
                d={model.areaPath}
              />
              <path
                className={`portfolio-evolution-chart__line portfolio-evolution-chart__line--${metric}`}
                d={model.linePath}
              />

              {model.points.map((point) => (
                <g key={point.period}>
                  <circle
                    className={`portfolio-evolution-chart__point portfolio-evolution-chart__point--${metric}`}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                  >
                    <title>
                      {`${formatPortfolioPeriod(point.period)}: ${formatMetricValue(metric, point.value)}`}
                    </title>
                  </circle>

                  {point.showLabel && (
                    <text
                      className="portfolio-evolution-chart__period-label"
                      x={point.x}
                      y={
                        EVOLUCION_CARTERA_VIEWBOX.height -
                        12
                      }
                      textAnchor="middle"
                    >
                      {formatPortfolioPeriod(
                        point.period
                      )}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>
      </EstadoRecursoCartera>
    </AnalyticsPanel>
  );
};
