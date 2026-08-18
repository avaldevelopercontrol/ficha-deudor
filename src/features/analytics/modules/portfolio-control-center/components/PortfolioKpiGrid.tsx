import type React from 'react';

import type {
  PortfolioSummaryMetrics,
} from '../../../types/portfolioControlCenter.types';
import {
  calculatePortfolioRate,
  formatPortfolioCurrency,
  formatPortfolioInteger,
  formatPortfolioPercentage,
} from '../utils/portfolioControlCenter.formatters';
import {
  PortfolioKpiCard,
} from './PortfolioKpiCard';

interface PortfolioKpiGridProps {
  summary: PortfolioSummaryMetrics;
}

export const PortfolioKpiGrid: React.FC<
  PortfolioKpiGridProps
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
      <PortfolioKpiCard
        label="Cartera asignada"
        value={formatPortfolioInteger(
          summary.assignedPortfolio
        )}
        helper="Universo asignado al corte"
        icon="briefcase"
        tone="navy"
        progress={100}
      />

      <PortfolioKpiCard
        label="Cartera gestionada"
        value={formatPortfolioInteger(
          summary.managedPortfolio
        )}
        helper={`${formatPortfolioPercentage(
          managedRate
        )} de la cartera`}
        icon="success"
        tone="success"
        progress={managedRate}
      />

      <PortfolioKpiCard
        label="Cartera pendiente"
        value={formatPortfolioInteger(
          summary.pendingPortfolio
        )}
        helper={`${formatPortfolioPercentage(
          pendingRate
        )} por gestionar`}
        icon="history"
        tone="warning"
        progress={pendingRate}
      />

      <PortfolioKpiCard
        label="Monto recuperado"
        value={formatPortfolioCurrency(
          summary.recoveredAmount
        )}
        helper="Pagos válidos acumulados"
        icon="money"
        tone="danger"
        emphasis
      />
    </div>
  );
};
