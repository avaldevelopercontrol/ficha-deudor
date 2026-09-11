import type {
  Modulo,
} from '../../types/opcion.types';

export interface AccessPermissions {
  consultar: boolean;
  insertar: boolean;
  editar: boolean;
  eliminar: boolean;
  exportar: boolean;
}

export type AccessPermissionKey = keyof AccessPermissions;

export type AccessCheckState =
  | 'checked'
  | 'unchecked'
  | 'mixed';

export type AccessPermissionStates = Record<
  AccessPermissionKey,
  AccessCheckState
>;

export interface AccessOptionsFormData {
  selectedOptionIds: number[];
  activeOptionId: number | null;
  permissionsByOptionId: Record<string, AccessPermissions>;
}

export interface AccessTreeItem extends Modulo {
  depth: number;
  treeCode: string;
  displayLabel: string;
  hasChildren: boolean;
  isAssignmentTarget: boolean;
  isPermissionTarget: boolean;
}

export interface AccessAssignment {
  opcionId: number;
  permissions: AccessPermissions;
}
