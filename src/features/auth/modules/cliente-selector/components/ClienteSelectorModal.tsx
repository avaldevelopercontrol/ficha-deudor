import type React from 'react';

import Modal from '@shared/components/modals/Modal';
import { SelectField } from '@shared/components/ui';

import type { Cliente, Usuario } from '../../../types';
import {
  aniosToSelectOptions,
  clienteToSelectOptions,
} from '../../../utils/clienteOptions.utils';
import { useClienteSelector } from '../hooks/useClienteSelector';
import { CarteraParametrosTable } from './CarteraParametrosTable';

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
    selectedClienteKey,
    anios,
    selectedAnio,
    carteras,
    selectedCarteraKey,
    isLoading,
    isAniosLoading,
    isCarterasLoading,
    hasLoadedAnios,
    hasLoadedCarteras,
    error,
    aniosError,
    carterasError,
    canContinue,
    handleContinue,
    handleSelectCliente,
    handleSelectAnio,
    handleSelectCartera,
  } = useClienteSelector({
    isOpen,
    usuarioId: usuario.id_usuario,
    onContinue,
  });

  const shouldShowAnioField =
    Boolean(selectedClienteKey) &&
    (isAniosLoading || anios.length > 0 || Boolean(aniosError));

  const shouldShowCarterasTable =
    selectedAnio !== '' &&
    hasLoadedCarteras &&
    carteras.length > 1;

  const hasNoCarteras =
    selectedAnio !== '' &&
    hasLoadedCarteras &&
    carteras.length === 0;

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
              value={selectedClienteKey}
              onChange={handleSelectCliente}
              placeholder="Seleccione un cliente..."
              required
            />

            {shouldShowAnioField && (
              <div className="cliente-selector__year-field">
                <SelectField<number | ''>
                  label="Año"
                  options={aniosToSelectOptions(anios)}
                  value={selectedAnio}
                  onChange={handleSelectAnio}
                  placeholder={
                    isAniosLoading
                      ? 'Cargando años...'
                      : 'Seleccione un año...'
                  }
                  disabled={isAniosLoading || anios.length === 0}
                  error={aniosError ?? undefined}
                  required
                />
              </div>
            )}

            {selectedClienteKey &&
              hasLoadedAnios &&
              anios.length === 0 && (
                <p className="cliente-selector__detail">
                  El cliente no tiene años configurados. Puede continuar.
                </p>
              )}

            {isCarterasLoading && (
              <div className="cliente-selector__loading cliente-selector__loading--compact">
                Cargando carteras...
              </div>
            )}

            {carterasError && (
              <div className="cliente-selector__error cliente-selector__error--compact">
                {carterasError}
              </div>
            )}

            {hasNoCarteras && (
              <div className="cliente-selector__error cliente-selector__error--compact">
                No se encontraron carteras para el cliente y año seleccionados.
              </div>
            )}

            {shouldShowCarterasTable && (
              <CarteraParametrosTable
                carteras={carteras}
                selectedCarteraKey={selectedCarteraKey}
                onSelect={handleSelectCartera}
              />
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
            disabled={!canContinue}
            type="button"
          >
            Continuar
          </button>
        </div>
      </div>
    </Modal>
  );
};
