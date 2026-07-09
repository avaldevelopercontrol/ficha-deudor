import React from 'react';
import { PanelLayout } from './PanelLayout';

interface Props {
  title: string;
  isActive: boolean;
  error?: string | null;
  loadingMessage: string;
  errorTitle: string;
  onRetry: () => void;
}

interface PanelErrorStateProps {
  error: string;
  errorTitle: string;
  onRetry: () => void;
}

const PanelErrorState: React.FC<PanelErrorStateProps> = ({
  error,
  errorTitle,
  onRetry,
}) => {
  return (
    <div style={{ padding: '2rem', color: '#c00' }}>
      <p style={{ marginBottom: 12 }}>{errorTitle}</p>

      <p style={{ fontSize: '0.9em', color: '#666', marginBottom: 16 }}>
        {error}
      </p>

      <button
        onClick={onRetry}
        style={{ padding: '8px 16px', cursor: 'pointer' }}
        type="button"
      >
        Reintentar
      </button>
    </div>
  );
};

interface PanelLoadingStateProps {
  loadingMessage: string;
}

const PanelLoadingState: React.FC<PanelLoadingStateProps> = ({
  loadingMessage,
}) => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <span>{loadingMessage}</span>
    </div>
  );
};

const PanelResumenEstado: React.FC<Props> = ({
  title,
  isActive,
  error,
  loadingMessage,
  errorTitle,
  onRetry,
}) => {
  return (
    <PanelLayout title={title} isActive={isActive}>
      {error ? (
        <PanelErrorState
          error={error}
          errorTitle={errorTitle}
          onRetry={onRetry}
        />
      ) : (
        <PanelLoadingState loadingMessage={loadingMessage} />
      )}
    </PanelLayout>
  );
};

export default PanelResumenEstado;