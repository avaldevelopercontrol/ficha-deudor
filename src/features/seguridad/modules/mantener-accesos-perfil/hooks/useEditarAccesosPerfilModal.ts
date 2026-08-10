import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  fetchOpciones,
} from '../../../api/opcionesApi';

import {
  fetchPerfilOpcionesByPerfil,
} from '../../../api/perfilOpcionesApi';

import type {
  PerfilOpcionCount,
  PerfilOpcionDetalle,
} from '../../../types/perfilOpcion.types';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';

import {
  createAsyncMutationController,
} from '@shared/utils/asyncMutation.utils';

import {
  MODAL_EDITAR_ACCESOS_PERFIL_TEXTS,
} from '../constants/modalEditarAccesosPerfil.constants';

import type {
  AsignarAccesosPerfilFormData,
  PerfilOpcionPermissionKey,
  RegistrarPerfilOpcionesData,
} from '../types/asignarAccesosPerfil.types';

import {
  buildAccesosPerfilTree,
} from '../utils/accesosPerfilTree.utils';

import {
  ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM,
  areAccesosPerfilFormsEqual,
  createAsignarAccesosPerfilFormFromAssignments,
  getPerfilOpcionBranchAllPermissionsState,
  getPerfilOpcionBranchPermissionStates,
  normalizeAsignarAccesosPerfilForm,
  setAllPerfilOpcionBranchPermissions,
  setPerfilOpcionBranchPermission,
  setPerfilOpcionBranchSelected,
  validateEditarAccesosPerfilForm,
} from '../utils/asignarAccesosPerfil.utils';

interface EditarAccesosPerfilCatalog {
  opciones: Awaited<
    ReturnType<typeof fetchOpciones>
  >;
  asignaciones: PerfilOpcionDetalle[];
}

interface UseEditarAccesosPerfilModalParams {
  isOpen: boolean;
  perfil: PerfilOpcionCount;
  onClose: () => void;
  onGuardar: (
    asignacionesActuales:
      readonly PerfilOpcionDetalle[],
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

  return 'No se pudieron actualizar los accesos del perfil.';
};

const filterEditableAssignments = (
  assignments: readonly PerfilOpcionDetalle[],
  initialForm: AsignarAccesosPerfilFormData,
  currentForm: AsignarAccesosPerfilFormData
): PerfilOpcionDetalle[] => {
  const editableOptionIds = new Set([
    ...initialForm.selectedOptionIds,
    ...currentForm.selectedOptionIds,
  ]);

  return assignments.filter(
    (assignment) =>
      editableOptionIds.has(
        assignment.idOpcion
      )
  );
};

export const useEditarAccesosPerfilModal = ({
  isOpen,
  perfil,
  onClose,
  onGuardar,
}: UseEditarAccesosPerfilModalParams) => {
  const mutationControllerRef = useRef(
    createAsyncMutationController()
  );

  const initializedCatalogRef =
    useRef<EditarAccesosPerfilCatalog | null>(
      null
    );

  const [form, setForm] =
    useState<AsignarAccesosPerfilFormData>({
      ...ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM,
      perfilId: perfil.idPerfil,
    });

  const [initialForm, setInitialForm] =
    useState<AsignarAccesosPerfilFormData | null>(
      null
    );

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const loadCatalog = useCallback(
    async (
      signal: AbortSignal
    ): Promise<EditarAccesosPerfilCatalog> => {
      const [opciones, asignaciones] =
        await Promise.all([
          fetchOpciones(signal),
          fetchPerfilOpcionesByPerfil(
            perfil.idPerfil,
            signal
          ),
        ]);

      return {
        opciones,
        asignaciones,
      };
    },
    [perfil.idPerfil]
  );

  const {
    data: catalog,
    isLoading,
    error: resourceError,
    refetch,
  } = useApiResource<EditarAccesosPerfilCatalog>(
    loadCatalog,
    [isOpen, perfil.idPerfil],
    {
      enabled: isOpen,
      initialLoading: false,
      errorMessage:
        'No se pudieron cargar las opciones y accesos del perfil.',
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

  useEffect(() => {
    if (
      !isOpen ||
      !catalog ||
      treeState.error ||
      initializedCatalogRef.current ===
        catalog
    ) {
      return;
    }

    initializedCatalogRef.current =
      catalog;

    const nextForm =
      createAsignarAccesosPerfilFormFromAssignments(
        perfil.idPerfil,
        catalog.asignaciones,
        treeState.items
      );

    setForm(nextForm);
    setInitialForm(nextForm);
    setErrors({});
    setSubmitError(null);
  }, [
    catalog,
    isOpen,
    perfil.idPerfil,
    treeState.error,
    treeState.items,
  ]);

  const profileOptions = useMemo(
    () => [
      {
        id: perfil.idPerfil,
        label: perfil.nombrePerfil,
      },
    ],
    [
      perfil.idPerfil,
      perfil.nombrePerfil,
    ]
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
    [form, treeState.items]
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

  const isDirty = useMemo(
    () =>
      initialForm !== null &&
      !areAccesosPerfilFormsEqual(
        form,
        initialForm,
        treeState.items
      ),
    [
      form,
      initialForm,
      treeState.items,
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
    [clearFormErrors, treeState.items]
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

    initializedCatalogRef.current = null;

    setForm({
      ...ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM,
      perfilId: perfil.idPerfil,
    });
    setInitialForm(null);
    setErrors({});
    setSubmitError(null);
    onClose();
  }, [onClose, perfil.idPerfil]);

  const handleSubmit = useCallback(async () => {
    if (
      mutationControllerRef.current.isPending() ||
      !catalog ||
      !initialForm ||
      !isDirty
    ) {
      return;
    }

    const validationErrors =
      validateEditarAccesosPerfilForm(
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
          await onGuardar(
            filterEditableAssignments(
              catalog.asignaciones,
              initialForm,
              form
            ),
            normalizeAsignarAccesosPerfilForm(
              form,
              treeState.items
            )
          );
        }
      );

    setIsSubmitting(false);

    if (result.status === 'success') {
      setErrors({});
      onClose();
      return;
    }

    if (result.status === 'error') {
      setSubmitError(
        resolveSubmitError(result.error)
      );
    }
  }, [
    catalog,
    form,
    initialForm,
    isDirty,
    onClose,
    onGuardar,
    treeState.items,
  ]);

  const emptyCatalogMessage =
    !isLoading &&
    !resourceError &&
    !treeState.error &&
    catalog &&
    treeState.items.length === 0
      ? MODAL_EDITAR_ACCESOS_PERFIL_TEXTS
          .emptyOptions
      : null;

  const catalogError =
    resourceError ??
    treeState.error ??
    emptyCatalogMessage;

  const isReady = Boolean(
    catalog &&
      initialForm &&
      !isLoading &&
      !catalogError
  );

  return {
    form,
    errors,
    submitError,
    isSubmitting,
    isDirty,

    isLoading,
    catalogError,
    isReady,
    refetch,

    profileOptions,
    treeItems: treeState.items,
    activeOption,
    activePermissionStates,
    activeSelectAllState,

    handleActivateOption,
    handleToggleOption,
    handlePermissionChange,
    handleSelectAllPermissions,
    handleSubmit,
    handleClose: resetAndClose,
  };
};
