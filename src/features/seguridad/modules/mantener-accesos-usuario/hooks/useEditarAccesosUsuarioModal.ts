import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';
import {
  createAsyncMutationController,
} from '@shared/utils/asyncMutation.utils';

import {
  fetchOpciones,
} from '../../../api/opcionesApi';
import {
  fetchUsuarioGrupoOpcionById,
  fetchUsuarioGrupoOpcionesByUsuarioGrupo,
} from '../../../api/usuarioGrupoOpcionesApi';

import type {
  UsuarioGrupoOpcionDetalle,
  UsuarioGrupoOpcionListado,
} from '../../../types/usuarioGrupoOpcion.types';

import type {
  PerfilOpcionPermissionKey,
} from '../../mantener-accesos-perfil/types/asignarAccesosPerfil.types';

import {
  buildAccesosPerfilTree,
} from '../../mantener-accesos-perfil/utils/accesosPerfilTree.utils';

import {
  getPerfilOpcionBranchAllPermissionsState,
  getPerfilOpcionBranchPermissionStates,
  setAllPerfilOpcionBranchPermissions,
  setPerfilOpcionBranchPermission,
  setPerfilOpcionBranchSelected,
} from '../../mantener-accesos-perfil/utils/asignarAccesosPerfil.utils';

import {
  MODAL_EDITAR_ACCESOS_USUARIO_TEXTS,
} from '../constants/modalEditarAccesosUsuario.constants';

import type {
  AsignarAccesosUsuarioFormData,
  RegistrarUsuarioGrupoOpcionesData,
} from '../types/asignarAccesosUsuario.types';

import {
  ASIGNAR_ACCESOS_USUARIO_INITIAL_FORM,
  areAccesosUsuarioFormsEqual,
  createAsignarAccesosUsuarioFormFromAssignments,
  normalizeAsignarAccesosUsuarioForm,
  validateEditarAccesosUsuarioForm,
} from '../utils/asignarAccesosUsuario.utils';

interface EditarAccesosUsuarioCatalog {
  opciones: Awaited<
    ReturnType<typeof fetchOpciones>
  >;
  asignaciones: UsuarioGrupoOpcionDetalle[];
}

interface UseEditarAccesosUsuarioModalParams {
  isOpen: boolean;
  acceso: UsuarioGrupoOpcionListado;
  onClose: () => void;
  onGuardar: (
    asignacionesActuales:
      readonly UsuarioGrupoOpcionDetalle[],
    data: RegistrarUsuarioGrupoOpcionesData
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

  return 'No se pudieron actualizar los accesos del usuario.';
};

export const useEditarAccesosUsuarioModal = ({
  isOpen,
  acceso,
  onClose,
  onGuardar,
}: UseEditarAccesosUsuarioModalParams) => {
  const mutationControllerRef = useRef(
    createAsyncMutationController()
  );
  const initializedCatalogRef =
    useRef<EditarAccesosUsuarioCatalog | null>(
      null
    );

  const [form, setForm] =
    useState<AsignarAccesosUsuarioFormData>({
      ...ASIGNAR_ACCESOS_USUARIO_INITIAL_FORM,
      usuarioId: acceso.idUsuario,
      grupoId: acceso.idGrupo,
    });
  const [initialForm, setInitialForm] =
    useState<AsignarAccesosUsuarioFormData | null>(
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
    ): Promise<EditarAccesosUsuarioCatalog> => {
      const [
        opciones,
        detalleSeleccionado,
        asignaciones,
      ] = await Promise.all([
        fetchOpciones(signal),
        fetchUsuarioGrupoOpcionById(
          acceso.idUsuarioGrupoOpcion,
          signal
        ),
        fetchUsuarioGrupoOpcionesByUsuarioGrupo(
          acceso.idUsuario,
          acceso.idGrupo,
          signal
        ),
      ]);

      if (
        detalleSeleccionado.idUsuario !==
          acceso.idUsuario ||
        detalleSeleccionado.idGrupo !==
          acceso.idGrupo
      ) {
        throw new Error(
          'El acceso seleccionado ya no pertenece al usuario y grupo mostrados en la tabla.'
        );
      }

      return {
        opciones,
        asignaciones,
      };
    },
    [
      acceso.idGrupo,
      acceso.idUsuario,
      acceso.idUsuarioGrupoOpcion,
    ]
  );

  const {
    data: catalog,
    isLoading,
    error: resourceError,
    refetch,
  } = useApiResource<EditarAccesosUsuarioCatalog>(
    loadCatalog,
    [
      isOpen,
      acceso.idUsuarioGrupoOpcion,
      acceso.idUsuario,
      acceso.idGrupo,
    ],
    {
      enabled: isOpen,
      initialLoading: false,
      errorMessage:
        'No se pudieron cargar las opciones y accesos del usuario.',
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

    initializedCatalogRef.current = catalog;

    const nextForm =
      createAsignarAccesosUsuarioFormFromAssignments(
        acceso.idUsuario,
        acceso.idGrupo,
        catalog.asignaciones,
        treeState.items
      );

    setForm(nextForm);
    setInitialForm(nextForm);
    setErrors({});
    setSubmitError(null);
  }, [
    acceso.idGrupo,
    acceso.idUsuario,
    catalog,
    isOpen,
    treeState.error,
    treeState.items,
  ]);

  const userOptions = useMemo(
    () => [
      {
        id: acceso.idUsuario,
        label:
          acceso.nombreCompleto &&
          acceso.usuario
            ? `${acceso.nombreCompleto} (${acceso.usuario})`
            : acceso.nombreCompleto ||
              acceso.usuario,
      },
    ],
    [
      acceso.idUsuario,
      acceso.nombreCompleto,
      acceso.usuario,
    ]
  );

  const groupOptions = useMemo(
    () => [
      {
        id: acceso.idGrupo,
        label: acceso.grupo,
      },
    ],
    [acceso.grupo, acceso.idGrupo]
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
            consultar:
              'unchecked' as const,
            insertar:
              'unchecked' as const,
            editar:
              'unchecked' as const,
            eliminar:
              'unchecked' as const,
            exportar:
              'unchecked' as const,
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
            activePermissionStates,
            activeOption
          )
        : 'unchecked',
    [
      activeOption,
      activePermissionStates,
    ]
  );

  const isDirty = useMemo(
    () =>
      initialForm !== null &&
      !areAccesosUsuarioFormsEqual(
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

    initializedCatalogRef.current = null;
    setForm({
      ...ASIGNAR_ACCESOS_USUARIO_INITIAL_FORM,
      usuarioId: acceso.idUsuario,
      grupoId: acceso.idGrupo,
    });
    setInitialForm(null);
    setErrors({});
    setSubmitError(null);
    onClose();
  }, [
    acceso.idGrupo,
    acceso.idUsuario,
    onClose,
  ]);

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
      validateEditarAccesosUsuarioForm(
        form,
        treeState.items
      );

    if (
      Object.keys(validationErrors).length >
      0
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
            catalog.asignaciones,
            normalizeAsignarAccesosUsuarioForm(
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
        resolveSubmitError(
          result.error
        )
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
      ? MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
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
    userOptions,
    groupOptions,
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
