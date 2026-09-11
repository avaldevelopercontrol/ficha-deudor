import {
  useCallback,
  useMemo,
} from 'react';

import {
  hasRegisteredOptionRoute,
} from '@features/access-control/registry/optionRoute.registry';
import type {
  AnalyticsReportClientPublicationInput,
} from '@features/analytics/access/api/analyticsAccessAdmin.api';

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
  normalizeModuloForm,
  validateEditarModuloForm,
} from '../validations/registrarModulo.validation';

import {
  useModuloAvailabilityControls,
} from './useModuloAvailabilityControls';
import {
  usePowerBiModuleConfiguration,
} from './usePowerBiModuleConfiguration';

interface UseEditarModuloModalOptions {
  isOpen: boolean;
  moduloId: number;
  modulosExistentes: readonly Modulo[];
  onClose: () => void;
  onGuardar: (
    modulo: OpcionApi,
    data: EditarModuloFormData,
    groupIds: readonly number[],
    reportClientPublications:
      readonly AnalyticsReportClientPublicationInput[] | null
  ) => Promise<void> | void;
}

const EMPTY_EDIT_FORM: EditarModuloFormData = {
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

export const useEditarModuloModal = ({
  isOpen,
  moduloId,
  modulosExistentes,
  onClose,
  onGuardar,
}: UseEditarModuloModalOptions) => {
  const isImplementedModule =
    hasRegisteredOptionRoute(moduloId);

  const fetcher = useCallback(
    (signal: AbortSignal) =>
      fetchOpcionById(moduloId, signal),
    [moduloId]
  );

  const {
    data: moduloDetalle,
    isLoading,
    error,
    refetch,
  } = useApiResource<OpcionApi>(
    fetcher,
    [moduloId]
  );

  const isPowerBiModule = Boolean(
    moduloDetalle?.sUrlBI?.trim()
  );

  const powerBi = usePowerBiModuleConfiguration({
    isOpen,
    moduloId,
    enabled: isPowerBiModule,
  });

  const mapEntityToForm = useCallback(
    (modulo: OpcionApi) =>
      mapOpcionApiToEditarModuloForm(
        modulo,
        modulosExistentes
      ),
    [modulosExistentes]
  );

  const validate = useCallback(
    (form: EditarModuloFormData) =>
      validateEditarModuloForm(form, {
        modulosExistentes,
        moduloIdActual: moduloId,
        isImplemented: isImplementedModule,
      }),
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
  } = useModalForm<
    EditarModuloFormData,
    OpcionApi
  >({
    initialForm: EMPTY_EDIT_FORM,
    entity: moduloDetalle,
    mapEntityToForm,
    onClose,
    validate,
    resetOnClose: true,
    onSubmit: async (data) => {
      if (!moduloDetalle) {
        throw new Error(
          'No se encontró la información del módulo a actualizar.'
        );
      }

      if (data.esPowerBI) {
        const message =
          powerBi.validateGroupSelection();

        if (message) {
          throw new Error(message);
        }
      }

      await onGuardar(
        moduloDetalle,
        normalizeModuloForm(data),
        data.esPowerBI
          ? powerBi.selectedGroupIds
          : [],
        data.esPowerBI
          ? powerBi.getPublicationsForSave()
          : null
      );
    },
  });

  const groupsDirty =
    form.esPowerBI && powerBi.groupsDirty;
  const reportClientPublicationsDirty =
    form.esPowerBI &&
    powerBi.reportClientPublicationsDirty;

  const analyticsReportClientEmbedsBusy =
    form.esPowerBI && powerBi.isLoading;
  const analyticsReportClientEmbedsUnavailable =
    form.esPowerBI && Boolean(powerBi.error);
  const analyticsGroupsBusy =
    form.esPowerBI && powerBi.isLoading;
  const analyticsGroupsUnavailable =
    form.esPowerBI && Boolean(powerBi.error);

  const parentOptions = useMemo(
    () =>
      moduloDetalle
        ? buildEditableParentOptions(
            moduloDetalle,
            modulosExistentes
          )
        : [],
    [moduloDetalle, modulosExistentes]
  );

  const orderOptions = useMemo(
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

  const orderPreview = useMemo(
    () =>
      buildOrderPreview(
        form,
        moduloId,
        modulosExistentes
      ),
    [form, moduloId, modulosExistentes]
  );

  const isRootModule = moduloDetalle
    ? (Number(moduloDetalle.nId_OpcionPadre) || 0) ===
      0
    : false;

  const handleNombreChange = useCallback(
    (value: string) => {
      handleChange('nombre', value);

      if (!moduloDetalle) {
        return;
      }

      const nextCode =
        resolveModuloCodeAfterNameChange(
          moduloDetalle,
          value
        );

      if (nextCode !== form.codigo) {
        handleChange('codigo', nextCode);
      }
    },
    [form.codigo, handleChange, moduloDetalle]
  );

  const handleParentChange = useCallback(
    (parentId: number) => {
      handleChange('padreId', parentId);
      handleChange(
        'orden',
        resolveOrderAfterParentChange(
          parentId,
          moduloId,
          modulosExistentes
        )
      );
    },
    [handleChange, moduloId, modulosExistentes]
  );

  const {
    visibleDisabled,
    onVisibleChange,
    onEstadoChange,
  } = useModuloAvailabilityControls({
    form,
    moduloId,
    modulos: modulosExistentes,
    onChange: handleChange,
    setErrors,
  });

  return {
    moduloDetalle,
    isLoading,
    error,
    refetch,
    form,
    errors,
    isDirty,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCancel,
    powerBi,
    groupsDirty,
    reportClientPublicationsDirty,
    analyticsReportClientEmbedsBusy,
    analyticsReportClientEmbedsUnavailable,
    analyticsGroupsBusy,
    analyticsGroupsUnavailable,
    parentOptions,
    orderOptions,
    orderPreview,
    isRootModule,
    visibleDisabled,
    handleNombreChange,
    handleParentChange,
    onVisibleChange,
    onEstadoChange,
  };
};

export default useEditarModuloModal;
