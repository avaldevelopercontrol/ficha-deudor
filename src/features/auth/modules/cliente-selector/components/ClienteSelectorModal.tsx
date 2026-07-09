import type React from 'react';

import Modal from '@shared/components/modals/Modal';
import { SelectField } from '@shared/components/ui';

import type { Cliente, Usuario } from '../../../types';
import { clienteToSelectOptions } from '../../../utils/clienteOptions.utils';
import { useClienteSelector } from '../hooks/useClienteSelector';

interface ClienteSelectorModalProps {
  isOpen: boolean;
  usuario: Usuario;
  onClose: () => void;
  onContinue: (cliente: Cliente) => void;
}

export const ClienteSelectorModal: React.FC<ClienteSelectorModalProps> = ({
  isOpen,
  usuario,
  onClose,
  onContinue,
}) => {
  const {
    clientes,
    selectedCliente,
    selectedClienteId,
    isLoading,
    error,
    handleContinue,
    handleSelectCliente,
  } = useClienteSelector({ isOpen, usuario, onContinue });

  return (
    <Modal
      isOpen={isOpen}
      title="Seleccionar Cliente"
      onClose={onClose}
      size="sm"
      closeOnEsc={false}
    >
      <div className="cliente-selector">
        <div className="cliente-selector__user-info">
          <p>
            <strong>
              Bienvenido, {usuario.nombre} {usuario.apellido}
            </strong>
          </p>

          <p className="cliente-selector__hint">
            Seleccione el cliente con el que desea trabajar:
          </p>
        </div>

        {isLoading ? (
          <div className="cliente-selector__loading">
            Cargando clientes...
          </div>
        ) : error ? (
          <div className="cliente-selector__error">{error}</div>
        ) : (
          <>
            <SelectField
              label="Cliente"
              options={clienteToSelectOptions(clientes)}
              value={selectedClienteId}
              onChange={handleSelectCliente}
              placeholder="Seleccione un cliente..."
              required
            />

            {selectedCliente && (
              <div className="cliente-selector__detail">
                <span className="cliente-selector__code">
                  {selectedCliente.codigo}
                </span>

                <span className="cliente-selector__status">
                  {selectedCliente.activa ? '● Activa' : '○ Inactiva'}
                </span>
              </div>
            )}
          </>
        )}

        <div className="cliente-selector__actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            disabled={isLoading}
            type="button"
          >
            Cancelar
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={handleContinue}
            disabled={!selectedClienteId || isLoading}
            type="button"
          >
            Continuar
          </button>
        </div>
      </div>
    </Modal>
  );
};
