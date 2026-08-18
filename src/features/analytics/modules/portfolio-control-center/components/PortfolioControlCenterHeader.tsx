import type React from 'react';

import { SisgesIcon } from '@shared/icons/sisges';

interface PortfolioControlCenterHeaderProps {
  updatedAt: string | null;
  isLoading?: boolean;
}

export const PortfolioControlCenterHeader: React.FC<
  PortfolioControlCenterHeaderProps
> = ({ updatedAt, isLoading = false }) => {
  const freshnessValue = isLoading
    ? 'Actualizando información...'
    : updatedAt ?? 'Pendiente de fuente analítica';

  return (
    <header className="portfolio-control-center__header">
      <div className="portfolio-control-center__headline">
        <span
          className="portfolio-control-center__header-icon"
          aria-hidden="true"
        >
          <SisgesIcon name="analytics" />
        </span>

        <div className="portfolio-control-center__header-copy">
          <h1 className="portfolio-control-center__title">
            Portfolio Control Center
          </h1>

          <p className="portfolio-control-center__subtitle">
            Seguimiento operativo de cartera, avance y resultados.
          </p>
        </div>
      </div>

      <div className="portfolio-control-center__freshness">
        <span
          className="portfolio-control-center__freshness-icon"
          aria-hidden="true"
        >
          <SisgesIcon name="history" />
        </span>

        <div>
          <span className="portfolio-control-center__freshness-label">
            Datos actualizados hasta
          </span>

          <strong className="portfolio-control-center__freshness-value">
            {freshnessValue}
          </strong>
        </div>
      </div>
    </header>
  );
};
