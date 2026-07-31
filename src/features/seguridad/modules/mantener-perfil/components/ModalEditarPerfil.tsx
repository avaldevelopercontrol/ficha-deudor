import {
  useCallback,
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

import {
  fetchPerfilById,
} from '../../../api/perfilesApi';

import {
  mapPerfilApiToForm,
} from '../../../mappers/actualizarPerfil.mapper';

import type {
  Perfil,
  PerfilApi,
} from '../../../types/perfil.types';

import {
  MODAL_EDITAR_PERFIL_TEXTS,
} from '../constants/modalEditarPerfil.constants';

import {
  MODAL_REGISTRAR_PERFIL_INITIAL_FORM,
} from '../constants/modalRegistrarPerfil.constants';

import type {
  RegistrarPerfilFormData,
} from '../types/registrarPerfil.types';

import {
  normalizeRegistrarPerfilForm,
  validateRegistrarPerfilForm,
} from '../validations/registrarPerfil.validation';

import PerfilFormErrorSummary from './PerfilFormErrorSummary';

import RegistrarPerfilFormFields from './RegistrarPerfilFormFields';

interface ModalEditarPerfilProps {
  isOpen:
    boolean;

  perfilId:
    number;

  perfilesExistentes:
    readonly Perfil[];

  onClose:
    () => void;

  onGuardar: (
    perfil:
      PerfilApi,

    data:
      RegistrarPerfilFormData
  ) => Promise<void> | void;
}

export const ModalEditarPerfil = ({
  isOpen,
  perfilId,
  perfilesExistentes,
  onClose,
  onGuardar,
}: ModalEditarPerfilProps): ReactNode => {
  const fetcher =
    useCallback(
      (
        signal:
          AbortSignal
      ) =>
        fetchPerfilById(
          perfilId,
          signal
        ),
      [
        perfilId,
      ]
    );

  const {
    data:
      perfilDetalle,

    isLoading,
    error,
    refetch,
  } =
    useApiResource<
      PerfilApi
    >(
      fetcher,
      [
        perfilId,
      ]
    );

  const validate =
    useCallback(
      (
        form:
          RegistrarPerfilFormData
      ) =>
        validateRegistrarPerfilForm(
          form,
          {
            perfilesExistentes,

            perfilIdActual:
              perfilId,
          }
        ),
      [
        perfilId,
        perfilesExistentes,
      ]
    );

  const {
    form,
    errors,
    isDirty,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCancel,
  } =
    useModalForm<
      RegistrarPerfilFormData,
      PerfilApi
    >({
      initialForm:
        MODAL_REGISTRAR_PERFIL_INITIAL_FORM,

      entity:
        perfilDetalle,

      mapEntityToForm:
        mapPerfilApiToForm,

      onClose,

      validate,

      resetOnClose: true,

      onSubmit: async (
        data
      ) => {
        if (!perfilDetalle) {
          throw new Error(
            'No se encontró la información del perfil a actualizar.'
          );
        }

        await onGuardar(
          perfilDetalle,

          normalizeRegistrarPerfilForm(
            data
          )
        );
      },
    });

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      title={
        MODAL_EDITAR_PERFIL_TEXTS
          .title
      }
      onClose={
        handleCancel
      }
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
          'registrar-perfil-modal',

          isSubmitting
            ? 'registrar-perfil-modal--submitting'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-busy={
          isLoading ||
          isSubmitting
        }
      >
        {isLoading && (
          <div
            className="editar-perfil-modal__resource-state"
            role="status"
            aria-live="polite"
          >
            <span
              className="editar-perfil-modal__spinner"
              aria-hidden="true"
            />

            <span>
              {
                MODAL_EDITAR_PERFIL_TEXTS
                  .loadingDetail
              }
            </span>
          </div>
        )}

        {!isLoading &&
          error && (
            <div className="editar-perfil-modal__resource-error">
              <FeedbackMessage
                variant="error"
                title={
                  MODAL_EDITAR_PERFIL_TEXTS
                    .detailErrorTitle
                }
                message={
                  error
                }
              />

              <div className="editar-perfil-modal__resource-actions">
                <ActionButton
                  label="Reintentar"
                  variant="secondary"
                  size="sm"
                  onClick={
                    refetch
                  }
                />
              </div>
            </div>
          )}

        {!isLoading &&
          !error &&
          perfilDetalle && (
            <>
              <div className="registrar-perfil-modal__body">
                <RegistrarPerfilFormFields
                  form={form}
                  errors={
                    errors
                  }
                  onChange={
                    handleChange
                  }
                />

                <PerfilFormErrorSummary
                  errors={
                    errors
                  }
                  title={
                    MODAL_EDITAR_PERFIL_TEXTS
                      .validationSummary
                  }
                />

                {submitError && (
                  <div
                    className="error-summary"
                    role="alert"
                  >
                    <strong>
                      {
                        submitError
                      }
                    </strong>
                  </div>
                )}
              </div>

              <footer className="registrar-perfil-modal__footer">
                <ActionButton
                  label={
                    MODAL_EDITAR_PERFIL_TEXTS
                      .submitLabel
                  }
                  loadingLabel={
                    MODAL_EDITAR_PERFIL_TEXTS
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
                    !isDirty
                  }
                  className="registrar-perfil-modal__submit-button"
                />
              </footer>
            </>
          )}
      </div>
    </Modal>
  );
};

export default ModalEditarPerfil;