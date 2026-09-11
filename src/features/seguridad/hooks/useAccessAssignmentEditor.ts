import {
  useCallback,
  useMemo,
  type Dispatch,
  type SetStateAction,
} from 'react';

import type {
  Modulo,
} from '../types/opcion.types';

import type {
  AccessOptionsFormData,
  AccessPermissionKey,
  AccessTreeItem,
} from '../domain/accesos/access.types';

import {
  buildAccessTree,
} from '../domain/accesos/accessTree.utils';

import {
  getAccessBranchAllPermissionsState,
  getAccessBranchPermissionStates,
  setAllAccessBranchPermissions,
  setAccessBranchPermission,
} from '../domain/accesos/accessPermissions.utils';
import {
  setAccessBranchSelected,
} from '../domain/accesos/accessSelection.utils';

interface UseAccessAssignmentEditorParams<
  TForm extends AccessOptionsFormData,
> {
  form: TForm;
  setForm: Dispatch<SetStateAction<TForm>>;
  opciones: readonly Modulo[] | null | undefined;
  setErrors: Dispatch<
    SetStateAction<Record<string, string>>
  >;
  setSubmitError: Dispatch<
    SetStateAction<string | null>
  >;
}

const EMPTY_PERMISSION_STATES = {
  consultar: 'unchecked',
  insertar: 'unchecked',
  editar: 'unchecked',
  eliminar: 'unchecked',
  exportar: 'unchecked',
} as const;

export const useAccessAssignmentEditor = <
  TForm extends AccessOptionsFormData,
>({
  form,
  setForm,
  opciones,
  setErrors,
  setSubmitError,
}: UseAccessAssignmentEditorParams<TForm>) => {
  const treeState = useMemo(() => {
    if (!opciones) {
      return {
        items: [],
        itemsById: new Map<number, AccessTreeItem>(),
        error: null,
      };
    }

    try {
      const items = buildAccessTree(opciones);

      return {
        items,
        itemsById: new Map(
          items.map((item) => [
            item.idModulo,
            item,
          ])
        ),
        error: null,
      };
    } catch (error) {
      return {
        items: [],
        itemsById: new Map<number, AccessTreeItem>(),
        error:
          error instanceof Error
            ? error.message
            : 'La jerarquía de opciones no es válida.',
      };
    }
  }, [opciones]);

  const activeOption = useMemo(
    () =>
      form.activeOptionId === null
        ? null
        : treeState.itemsById.get(
            form.activeOptionId
          ) ?? null,
    [form.activeOptionId, treeState.itemsById]
  );

  const activePermissionStates = useMemo(
    () =>
      form.activeOptionId === null
        ? EMPTY_PERMISSION_STATES
        : getAccessBranchPermissionStates(
            form,
            treeState.items,
            form.activeOptionId
          ),
    [form, treeState.items]
  );

  const activeSelectAllState = useMemo(
    () =>
      activeOption?.isPermissionTarget
        ? getAccessBranchAllPermissionsState(
            activePermissionStates,
            activeOption
          )
        : 'unchecked',
    [activeOption, activePermissionStates]
  );

  const clearFormErrors = useCallback(
    (...fieldNames: string[]) => {
      setErrors((previousErrors) => {
        const nextErrors = {
          ...previousErrors,
        };

        fieldNames.forEach((fieldName) => {
          delete nextErrors[fieldName];
        });

        return nextErrors;
      });

      setSubmitError(null);
    },
    [setErrors, setSubmitError]
  );

  const handleActivateOption = useCallback(
    (optionId: number) => {
      setForm((previousForm) => ({
        ...previousForm,
        activeOptionId: optionId,
      }));
    },
    [setForm]
  );

  const handleToggleOption = useCallback(
    (optionId: number, selected: boolean) => {
      setForm((previousForm) =>
        setAccessBranchSelected(
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
    [clearFormErrors, setForm, treeState.items]
  );

  const handlePermissionChange = useCallback(
    (
      permission: AccessPermissionKey,
      checked: boolean
    ) => {
      if (form.activeOptionId === null) {
        return;
      }

      const activeOptionId = form.activeOptionId;

      setForm((previousForm) =>
        setAccessBranchPermission(
          previousForm,
          treeState.items,
          activeOptionId,
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
      setForm,
      treeState.items,
    ]
  );

  const handleSelectAllPermissions = useCallback(
    (checked: boolean) => {
      if (form.activeOptionId === null) {
        return;
      }

      const activeOptionId = form.activeOptionId;

      setForm((previousForm) =>
        setAllAccessBranchPermissions(
          previousForm,
          treeState.items,
          activeOptionId,
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
      setForm,
      treeState.items,
    ]
  );

  return {
    treeItems: treeState.items,
    treeError: treeState.error,
    activeOption,
    activePermissionStates,
    activeSelectAllState,
    clearFormErrors,
    handleActivateOption,
    handleToggleOption,
    handlePermissionChange,
    handleSelectAllPermissions,
  };
};
