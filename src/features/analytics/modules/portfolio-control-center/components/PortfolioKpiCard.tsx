import type React from 'react';

import {
  SisgesIcon,
  type SisgesIconName,
} from '@shared/icons/sisges';

export type PortfolioKpiTone =
  | 'navy'
  | 'success'
  | 'warning'
  | 'danger';

interface PortfolioKpiCardProps {
  label: string;
  value: string;
  helper?: string;
  icon: SisgesIconName;
  tone?: PortfolioKpiTone;
  progress?: number;
  emphasis?: boolean;
}

interface PortfolioKpiStyle extends React.CSSProperties {
  '--portfolio-kpi-progress'?: string;
}

const clampProgress = (value: number): number => {
  return Math.min(100, Math.max(0, value));
};

export const PortfolioKpiCard: React.FC<
  PortfolioKpiCardProps
> = ({
  label,
  value,
  helper,
  icon,
  tone = 'navy',
  progress,
  emphasis = false,
}) => {
  const normalizedProgress =
    typeof progress === 'number'
      ? clampProgress(progress)
      : null;
  const style: PortfolioKpiStyle | undefined =
    normalizedProgress === null
      ? undefined
      : {
          '--portfolio-kpi-progress': `${normalizedProgress}%`,
        };

  return (
    <article
      className={[
        'portfolio-kpi-card',
        `portfolio-kpi-card--${tone}`,
        emphasis
          ? 'portfolio-kpi-card--emphasis'
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <div className="portfolio-kpi-card__topline">
        <span
          className="portfolio-kpi-card__icon"
          aria-hidden="true"
        >
          <SisgesIcon name={icon} />
        </span>

        <span className="portfolio-kpi-card__label">
          {label}
        </span>
      </div>

      <strong className="portfolio-kpi-card__value">
        {value}
      </strong>

      {helper && (
        <span className="portfolio-kpi-card__helper">
          {helper}
        </span>
      )}

      {normalizedProgress !== null && (
        <span
          className="portfolio-kpi-card__progress"
          aria-hidden="true"
        >
          <span />
        </span>
      )}
    </article>
  );
};
