import type {
  ReactNode,
} from 'react';

import {
  ACCESS_PERMISSION_LABELS,
} from '../../domain/accesos/access.constants';

import type {
  AccessCheckState,
  AccessPermissionKey,
  AccessPermissionStates,
  AccessTreeItem,
} from '../../domain/accesos/access.types';

import {
  ACCESS_PERMISSION_KEYS,
} from '../../domain/accesos/access.constants';

import {
  isAccessPermissionAvailable,
} from '../../domain/accesos/accessCapabilities.utils';

import AccessStateCheckbox from './AccessStateCheckbox';

interface AccessPermissionsPanelProps {
  activeOption: AccessTreeItem | null;
  permissionStates: AccessPermissionStates;
  selectAllState: AccessCheckState;
  disabled?: boolean;
  titleLabel: string;
  noSelectionMessage: string;
  selectAllLabel: string;
  globalHint: string;
  containerHint: string;
  singleHint: string;
  onPermissionChange: (
    permission: AccessPermissionKey,
    checked: boolean
  ) => void;
  onSelectAll: (checked: boolean) => void;
}

export const AccessPermissionsPanel = ({
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
}: AccessPermissionsPanelProps): ReactNode => {
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

        {ACCESS_PERMISSION_KEYS.map(
          (permission) => {
            const isAvailable =
              isAccessPermissionAvailable(
                activeOption,
                permission
              );
            const permissionDisabled =
              controlsDisabled || !isAvailable;

            return (
              <label
                key={permission}
                className="asignar-accesos-permissions__item"
                aria-disabled={permissionDisabled}
                title={
                  !controlsDisabled && !isAvailable
                    ? 'Esta operación no aplica para este módulo.'
                    : undefined
                }
              >
                <AccessStateCheckbox
                  state={permissionStates[permission]}
                  disabled={permissionDisabled}
                  ariaLabel={ACCESS_PERMISSION_LABELS[permission]}
                  onChange={(checked) => {
                    onPermissionChange(permission, checked);
                  }}
                />

                <span>
                  {ACCESS_PERMISSION_LABELS[permission]}
                </span>
              </label>
            );
          }
        )}
      </div>
    </div>
  );
};

export default AccessPermissionsPanel;
