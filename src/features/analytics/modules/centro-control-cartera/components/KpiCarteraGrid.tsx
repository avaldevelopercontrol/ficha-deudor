import type React from 'react';

import type {
  PortfolioSummaryMetrics,
} from '../domain/panoramaCartera.types';
import {
  calculatePortfolioRate,
  formatPortfolioCurrency,
  formatPortfolioInteger,
  formatPortfolioPercentage,
} from '../utils/centroControlCartera.formatters';
import {
  KpiCarteraCard,
} from './KpiCarteraCard';

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
      <KpiCarteraCard
        label="Cartera asignada"
        value={formatPortfolioInteger(
          summary.assignedPortfolio
        )}
        helper="Universo asignado al corte"
        icon="briefcase"
        tone="navy"
        progress={100}
      />

      <KpiCarteraCard
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

      <KpiCarteraCard
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

      <KpiCarteraCard
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
