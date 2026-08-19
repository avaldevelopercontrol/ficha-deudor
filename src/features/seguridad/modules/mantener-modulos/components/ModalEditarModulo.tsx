import {
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

import {
  hasRegisteredOptionRoute,
} from '@features/access-control/registry/optionRoute.registry';

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
  fetchOpcionById,
} from '../../../api/opcionesApi';

import type {
  Modulo,
  OpcionApi,
} from '../../../types/opcion.types';

import {
  MODAL_EDITAR_MODULO_TEXTS,
} from '../constants/modalEditarModulo.constants';

import type {
  EditarModuloFormData,
} from '../types/editarModulo.types';

import {
  buildEditableParentOptions,
  buildOrderOptions,
  buildOrderPreview,
  mapOpcionApiToEditarModuloForm,
  resolveModuloCodeAfterNameChange,
  resolveOrderAfterParentChange,
} from '../utils/editarModulo.utils';


import {
  useModuloAvailabilityControls,
} from '../hooks/useModuloAvailabilityControls';

import {
  normalizeModuloForm,
  validateEditarModuloForm,
} from '../validations/registrarModulo.validation';

import ModuloFormErrorSummary from './ModuloFormErrorSummary';

import ModuloFormFields from './ModuloFormFields';

import ModuloOrderControl from './ModuloOrderControl';

import {
  getMantenerModulosPermissionMessage,
} from '../utils/mantenerModulosPermissions';

interface ModalEditarModuloProps {
  isOpen: boolean;
  canEdit: boolean;
  moduloId: number;
  modulosExistentes: readonly Modulo[];
  onClose: () => void;
  onGuardar: (
    modulo: OpcionApi,
    data: EditarModuloFormData
  ) => Promise<void> | void;
}

const EMPTY_EDIT_FORM:
  EditarModuloFormData = {
    nombre: '',
    descripcion: '',
    codigo: '',
    icono: '',
    esPowerBI: false,
    urlBI: '',
    imagenOpcion: '',
    emailOpcion: '',
    padreId: 0,
    orden: 0,
    visible: true,
    estado: true,
  };

