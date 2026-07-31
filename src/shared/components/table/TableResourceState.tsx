import type React from 'react';

import {
  ActionButton,
  FeedbackMessage,
} from '../ui';

import '../../styles/components/table-resource-state.css';

interface TableResourceStateProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  loadingMessage?: string;
  errorTitle?: string;
  children: React.ReactNode;
}

export const TableResourceState: React.FC<
  TableResourceStateProps
> = ({
  isLoading,
  error,
  onRetry,
  loadingMessage =
    'Cargando información...',
  errorTitle =
    'No se pudo cargar la información',
  children,
}) => {
  if (isLoading) {
    return (
      <div
        className="table-resource-state"
        role="status"
        aria-live="polite"
      >
        <span
          className="table-resource-state__spinner"
          aria-hidden="true"
        />

        <span>{loadingMessage}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="table-resource-error">
        <FeedbackMessage
          variant="error"
          title={errorTitle}
          message={error}
        />

        <div className="table-resource-error__actions">
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

  return <>{children}</>;
};

export default TableResourceState;