import {
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

import Modal from '@shared/components/modals/Modal';

import {
  ActionButton,
  FeedbackMessage,
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
  fetchClientesActivos,
} from '../../../api/clientesApi';

import {
  fetchGrupoById,
} from '../../../api/gruposApi';

import {
  mapGrupoDetalleApiToForm,
} from '../../../mappers/actualizarGrupo.mapper';

import type {
  GrupoDetalleApi,
} from '../../../types/grupo.types';

import {
  MODAL_EDITAR_GRUPO_TEXTS,
} from '../constants/modalEditarGrupo.constants';

import {
  MODAL_REGISTRAR_GRUPO_INITIAL_FORM,
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

interface ModalEditarGrupoProps {
  isOpen: boolean;

  canEdit: boolean;

  grupoId: number;

  clienteNombreActual: string;

  onClose: () => void;

  onGuardar: (
    grupoId: number,
    grupo: GrupoDetalleApi,
    data: RegistrarGrupoFormData
  ) => Promise<void> | void;
}

export const ModalEditarGrupo = ({
  isOpen,
  canEdit,
  grupoId,
  clienteNombreActual,
  onClose,
  onGuardar,
}: ModalEditarGrupoProps): ReactNode => {
  const fetchDetalle =
    useCallback(
      (
        signal: AbortSignal
      ) =>
        fetchGrupoById(
          grupoId,
          signal
        ),
      [grupoId]
    );

  const {
    data: grupoDetalle,
    isLoading: isLoadingDetalle,
    error: detalleError,
    refetch: refetchDetalle,
  } = useApiResource<
    GrupoDetalleApi
  >(
    fetchDetalle,
    [grupoId],
    {
      enabled: isOpen,
      initialLoading: false,
    }
  );

  const {
    data: clientes,
    isLoading: isLoadingClientes,
    error: clientesError,
    refetch: refetchClientes,
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
    >(() => {
      const options = [
        ...(clientes ?? []),
      ]
        .sort((a, b) =>
          a.nombreCliente.localeCompare(
            b.nombreCliente,
            'es-PE',
            {
              sensitivity: 'base',
            }
          )
        )
        .map((cliente) => ({
          id: cliente.idCliente,
          label:
            cliente.nombreCliente,
        }));

      if (!grupoDetalle) {
        return options;
      }

      const clienteActualId =
        grupoDetalle.nid_cliente;

      const clienteActualExiste =
        options.some(
          (option) =>
            option.id ===
            clienteActualId
        );

      if (
        clienteActualExiste ||
        !Number.isInteger(
          clienteActualId
        ) ||
        clienteActualId <= 0
      ) {
        return options;
      }

      return [
        {
          id: clienteActualId,
          label:
            clienteNombreActual.trim() ||
            `Cliente #${clienteActualId}`,
        },
        ...options,
      ];
    }, [
      clientes,
      clienteNombreActual,
      grupoDetalle,
    ]);

  const {
    form,
    errors,
    isDirty,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useModalForm<
    RegistrarGrupoFormData,
    GrupoDetalleApi
  >({
    initialForm:
      MODAL_REGISTRAR_GRUPO_INITIAL_FORM,

    entity:
      grupoDetalle,

    mapEntityToForm:
      mapGrupoDetalleApiToForm,

    onClose,

    validate:
      validateRegistrarGrupoForm,

    resetOnClose: true,

    onSubmit: async (
      data
    ) => {
      if (!grupoDetalle) {
        throw new Error(
          'No se encontró la información del grupo a actualizar.'
        );
      }

      await onGuardar(
        grupoId,
        grupoDetalle,
        normalizeRegistrarGrupoForm(
          data
        )
      );
    },
  });

  if (!isOpen) {
    return null;
  }

  const resourceError =
    detalleError || clientesError;

  const isLoading =
    isLoadingDetalle ||
    isLoadingClientes ||
    (!detalleError &&
      grupoDetalle === null) ||
    (!clientesError &&
      clientes === null);

  const hasClientes =
    clienteOptions.length > 0;

  const canRenderForm =
    !isLoading &&
    !resourceError &&
    grupoDetalle !== null &&
    hasClientes;

  const handleRetry = () => {
    if (detalleError) {
      refetchDetalle();
    }

    if (clientesError) {
      refetchClientes();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      title={
        MODAL_EDITAR_GRUPO_TEXTS
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
          isLoading ||
          isSubmitting
        }
      >
        <div className="registrar-grupo-modal__body">
          {isLoading &&
            !resourceError && (
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
                  {isLoadingDetalle ||
                  grupoDetalle === null
                    ? MODAL_EDITAR_GRUPO_TEXTS
                        .loadingDetail
                    : MODAL_EDITAR_GRUPO_TEXTS
                        .loadingClientes}
                </span>
              </div>
            )}

          {!isLoading &&
            resourceError && (
              <div className="registrar-grupo-modal__resource-error">
                <FeedbackMessage
                  variant="error"
                  title={
                    MODAL_EDITAR_GRUPO_TEXTS
                      .resourceErrorTitle
                  }
                  message={
                    resourceError
                  }
                />

                <div className="registrar-grupo-modal__resource-actions">
                  <ActionButton
                    label={
                      MODAL_EDITAR_GRUPO_TEXTS
                        .retry
                    }
                    variant="secondary"
                    size="sm"
                    onClick={
                      handleRetry
                    }
                  />
                </div>
              </div>
            )}

          {!isLoading &&
            !resourceError &&
            grupoDetalle !== null &&
            !hasClientes && (
              <div className="registrar-grupo-modal__resource-error">
                <FeedbackMessage
                  variant="error"
                  title={
                    MODAL_EDITAR_GRUPO_TEXTS
                      .resourceErrorTitle
                  }
                  message={
                    MODAL_EDITAR_GRUPO_TEXTS
                      .emptyClientes
                  }
                />
              </div>
            )}

          {canRenderForm && (
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
                  MODAL_EDITAR_GRUPO_TEXTS
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

        {canRenderForm && (
          <footer className="registrar-grupo-modal__footer">
            <ActionButton
              label={
                MODAL_EDITAR_GRUPO_TEXTS
                  .submitLabel
              }
              loadingLabel={
                MODAL_EDITAR_GRUPO_TEXTS
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
                !isDirty ||
                !canEdit
              }
              title={
                !canEdit
                  ? getMantenerGrupoPermissionMessage(
                      'editar'
                    )
                  : undefined
              }
              className="registrar-grupo-modal__submit-button"
            />
          </footer>
        )}
      </div>
    </Modal>
  );
};

export default ModalEditarGrupo;
