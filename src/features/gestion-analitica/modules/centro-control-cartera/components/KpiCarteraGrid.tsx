import type React from 'react';

import { SisgesIcon } from '@shared/icons/sisges';

import { AnalyticsKpiCard } from '../../../shared/components';
import type {
  PortfolioSummaryMetrics,
} from '../domain/panoramaCartera.types';
import {
  calculatePortfolioRate,
  formatPortfolioCurrency,
  formatPortfolioInteger,
  formatPortfolioPercentage,
} from '../utils/centroControlCartera.formatters';

interface KpiCarteraGridProps {
  summary: PortfolioSummaryMetrics;
}

export const KpiCarteraGrid: React.FC<
  KpiCarteraGridProps
> = ({ summary }) => {
  const managedRate = calculatePortfolioRate(
    summary.managedPortfolio,
    summary.assignedPortfolio
  );

  const pendingRate = calculatePortfolioRate(
    summary.pendingPortfolio,
    summary.assignedPortfolio
  );

  return (
    <div className="portfolio-kpi-grid">
      <AnalyticsKpiCard
        layout="stacked"
        label="Cartera asignada"
        value={formatPortfolioInteger(
          summary.assignedPortfolio
        )}
        hint="Universo asignado al corte"
        icon={<SisgesIcon name="briefcase" />}
        progress={100}
      />

      <AnalyticsKpiCard
        layout="stacked"
        label="Cartera gestionada"
        value={formatPortfolioInteger(
          summary.managedPortfolio
        )}
        hint={`${formatPortfolioPercentage(
          managedRate
        )} de la cartera`}
        icon={<SisgesIcon name="success" />}
        tone="success"
        progress={managedRate}
      />

      <AnalyticsKpiCard
        layout="stacked"
        label="Cartera pendiente"
        value={formatPortfolioInteger(
          summary.pendingPortfolio
        )}
        hint={`${formatPortfolioPercentage(
          pendingRate
        )} por gestionar`}
        icon={<SisgesIcon name="history" />}
        tone="warning"
        progress={pendingRate}
      />

      <AnalyticsKpiCard
        layout="stacked"
        label="Monto recuperado"
        value={formatPortfolioCurrency(
          summary.recoveredAmount
        )}
        hint="Pagos válidos acumulados"
        icon={<SisgesIcon name="money" />}
        tone="danger"
        emphasis
      />
    </div>
  );
};
