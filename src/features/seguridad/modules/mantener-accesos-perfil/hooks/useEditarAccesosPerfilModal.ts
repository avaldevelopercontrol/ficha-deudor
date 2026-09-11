import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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
  useAccessAssignmentEditor,
} from '../../../hooks/useAccessAssignmentEditor';

import {
  resolveOperationErrorMessage,
} from '../../../utils/operationError.utils';

import {
  loadEditarAccesosPerfilCatalog,
  type EditarAccesosPerfilCatalog,
} from '../../../application/accesos/accessCatalog.application';

import {
  MODAL_EDITAR_ACCESOS_PERFIL_TEXTS,
} from '../constants/modalEditarAccesosPerfil.constants';

import type {
  AsignarAccesosPerfilFormData,
  RegistrarPerfilOpcionesData,
} from '../../../domain/accesos/perfilAccess.types';

import {
  ASIGNAR_ACCESOS_PERFIL_INITIAL_FORM,
  areAccesosPerfilFormsEqual,
  createAsignarAccesosPerfilFormFromAssignments,
  normalizeAsignarAccesosPerfilForm,
  validateEditarAccesosPerfilForm,
} from '../../../domain/accesos/perfilAccessAssignment.utils';

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
    (signal: AbortSignal) =>
      loadEditarAccesosPerfilCatalog(
        perfil.idPerfil,
        signal
      ),
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

  const {
    treeItems,
    treeError,
    activeOption,
    activePermissionStates,
    activeSelectAllState,
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

  useEffect(() => {
    if (
      !isOpen ||
      !catalog ||
      treeError ||
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
        treeItems
      );

    setForm(nextForm);
    setInitialForm(nextForm);
    setErrors({});
    setSubmitError(null);
  }, [
    catalog,
    isOpen,
    perfil.idPerfil,
    treeError,
    treeItems,
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

  const isDirty = useMemo(
    () =>
      initialForm !== null &&
      !areAccesosPerfilFormsEqual(
        form,
        initialForm,
        treeItems
      ),
    [
      form,
      initialForm,
      treeItems,
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
          await onGuardar(
            filterEditableAssignments(
              catalog.asignaciones,
              initialForm,
              form
            ),
            normalizeAsignarAccesosPerfilForm(
              form,
              treeItems
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
        resolveOperationErrorMessage(
          result.error,
          'No se pudieron actualizar los accesos del perfil.'
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
    treeItems,
  ]);

  const emptyCatalogMessage =
    !isLoading &&
    !resourceError &&
    !treeError &&
    catalog &&
    treeItems.length === 0
      ? MODAL_EDITAR_ACCESOS_PERFIL_TEXTS
          .emptyOptions
      : null;

  const catalogError =
    resourceError ??
    treeError ??
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
    treeItems,
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
