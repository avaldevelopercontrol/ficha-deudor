import type {
  ReactNode,
} from 'react';

import type {
  AnalyticsOptionReportClientPublication,
} from '@features/analytics/access/api/analyticsAccessAdmin.api';

import {
  isValidPowerBiPublishToWebUrl,
} from '../utils/powerBiModulo.utils';

import './PowerBiReportClientPublications.css';

interface PowerBiReportClientPublicationsProps {
  clients: readonly AnalyticsOptionReportClientPublication[];
  disabled?: boolean;
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

const isDraftReady = (
  client: AnalyticsOptionReportClientPublication
): boolean => {
  const embedUrl = client.embedUrl?.trim() ?? '';

  return (
    client.isAvailable &&
    client.groupIds.length > 0 &&
    isValidPowerBiPublishToWebUrl(embedUrl)
  );
};

const getStatus = (
  client: AnalyticsOptionReportClientPublication
): {
  label: string;
  modifier: string;
} => {
  if (!client.isAvailable) {
    return {
      label: 'No disponible',
      modifier: 'unavailable',
    };
  }

  if (client.candidateGroups.length === 0) {
    return {
      label: 'Sin grupo SISGES',
      modifier: 'warning',
    };
  }

  if (client.groupIds.length === 0) {
    return {
      label: 'Configurar acceso',
      modifier: 'warning',
    };
  }

  const embedUrl = client.embedUrl?.trim() ?? '';

  if (!embedUrl) {
    return {
      label: 'Falta publicación',
      modifier: 'pending',
    };
  }

  if (!isValidPowerBiPublishToWebUrl(embedUrl)) {
    return {
      label: 'URL inválida',
      modifier: 'error',
    };
  }

  return {
    label: 'Listo',
    modifier: 'configured',
  };
};

export const PowerBiReportClientPublications = ({
  clients,
  disabled = false,
  onEmbedUrlChange,
  onGroupIdsChange,
}: PowerBiReportClientPublicationsProps): ReactNode => {
  const availableClients = clients.filter(
    (client) => client.isAvailable
  );
  const readyCount = availableClients.filter(
    isDraftReady
  ).length;
  const unavailableCount =
    clients.length - availableClients.length;

  return (
    <section className="power-bi-report-client-publications">
      <details>
        <summary className="power-bi-report-client-publications__summary">
          <span>
            Publicaciones por cartera
          </span>
          <span className="power-bi-report-client-publications__counter">
            {readyCount}/{availableClients.length} listas
            {unavailableCount > 0
              ? ` · ${unavailableCount} no disponibles`
              : ''}
          </span>
        </summary>

        <div className="power-bi-report-client-publications__body">
          <p className="power-bi-report-client-publications__help">
            Las carteras vigentes se detectan desde el BI. Si un cliente tiene un único grupo SISGES activo, el acceso se propone automáticamente; si tiene varios, seleccione los grupos requeridos. Una cartera solo aparece al usuario cuando tiene acceso resuelto y una URL Publish to web válida.
          </p>

          <div className="power-bi-report-client-publications__list">
            {clients.map((client) => {
              const value =
                client.embedUrl ?? '';
              const hasValue =
                Boolean(value.trim());
              const isInvalid =
                hasValue &&
                !isValidPowerBiPublishToWebUrl(
                  value
                );
              const status =
                getStatus(client);
              const inputId =
                `report-client-embed-${client.clientId}-${client.name}`
                  .replace(/[^A-Za-z0-9_-]+/g, '-');
              const selectedGroupIds =
                new Set(client.groupIds);
              const selectedGroups =
                client.candidateGroups.filter(
                  (group) =>
                    selectedGroupIds.has(
                      group.groupId
                    )
                );
              const rowDisabled =
                disabled ||
                !client.isAvailable;

              return (
                <div
                  key={`${client.clientId}:${client.name}`}
                  className={[
                    'power-bi-report-client-publications__row',
                    !client.isAvailable
                      ? 'power-bi-report-client-publications__row--unavailable'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="power-bi-report-client-publications__identity">
                    <label
                      htmlFor={inputId}
                      className="power-bi-report-client-publications__name"
                    >
                      {client.name}
                    </label>
                    <span className="power-bi-report-client-publications__client-id">
                      Cliente {client.clientId}
                    </span>
                    {!client.isAvailable && (
                      <span className="power-bi-report-client-publications__source-note">
                        Ya no está vigente en la fuente del BI. Se conserva su configuración por si reaparece.
                      </span>
                    )}
                  </div>

                  <div className="power-bi-report-client-publications__access">
                    {client.isAvailable &&
                      client.candidateGroups.length === 0 && (
                        <span className="power-bi-report-client-publications__access-warning">
                          No hay grupos SISGES activos vinculados a este cliente.
                        </span>
                      )}

                    {client.candidateGroups.length > 0 && (
                      <>
                        <div className="power-bi-report-client-publications__selected-groups">
                          {selectedGroups.length > 0
                            ? selectedGroups.map(
                                (group) => (
                                  <span
                                    key={group.groupId}
                                    className="power-bi-report-client-publications__group-chip"
                                  >
                                    {group.name} [{group.groupId}]
                                  </span>
                                )
                              )
                            : (
                              <span className="power-bi-report-client-publications__access-warning">
                                Acceso pendiente
                              </span>
                            )}
                        </div>

                        {client.isAvailable &&
                          client.candidateGroups.length === 1 &&
                          client.groupResolution === 'AUTO_DETECTED' && (
                            <span className="power-bi-report-client-publications__auto-note">
                              Detectado automáticamente por cliente SISGES.
                            </span>
                          )}

                        {client.isAvailable &&
                          (
                            client.candidateGroups.length > 1 ||
                            client.groupIds.length === 0 ||
                            client.groupResolution === 'INVALID_CONFIGURED'
                          ) && (
                            <details className="power-bi-report-client-publications__group-picker">
                              <summary>
                                Configurar acceso ({client.groupIds.length} seleccionado{client.groupIds.length === 1 ? '' : 's'})
                              </summary>

                              <div className="power-bi-report-client-publications__group-options">
                                {client.candidateGroups.map(
                                  (group) => (
                                    <label
                                      key={group.groupId}
                                      className="power-bi-report-client-publications__group-option"
                                    >
                                      <input
                                        type="checkbox"
                                        disabled={rowDisabled}
                                        checked={selectedGroupIds.has(
                                          group.groupId
                                        )}
                                        onChange={(event) => {
                                          const nextGroupIds =
                                            new Set(
                                              client.groupIds
                                            );

                                          if (event.target.checked) {
                                            nextGroupIds.add(
                                              group.groupId
                                            );
                                          } else {
                                            nextGroupIds.delete(
                                              group.groupId
                                            );
                                          }

                                          onGroupIdsChange(
                                            client.clientId,
                                            client.name,
                                            [...nextGroupIds].sort(
                                              (left, right) =>
                                                left - right
                                            )
                                          );
                                        }}
                                      />
                                      <span>
                                        {group.name} [{group.groupId}]
                                      </span>
                                    </label>
                                  )
                                )}
                              </div>
                            </details>
                          )}
                      </>
                    )}
                  </div>

                  <div className="power-bi-report-client-publications__field">
                    <input
                      id={inputId}
                      type="url"
                      value={value}
                      disabled={rowDisabled}
                      autoComplete="off"
                      inputMode="url"
                      placeholder="https://app.powerbi.com/view?r=..."
                      aria-invalid={
                        isInvalid || undefined
                      }
                      onChange={(event) => {
                        onEmbedUrlChange(
                          client.clientId,
                          client.name,
                          event.target.value
                        );
                      }}
                    />

                    {isInvalid && (
                      <span
                        className="power-bi-report-client-publications__error"
                        role="alert"
                      >
                        Use una URL https://app.powerbi.com/view?r=...
                      </span>
                    )}
                  </div>

                  <span
                    className={`power-bi-report-client-publications__status power-bi-report-client-publications__status--${status.modifier}`}
                  >
                    {status.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </details>
    </section>
  );
};

export default PowerBiReportClientPublications;
