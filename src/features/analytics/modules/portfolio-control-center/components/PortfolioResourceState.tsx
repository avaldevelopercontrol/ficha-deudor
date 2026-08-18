import type React from 'react';

import {
  ActionButton,
  FeedbackMessage,
} from '@shared/components/ui';

interface PortfolioResourceStateProps {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  onRetry: () => void;
  children: React.ReactNode;
}

export const PortfolioResourceState: React.FC<
  PortfolioResourceStateProps
> = ({
  isLoading,
  error,
  isEmpty,
  onRetry,
  children,
}) => {
  if (isLoading) {
    return (
      <div
        className="portfolio-resource-state"
        role="status"
        aria-live="polite"
      >
        <span
          className="portfolio-resource-state__spinner"
          aria-hidden="true"
        />
        <span>Cargando indicadores...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-resource-error">
        <FeedbackMessage
          variant="error"
          title="No se pudieron cargar los indicadores"
          message={error}
        />

        <div className="portfolio-resource-error__actions">
          <ActionButton
            label="Reintentar"
            variant="secondary"
            size="sm"
            onClick={onRetry}
          />
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="portfolio-resource-state">
        No hay información para los filtros seleccionados.
      </div>
    );
  }

  return <>{children}</>;
};
