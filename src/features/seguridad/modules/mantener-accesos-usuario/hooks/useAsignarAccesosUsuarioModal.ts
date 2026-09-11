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
  useAccessAssignmentEditor,
} from '../../../hooks/useAccessAssignmentEditor';

import {
  resolveOperationErrorMessage,
} from '../../../utils/operationError.utils';

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
  buildActiveUsuarioSearchOptions,
} from '../utils/usuarioSearch.utils';

interface UseAsignarAccesosUsuarioModalParams {
  catalogResource: AsignarAccesosUsuarioCatalogResource;
  existingAccesses: readonly UsuarioGrupoOpcionListado[];
  onClose: () => void;
  onRegistrar: (
    data: RegistrarUsuarioGrupoOpcionesData
  ) => Promise<void> | void;
}

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

  const {
    treeItems,
    treeError,
    activeOption,
    activePermissionStates,
    activeSelectAllState,
    clearFormErrors,
    handleActivateOption,
    handleToggleOption,
    handlePermissionChange,
    handleSelectAllPermissions,
  } = useAccessAssignmentEditor({
    form,
    setForm,
    opciones: catalog?.opciones,
    setErrors,
    setSubmitError,
  });

  const activeUserOptions = useMemo(
    () =>
      buildActiveUsuarioSearchOptions(
        catalog?.usuarios ?? []
      ),
    [catalog?.usuarios]
  );

  const userOptions = useMemo(
    () =>
      filterAvailableUsuarioOptionsForGrupo(
        activeUserOptions,
        existingAccesses,
        form.grupoId
      ),
    [
      activeUserOptions,
      existingAccesses,
      form.grupoId,
    ]
  );

  const availableUserIdSet = useMemo(
    () =>
      new Set(
        userOptions.map(
          (usuario) => usuario.id
        )
      ),
    [userOptions]
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
        treeItems
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
      typeof form.usuarioId === 'number' &&
      !hasUsuarioGrupoAccess(
        existingAccesses,
        form.usuarioId,
        form.grupoId
      ) &&
      !availableUserIdSet.has(
        form.usuarioId
      )
    ) {
      validationErrors.usuarioId =
        MANTENER_ACCESOS_USUARIO_RULE_MESSAGES
          .inactiveOrUnavailableUser;
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
              treeItems
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
        resolveOperationErrorMessage(
          result.error,
          'No se pudieron registrar los accesos del usuario.'
        )
      );
    }
  }, [
    availableUserIdSet,
    existingAccesses,
    form,
    onClose,
    onRegistrar,
    treeItems,
  ]);

  const emptyCatalogMessage =
    !isLoading &&
    !resourceError &&
    !treeError &&
    catalog
      ? activeUserOptions.length === 0
        ? MODAL_ASIGNAR_ACCESOS_USUARIO_TEXTS
            .emptyUsers
        : groupOptions.length === 0
          ? MODAL_ASIGNAR_ACCESOS_USUARIO_TEXTS
              .emptyGroups
          : treeItems.length === 0
            ? MODAL_ASIGNAR_ACCESOS_USUARIO_TEXTS
                .emptyOptions
            : null
      : null;

  const catalogError =
    resourceError ??
    treeError ??
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
    treeItems,
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
