import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import {
  fetchGruposListado,
} from '@features/seguridad/api/gruposApi';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';

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
  buildRegistrarModuloInitialForm,
  suggestModuloCode,
} from '../utils/registrarModulo.utils';

import {
  POWER_BI_DEFAULT_ICON,
  POWER_BI_PARENT_OPTION_ID,
} from '../utils/powerBiModulo.utils';

import {
  normalizeRegistrarModuloForm,
  validateRegistrarModuloForm,
} from '../validations/registrarModulo.validation';

import ModuloFormErrorSummary from './ModuloFormErrorSummary';

import ModuloFormFields from './ModuloFormFields';

import PowerBiGroupSelector from './PowerBiGroupSelector';

import './PowerBiGroupSelector.css';

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
      RegistrarModuloFormData,
    groupIds:
      readonly number[]
  ) => Promise<void> | void;
}

export const ModalRegistrarModulo = ({
  isOpen,
  canInsert,
  modulosExistentes,
  onClose,
  onRegistrar,
}: ModalRegistrarModuloProps): ReactNode => {
  const [
    selectedGroupIds,
    setSelectedGroupIds,
  ] = useState<number[]>([]);

  const [
    groupSelectionError,
    setGroupSelectionError,
  ] = useState<string | null>(null);

  const hasValidGroupSelection =
    selectedGroupIds.length === 1 &&
    Number.isSafeInteger(
      selectedGroupIds[0]
    ) &&
    selectedGroupIds[0] > 0;

  const codeWasEditedRef =
    useRef(false);

  const previousParentIdRef =
    useRef<number | null>(null);

  const previousIconRef =
    useRef<string>('');

  useEffect(() => {
    if (!isOpen) {
      codeWasEditedRef.current =
        false;
      previousParentIdRef.current =
        null;
      previousIconRef.current = '';
    }
  }, [isOpen]);

  const initialForm =
    useMemo(
      () =>
        buildRegistrarModuloInitialForm(
          modulosExistentes
        ),
      [modulosExistentes]
    );

  const powerBiParentAvailable =
    modulosExistentes.some(
      (modulo) =>
        modulo.idModulo ===
        POWER_BI_PARENT_OPTION_ID
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
        if (
          data.esPowerBI &&
          !hasValidGroupSelection
        ) {
          const message =
            'Seleccione un grupo para el tablero Power BI.';

          setGroupSelectionError(
            message
          );

          throw new Error(
            message
          );
        }

        setGroupSelectionError(
          null
        );

        await onRegistrar(
          normalizeRegistrarModuloForm(
            data
          ),
          data.esPowerBI
            ? selectedGroupIds
            : []
        );
      },
    });

  const {
    data: activeGroups,
    isLoading:
      isLoadingActiveGroups,
    error: activeGroupsError,
  } = useApiResource(
    fetchGruposListado,
    [],
    {
      enabled:
        isOpen &&
        form.esPowerBI,
      initialLoading: false,
    }
  );

  const powerBiGroups =
    useMemo(
      () =>
        (activeGroups ?? []).filter(
          (group) =>
            group.estado === 'Activo' &&
            group.idCliente > 0
        ),
      [activeGroups]
    );

  const handleNombreChange =
    useCallback(
      (value: string) => {
        handleChange(
          'nombre',
          value
        );

        if (
          !codeWasEditedRef.current
        ) {
          handleChange(
            'codigo',
            suggestModuloCode(
              value
            )
          );
        }
      },
      [handleChange]
    );

  const handleCodigoChange =
    useCallback(
      (value: string) => {
        codeWasEditedRef.current =
          true;

        handleChange(
          'codigo',
          value
        );
      },
      [handleChange]
    );

  const handlePowerBIChange =
    useCallback(
      (enabled: boolean) => {
        setGroupSelectionError(
          null
        );

        if (enabled) {
          previousParentIdRef.current =
            form.padreId !==
            POWER_BI_PARENT_OPTION_ID
              ? form.padreId
              : previousParentIdRef.current;

          handleChange(
            'esPowerBI',
            true
          );
          handleChange(
            'padreId',
            POWER_BI_PARENT_OPTION_ID
          );

          previousIconRef.current =
            form.icono.trim();

          handleChange(
            'icono',
            POWER_BI_DEFAULT_ICON
          );

          return;
        }

        handleChange(
          'esPowerBI',
          false
        );
        handleChange(
          'urlBI',
          ''
        );
        handleChange(
          'imagenOpcion',
          ''
        );
        handleChange(
          'emailOpcion',
          ''
        );
        handleChange(
          'icono',
          previousIconRef.current
        );

        setSelectedGroupIds(
          []
        );

        const previousParentId =
          previousParentIdRef.current;

        if (
          previousParentId !== null &&
          modulosExistentes.some(
            (modulo) =>
              modulo.idModulo ===
              previousParentId
          )
        ) {
          handleChange(
            'padreId',
            previousParentId
          );
        }
      },
      [
        form.icono,
        form.padreId,
        handleChange,
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
          <ModuloFormFields
            form={form}
            errors={errors}
            parentOptions={
              parentOptions
            }
            powerBiDisabled={
              !powerBiParentAvailable
            }
            powerBiDisabledMessage={
              !powerBiParentAvailable
                ? 'Primero registre el módulo Reportería para poder crear tableros Power BI.'
                : undefined
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
            onCodigoChange={
              handleCodigoChange
            }
            onIconoChange={(value) => {
              handleChange(
                'icono',
                value
              );
            }}
            onEsPowerBIChange={
              handlePowerBIChange
            }
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
            parentDisabled={
              form.esPowerBI
            }
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

          {form.esPowerBI && (
            <div className="power-bi-group-selector-spacing">
              <PowerBiGroupSelector
                groups={
                  powerBiGroups
                }
                value={
                  selectedGroupIds
                }
                disabled={
                  isSubmitting ||
                  isLoadingActiveGroups ||
                  Boolean(
                    activeGroupsError
                  )
                }
                error={
                  activeGroupsError
                    ? 'No se pudieron cargar los grupos activos.'
                    : groupSelectionError
                }
                onChange={(
                  groupIds
                ) => {
                  setSelectedGroupIds(
                    groupIds
                  );
                  setGroupSelectionError(
                    null
                  );
                }}
              />
            </div>
          )}

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
              (
                form.esPowerBI &&
                !hasValidGroupSelection
              )
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
