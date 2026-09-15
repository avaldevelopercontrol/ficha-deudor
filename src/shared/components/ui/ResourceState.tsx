import type { ReactNode } from 'react';

import '../../styles/components/resource-state.css';
import { ActionButton } from './ActionButton';
import { LoadingState } from './LoadingState';

interface ResourceStateProps {
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
  onRetry: () => void;
  children: ReactNode;
  loadingMessage?: string;
  errorTitle?: string;
  emptyMessage?: ReactNode;
  preserveDataOnError?: boolean;
  preserveDataOnLoading?: boolean;
  className?: string;
  loadingClassName?: string;
  errorClassName?: string;
  emptyClassName?: string;
}

export const ResourceState = ({
  isLoading,
  error,
  hasData,
  onRetry,
  children,
  loadingMessage = 'Cargando información...',
  errorTitle = 'No se pudo cargar la información',
  emptyMessage,
  preserveDataOnError = true,
  preserveDataOnLoading = true,
  className = '',
  loadingClassName = '',
  errorClassName = '',
  emptyClassName = '',
}: ResourceStateProps) => {
  if (isLoading && (!hasData || !preserveDataOnLoading)) {
    return (
      <LoadingState
        message={loadingMessage}
        className={`resource-state resource-state--loading ${className} ${loadingClassName}`.trim()}
      />
    );
  }

  if (error && (!hasData || !preserveDataOnError)) {
    return (
      <section
        className={`resource-state resource-state--error ${className} ${errorClassName}`.trim()}
        role="alert"
      >
        <div>
          <strong>{errorTitle}</strong>
          <span>{error}</span>
        </div>
        <ActionButton
          label="Reintentar"
          variant="secondary"
          size="sm"
          className="resource-state__retry"
          onClick={onRetry}
        />
      </section>
    );
  }

  if (!hasData) {
    return emptyMessage ? (
      <section
        className={`resource-state resource-state--empty ${className} ${emptyClassName}`.trim()}
      >
        {emptyMessage}
      </section>
    ) : null;
  }

  return (
    <>
      {error && (
        <section
          className={`resource-state resource-state--error ${className} ${errorClassName}`.trim()}
          role="alert"
        >
          <div>
            <strong>{errorTitle}</strong>
            <span>{error}</span>
          </div>
          <ActionButton
            label="Reintentar"
            variant="secondary"
            size="sm"
            className="resource-state__retry"
            onClick={onRetry}
          />
        </section>
      )}
      {children}
    </>
  );
};
