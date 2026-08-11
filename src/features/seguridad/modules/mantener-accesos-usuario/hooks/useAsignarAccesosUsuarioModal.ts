import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  UsuarioGrupoOpcionListado,
} from '../../../types/usuarioGrupoOpcion.types';

import {
  createAsyncMutationController,
} from '@shared/utils/asyncMutation.utils';

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

import type {
  PerfilOpcionPermissionKey,
} from '../../mantener-accesos-perfil/types/asignarAccesosPerfil.types';

import {
  MODAL_ASIGNAR_ACCESOS_USUARIO_TEXTS,
} from '../constants/modalAsignarAccesosUsuario.constants';
import {
  MANTENER_ACCESOS_USUARIO_RULE_MESSAGES,
} from '../constants/mantenerAccesosUsuario.constants';

import type {
  AsignarAccesosUsuarioCatalogResource,
} from './useAsignarAccesosUsuarioCatalog';

import type {
  AsignarAccesosUsuarioFormData,
  RegistrarUsuarioGrupoOpcionesData,
} from '../types/asignarAccesosUsuario.types';

import {
  ASIGNAR_ACCESOS_USUARIO_INITIAL_FORM,
  normalizeAsignarAccesosUsuarioForm,
  validateAsignarAccesosUsuarioForm,
} from '../utils/asignarAccesosUsuario.utils';
import {
  filterAvailableUsuarioOptionsForGrupo,
  hasUsuarioGrupoAccess,
} from '../utils/accesosUsuarioAvailability.utils';
import {
  buildUsuarioSearchOptions,
} from '../utils/usuarioSearch.utils';

interface UseAsignarAccesosUsuarioModalParams {
  catalogResource: AsignarAccesosUsuarioCatalogResource;
  existingAccesses: readonly UsuarioGrupoOpcionListado[];
  onClose: () => void;
  onRegistrar: (
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

  return 'No se pudieron registrar los accesos del usuario.';
};

export const useAsignarAccesosUsuarioModal = ({
  catalogResource,
  existingAccesses,
  onClose,
  onRegistrar,
}: UseAsignarAccesosUsuarioModalParams) => {
  const mutationControllerRef = useRef(
    createAsyncMutationController()
  );

  const [form, setForm] =
    useState<AsignarAccesosUsuarioFormData>(
      ASIGNAR_ACCESOS_USUARIO_INITIAL_FORM
    );
  const [errors, setErrors] = useState<
    Record<string, string>
  >({});
  const [submitError, setSubmitError] =
    useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const {
    catalog,
    isLoading,
    error: resourceError,
    refetch,
  } = catalogResource;

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

  const allUserOptions = useMemo(
    () =>
      buildUsuarioSearchOptions(
        catalog?.usuarios ?? []
      ),
    [catalog?.usuarios]
  );

  const userOptions = useMemo(
    () =>
      filterAvailableUsuarioOptionsForGrupo(
        allUserOptions,
        existingAccesses,
        form.grupoId
      ),
    [
      allUserOptions,
      existingAccesses,
      form.grupoId,
    ]
  );

  const groupOptions = useMemo(
    () =>
      (catalog?.grupos ?? [])
        .map((grupo) => ({
          id: Number(grupo.id),
          label: grupo.label,
        }))
        .filter(
          (grupo) =>
            Number.isSafeInteger(
              grupo.id
            ) && grupo.id > 0
        ),
    [catalog?.grupos]
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

  const handleUsuarioChange = useCallback(
    (usuarioId: number | '') => {
      setForm((previousForm) => ({
        ...previousForm,
        usuarioId,
      }));
      clearFormErrors('usuarioId');
    },
    [clearFormErrors]
  );

  const handleGrupoChange = useCallback(
    (grupoId: number | '') => {
      setForm((previousForm) => ({
        ...previousForm,
        grupoId,
        usuarioId:
          previousForm.grupoId === grupoId
            ? previousForm.usuarioId
            : '',
      }));
      clearFormErrors(
        'grupoId',
        'usuarioId'
      );
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
      ASIGNAR_ACCESOS_USUARIO_INITIAL_FORM
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

    const validationErrors =
      validateAsignarAccesosUsuarioForm(
        form,
        treeState.items
      );

    if (
      hasUsuarioGrupoAccess(
        existingAccesses,
        form.usuarioId,
        form.grupoId
      )
    ) {
      validationErrors.usuarioId =
        MANTENER_ACCESOS_USUARIO_RULE_MESSAGES
          .alreadyAssignedUserGroup;
    }

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
          await onRegistrar(
            normalizeAsignarAccesosUsuarioForm(
              form,
              treeState.items
            )
          );
        }
      );

    setIsSubmitting(false);

    if (result.status === 'success') {
      setForm(
        ASIGNAR_ACCESOS_USUARIO_INITIAL_FORM
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
    existingAccesses,
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
      ? allUserOptions.length === 0
        ? MODAL_ASIGNAR_ACCESOS_USUARIO_TEXTS
            .emptyUsers
        : groupOptions.length === 0
          ? MODAL_ASIGNAR_ACCESOS_USUARIO_TEXTS
              .emptyGroups
          : treeState.items.length === 0
            ? MODAL_ASIGNAR_ACCESOS_USUARIO_TEXTS
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

  const hasSelectedGroup =
    typeof form.grupoId === 'number' &&
    form.grupoId > 0;
  const hasAvailableUsersForSelectedGroup =
    hasSelectedGroup &&
    userOptions.length > 0;

  return {
    form,
    errors,
    submitError,
    isSubmitting,
    isLoading,
    catalogError,
    isReady,
    refetch,
    userOptions,
    groupOptions,
    hasSelectedGroup,
    hasAvailableUsersForSelectedGroup,
    treeItems: treeState.items,
    activeOption,
    activePermissionStates,
    activeSelectAllState,
    handleUsuarioChange,
    handleGrupoChange,
    handleActivateOption,
    handleToggleOption,
    handlePermissionChange,
    handleSelectAllPermissions,
    handleSubmit,
    handleClose: resetAndClose,
  };
};
