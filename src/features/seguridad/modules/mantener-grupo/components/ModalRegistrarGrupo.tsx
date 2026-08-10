import {
  useMemo,
  type ReactNode,
} from 'react';

import {
  fetchClientesActivos,
} from '../../../api/clientesApi';

import Modal from '@shared/components/modals/Modal';

import {
  ActionButton,
} from '@shared/components/ui';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';

import {
  useModalForm,
} from '@shared/hooks/ui/useModalForm';

import type {
  SelectOption,
} from '@shared/types';

import {
  MODAL_REGISTRAR_GRUPO_INITIAL_FORM,
  MODAL_REGISTRAR_GRUPO_TEXTS,
} from '../constants/modalRegistrarGrupo.constants';

import type {
  RegistrarGrupoFormData,
} from '../types/registrarGrupo.types';

import {
  getMantenerGrupoPermissionMessage,
} from '../utils/mantenerGrupoPermissions';

import {
  normalizeRegistrarGrupoForm,
  validateRegistrarGrupoForm,
} from '../validations/registrarGrupo.validation';

import GrupoFormErrorSummary from './GrupoFormErrorSummary';

import RegistrarGrupoFormFields from './RegistrarGrupoFormFields';

interface ModalRegistrarGrupoProps {
  isOpen: boolean;

  canInsert: boolean;

  onClose: () => void;

  onRegistrar: (
    data:
      RegistrarGrupoFormData
  ) => Promise<void> | void;
}

export const ModalRegistrarGrupo = ({
  isOpen,
  canInsert,
  onClose,
  onRegistrar,
}: ModalRegistrarGrupoProps): ReactNode => {
  const {
    data: clientes,
    isLoading:
      isLoadingClientes,
    error: clientesError,
    refetch:
      refetchClientes,
  } = useApiResource(
    fetchClientesActivos,
    [],
    {
      enabled: isOpen,
      initialLoading: false,
    }
  );

  const clienteOptions =
    useMemo<
      SelectOption<number>[]
    >(
      () =>
        [...(clientes ?? [])]
          .sort((a, b) =>
            a.nombreCliente.localeCompare(
              b.nombreCliente,
              'es-PE',
              {
                sensitivity:
                  'base',
              }
            )
          )
          .map(
            (cliente) => ({
              id:
                cliente.idCliente,
              label:
                cliente.nombreCliente,
            })
          ),
      [clientes]
    );

  const {
    form,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useModalForm<
    RegistrarGrupoFormData
  >({
    initialForm:
      MODAL_REGISTRAR_GRUPO_INITIAL_FORM,

    onClose,

    validate:
      validateRegistrarGrupoForm,

    resetOnClose: true,

    onSubmit: async (
      data
    ) => {
      await onRegistrar(
        normalizeRegistrarGrupoForm(
          data
        )
      );
    },
  });

  if (!isOpen) {
    return null;
  }

  const hasClientes =
    clienteOptions.length > 0;

  const isCatalogReady =
    clientes !== null &&
    !isLoadingClientes &&
    !clientesError &&
    hasClientes;

  return (
    <Modal
      isOpen={isOpen}
      title={
        MODAL_REGISTRAR_GRUPO_TEXTS
          .title
      }
      onClose={handleCancel}
      size="md"
      closeOnEsc={
        !isSubmitting
      }
      disableClose={
        isSubmitting
      }
    >
      <div
        className={[
          'registrar-grupo-modal',

          isSubmitting
            ? 'registrar-grupo-modal--submitting'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-busy={
          isSubmitting ||
          isLoadingClientes
        }
      >
        <div className="registrar-grupo-modal__body">
          {(isLoadingClientes ||
            (clientes === null && !clientesError)) && (
            <div
              className="registrar-grupo-modal__resource-state"
              role="status"
              aria-live="polite"
            >
              <span
                className="registrar-grupo-modal__spinner"
                aria-hidden="true"
              />

              <span>
                {
                  MODAL_REGISTRAR_GRUPO_TEXTS
                    .loadingClientes
                }
              </span>
            </div>
          )}

          {!isLoadingClientes &&
            clientesError && (
              <div className="registrar-grupo-modal__resource-error">
                <div
                  className="error-summary"
                  role="alert"
                >
                  <strong>
                    {clientesError}
                  </strong>
                </div>

                <div className="registrar-grupo-modal__resource-actions">
                  <ActionButton
                    label={
                      MODAL_REGISTRAR_GRUPO_TEXTS
                        .retryClientes
                    }
                    variant="secondary"
                    size="sm"
                    onClick={
                      refetchClientes
                    }
                  />
                </div>
              </div>
            )}

          {clientes !== null &&
            !isLoadingClientes &&
            !clientesError &&
            !hasClientes && (
              <div className="registrar-grupo-modal__resource-error">
                <div
                  className="error-summary"
                  role="alert"
                >
                  <strong>
                    {
                      MODAL_REGISTRAR_GRUPO_TEXTS
                        .emptyClientes
                    }
                  </strong>
                </div>

                <div className="registrar-grupo-modal__resource-actions">
                  <ActionButton
                    label={
                      MODAL_REGISTRAR_GRUPO_TEXTS
                        .retryClientes
                    }
                    variant="secondary"
                    size="sm"
                    onClick={
                      refetchClientes
                    }
                  />
                </div>
              </div>
            )}

          {isCatalogReady && (
            <>
              <RegistrarGrupoFormFields
                form={form}
                errors={errors}
                clienteOptions={
                  clienteOptions
                }
                disabled={
                  isSubmitting
                }
                onChange={
                  handleChange
                }
              />

              <GrupoFormErrorSummary
                errors={errors}
                title={
                  MODAL_REGISTRAR_GRUPO_TEXTS
                    .validationSummary
                }
              />

              {submitError && (
                <div
                  className="error-summary"
                  role="alert"
                >
                  <strong>
                    {submitError}
                  </strong>
                </div>
              )}
            </>
          )}
        </div>

        <footer className="registrar-grupo-modal__footer">
          <ActionButton
            label={
              MODAL_REGISTRAR_GRUPO_TEXTS
                .submitLabel
            }
            loadingLabel={
              MODAL_REGISTRAR_GRUPO_TEXTS
                .loadingLabel
            }
            loading={
              isSubmitting
            }
            variant="primary"
            size="md"
            icon="✓"
            onClick={
              handleSubmit
            }
            disabled={
              isSubmitting ||
              !isCatalogReady ||
              !canInsert
            }
            title={
              !canInsert
                ? getMantenerGrupoPermissionMessage(
                    'insertar'
                  )
                : undefined
            }
            className="registrar-grupo-modal__submit-button"
          />
        </footer>
      </div>
    </Modal>
  );
};

export default ModalRegistrarGrupo;
