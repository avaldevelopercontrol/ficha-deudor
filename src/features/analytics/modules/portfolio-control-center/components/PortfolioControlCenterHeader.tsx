import type React from 'react';

import { SisgesIcon } from '@shared/icons/sisges';

import type {
  PortfolioControlCenterFreshness,
} from '../../../types/portfolioControlCenter.types';
import {
  formatPortfolioUpdatedAt,
} from '../utils/portfolioControlCenter.formatters';

interface PortfolioControlCenterHeaderProps {
  freshness: PortfolioControlCenterFreshness | null;
  isLoading?: boolean;
}

const formatFreshnessValue = (
  value: string | null | undefined,
  fallback = 'No disponible'
): string => {
  if (!value) {
    return fallback;
  }

  return formatPortfolioUpdatedAt(value);
};

const formatTooltipFreshnessValue = (
  value: string | null | undefined
): string => {
  return formatFreshnessValue(value).replace(', ', ' ');
};

export const PortfolioControlCenterHeader: React.FC<
  PortfolioControlCenterHeaderProps
> = ({ freshness, isLoading = false }) => {
  const operationValue = isLoading
    ? 'Actualizando información...'
    : formatFreshnessValue(
        freshness?.operationAsOfAt,
        'Pendiente de fuente analítica'
      );

  const operationDetail = formatTooltipFreshnessValue(
    freshness?.operationAsOfAt
  );
  const portfolioBaseDetail = formatTooltipFreshnessValue(
    freshness?.portfolioBaseRefreshedAt
  );
  const refreshedAtDetail = formatTooltipFreshnessValue(
    freshness?.refreshedAt
  );

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

        <div className="portfolio-control-center__freshness-copy">
          <span className="portfolio-control-center__freshness-label">
            Información operativa hasta
          </span>

          <div className="portfolio-control-center__freshness-value-row">
            <strong className="portfolio-control-center__freshness-value">
              {operationValue}
            </strong>

            <span className="portfolio-control-center__freshness-help">
              <button
                type="button"
                className="portfolio-control-center__freshness-help-button"
                aria-label="Ver detalle de actualización de la información"
                aria-describedby="portfolio-control-center-freshness-tooltip"
              >
                ⓘ
              </button>

              <span
                id="portfolio-control-center-freshness-tooltip"
                className="portfolio-control-center__freshness-tooltip"
                role="tooltip"
              >
                <span className="portfolio-control-center__freshness-tooltip-row">
                  <span>Operación:</span>
                  <strong>{operationDetail}</strong>
                </span>
                <span className="portfolio-control-center__freshness-tooltip-row">
                  <span>Cartera base:</span>
                  <strong>{portfolioBaseDetail}</strong>
                </span>
                <span className="portfolio-control-center__freshness-tooltip-row">
                  <span>Último refresh:</span>
                  <strong>{refreshedAtDetail}</strong>
                </span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