export const ModalEditarModulo = ({
  isOpen,
  canEdit,
  moduloId,
  modulosExistentes,
  onClose,
  onGuardar,
}: ModalEditarModuloProps): ReactNode => {
  const isImplementedModule =
    hasRegisteredOptionRoute(
      moduloId
    );

  const fetcher =
    useCallback(
      (
        signal: AbortSignal
      ) =>
        fetchOpcionById(
          moduloId,
          signal
        ),
      [moduloId]
    );

  const {
    data: moduloDetalle,
    isLoading,
    error,
    refetch,
  } =
    useApiResource<OpcionApi>(
      fetcher,
      [moduloId]
    );

  const mapEntityToForm =
    useCallback(
      (
        modulo: OpcionApi
      ) =>
        mapOpcionApiToEditarModuloForm(
          modulo,
          modulosExistentes
        ),
      [modulosExistentes]
    );

  const validate =
    useCallback(
      (
        form: EditarModuloFormData
      ) =>
        validateEditarModuloForm(
          form,
          {
            modulosExistentes,
            moduloIdActual: moduloId,
            isImplemented:
              isImplementedModule,
          }
        ),
      [
        isImplementedModule,
        moduloId,
        modulosExistentes,
      ]
    );

  const {
    form,
    errors,
    isDirty,
    isSubmitting,
    submitError,
    handleChange,
    setErrors,
    handleSubmit,
    handleCancel,
  } =
    useModalForm<
      EditarModuloFormData,
      OpcionApi
    >({
      initialForm:
        EMPTY_EDIT_FORM,

      entity:
        moduloDetalle,

      mapEntityToForm,

      onClose,

      validate,

      resetOnClose: true,

      onSubmit: async (
        data
      ) => {
        if (!moduloDetalle) {
          throw new Error(
            'No se encontró la información del módulo a actualizar.'
          );
        }

        await onGuardar(
          moduloDetalle,
          normalizeModuloForm(
            data
          )
        );
      },
    });

  const parentOptions =
    useMemo(
      () =>
        moduloDetalle
          ? buildEditableParentOptions(
              moduloDetalle,
              modulosExistentes
            )
          : [],
      [
        moduloDetalle,
        modulosExistentes,
      ]
    );

  const orderOptions =
    useMemo(
      () =>
        buildOrderOptions(
          form.padreId,
          moduloId,
          modulosExistentes
        ),
      [
        form.padreId,
        moduloId,
        modulosExistentes,
      ]
    );

  const orderPreview =
    useMemo(
      () =>
        buildOrderPreview(
          form,
          moduloId,
          modulosExistentes
        ),
      [
        form,
        moduloId,
        modulosExistentes,
      ]
    );

  const isRootModule =
    moduloDetalle
      ? (
          Number(
            moduloDetalle
              .nId_OpcionPadre
          ) || 0
        ) === 0
      : false;

  const handleNombreChange =
    useCallback(
      (
        value: string
      ) => {
        handleChange(
          'nombre',
          value
        );

        if (!moduloDetalle) {
          return;
        }

        const nextCode =
          resolveModuloCodeAfterNameChange(
            moduloDetalle,
            value
          );

        if (
          nextCode !==
          form.codigo
        ) {
          handleChange(
            'codigo',
            nextCode
          );
        }
      },
      [
        form.codigo,
        handleChange,
        moduloDetalle,
      ]
    );

  const handleParentChange =
    useCallback(
      (
        parentId: number
      ) => {
        handleChange(
          'padreId',
          parentId
        );

        handleChange(
          'orden',
          resolveOrderAfterParentChange(
            parentId,
            moduloId,
            modulosExistentes
          )
        );
      },
      [
        handleChange,
        moduloId,
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
      moduloId,
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
        MODAL_EDITAR_MODULO_TEXTS
          .title
      }
      onClose={handleCancel}
      size="md"
      closeOnEsc={!isSubmitting}
      disableClose={isSubmitting}
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
          isLoading ||
          isSubmitting
        }
      >
        {isLoading && (
          <div
            className="editar-modulo-modal__resource-state"
            role="status"
            aria-live="polite"
          >
            <span
              className="editar-modulo-modal__spinner"
              aria-hidden="true"
            />

            <span>
              {
                MODAL_EDITAR_MODULO_TEXTS
                  .loadingDetail
              }
            </span>
          </div>
        )}

        {!isLoading &&
          error && (
            <div className="editar-modulo-modal__resource-error">
              <FeedbackMessage
                variant="error"
                title={
                  MODAL_EDITAR_MODULO_TEXTS
                    .detailErrorTitle
                }
                message={error}
              />

              <div className="editar-modulo-modal__resource-actions">
                <ActionButton
                  label="Reintentar"
                  variant="secondary"
                  size="sm"
                  onClick={refetch}
                />
              </div>
            </div>
          )}

        {!isLoading &&
          !error &&
          moduloDetalle && (
            <>
              <div className="registrar-modulo-modal__body">
                <ModuloFormFields
                  form={form}
                  errors={errors}
                  parentOptions={
                    parentOptions
                  }
                  codeDisabled
                  parentDisabled={
                    isRootModule ||
                    form.esPowerBI
                  }
                  showPowerBiTypeSelector={
                    false
                  }
                  onNombreChange={
                    handleNombreChange
                  }
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
                  onUrlBIChange={(value) => {
                    handleChange(
                      'urlBI',
                      value
                    );
                  }}
                  onImagenOpcionChange={(value) => {
                    handleChange(
                      'imagenOpcion',
                      value
                    );
                  }}
                  onEmailOpcionChange={(value) => {
                    handleChange(
                      'emailOpcion',
                      value
                    );
                  }}
                  onPadreChange={
                    handleParentChange
                  }
                  visibleDisabled={
                    visibleDisabled
                  }
                  onVisibleChange={
                    onVisibleChange
                  }
                  onEstadoChange={
                    onEstadoChange
                  }
                  orderControl={
                    <ModuloOrderControl
                      value={form.orden}
                      options={
                        orderOptions
                      }
                      previewItems={
                        orderPreview
                      }
                      error={errors.orden}
                      helpText={
                        MODAL_EDITAR_MODULO_TEXTS
                          .orderHelp
                      }
                      previewTitle={
                        MODAL_EDITAR_MODULO_TEXTS
                          .orderPreview
                      }
                      disabled={
                        isRootModule
                      }
                      onChange={(value) => {
                        handleChange(
                          'orden',
                          value
                        );
                      }}
                    />
                  }
                />

                <ModuloFormErrorSummary
                  errors={errors}
                  title={
                    MODAL_EDITAR_MODULO_TEXTS
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
                    MODAL_EDITAR_MODULO_TEXTS
                      .submitLabel
                  }
                  loadingLabel={
                    MODAL_EDITAR_MODULO_TEXTS
                      .loadingLabel
                  }
                  loading={isSubmitting}
                  variant="primary"
                  size="md"
                  icon="✓"
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    !isDirty ||
                    !canEdit
                  }
                  title={
                    !canEdit
                      ? getMantenerModulosPermissionMessage(
                          'editar'
                        )
                      : undefined
                  }
                  className="registrar-modulo-modal__submit-button"
                />
              </footer>
            </>
          )}
      </div>
    </Modal>
  );
};

export default ModalEditarModulo;
