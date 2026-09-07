import type {
  ReactNode,
} from 'react';

import type {
  AnalyticsOptionReportClientPublication,
} from '@features/analytics/access/api/analyticsAccessAdmin.api';

import type {
  Grupo,
} from '@features/seguridad/types/grupo.types';

import {
  ActionButton,
  FeedbackMessage,
} from '@shared/components/ui';

import PowerBiGroupSelector from './PowerBiGroupSelector';
import PowerBiReportClientPublications from './PowerBiReportClientPublications';

import './PowerBiGroupSelector.css';

interface PowerBiConfigurationSectionProps {
  groups: readonly Grupo[];
  selectedGroupIds: readonly number[];
  publications: readonly AnalyticsOptionReportClientPublication[];
  hasReportClientConfiguration: boolean;
  isSubmitting: boolean;
  isLoading: boolean;
  error: string | null;
  groupSelectionError: string | null;
  onRetry: () => Promise<void>;
  onGroupSelectionChange: (groupIds: number[]) => void;
  onEmbedUrlChange: (
    clientId: number,
    name: string,
    embedUrl: string
  ) => void;
  onGroupIdsChange: (
    clientId: number,
    name: string,
    groupIds: readonly number[]
  ) => void;
}

export const PowerBiConfigurationSection = ({
  groups,
  selectedGroupIds,
  publications,
  hasReportClientConfiguration,
  isSubmitting,
  isLoading,
  error,
  groupSelectionError,
  onRetry,
  onGroupSelectionChange,
  onEmbedUrlChange,
  onGroupIdsChange,
}: PowerBiConfigurationSectionProps): ReactNode => {
  const unavailable = Boolean(error);

  return (
    <>
      <div className="power-bi-group-selector-spacing">
        <PowerBiGroupSelector
          groups={groups}
          value={selectedGroupIds}
          disabled={
            isSubmitting ||
            isLoading ||
            unavailable
          }
          error={
            error
              ? 'No se pudo cargar la configuración de grupos del tablero.'
              : groupSelectionError
          }
          onChange={onGroupSelectionChange}
        />
      </div>

      {unavailable && (
        <div className="editar-modulo-modal__resource-actions">
          <ActionButton
            label="Reintentar grupos"
            variant="secondary"
            size="sm"
            onClick={() => {
              void onRetry();
            }}
          />
        </div>
      )}

      {hasReportClientConfiguration && (
        <PowerBiReportClientPublications
          clients={publications}
          disabled={
            isSubmitting || isLoading
          }
          onEmbedUrlChange={onEmbedUrlChange}
          onGroupIdsChange={onGroupIdsChange}
        />
      )}

      {error && (
        <div className="editar-modulo-modal__resource-error">
          <FeedbackMessage
            variant="error"
            title="No se pudieron cargar las publicaciones por cartera"
            message={error}
          />

          <div className="editar-modulo-modal__resource-actions">
            <ActionButton
              label="Reintentar publicaciones"
              variant="secondary"
              size="sm"
              onClick={onRetry}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PowerBiConfigurationSection;
