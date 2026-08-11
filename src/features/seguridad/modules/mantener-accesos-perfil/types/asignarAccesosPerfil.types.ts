import type {
  Modulo,
} from '../../../types/opcion.types';

export interface PerfilAccesoOption {
  idPerfil: number;
  nombrePerfil: string;
}

export interface PerfilOpcionPermissions {
  consultar: boolean;
  insertar: boolean;
  editar: boolean;
  eliminar: boolean;
  exportar: boolean;
}

export type PerfilOpcionPermissionKey =
  keyof PerfilOpcionPermissions;

export type PerfilOpcionCheckState =
  | 'checked'
  | 'unchecked'
  | 'mixed';

export type PerfilOpcionPermissionStates =
  Record<
    PerfilOpcionPermissionKey,
    PerfilOpcionCheckState
  >;

export interface AccesosOpcionesFormData {
  selectedOptionIds: number[];
  activeOptionId: number | null;
  permissionsByOptionId: Record<
    string,
    PerfilOpcionPermissions
  >;
}

export interface AsignarAccesosPerfilFormData
  extends AccesosOpcionesFormData {
  perfilId: number | '';
}

export interface OpcionTreeItem
  extends Modulo {
  depth: number;
  treeCode: string;
  displayLabel: string;
  hasChildren: boolean;
  isAssignmentTarget: boolean;
  isPermissionTarget: boolean;
}

export interface AsignarAccesosPerfilCatalog {
  perfiles: PerfilAccesoOption[];
  opciones: Modulo[];
}

export interface PerfilOpcionAssignment {
  opcionId: number;
  permissions: PerfilOpcionPermissions;
}

export interface RegistrarPerfilOpcionesData {
  perfilId: number;
  assignments: PerfilOpcionAssignment[];
}
