import type {
  ReactNode,
} from 'react';

import {
  PERFIL_OPCION_PERMISSION_LABELS,
} from '../constants/modalAsignarAccesosPerfil.constants';

import type {
  OpcionTreeItem,
  PerfilOpcionCheckState,
  PerfilOpcionPermissionKey,
  PerfilOpcionPermissionStates,
} from '../types/asignarAccesosPerfil.types';

import {
  PERFIL_OPCION_PERMISSION_KEYS,
} from '../utils/asignarAccesosPerfil.utils';

import {
  isPerfilOpcionPermissionAvailable,
} from '../utils/opcionAccessCapabilities.utils';

import AccessStateCheckbox from './AccessStateCheckbox';

interface AccesosPerfilPermissionsPanelProps {
  activeOption: OpcionTreeItem | null;
  permissionStates: PerfilOpcionPermissionStates;
  selectAllState: PerfilOpcionCheckState;
  disabled?: boolean;
  titleLabel: string;
  noSelectionMessage: string;
  selectAllLabel: string;
  globalHint: string;
  containerHint: string;
  singleHint: string;
  onPermissionChange: (
    permission: PerfilOpcionPermissionKey,
    checked: boolean
  ) => void;
  onSelectAll: (checked: boolean) => void;
}

export const AccesosPerfilPermissionsPanel = ({
  activeOption,
  permissionStates,
  selectAllState,
  disabled = false,
  titleLabel,
  noSelectionMessage,
  selectAllLabel,
  globalHint,
  containerHint,
  singleHint,
  onPermissionChange,
  onSelectAll,
}: AccesosPerfilPermissionsPanelProps): ReactNode => {
  const controlsDisabled =
    disabled ||
    !activeOption ||
    !activeOption.isPermissionTarget;

  return (
    <div className="asignar-accesos-permissions">
      <div className="asignar-accesos-permissions__header">
        <strong>
          {titleLabel}{' '}
          <span>
            {activeOption
              ? activeOption.displayLabel
              : noSelectionMessage}
          </span>
        </strong>

        <label className="asignar-accesos-permissions__select-all">
          <AccessStateCheckbox
            state={selectAllState}
            disabled={controlsDisabled}
            ariaLabel={selectAllLabel}
            onChange={onSelectAll}
          />

          <span>{selectAllLabel}</span>
        </label>
      </div>

      <div
        className="asignar-accesos-permissions__body"
        aria-disabled={controlsDisabled}
      >
        {activeOption && (
          <p className="asignar-accesos-permissions__hint">
            {!activeOption.isAssignmentTarget
              ? globalHint
              : activeOption.isPermissionTarget
                ? singleHint
                : containerHint}
          </p>
        )}

        {PERFIL_OPCION_PERMISSION_KEYS.map(
          (permission) => {
            const isAvailable =
              isPerfilOpcionPermissionAvailable(
                activeOption,
                permission
              );
            const permissionDisabled =
              controlsDisabled ||
              !isAvailable;

            return (
              <label
                key={permission}
                className="asignar-accesos-permissions__item"
                aria-disabled={permissionDisabled}
                title={
                  !controlsDisabled &&
                  !isAvailable
                    ? 'Esta operación no aplica para este módulo.'
                    : undefined
                }
              >
                <AccessStateCheckbox
                  state={
                    permissionStates[
                      permission
                    ]
                  }
                  disabled={permissionDisabled}
                  ariaLabel={
                    PERFIL_OPCION_PERMISSION_LABELS[
                      permission
                    ]
                  }
                  onChange={(checked) => {
                    onPermissionChange(
                      permission,
                      checked
                    );
                  }}
                />

                <span>
                  {
                    PERFIL_OPCION_PERMISSION_LABELS[
                      permission
                    ]
                  }
                </span>
              </label>
            );
          }
        )}
      </div>
    </div>
  );
};

export default AccesosPerfilPermissionsPanel;
