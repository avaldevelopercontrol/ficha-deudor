import type React from 'react';
import { useMemo, useState } from 'react';

import { SisgesIcon } from '@shared/icons/sisges';

import type {
  PortfolioEvolutionPoint,
} from '../../../types/portfolioControlCenter.types';
import {
  formatPortfolioCompactCurrency,
  formatPortfolioCurrency,
  formatPortfolioPercentage,
  formatPortfolioPeriod,
} from '../utils/portfolioControlCenter.formatters';
import {
  buildPortfolioEvolutionChartModel,
  PORTFOLIO_EVOLUTION_VIEWBOX,
  type PortfolioEvolutionMetric,
} from '../utils/portfolioEvolutionChart.utils';
import {
  PortfolioResourceState,
} from './PortfolioResourceState';

interface PortfolioEvolutionChartProps {
  evolution: readonly PortfolioEvolutionPoint[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

const METRIC_OPTIONS: ReadonlyArray<{
  id: PortfolioEvolutionMetric;
  label: string;
}> = [
  {
    id: 'progress',
    label: 'Avance de cartera',
  },
  {
    id: 'recovery',
    label: 'Recuperación',
  },
];

const formatMetricValue = (
  metric: PortfolioEvolutionMetric,
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
  metric: PortfolioEvolutionMetric,
  value: number
): string => {
  const prefix = value > 0 ? '+' : '';

  if (metric === 'progress') {
    return `${prefix}${value.toFixed(2)} pp`;
  }

  return `${prefix}${formatPortfolioCurrency(value)}`;
};

export const PortfolioEvolutionChart: React.FC<
  PortfolioEvolutionChartProps
> = ({
  evolution,
  isLoading,
  error,
  onRetry,
}) => {
  const [metric, setMetric] =
    useState<PortfolioEvolutionMetric>('progress');

  const model = useMemo(
    () =>
      buildPortfolioEvolutionChartModel(
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
    <section className="portfolio-control-center__section portfolio-evolution-panel">
      <div className="portfolio-evolution-panel__header">
        <div className="portfolio-control-center__section-heading portfolio-control-center__section-heading--compact">
          <h2>
            <span
              className="portfolio-heading-icon portfolio-heading-icon--chart"
              aria-hidden="true"
            >
              <SisgesIcon name="analytics" />
            </span>
            Evolución operativa
          </h2>
          <p>
            Seguimiento temporal del avance de cartera y recuperación.
          </p>
        </div>

        <div
          className="portfolio-evolution-metric-tabs"
          role="group"
          aria-label="Métrica de evolución"
        >
          {METRIC_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`portfolio-evolution-metric-tab${
                metric === option.id
                  ? ' portfolio-evolution-metric-tab--active'
                  : ''
              }`}
              aria-pressed={metric === option.id}
              onClick={() => {
                setMetric(option.id);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <PortfolioResourceState
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
              viewBox={`0 0 ${PORTFOLIO_EVOLUTION_VIEWBOX.width} ${PORTFOLIO_EVOLUTION_VIEWBOX.height}`}
              role="img"
              aria-label={`Evolución de ${metric === 'progress' ? 'avance de cartera' : 'recuperación'}`}
            >
              {model.ticks.map((tick) => (
                <g key={tick.value}>
                  <line
                    className="portfolio-evolution-chart__grid-line"
                    x1={PORTFOLIO_EVOLUTION_VIEWBOX.left}
                    x2={
                      PORTFOLIO_EVOLUTION_VIEWBOX.width -
                      PORTFOLIO_EVOLUTION_VIEWBOX.right
                    }
                    y1={tick.y}
                    y2={tick.y}
                  />
                  <text
                    className="portfolio-evolution-chart__axis-label"
                    x={
                      PORTFOLIO_EVOLUTION_VIEWBOX.left -
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
                        PORTFOLIO_EVOLUTION_VIEWBOX.height -
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
      </PortfolioResourceState>
    </section>
  );
};
