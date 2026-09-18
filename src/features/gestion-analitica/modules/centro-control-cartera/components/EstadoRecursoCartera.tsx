import type React from 'react';

import { ResourceState } from '@shared/components/ui';

interface EstadoRecursoCarteraProps {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
  onRetry: () => void;
  children: React.ReactNode;
}

export const EstadoRecursoCartera: React.FC<
  EstadoRecursoCarteraProps
> = ({
  isLoading,
  error,
  isEmpty,
  onRetry,
  children,
}) => (
  <ResourceState
    isLoading={isLoading}
    error={error}
    hasData={!isEmpty}
    onRetry={onRetry}
    loadingMessage="Cargando indicadores..."
    errorTitle="No se pudieron cargar los indicadores"
    emptyMessage="No hay información para los filtros seleccionados."
    preserveDataOnError={false}
    preserveDataOnLoading={false}
    className="portfolio-resource-state-shared"
    emptyClassName="portfolio-resource-state"
    errorClassName="portfolio-resource-error"
  >
    {children}
  </ResourceState>
);
