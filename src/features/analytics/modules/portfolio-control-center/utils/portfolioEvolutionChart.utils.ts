import type {
  PortfolioEvolutionPoint,
} from '../../../types/portfolioControlCenter.types';
import {
  calculatePortfolioRate,
} from './portfolioControlCenter.formatters';

export type PortfolioEvolutionMetric =
  | 'progress'
  | 'recovery';

export interface PortfolioEvolutionChartPoint {
  period: string;
  value: number;
  x: number;
  y: number;
  showLabel: boolean;
}

export interface PortfolioEvolutionChartTick {
  value: number;
  y: number;
}

export interface PortfolioEvolutionChartModel {
  points: readonly PortfolioEvolutionChartPoint[];
  ticks: readonly PortfolioEvolutionChartTick[];
  linePath: string;
  areaPath: string;
  maxValue: number;
  currentValue: number;
  deltaValue: number;
}

export const PORTFOLIO_EVOLUTION_VIEWBOX = {
  width: 720,
  height: 230,
  left: 56,
  right: 18,
  top: 16,
  bottom: 40,
} as const;

const getMetricValue = (
  point: PortfolioEvolutionPoint,
  metric: PortfolioEvolutionMetric
): number => {
  if (metric === 'recovery') {
    return point.recoveredAmount;
  }

  return calculatePortfolioRate(
    point.managedPortfolio,
    point.assignedPortfolio
  );
};

const getNiceMax = (value: number): number => {
  if (value <= 0) {
    return 1;
  }

  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;

  if (normalized <= 1) {
    return magnitude;
  }

  if (normalized <= 2) {
    return 2 * magnitude;
  }

  if (normalized <= 5) {
    return 5 * magnitude;
  }

  return 10 * magnitude;
};

const getMaxValue = (
  values: readonly number[],
  metric: PortfolioEvolutionMetric
): number => {
  if (metric === 'progress') {
    return 100;
  }

  return getNiceMax(Math.max(...values, 0));
};

const shouldShowLabel = (
  index: number,
  total: number
): boolean => {
  if (total <= 6) {
    return true;
  }

  const step = Math.ceil((total - 1) / 5);

  return (
    index === 0 ||
    index === total - 1 ||
    index % step === 0
  );
};

export const buildPortfolioEvolutionChartModel = (
  evolution: readonly PortfolioEvolutionPoint[],
  metric: PortfolioEvolutionMetric
): PortfolioEvolutionChartModel => {
  if (evolution.length === 0) {
    return {
      points: [],
      ticks: [],
      linePath: '',
      areaPath: '',
      maxValue: metric === 'progress' ? 100 : 1,
      currentValue: 0,
      deltaValue: 0,
    };
  }

  const values = evolution.map((point) =>
    getMetricValue(point, metric)
  );
  const maxValue = getMaxValue(values, metric);
  const {
    width,
    height,
    left,
    right,
    top,
    bottom,
  } = PORTFOLIO_EVOLUTION_VIEWBOX;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const denominator = Math.max(
    evolution.length - 1,
    1
  );

  const points = evolution.map((item, index) => {
    const value = values[index] ?? 0;
    const x =
      left + (plotWidth * index) / denominator;
    const y =
      top +
      plotHeight *
        (1 - Math.min(value / maxValue, 1));

    return {
      period: item.period,
      value,
      x,
      y,
      showLabel: shouldShowLabel(
        index,
        evolution.length
      ),
    };
  });

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    )
    .join(' ');

  const baselineY = top + plotHeight;
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaPath =
    firstPoint && lastPoint
      ? `${linePath} L ${lastPoint.x.toFixed(2)} ${baselineY.toFixed(2)} L ${firstPoint.x.toFixed(2)} ${baselineY.toFixed(2)} Z`
      : '';

  const ticks = [1, 0.75, 0.5, 0.25, 0].map(
    (ratio) => ({
      value: maxValue * ratio,
      y: top + plotHeight * (1 - ratio),
    })
  );

  return {
    points,
    ticks,
    linePath,
    areaPath,
    maxValue,
    currentValue: values[values.length - 1] ?? 0,
    deltaValue:
      (values[values.length - 1] ?? 0) -
      (values[0] ?? 0),
  };
};
