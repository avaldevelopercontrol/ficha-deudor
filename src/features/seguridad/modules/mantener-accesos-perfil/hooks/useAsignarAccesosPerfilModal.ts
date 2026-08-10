import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  fetchOpciones,
} from '../../../api/opcionesApi';

import {
  fetchPerfilesAcceso,
} from '../../../api/perfilOpcionesApi';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';

import {
  createAsyncMutationController,
} from '@shared/utils/asyncMutation.utils';

import {
  MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS,
} from '../constants/modalAsignarAccesosPerfil.constants';

import type {
  AsignarAccesosPerfilCatalog,
  AsignarAccesosPerfilFormData,
  PerfilOpcionPermissionKey,
  RegistrarPerfilOpcionesData,
} from '../types/asignarAccesosPerfil.types';

import {
  buildAccesosPerfilTree,
} from '../utils/accesosPerfilTree.utils';

import {
  ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM,
  filterUnassignedPerfilOptions,
  getPerfilOpcionBranchAllPermissionsState,
  getPerfilOpcionBranchPermissionStates,
  normalizeAsignarAccesosPerfilForm,
  setAllPerfilOpcionBranchPermissions,
  setPerfilOpcionBranchPermission,
  setPerfilOpcionBranchSelected,
  validateAsignarAccesosPerfilForm,
} from '../utils/asignarAccesosPerfil.utils';

interface UseAsignarAccesosPerfilModalParams {
  isOpen: boolean;
  assignedPerfilIds: readonly number[];
  onClose: () => void;
  onRegistrar: (
    data: RegistrarPerfilOpcionesData
  ) => Promise<void> | void;
}

const resolveSubmitError = (
  error: unknown
): string => {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return 'No se pudieron registrar los accesos del perfil.';
};

const loadCatalog = async (
  signal: AbortSignal
): Promise<AsignarAccesosPerfilCatalog> => {
  const [perfiles, opciones] =
    await Promise.all([
      fetchPerfilesAcceso(signal),
      fetchOpciones(signal),
    ]);

  return {
    perfiles,
    opciones,
  };
};

