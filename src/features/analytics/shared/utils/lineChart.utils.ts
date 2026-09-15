export interface LineChartCoordinate {
  x: number;
  y: number;
  value: number;
}

export interface LineChartPadding {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

interface BuildLineChartModelOptions {
  width: number;
  height: number;
  paddingX?: number;
  paddingY?: number;
  padding?: Partial<LineChartPadding>;
  maxValue?: number;
}

export interface LineChartModel {
  coordinates: readonly LineChartCoordinate[];
  polyline: string;
  linePath: string;
  areaPath: string;
  maxValue: number;
  baselineY: number;
}

const resolvePadding = ({
  paddingX = 0,
  paddingY = 0,
  padding,
}: Pick<BuildLineChartModelOptions, 'paddingX' | 'paddingY' | 'padding'>): LineChartPadding => ({
  left: padding?.left ?? paddingX,
  right: padding?.right ?? paddingX,
  top: padding?.top ?? paddingY,
  bottom: padding?.bottom ?? paddingY,
});

export const buildLineChartModel = (
  values: readonly number[],
  options: BuildLineChartModelOptions
): LineChartModel => {
  const {
    width,
    height,
  } = options;
  const padding = resolvePadding(options);
  const maxValue = Math.max(
    1,
    options.maxValue ?? Math.max(...values, 0)
  );
  const innerWidth = Math.max(0, width - padding.left - padding.right);
  const innerHeight = Math.max(0, height - padding.top - padding.bottom);
  const baselineY = padding.top + innerHeight;

  const coordinates = values.map((value, index) => {
    const x = values.length <= 1
      ? padding.left + innerWidth / 2
      : padding.left + (index / (values.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - Math.min(value / maxValue, 1) * innerHeight;

    return { x, y, value };
  });

  const polyline = coordinates.map(({ x, y }) => `${x},${y}`).join(' ');
  const linePath = coordinates
    .map(
      ({ x, y }, index) =>
        `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    )
    .join(' ');
  const firstPoint = coordinates[0];
  const lastPoint = coordinates[coordinates.length - 1];
  const areaPath =
    firstPoint && lastPoint
      ? `${linePath} L ${lastPoint.x.toFixed(2)} ${baselineY.toFixed(2)} L ${firstPoint.x.toFixed(2)} ${baselineY.toFixed(2)} Z`
      : '';

  return {
    coordinates,
    polyline,
    linePath,
    areaPath,
    maxValue,
    baselineY,
  };
};
