import type React from 'react';

import {
  SisgesIcon,
  type SisgesIconName,
} from '@shared/icons/sisges';
import type {
  PortfolioSummaryMetrics,
} from '../../../types/portfolioControlCenter.types';
import {
  formatPortfolioInteger,
  formatPortfolioPercentage,
  formatPortfolioIntensityPercentage,
} from '../utils/portfolioControlCenter.formatters';

interface PortfolioSecondaryMetricsProps {
  summary: PortfolioSummaryMetrics;
}

interface SecondaryMetricProps {
  label: string;
  value: string;
  icon: SisgesIconName;
}

const SecondaryMetric: React.FC<
  SecondaryMetricProps
> = ({ label, value, icon }) => {
  return (
    <div className="portfolio-secondary-metric">
      <span
        className="portfolio-secondary-metric__icon"
        aria-hidden="true"
      >
        <SisgesIcon name={icon} />
      </span>

      <span className="portfolio-secondary-metric__copy">
        <span className="portfolio-secondary-metric__label">
          {label}
        </span>
        <strong className="portfolio-secondary-metric__value">
          {value}
        </strong>
      </span>
    </div>
  );
};

export const PortfolioSecondaryMetrics: React.FC<
  PortfolioSecondaryMetricsProps
> = ({ summary }) => {
  return (
    <div className="portfolio-secondary-metrics">
      <SecondaryMetric
        label="Gestiones"
        value={formatPortfolioInteger(
          summary.managementCount
        )}
        icon="bar-chart"
      />
      <SecondaryMetric
        label="Intensidad"
        value={formatPortfolioIntensityPercentage(
          summary.managementIntensity
        )}
        icon="analytics"
      />
      <SecondaryMetric
        label="Contactabilidad"
        value={formatPortfolioPercentage(
          summary.contactabilityRate
        )}
        icon="phone"
      />
      <SecondaryMetric
        label="RPC"
        value={formatPortfolioPercentage(
          summary.rpcRate
        )}
        icon="target"
      />
      <SecondaryMetric
        label="Tasa de cierre"
        value={formatPortfolioPercentage(
          summary.closeRate
        )}
        icon="success"
      />
    </div>
  );
};
