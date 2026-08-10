import {
  useCallback,
  type ReactNode,
} from 'react';

import Modal from '@shared/components/modals/Modal';

import {
  ActionButton,
} from '@shared/components/ui';

import {
  useModalForm,
} from '@shared/hooks/ui/useModalForm';

import type {
  Perfil,
} from '../../../types/perfil.types';

import {
  MODAL_REGISTRAR_PERFIL_INITIAL_FORM,
  MODAL_REGISTRAR_PERFIL_TEXTS,
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

import {
  getMantenerPerfilPermissionMessage,
} from '../utils/mantenerPerfilPermissions';

interface ModalRegistrarPerfilProps {
  isOpen: boolean;

  canInsert: boolean;

  perfilesExistentes:
    readonly Perfil[];

  onClose: () => void;

  onRegistrar: (
    data:
      RegistrarPerfilFormData
  ) => Promise<void> | void;
}

export const ModalRegistrarPerfil = ({
  isOpen,
  canInsert,
  perfilesExistentes,
  onClose,
  onRegistrar,
}: ModalRegistrarPerfilProps): ReactNode => {
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
          }
        ),
      [
        perfilesExistentes,
      ]
    );

  const {
    form,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCancel,
  } =
    useModalForm<
      RegistrarPerfilFormData
    >({
      initialForm:
        MODAL_REGISTRAR_PERFIL_INITIAL_FORM,

      onClose,

      validate,

      resetOnClose: true,

      onSubmit: async (
        data
      ) => {
        await onRegistrar(
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
        MODAL_REGISTRAR_PERFIL_TEXTS
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
          isSubmitting
        }
      >
        <div className="registrar-perfil-modal__body">
          <RegistrarPerfilFormFields
            form={form}
            errors={errors}
            onChange={
              handleChange
            }
          />

          <PerfilFormErrorSummary
            errors={errors}
            title={
              MODAL_REGISTRAR_PERFIL_TEXTS
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
        </div>

        <footer className="registrar-perfil-modal__footer">
          <ActionButton
            label={
              MODAL_REGISTRAR_PERFIL_TEXTS
                .submitLabel
            }
            loadingLabel={
              MODAL_REGISTRAR_PERFIL_TEXTS
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
              !canInsert
            }
            title={
              !canInsert
                ? getMantenerPerfilPermissionMessage(
                    'insertar'
                  )
                : undefined
            }
            className="registrar-perfil-modal__submit-button"
          />
        </footer>
      </div>
    </Modal>
  );
};

export default ModalRegistrarPerfil;