export const useAsignarAccesosPerfilModal = ({
  isOpen,
  assignedPerfilIds,
  onClose,
  onRegistrar,
}: UseAsignarAccesosPerfilModalParams) => {
  const mutationControllerRef = useRef(
    createAsyncMutationController()
  );

  const [form, setForm] =
    useState<AsignarAccesosPerfilFormData>(
      ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM
    );

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const {
    data: catalog,
    isLoading,
    error: resourceError,
    refetch,
  } = useApiResource<AsignarAccesosPerfilCatalog>(
    loadCatalog,
    [isOpen],
    {
      enabled: isOpen,
      initialLoading: false,
      errorMessage:
        'No se pudieron cargar los perfiles y opciones.',
    }
  );

  const treeState = useMemo(() => {
    if (!catalog) {
      return {
        items: [],
        error: null,
      };
    }

    try {
      return {
        items: buildAccesosPerfilTree(
          catalog.opciones
        ),
        error: null,
      };
    } catch (error) {
      return {
        items: [],
        error:
          error instanceof Error
            ? error.message
            : 'La jerarquía de opciones no es válida.',
      };
    }
  }, [catalog]);

  const assignedPerfilIdSet = useMemo(
    () => new Set(assignedPerfilIds),
    [assignedPerfilIds]
  );

  const availablePerfiles = useMemo(
    () =>
      filterUnassignedPerfilOptions(
        catalog?.perfiles ?? [],
        assignedPerfilIds
      ),
    [
      assignedPerfilIds,
      catalog?.perfiles,
    ]
  );

  const profileOptions = useMemo(
    () =>
      availablePerfiles.map(
        (perfil) => ({
          id: perfil.idPerfil,
          label: perfil.nombrePerfil,
        })
      ),
    [availablePerfiles]
  );

  const activeOption = useMemo(
    () =>
      treeState.items.find(
        (item) =>
          item.idModulo ===
          form.activeOptionId
      ) ?? null,
    [
      form.activeOptionId,
      treeState.items,
    ]
  );

  const activePermissionStates = useMemo(
    () =>
      form.activeOptionId === null
        ? {
            consultar: 'unchecked' as const,
            insertar: 'unchecked' as const,
            editar: 'unchecked' as const,
            eliminar: 'unchecked' as const,
            exportar: 'unchecked' as const,
          }
        : getPerfilOpcionBranchPermissionStates(
            form,
            treeState.items,
            form.activeOptionId
          ),
    [
      form,
      treeState.items,
    ]
  );

  const activeSelectAllState = useMemo(
    () =>
      activeOption?.isPermissionTarget
        ? getPerfilOpcionBranchAllPermissionsState(
            activePermissionStates
          )
        : 'unchecked',
    [
      activeOption?.isPermissionTarget,
      activePermissionStates,
    ]
  );

  const clearFormErrors = useCallback(
    (...fieldNames: string[]) => {
      setErrors((previousErrors) => {
        const nextErrors = {
          ...previousErrors,
        };

        fieldNames.forEach(
          (fieldName) => {
            delete nextErrors[
              fieldName
            ];
          }
        );

        return nextErrors;
      });

      setSubmitError(null);
    },
    []
  );

  const handlePerfilChange = useCallback(
    (perfilId: number | '') => {
      setForm((previousForm) => ({
        ...previousForm,
        perfilId,
      }));

      clearFormErrors('perfilId');
    },
    [clearFormErrors]
  );

  const handleActivateOption = useCallback(
    (optionId: number) => {
      setForm((previousForm) => ({
        ...previousForm,
        activeOptionId: optionId,
      }));
    },
    []
  );

  const handleToggleOption = useCallback(
    (
      optionId: number,
      selected: boolean
    ) => {
      setForm((previousForm) =>
        setPerfilOpcionBranchSelected(
          previousForm,
          treeState.items,
          optionId,
          selected
        )
      );

      clearFormErrors(
        'selectedOptionIds',
        'permissionsByOptionId'
      );
    },
    [
      clearFormErrors,
      treeState.items,
    ]
  );

  const handlePermissionChange = useCallback(
    (
      permission: PerfilOpcionPermissionKey,
      checked: boolean
    ) => {
      if (form.activeOptionId === null) {
        return;
      }

      setForm((previousForm) =>
        setPerfilOpcionBranchPermission(
          previousForm,
          treeState.items,
          form.activeOptionId as number,
          permission,
          checked
        )
      );

      clearFormErrors(
        'selectedOptionIds',
        'permissionsByOptionId'
      );
    },
    [
      clearFormErrors,
      form.activeOptionId,
      treeState.items,
    ]
  );

  const handleSelectAllPermissions =
    useCallback(
      (checked: boolean) => {
        if (
          form.activeOptionId === null
        ) {
          return;
        }

        setForm((previousForm) =>
          setAllPerfilOpcionBranchPermissions(
            previousForm,
            treeState.items,
            form.activeOptionId as number,
            checked
          )
        );

        clearFormErrors(
          'selectedOptionIds',
          'permissionsByOptionId'
        );
      },
      [
        clearFormErrors,
        form.activeOptionId,
        treeState.items,
      ]
    );

  const resetAndClose = useCallback(() => {
    if (
      mutationControllerRef.current.isPending()
    ) {
      return;
    }

    setForm(
      ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM
    );
    setErrors({});
    setSubmitError(null);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (
      mutationControllerRef.current.isPending()
    ) {
      return;
    }

    if (
      typeof form.perfilId === 'number' &&
      assignedPerfilIdSet.has(
        form.perfilId
      )
    ) {
      setErrors({
        perfilId:
          MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
            .alreadyAssignedProfile,
      });
      setSubmitError(null);
      return;
    }

    const validationErrors =
      validateAsignarAccesosPerfilForm(
        form,
        treeState.items
      );

    if (
      Object.keys(validationErrors).length > 0
    ) {
      setErrors(validationErrors);
      setSubmitError(null);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const result =
      await mutationControllerRef.current.execute(
        async () => {
          await onRegistrar(
            normalizeAsignarAccesosPerfilForm(
              form,
              treeState.items
            )
          );
        }
      );

    setIsSubmitting(false);

    if (result.status === 'success') {
      setForm(
        ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM
      );
      setErrors({});
      onClose();
      return;
    }

    if (result.status === 'error') {
      setSubmitError(
        resolveSubmitError(
          result.error
        )
      );
    }
  }, [
    assignedPerfilIdSet,
    form,
    onClose,
    onRegistrar,
    treeState.items,
  ]);

  const emptyCatalogMessage =
    !isLoading &&
    !resourceError &&
    !treeState.error &&
    catalog
      ? catalog.perfiles.length === 0
        ? MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
            .emptyProfiles
        : availablePerfiles.length === 0
          ? MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
              .allProfilesAssigned
          : treeState.items.length === 0
            ? MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
                .emptyOptions
            : null
      : null;

  const catalogError =
    resourceError ??
    treeState.error ??
    emptyCatalogMessage;

  const isReady = Boolean(
    catalog &&
      !isLoading &&
      !catalogError
  );

  return {
    form,
    errors,
    submitError,
    isSubmitting,

    isLoading,
    catalogError,
    isReady,
    refetch,

    profileOptions,
    treeItems: treeState.items,
    activeOption,
    activePermissionStates,
    activeSelectAllState,

    handlePerfilChange,
    handleActivateOption,
    handleToggleOption,
    handlePermissionChange,
    handleSelectAllPermissions,
    handleSubmit,
    handleClose: resetAndClose,
  };
};
