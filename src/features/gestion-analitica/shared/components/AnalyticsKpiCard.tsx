import type { CSSProperties, ReactNode } from 'react';

import '../styles/analytics-primitives.css';

export type AnalyticsKpiTone =
  | 'default'
  | 'info'
  | 'violet'
  | 'success'
  | 'warning'
  | 'danger';
export type AnalyticsKpiLayout = 'inline' | 'stacked';

interface AnalyticsKpiCardStyle extends CSSProperties {
  '--analytics-kpi-progress'?: string;
}

interface AnalyticsKpiCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: ReactNode;
  tone?: AnalyticsKpiTone;
  layout?: AnalyticsKpiLayout;
  progress?: number;
  emphasis?: boolean;
  className?: string;
}

const clampProgress = (value: number): number =>
  Math.min(100, Math.max(0, value));

export const AnalyticsKpiCard = ({
  label,
  value,
  hint,
  icon,
  tone = 'default',
  layout = 'inline',
  progress,
  emphasis = false,
  className = '',
}: AnalyticsKpiCardProps) => {
  const normalizedProgress =
    typeof progress === 'number' ? clampProgress(progress) : null;
  const style: AnalyticsKpiCardStyle | undefined =
    normalizedProgress === null
      ? undefined
      : {
          '--analytics-kpi-progress': `${normalizedProgress}%`,
        };

  return (
    <article
      className={[
        'analytics-kpi-card',
        `analytics-kpi-card--${layout}`,
        tone !== 'default' ? `analytics-kpi-card--${tone}` : '',
        emphasis ? 'analytics-kpi-card--emphasis' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <div className="analytics-kpi-card__icon" aria-hidden="true">
        {icon}
      </div>
      <div className="analytics-kpi-card__body">
        <span className="analytics-kpi-card__label">{label}</span>
        <strong className="analytics-kpi-card__value">{value}</strong>
        {hint && <span className="analytics-kpi-card__hint">{hint}</span>}
      </div>
      {normalizedProgress !== null && (
        <span className="analytics-kpi-card__progress" aria-hidden="true">
          <span />
        </span>
      )}
    </article>
  );
};
