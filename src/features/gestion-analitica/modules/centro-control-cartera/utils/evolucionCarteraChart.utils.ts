import type {
  EvolucionCarteraComparison,
  EvolucionCarteraComparisonSeries,
} from '../domain/evolucionCartera.types';
import type {
  EvolucionCarteraPoint,
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import {
  calculatePortfolioRate,
} from './centroControlCartera.formatters';

export type EvolucionCarteraMetric =
  | 'progress'
  | 'recovery';

export type EvolucionCarteraSeriesRole =
  | 'current'
  | 'previous'
  | 'best';

export interface EvolucionCarteraChartPoint {
  period: string;
  value: number;
  x: number;
  y: number;
}

export interface EvolucionCarteraChartTick {
  value: number;
  y: number;
}

export interface EvolucionCarteraChartXAxisTick {
  day: number;
  x: number;
}

export interface EvolucionCarteraChartSeries {
  id: string;
  campaignId: string;
  roles: readonly EvolucionCarteraSeriesRole[];
  coversComparablePeriod: boolean;
  points: readonly EvolucionCarteraChartPoint[];
  linePath: string;
  areaPath: string;
  currentValue: number;
}

export interface EvolucionCarteraChartModel {
  series: readonly EvolucionCarteraChartSeries[];
  ticks: readonly EvolucionCarteraChartTick[];
  xTicks: readonly EvolucionCarteraChartXAxisTick[];
  maxValue: number;
  currentValue: number;
  deltaValue: number;
  comparableMonths: number;
}

export const EVOLUCION_CARTERA_VIEWBOX = {
  width: 720,
  height: 230,
  left: 56,
  right: 18,
  top: 16,
  bottom: 40,
} as const;

const DAY_IN_MS = 86_400_000;

const parseIsoDateUtc = (value: string): number => {
  const [year, month, day] = value.split('-').map(Number);
  return Date.UTC(year!, month! - 1, day!);
};

const getDayOffset = (
  period: string,
  dateFrom: string
): number =>
  Math.round(
    (parseIsoDateUtc(period) - parseIsoDateUtc(dateFrom)) /
      DAY_IN_MS
  );

const getComparableDays = (
  context: PortfolioOperationalContext
): number =>
  Math.max(
    1,
    getDayOffset(context.dateTo, context.dateFrom) + 1
  );

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

const getX = (
  offset: number,
  comparableDays: number
): number => {
  const innerWidth =
    EVOLUCION_CARTERA_VIEWBOX.width -
    EVOLUCION_CARTERA_VIEWBOX.left -
    EVOLUCION_CARTERA_VIEWBOX.right;

  if (comparableDays <= 1) {
    return EVOLUCION_CARTERA_VIEWBOX.left + innerWidth / 2;
  }

  return (
    EVOLUCION_CARTERA_VIEWBOX.left +
    (Math.min(Math.max(offset, 0), comparableDays - 1) /
      (comparableDays - 1)) *
      innerWidth
  );
};

const getY = (
  value: number,
  maxValue: number
): number => {
  const innerHeight =
    EVOLUCION_CARTERA_VIEWBOX.height -
    EVOLUCION_CARTERA_VIEWBOX.top -
    EVOLUCION_CARTERA_VIEWBOX.bottom;

  return (
    EVOLUCION_CARTERA_VIEWBOX.top +
    innerHeight -
    Math.min(value / Math.max(maxValue, 1), 1) * innerHeight
  );
};

const buildPath = (
  points: readonly EvolucionCarteraChartPoint[]
): string =>
  points
    .map(
      ({ x, y }, index) =>
        `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    )
    .join(' ');

const buildAreaPath = (
  points: readonly EvolucionCarteraChartPoint[],
  linePath: string
): string => {
  const first = points[0];
  const last = points[points.length - 1];

  if (!first || !last) {
    return '';
  }

  const baseline =
    EVOLUCION_CARTERA_VIEWBOX.height -
    EVOLUCION_CARTERA_VIEWBOX.bottom;

  return `${linePath} L ${last.x.toFixed(2)} ${baseline.toFixed(2)} L ${first.x.toFixed(2)} ${baseline.toFixed(2)} Z`;
};

const buildSeries = (
  id: string,
  campaignId: string,
  roles: readonly EvolucionCarteraSeriesRole[],
  evolution: readonly EvolucionCarteraPoint[],
  dateFrom: string,
  coversComparablePeriod: boolean,
  metric: EvolucionCarteraMetric,
  comparableDays: number,
  maxValue: number
): EvolucionCarteraChartSeries => {
  const points = evolution
    .map((point) => ({
      period: point.period,
      value: getMetricValue(point, metric),
      offset: getDayOffset(point.period, dateFrom),
    }))
    .filter(({ offset }) => offset >= 0 && offset < comparableDays)
    .map(({ period, value, offset }) => ({
      period,
      value,
      x: getX(offset, comparableDays),
      y: getY(value, maxValue),
    }));

  const linePath = buildPath(points);

  return {
    id,
    campaignId,
    roles,
    coversComparablePeriod,
    points,
    linePath,
    areaPath: roles.includes('current')
      ? buildAreaPath(points, linePath)
      : '',
    currentValue: points[points.length - 1]?.value ?? 0,
  };
};

const getBestSeries = (
  comparison: EvolucionCarteraComparison | null,
  metric: EvolucionCarteraMetric
): EvolucionCarteraComparisonSeries | null =>
  metric === 'progress'
    ? comparison?.bestProgress ?? null
    : comparison?.bestRecovery ?? null;

const buildReferenceDefinitions = (
  comparison: EvolucionCarteraComparison | null,
  metric: EvolucionCarteraMetric
): readonly {
  series: EvolucionCarteraComparisonSeries;
  roles: EvolucionCarteraSeriesRole[];
}[] => {
  if (comparison === null) {
    return [];
  }

  const definitions = new Map<
    string,
    {
      series: EvolucionCarteraComparisonSeries;
      roles: EvolucionCarteraSeriesRole[];
    }
  >();

  if (comparison.previousMonth) {
    definitions.set(comparison.previousMonth.campaignId, {
      series: comparison.previousMonth,
      roles: ['previous'],
    });
  }

  const best = getBestSeries(comparison, metric);
  if (best) {
    const existing = definitions.get(best.campaignId);
    if (existing) {
      existing.roles.push('best');
    } else {
      definitions.set(best.campaignId, {
        series: best,
        roles: ['best'],
      });
    }
  }

  return [...definitions.values()];
};

const buildXAxisTicks = (
  comparableDays: number
): readonly EvolucionCarteraChartXAxisTick[] => {
  const step = comparableDays <= 6
    ? 1
    : Math.ceil((comparableDays - 1) / 5);
  const offsets = new Set<number>([0, comparableDays - 1]);

  for (let offset = step; offset < comparableDays - 1; offset += step) {
    offsets.add(offset);
  }

  return [...offsets]
    .sort((left, right) => left - right)
    .map((offset) => ({
      day: offset + 1,
      x: getX(offset, comparableDays),
    }));
};

export const buildEvolucionCarteraChartModel = (
  evolution: readonly EvolucionCarteraPoint[],
  context: PortfolioOperationalContext,
  comparison: EvolucionCarteraComparison | null,
  metric: EvolucionCarteraMetric
): EvolucionCarteraChartModel => {
  const comparableDays = getComparableDays(context);
  const references = buildReferenceDefinitions(comparison, metric);
  const allValues = [
    ...evolution.map((point) => getMetricValue(point, metric)),
    ...references.flatMap(({ series }) =>
      series.evolution.map((point) => getMetricValue(point, metric))
    ),
  ];
  const maxValue = getMaxValue(allValues, metric);

  const current = buildSeries(
    `current:${context.campaignId}`,
    context.campaignId,
    ['current'],
    evolution,
    context.dateFrom,
    true,
    metric,
    comparableDays,
    maxValue
  );

  const referenceSeries = references.map(({ series, roles }) =>
    buildSeries(
      `reference:${series.campaignId}`,
      series.campaignId,
      roles,
      series.evolution,
      series.dateFrom,
      series.coversComparablePeriod,
      metric,
      comparableDays,
      maxValue
    )
  );

  const plotHeight =
    EVOLUCION_CARTERA_VIEWBOX.height -
    EVOLUCION_CARTERA_VIEWBOX.top -
    EVOLUCION_CARTERA_VIEWBOX.bottom;
  const ticks = [1, 0.75, 0.5, 0.25, 0].map((ratio) => ({
    value: maxValue * ratio,
    y:
      EVOLUCION_CARTERA_VIEWBOX.top +
      plotHeight * (1 - ratio),
  }));

  const currentValues = evolution.map((point) =>
    getMetricValue(point, metric)
  );

  return {
    series: [current, ...referenceSeries],
    ticks,
    xTicks: buildXAxisTicks(comparableDays),
    maxValue,
    currentValue: currentValues[currentValues.length - 1] ?? 0,
    deltaValue:
      (currentValues[currentValues.length - 1] ?? 0) -
      (currentValues[0] ?? 0),
    comparableMonths:
      metric === 'progress'
        ? comparison?.comparableProgressMonths ?? 0
        : comparison?.comparableRecoveryMonths ?? 0,
  };
};
