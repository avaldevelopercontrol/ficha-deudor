import type React from 'react';

import type {
  SisgesIconName,
} from '@shared/icons/sisges';

export type AccessPermissionName =
  | 'consultar'
  | 'insertar'
  | 'editar'
  | 'eliminar'
  | 'exportar';

export interface AccessPermissions {
  readonly consultar: boolean;
  readonly insertar: boolean;
  readonly editar: boolean;
  readonly eliminar: boolean;
  readonly exportar: boolean;
}

export interface AccessOptionSource {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  type: number;
  parentId: number;
  order: number;
  visible: boolean;
  active: boolean;
}

export interface ProfileOptionAccessSource {
  assignmentId: number;
  profileId: number;
  optionId: number;
  permissions: AccessPermissions;
  active: boolean;
}

export interface UserGroupOptionAccessSource {
  assignmentId: number;
  userId: number;
  groupId: number;
  optionId: number;
  permissions: AccessPermissions;
  active: boolean;
}

export interface AuthorizedOption {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: SisgesIconName;
  type: number;
  parentId: number;
  order: number;
  route: string | null;
  permissions: AccessPermissions;
  children: readonly AuthorizedOption[];
}

export interface AccessControlSnapshot {
  profileId: number;
  menuTree: readonly AuthorizedOption[];
  navigationTree: readonly AuthorizedOption[];
  optionsById: ReadonlyMap<number, AuthorizedOption>;
}

export type AccessControlStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'error';

export interface AccessControlContextValue {
  status: AccessControlStatus;
  error: string | null;
  menuTree: readonly AuthorizedOption[];
  navigationTree: readonly AuthorizedOption[];
  refresh: () => Promise<void>;
  hasOption: (optionId: number) => boolean;
  hasPermission: (
    optionId: number,
    permission: AccessPermissionName
  ) => boolean;
  getPermissions: (
    optionId: number
  ) => AccessPermissions;
}

export interface AccessControlProviderProps {
  children: React.ReactNode;
}
