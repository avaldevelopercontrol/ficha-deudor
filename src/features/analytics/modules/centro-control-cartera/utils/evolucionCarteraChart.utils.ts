import type {
  EvolucionCarteraPoint,
} from '../domain/panoramaCartera.types';
import {
  buildLineChartModel,
} from '../../../shared/utils/lineChart.utils';
import {
  calculatePortfolioRate,
} from './centroControlCartera.formatters';

export type EvolucionCarteraMetric =
  | 'progress'
  | 'recovery';

export interface EvolucionCarteraChartPoint {
  period: string;
  value: number;
  x: number;
  y: number;
  showLabel: boolean;
}

export interface EvolucionCarteraChartTick {
  value: number;
  y: number;
}

export interface EvolucionCarteraChartModel {
  points: readonly EvolucionCarteraChartPoint[];
  ticks: readonly EvolucionCarteraChartTick[];
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
  point: EvolucionCarteraPoint,
  metric: EvolucionCarteraMetric
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
  metric: EvolucionCarteraMetric
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

export const buildEvolucionCarteraChartModel = (
  evolution: readonly EvolucionCarteraPoint[],
  metric: EvolucionCarteraMetric
): EvolucionCarteraChartModel => {
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
  const geometry = buildLineChartModel(values, {
    width: PORTFOLIO_EVOLUTION_VIEWBOX.width,
    height: PORTFOLIO_EVOLUTION_VIEWBOX.height,
    padding: {
      left: PORTFOLIO_EVOLUTION_VIEWBOX.left,
      right: PORTFOLIO_EVOLUTION_VIEWBOX.right,
      top: PORTFOLIO_EVOLUTION_VIEWBOX.top,
      bottom: PORTFOLIO_EVOLUTION_VIEWBOX.bottom,
    },
    maxValue,
  });

  const points = geometry.coordinates.map((coordinate, index) => ({
    period: evolution[index]!.period,
    value: coordinate.value,
    x: coordinate.x,
    y: coordinate.y,
    showLabel: shouldShowLabel(index, evolution.length),
  }));

  const plotHeight =
    PORTFOLIO_EVOLUTION_VIEWBOX.height -
    PORTFOLIO_EVOLUTION_VIEWBOX.top -
    PORTFOLIO_EVOLUTION_VIEWBOX.bottom;
  const ticks = [1, 0.75, 0.5, 0.25, 0].map(
    (ratio) => ({
      value: geometry.maxValue * ratio,
      y:
        PORTFOLIO_EVOLUTION_VIEWBOX.top +
        plotHeight * (1 - ratio),
    })
  );

  return {
    points,
    ticks,
    linePath: geometry.linePath,
    areaPath: geometry.areaPath,
    maxValue: geometry.maxValue,
    currentValue: values[values.length - 1] ?? 0,
    deltaValue:
      (values[values.length - 1] ?? 0) -
      (values[0] ?? 0),
  };
};
