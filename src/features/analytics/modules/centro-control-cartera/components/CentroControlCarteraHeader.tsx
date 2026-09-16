import type React from 'react';

import { AnalyticsPageHeader } from '../../../shared/components';
import { SisgesIcon } from '@shared/icons/sisges';

import type {
  CentroControlCarteraFreshness,
} from '../domain/panoramaCartera.types';
import {
  formatPortfolioUpdatedAt,
} from '../utils/centroControlCartera.formatters';

interface CentroControlCarteraHeaderProps {
  freshness: CentroControlCarteraFreshness | null;
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
): string => formatFreshnessValue(value).replace(', ', ' ');

const CentroControlCarteraFreshnessInfo: React.FC<
  CentroControlCarteraHeaderProps
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
              <svg
                className="portfolio-control-center__freshness-help-icon"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5" />
                <path d="M12 8h.01" />
              </svg>
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
  );
};

export const CentroControlCarteraHeader: React.FC<
  CentroControlCarteraHeaderProps
> = ({ freshness, isLoading = false }) => (
  <AnalyticsPageHeader
    variant="hero"
    className="portfolio-control-center__header"
    icon={<SisgesIcon name="analytics" />}
    title="Análisis de Carteras"
    description="Seguimiento operativo de cartera, avance y resultados."
    actions={(
      <CentroControlCarteraFreshnessInfo
        freshness={freshness}
        isLoading={isLoading}
      />
    )}
  />
);
