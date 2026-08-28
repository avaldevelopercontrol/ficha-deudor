import {
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type {
  AuthorizedOption,
} from '@features/access-control';

import Modal from '@shared/components/modals/Modal';
import {
  SelectField,
} from '@shared/components/ui';

import type {
  AnalyticsReportClientOption,
} from '../../../access/types/analyticsAccess.types';

interface PowerBiReportClientModalProps {
  report: AuthorizedOption | null;
  clients: readonly AnalyticsReportClientOption[];
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onContinue: (
    client: AnalyticsReportClientOption
  ) => void;
}

const buildClientOptionKey = (
  client: AnalyticsReportClientOption
): string =>
  `${client.clientId}:${encodeURIComponent(client.name)}`;

export const PowerBiReportClientModal = ({
  report,
  clients,
  isLoading,
  error,
  onClose,
  onContinue,
}: PowerBiReportClientModalProps): ReactNode => {
  const [selectedKey, setSelectedKey] =
    useState('');

  const options = useMemo(
    () =>
      clients.map((client) => ({
        id: buildClientOptionKey(client),
        label: client.name,
      })),
    [clients]
  );

  const selectedClient = useMemo(
    () =>
      clients.find(
        (client) =>
          buildClientOptionKey(client) ===
          selectedKey
      ) ?? null,
    [clients, selectedKey]
  );

  return (
    <Modal
      isOpen={report !== null}
      title="Seleccionar cartera"
      onClose={onClose}
      size="sm"
      disableClose={isLoading}
    >
      <div className="reporteria-client-selector">
        <div className="reporteria-client-selector__intro">
          <strong>{report?.name}</strong>
          <p>
            Selecciona la cartera con la que deseas consultar este reporte.
          </p>
        </div>

        {isLoading && (
          <div
            className="reporteria-client-selector__state"
            role="status"
          >
            Cargando carteras autorizadas...
          </div>
        )}

        {!isLoading && error && (
          <div
            className="reporteria-client-selector__state reporteria-client-selector__state--error"
            role="alert"
          >
            {error}
          </div>
        )}

        {!isLoading &&
          !error &&
          clients.length > 0 && (
            <SelectField
              label="Cartera"
              options={options}
              value={selectedKey}
              onChange={setSelectedKey}
              placeholder="Seleccione una cartera..."
              required
            />
          )}

        <div className="reporteria-client-selector__actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              if (selectedClient) {
                onContinue(selectedClient);
              }
            }}
            disabled={
              isLoading ||
              Boolean(error) ||
              selectedClient === null
            }
          >
            Continuar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PowerBiReportClientModal;
