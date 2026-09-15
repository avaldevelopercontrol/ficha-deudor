import type React from 'react';

import {
  ActionButton,
  FeedbackMessage,
  LoadingState,
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
      <LoadingState
        message={loadingMessage}
        className="table-resource-state"
      />
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