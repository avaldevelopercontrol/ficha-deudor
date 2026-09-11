import type {
  AccessAssignment,
  AccessOptionsFormData,
} from './access.types';

export interface AsignarAccesosUsuarioFormData extends AccessOptionsFormData {
  usuarioId: number | '';
  grupoId: number | '';
}

export type UsuarioGrupoOpcionAssignment = AccessAssignment;

export interface RegistrarUsuarioGrupoOpcionesData {
  usuarioId: number;
  grupoId: number;
  assignments: UsuarioGrupoOpcionAssignment[];
}
