import type React from 'react';

import {
  ActionButton,
  FeedbackMessage,
} from '@shared/components/ui';

import '../styles/gestion-usuarios-resource.css';

interface UsuariosTableResourceStateProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  children: React.ReactNode;
}

export const UsuariosTableResourceState: React.FC<
  UsuariosTableResourceStateProps
> = ({
  isLoading,
  error,
  onRetry,
  children,
}) => {
  if (isLoading) {
    return (
      <div
        className="gestion-usuarios-resource-state"
        role="status"
        aria-live="polite"
      >
        <span
          className="gestion-usuarios-resource-state__spinner"
          aria-hidden="true"
        />

        <span>Cargando usuarios...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gestion-usuarios-resource-error">
        <FeedbackMessage
          variant="error"
          title="No se pudo cargar la información"
          message={error}
        />

        <div className="gestion-usuarios-resource-error__actions">
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

export default UsuariosTableResourceState;