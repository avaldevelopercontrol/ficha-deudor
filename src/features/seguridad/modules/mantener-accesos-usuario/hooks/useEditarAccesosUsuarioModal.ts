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

import type {
  UsuarioGrupoOpcionDetalle,
  UsuarioGrupoOpcionListado,
} from '../../../types/usuarioGrupoOpcion.types';

import {
  useAccessAssignmentEditor,
} from '../../../hooks/useAccessAssignmentEditor';

import {
  resolveOperationErrorMessage,
} from '../../../utils/operationError.utils';

import {
  loadEditarAccesosUsuarioCatalog,
  type EditarAccesosUsuarioCatalog,
} from '../../../application/accesos/accessCatalog.application';

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
    (signal: AbortSignal) =>
      loadEditarAccesosUsuarioCatalog(
        {
          idUsuarioGrupoOpcion:
            acceso.idUsuarioGrupoOpcion,
          idUsuario: acceso.idUsuario,
          idGrupo: acceso.idGrupo,
        },
        signal
      ),
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

    initializedCatalogRef.current = catalog;

    const nextForm =
      createAsignarAccesosUsuarioFormFromAssignments(
        acceso.idUsuario,
        acceso.idGrupo,
        catalog.asignaciones,
        treeItems
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
    treeError,
    treeItems,
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

  const isDirty = useMemo(
    () =>
      initialForm !== null &&
      !areAccesosUsuarioFormsEqual(
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
        treeItems
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
          'No se pudieron actualizar los accesos del usuario.'
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
      ? MODAL_EDITAR_ACCESOS_USUARIO_TEXTS
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
    userOptions,
    groupOptions,
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
