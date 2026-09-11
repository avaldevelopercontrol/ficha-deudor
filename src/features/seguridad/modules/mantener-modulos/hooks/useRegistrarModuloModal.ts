import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  fetchGruposListado,
} from '@features/seguridad/api/gruposApi';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';
import {
  useModalForm,
} from '@shared/hooks/ui/useModalForm';
import type {
  SelectOption,
} from '@shared/types';

import type {
  Modulo,
} from '../../../types/opcion.types';
import type {
  RegistrarModuloFormData,
} from '../types/registrarModulo.types';
import {
  POWER_BI_DEFAULT_ICON,
  POWER_BI_PARENT_OPTION_ID,
} from '../../../domain/modulos/powerBiModulo.utils';
import {
  buildRegistrarModuloInitialForm,
  suggestModuloCode,
} from '../../../domain/modulos/moduloForm.utils';
import {
  normalizeRegistrarModuloForm,
  validateRegistrarModuloForm,
} from '../validations/registrarModulo.validation';

import {
  useModuloAvailabilityControls,
} from './useModuloAvailabilityControls';

interface UseRegistrarModuloModalOptions {
  isOpen: boolean;
  modulosExistentes: readonly Modulo[];
  onClose: () => void;
  onRegistrar: (
    data: RegistrarModuloFormData,
    groupIds: readonly number[]
  ) => Promise<void> | void;
}

export const useRegistrarModuloModal = ({
  isOpen,
  modulosExistentes,
  onClose,
  onRegistrar,
}: UseRegistrarModuloModalOptions) => {
  const [selectedGroupIds, setSelectedGroupIds] =
    useState<number[]>([]);
  const [
    groupSelectionError,
    setGroupSelectionError,
  ] = useState<string | null>(null);

  const hasValidGroupSelection =
    selectedGroupIds.length === 1 &&
    Number.isSafeInteger(selectedGroupIds[0]) &&
    selectedGroupIds[0] > 0;

  const codeWasEditedRef = useRef(false);
  const previousParentIdRef =
    useRef<number | null>(null);
  const previousIconRef = useRef('');

  useEffect(() => {
    if (!isOpen) {
      codeWasEditedRef.current = false;
      previousParentIdRef.current = null;
      previousIconRef.current = '';
    }
  }, [isOpen]);

  const initialForm = useMemo(
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

  const parentOptions = useMemo<
    SelectOption<number>[]
  >(
    () =>
      modulosExistentes.map((modulo) => ({
        id: modulo.idModulo,
        label:
          modulo.nombre ||
          modulo.codigo ||
          `Id ${modulo.idModulo}`,
      })),
    [modulosExistentes]
  );

  const validate = useCallback(
    (form: RegistrarModuloFormData) =>
      validateRegistrarModuloForm(form, {
        modulosExistentes,
      }),
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
  } = useModalForm<RegistrarModuloFormData>({
    initialForm,
    onClose,
    validate,
    resetOnClose: true,
    onSubmit: async (data) => {
      if (
        data.esPowerBI &&
        !hasValidGroupSelection
      ) {
        const message =
          'Seleccione un grupo para el tablero Power BI.';

        setGroupSelectionError(message);
        throw new Error(message);
      }

      setGroupSelectionError(null);

      await onRegistrar(
        normalizeRegistrarModuloForm(data),
        data.esPowerBI ? selectedGroupIds : []
      );
    },
  });

  const {
    data: activeGroups,
    isLoading: isLoadingActiveGroups,
    error: activeGroupsError,
  } = useApiResource(
    fetchGruposListado,
    [],
    {
      enabled: isOpen && form.esPowerBI,
      initialLoading: false,
    }
  );

  const powerBiGroups = useMemo(
    () =>
      (activeGroups ?? []).filter(
        (group) =>
          group.estado === 'Activo' &&
          group.idCliente > 0
      ),
    [activeGroups]
  );

  const handleNombreChange = useCallback(
    (value: string) => {
      handleChange('nombre', value);

      if (!codeWasEditedRef.current) {
        handleChange(
          'codigo',
          suggestModuloCode(value)
        );
      }
    },
    [handleChange]
  );

  const handleCodigoChange = useCallback(
    (value: string) => {
      codeWasEditedRef.current = true;
      handleChange('codigo', value);
    },
    [handleChange]
  );

  const handlePowerBIChange = useCallback(
    (enabled: boolean) => {
      setGroupSelectionError(null);

      if (enabled) {
        previousParentIdRef.current =
          form.padreId !== POWER_BI_PARENT_OPTION_ID
            ? form.padreId
            : previousParentIdRef.current;

        handleChange('esPowerBI', true);
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

      handleChange('esPowerBI', false);
      handleChange('urlBI', '');
      handleChange('imagenOpcion', '');
      handleChange('emailOpcion', '');
      handleChange(
        'icono',
        previousIconRef.current
      );
      setSelectedGroupIds([]);

      const previousParentId =
        previousParentIdRef.current;

      if (
        previousParentId !== null &&
        modulosExistentes.some(
          (modulo) =>
            modulo.idModulo === previousParentId
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

  const handleGroupSelectionChange =
    useCallback((groupIds: number[]) => {
      setSelectedGroupIds(groupIds);
      setGroupSelectionError(null);
    }, []);

  const {
    visibleDisabled,
    onVisibleChange,
    onEstadoChange,
  } = useModuloAvailabilityControls({
    form,
    modulos: modulosExistentes,
    onChange: handleChange,
    setErrors,
  });

  return {
    form,
    errors,
    isSubmitting,
    submitError,
    handleChange,
    handleSubmit,
    handleCancel,
    parentOptions,
    powerBiParentAvailable,
    selectedGroupIds,
    hasValidGroupSelection,
    groupSelectionError,
    powerBiGroups,
    isLoadingActiveGroups,
    activeGroupsError,
    visibleDisabled,
    handleNombreChange,
    handleCodigoChange,
    handlePowerBIChange,
    handleGroupSelectionChange,
    onVisibleChange,
    onEstadoChange,
  };
};

export default useRegistrarModuloModal;
