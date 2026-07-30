import type React from 'react';

import Modal from '@shared/components/modals/Modal';

import {
  ActionButton,
} from '@shared/components/ui';

import {
  useModalForm,
} from '@shared/hooks/ui/useModalForm';

import {
  MODAL_REGISTRAR_USUARIO_INITIAL_FORM,
  MODAL_REGISTRAR_USUARIO_TEXTS,
} from '../constants/modalRegistrarUsuario.constants';

import type {
  RegistrarUsuarioFormData,
} from '../types/registrarUsuario.types';

import {
  normalizeRegistrarUsuarioForm,
  validateRegistrarUsuarioForm,
} from '../validations/registrarUsuario.validation';

import RegistrarUsuarioFormFields from './RegistrarUsuarioFormFields';

import {
  useAuth,
} from '@features/auth/contexts/authContextValue';

import {
  useRegistrarUsuarioCatalogos,
} from '../hooks/useRegistrarUsuarioCatalogos';

interface ModalRegistrarUsuarioProps {
  isOpen: boolean;
  onClose: () => void;

  onRegistrar: (
    data:
      RegistrarUsuarioFormData
  ) => Promise<void> | void;
}

interface RegistrarUsuarioErrorSummaryProps {
  errors:
    Record<string, string>;
}

const RegistrarUsuarioErrorSummary:
  React.FC<
    RegistrarUsuarioErrorSummaryProps
  > = ({
    errors,
  }) => {
    const errorEntries =
      Object.entries(errors);

    if (
      errorEntries.length === 0
    ) {
      return null;
    }

    return (
      <div
        className="error-summary"
        role="alert"
      >
        <strong>
          {
            MODAL_REGISTRAR_USUARIO_TEXTS
              .validationSummary
          }
        </strong>

        <ul>
          {errorEntries.map(
            ([field, message]) => (
              <li key={field}>
                {message}
              </li>
            )
          )}
        </ul>
      </div>
    );
  };

export const ModalRegistrarUsuario:
  React.FC<
    ModalRegistrarUsuarioProps
  > = ({
    isOpen,
    onClose,
    onRegistrar,
  }) => {
    const {
      usuario,
    } = useAuth();

    const {
      catalogos,
      loading: catalogLoading,
      errors: catalogErrors,
      isLoading: isLoadingCatalogos,
    } = useRegistrarUsuarioCatalogos({
      enabled: isOpen,
      idUsuario:
        usuario?.id_usuario ??
        null,
    });

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
        RegistrarUsuarioFormData
      >({
        initialForm:
          MODAL_REGISTRAR_USUARIO_INITIAL_FORM,

        onClose,

        validate:
          validateRegistrarUsuarioForm,

        resetOnClose: true,

        onSubmit: async (
          data
        ) => {
          const normalizedData =
            normalizeRegistrarUsuarioForm(
              data
            );

          await onRegistrar(
            normalizedData
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
          MODAL_REGISTRAR_USUARIO_TEXTS
            .title
        }
        onClose={
          handleCancel
        }
        size="xl"
        closeOnEsc={
          !isSubmitting
        }
        disableClose={
          isSubmitting
        }
      >
        <div
          className={[
            'registrar-usuario-modal',

            isSubmitting
              ? 'registrar-usuario-modal--submitting'
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-busy={
            isSubmitting
          }
        >
          <div className="registrar-usuario-modal__body">
            <RegistrarUsuarioFormFields
              form={form}
              errors={errors}
              catalogos={catalogos}
              catalogLoading={catalogLoading}
              catalogErrors={catalogErrors}
              onChange={handleChange}
            />

            <RegistrarUsuarioErrorSummary
              errors={errors}
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

          <footer className="registrar-usuario-modal__footer">
            <ActionButton
              label={
                MODAL_REGISTRAR_USUARIO_TEXTS
                  .submitLabel
              }
              loadingLabel={
                MODAL_REGISTRAR_USUARIO_TEXTS
                  .loadingLabel
              }
              loading={isSubmitting}
              variant="primary"
              size="md"
              icon="✓"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                isLoadingCatalogos
              }
              className="registrar-usuario-modal__submit-button"
            />
          </footer>
        </div>
      </Modal>
    );
  };

export default ModalRegistrarUsuario;