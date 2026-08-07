import {
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

import type {
  SelectOption,
} from '@shared/types';

import Modal from '@shared/components/modals/Modal';

import {
  ActionButton,
} from '@shared/components/ui';

import {
  useModalForm,
} from '@shared/hooks/ui/useModalForm';

import type {
  Modulo,
} from '../../../types/opcion.types';

import {
  MODAL_REGISTRAR_MODULO_TEXTS,
} from '../constants/modalRegistrarModulo.constants';

import type {
  RegistrarModuloFormData,
} from '../types/registrarModulo.types';

import {
  useModuloAvailabilityControls,
} from '../hooks/useModuloAvailabilityControls';

import {
  applyApplicationOptionToForm,
  buildApplicationOptionSelectOptions,
  buildRegistrarModuloInitialForm,
  getAvailableApplicationOptions,
} from '../utils/registrarModulo.utils';

import {
  normalizeRegistrarModuloForm,
  validateRegistrarModuloForm,
} from '../validations/registrarModulo.validation';

import ModuloFormErrorSummary from './ModuloFormErrorSummary';

import ModuloFormFields from './ModuloFormFields';

import RegistrarModuloSourceSelector from './RegistrarModuloSourceSelector';

import {
  getMantenerModulosPermissionMessage,
} from '../utils/mantenerModulosPermissions';

interface ModalRegistrarModuloProps {
  isOpen: boolean;

  canInsert: boolean;

  modulosExistentes:
    readonly Modulo[];

  onClose: () => void;

  onRegistrar: (
    data:
      RegistrarModuloFormData
  ) => Promise<void> | void;
}

export const ModalRegistrarModulo = ({
  isOpen,
  canInsert,
  modulosExistentes,
  onClose,
  onRegistrar,
}: ModalRegistrarModuloProps): ReactNode => {
  const initialForm =
    useMemo(
      () =>
        buildRegistrarModuloInitialForm(
          modulosExistentes
        ),
      [modulosExistentes]
    );

  const parentOptions =
    useMemo<
      SelectOption<number>[]
    >(
      () =>
        modulosExistentes.map(
          (modulo) => ({
            id: modulo.idModulo,
            label:
              modulo.nombre ||
              modulo.codigo ||
              `Id ${modulo.idModulo}`,
          })
        ),
      [modulosExistentes]
    );

  const availableApplicationOptions =
    useMemo(
      () =>
        getAvailableApplicationOptions(
          modulosExistentes
        ),
      [modulosExistentes]
    );

  const applicationOptionSelectOptions =
    useMemo(
      () =>
        buildApplicationOptionSelectOptions(
          availableApplicationOptions
        ),
      [availableApplicationOptions]
    );

  const validate =
    useCallback(
      (
        form:
          RegistrarModuloFormData
      ) =>
        validateRegistrarModuloForm(
          form,
          {
            modulosExistentes,
          }
        ),
      [modulosExistentes]
    );

  const {
    form,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    setErrors,
    handleSubmit,
    handleCancel,
  } =
    useModalForm<
      RegistrarModuloFormData
    >({
      initialForm,

      onClose,

      validate,

      resetOnClose: true,

      onSubmit: async (
        data
      ) => {
        await onRegistrar(
          normalizeRegistrarModuloForm(
            data
          )
        );
      },
    });

  const handleApplicationOptionChange =
    useCallback(
      (value: string) => {
        const definition =
          availableApplicationOptions.find(
            (option) =>
              option.code === value
          );

        if (!definition) {
          handleChange(
            'applicationOptionCode',
            ''
          );
          handleChange(
            'nombre',
            ''
          );
          handleChange(
            'descripcion',
            ''
          );
          handleChange(
            'codigo',
            ''
          );
          handleChange(
            'icono',
            ''
          );
          handleChange(
            'padreId',
            initialForm.padreId
          );

          return;
        }

        const nextForm =
          applyApplicationOptionToForm(
            form,
            definition,
            modulosExistentes
          );

        handleChange(
          'applicationOptionCode',
          nextForm.applicationOptionCode
        );
        handleChange(
          'nombre',
          nextForm.nombre
        );
        handleChange(
          'descripcion',
          nextForm.descripcion
        );
        handleChange(
          'codigo',
          nextForm.codigo
        );
        handleChange(
          'icono',
          nextForm.icono
        );
        handleChange(
          'padreId',
          nextForm.padreId
        );
      },
      [
        availableApplicationOptions,
        form,
        handleChange,
        initialForm.padreId,
        modulosExistentes,
      ]
    );

  const {
    visibleDisabled,
    onVisibleChange,
    onEstadoChange,
  } =
    useModuloAvailabilityControls({
      form,
      modulos:
        modulosExistentes,
      onChange:
        handleChange,
      setErrors,
    });

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      title={
        MODAL_REGISTRAR_MODULO_TEXTS
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
          'registrar-modulo-modal',

          isSubmitting
            ? 'registrar-modulo-modal--submitting'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-busy={
          isSubmitting
        }
      >
        <div className="registrar-modulo-modal__body">
          <div className="registrar-modulo-form registrar-modulo-form--source">
            <RegistrarModuloSourceSelector
              value={
                form.applicationOptionCode
              }
              options={
                applicationOptionSelectOptions
              }
              error={
                errors.applicationOptionCode
              }
              disabled={
                isSubmitting
              }
              onChange={
                handleApplicationOptionChange
              }
            />
          </div>

          <ModuloFormFields
            form={form}
            errors={errors}
            parentOptions={
              parentOptions
            }
            nameDisabled
            codeDisabled
            onNombreChange={(value) => {
              handleChange(
                'nombre',
                value
              );
            }}
            onDescripcionChange={(value) => {
              handleChange(
                'descripcion',
                value
              );
            }}
            onCodigoChange={(value) => {
              handleChange(
                'codigo',
                value
              );
            }}
            onIconoChange={(value) => {
              handleChange(
                'icono',
                value
              );
            }}
            onPadreChange={(value) => {
              handleChange(
                'padreId',
                value
              );
            }}
            visibleDisabled={
              visibleDisabled
            }
            onVisibleChange={
              onVisibleChange
            }
            onEstadoChange={
              onEstadoChange
            }
          />

          <ModuloFormErrorSummary
            errors={errors}
            title={
              MODAL_REGISTRAR_MODULO_TEXTS
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

        <footer className="registrar-modulo-modal__footer">
          <ActionButton
            label={
              MODAL_REGISTRAR_MODULO_TEXTS
                .submitLabel
            }
            loadingLabel={
              MODAL_REGISTRAR_MODULO_TEXTS
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
              !canInsert ||
              !form.applicationOptionCode ||
              applicationOptionSelectOptions.length === 0
            }
            title={
              !canInsert
                ? getMantenerModulosPermissionMessage(
                    'insertar'
                  )
                : undefined
            }
            className="registrar-modulo-modal__submit-button"
          />
        </footer>
      </div>
    </Modal>
  );
};

export default ModalRegistrarModulo;
