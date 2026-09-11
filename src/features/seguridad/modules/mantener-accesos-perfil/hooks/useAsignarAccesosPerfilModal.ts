import {
  useCallback,
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
  useAccessAssignmentEditor,
} from '../../../hooks/useAccessAssignmentEditor';

import {
  resolveOperationErrorMessage,
} from '../../../utils/operationError.utils';

import {
  loadAsignarAccesosPerfilCatalog,
} from '../../../application/accesos/accessCatalog.application';

import {
  MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS,
} from '../constants/modalAsignarAccesosPerfil.constants';

import type {
  AsignarAccesosPerfilCatalog,
  AsignarAccesosPerfilFormData,
  RegistrarPerfilOpcionesData,
} from '../../../domain/accesos/perfilAccess.types';

import {
  ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM,
  filterAssignablePerfilOptions,
  normalizeAsignarAccesosPerfilForm,
  validateAsignarAccesosPerfilForm,
} from '../../../domain/accesos/perfilAccessAssignment.utils';

interface UseAsignarAccesosPerfilModalParams {
  isOpen: boolean;
  assignedPerfilIds: readonly number[];
  onClose: () => void;
  onRegistrar: (
    data: RegistrarPerfilOpcionesData
  ) => Promise<void> | void;
}

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
    loadAsignarAccesosPerfilCatalog,
    [isOpen],
    {
      enabled: isOpen,
      initialLoading: false,
      errorMessage:
        'No se pudieron cargar los perfiles y opciones.',
    }
  );

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

  const assignedPerfilIdSet = useMemo(
    () => new Set(assignedPerfilIds),
    [assignedPerfilIds]
  );

  const availablePerfiles = useMemo(
    () =>
      filterAssignablePerfilOptions(
        catalog?.perfiles ?? [],
        assignedPerfilIds
      ),
    [
      assignedPerfilIds,
      catalog?.perfiles,
    ]
  );

  const availablePerfilIdSet = useMemo(
    () =>
      new Set(
        availablePerfiles.map(
          (perfil) => perfil.idPerfil
        )
      ),
    [availablePerfiles]
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

    if (
      typeof form.perfilId === 'number' &&
      !availablePerfilIdSet.has(
        form.perfilId
      )
    ) {
      setErrors({
        perfilId:
          MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
            .inactiveOrUnavailableProfile,
      });
      setSubmitError(null);
      return;
    }

    const validationErrors =
      validateAsignarAccesosPerfilForm(
        form,
        treeItems
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
              treeItems
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
        resolveOperationErrorMessage(
          result.error,
          'No se pudieron registrar los accesos del perfil.'
        )
      );
    }
  }, [
    assignedPerfilIdSet,
    availablePerfilIdSet,
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
      ? !catalog.perfiles.some(
          (perfil) => perfil.estadoActivo
        )
        ? MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
            .emptyProfiles
        : availablePerfiles.length === 0
          ? MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
              .allProfilesAssigned
          : treeItems.length === 0
            ? MODAL_ASIGNAR_ACCESOS_PERFIL_TEXTS
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
    treeItems: treeItems,
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
