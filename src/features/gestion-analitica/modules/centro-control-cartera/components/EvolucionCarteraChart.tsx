import type React from 'react';
import { useMemo, useState } from 'react';

import { SegmentedControl } from '@shared/components/ui';
import { SisgesIcon } from '@shared/icons/sisges';

import { AnalyticsPanel } from '../../../shared/components';

import type {
  EvolucionCarteraComparison,
} from '../domain/evolucionCartera.types';
import type {
  EvolucionCarteraPoint,
  PortfolioOperationalContext,
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
  type EvolucionCarteraChartSeries,
  type EvolucionCarteraMetric,
} from '../utils/evolucionCarteraChart.utils';
import {
  EstadoRecursoCartera,
} from './EstadoRecursoCartera';

interface EvolucionCarteraChartProps {
  evolution: readonly EvolucionCarteraPoint[];
  context: PortfolioOperationalContext | null;
  comparison: EvolucionCarteraComparison | null;
  isComparisonLoading: boolean;
  comparisonError: string | null;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onRetryComparison: () => void;
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

const monthFormatter = new Intl.DateTimeFormat('es-PE', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

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

const formatCampaignMonth = (campaignId: string): string => {
  const match = /^(\d{4})-(\d{2})$/.exec(campaignId);

  if (!match) {
    return campaignId;
  }

  const label = monthFormatter.format(
    new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1))
  );

  return label.charAt(0).toUpperCase() + label.slice(1);
};

const getSeriesRoleLabel = (
  series: EvolucionCarteraChartSeries,
  comparableMonths: number
): string => {
  const isPrevious = series.roles.includes('previous');
  const isBest = series.roles.includes('best');

  if (isPrevious && isBest) {
    return `Mes anterior y mejor de ${comparableMonths}`;
  }

  if (isPrevious) {
    return series.coversComparablePeriod
      ? 'Mes anterior'
      : 'Mes anterior · período incompleto';
  }

  if (isBest) {
    return `Mejor de ${comparableMonths} meses comparables`;
  }

  return 'Seleccionado';
};

const getSeriesClassName = (
  series: EvolucionCarteraChartSeries,
  metric: EvolucionCarteraMetric
): string => {
  if (series.roles.includes('current')) {
    return `portfolio-evolution-chart__line--${metric}`;
  }

  if (
    series.roles.includes('previous') &&
    series.roles.includes('best')
  ) {
    return 'portfolio-evolution-chart__line--previous-best';
  }

  return series.roles.includes('best')
    ? 'portfolio-evolution-chart__line--best'
    : 'portfolio-evolution-chart__line--previous';
};

export const EvolucionCarteraChart: React.FC<
  EvolucionCarteraChartProps
> = ({
  evolution,
  context,
  comparison,
  isComparisonLoading,
  comparisonError,
  isLoading,
  error,
  onRetry,
  onRetryComparison,
}) => {
  const [metric, setMetric] =
    useState<EvolucionCarteraMetric>('progress');

  const model = useMemo(
    () =>
      context === null
        ? null
        : buildEvolucionCarteraChartModel(
            evolution,
            context,
            comparison,
            metric
          ),
    [comparison, context, evolution, metric]
  );

  const metricLabel =
    metric === 'progress'
      ? 'Avance actual'
      : 'Recuperado acumulado';

  const referenceSeries = model?.series.filter(
    (series) => !series.roles.includes('current')
  ) ?? [];

  return (
    <AnalyticsPanel
      variant="integrated"
      className="portfolio-control-center__section portfolio-evolution-panel"
      headerClassName="portfolio-evolution-panel__header portfolio-control-center__section-heading portfolio-control-center__section-heading--compact"
      iconClassName="analytics-heading-icon analytics-heading-icon--info"
      icon={<SisgesIcon name="analytics" />}
      title="Evolución operativa"
      description="Comparación temporal al mismo corte entre el período seleccionado y referencias históricas."
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
        {model && context && (
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

            <div className="portfolio-evolution-chart__references">
              <div
                className={`portfolio-evolution-chart__legend-item portfolio-evolution-chart__legend-item--current portfolio-evolution-chart__legend-item--current-${metric}`}
              >
                <span className="portfolio-evolution-chart__legend-line" />
                <div>
                  <strong>{formatCampaignMonth(context.campaignId)}</strong>
                  <small>Seleccionado</small>
                </div>
              </div>

              {referenceSeries.map((series) => (
                <div
                  key={series.id}
                  className={`portfolio-evolution-chart__legend-item ${
                    series.roles.includes('previous') &&
                    series.roles.includes('best')
                      ? 'portfolio-evolution-chart__legend-item--previous-best'
                      : series.roles.includes('best')
                        ? 'portfolio-evolution-chart__legend-item--best'
                        : 'portfolio-evolution-chart__legend-item--previous'
                  }`}
                >
                  <span className="portfolio-evolution-chart__legend-line" />
                  <div>
                    <strong>{formatCampaignMonth(series.campaignId)}</strong>
                    <small>
                      {getSeriesRoleLabel(
                        series,
                        model.comparableMonths
                      )}
                    </small>
                  </div>
                  <b>{formatMetricValue(metric, series.currentValue)}</b>
                </div>
              ))}

              {isComparisonLoading && (
                <span className="portfolio-evolution-chart__comparison-state">
                  Cargando referencias históricas…
                </span>
              )}

              {!isComparisonLoading && comparisonError && (
                <button
                  type="button"
                  className="portfolio-evolution-chart__comparison-retry"
                  onClick={onRetryComparison}
                >
                  Reintentar comparación
                </button>
              )}
            </div>

            <div className="portfolio-evolution-chart__canvas">
              <svg
                viewBox={`0 0 ${EVOLUCION_CARTERA_VIEWBOX.width} ${EVOLUCION_CARTERA_VIEWBOX.height}`}
                role="img"
                aria-label={`Evolución comparativa de ${metric === 'progress' ? 'avance de cartera' : 'recuperación'}`}
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
                      x={EVOLUCION_CARTERA_VIEWBOX.left - 10}
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

                {model.xTicks.map((tick) => (
                  <text
                    key={tick.day}
                    className="portfolio-evolution-chart__period-label"
                    x={tick.x}
                    y={EVOLUCION_CARTERA_VIEWBOX.height - 12}
                    textAnchor="middle"
                  >
                    {`Día ${tick.day}`}
                  </text>
                ))}

                {model.series.map((series) => (
                  <g key={series.id}>
                    {series.areaPath && (
                      <path
                        className={`portfolio-evolution-chart__area portfolio-evolution-chart__area--${metric}`}
                        d={series.areaPath}
                      />
                    )}
                    <path
                      className={`portfolio-evolution-chart__line ${getSeriesClassName(series, metric)}`}
                      d={series.linePath}
                    />

                    {series.points.map((point) => (
                      <circle
                        key={`${series.id}:${point.period}`}
                        className={`portfolio-evolution-chart__point ${
                          series.roles.includes('current')
                            ? `portfolio-evolution-chart__point--${metric}`
                            : 'portfolio-evolution-chart__point--reference'
                        }`}
                        cx={point.x}
                        cy={point.y}
                        r={series.roles.includes('current') ? 4 : 2.6}
                      >
                        <title>
                          {`${formatCampaignMonth(series.campaignId)} · ${formatPortfolioPeriod(point.period)}: ${formatMetricValue(metric, point.value)}`}
                        </title>
                      </circle>
                    ))}
                  </g>
                ))}
              </svg>
            </div>
          </div>
        )}
      </EstadoRecursoCartera>
    </AnalyticsPanel>
  );
};
