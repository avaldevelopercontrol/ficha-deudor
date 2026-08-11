import type {
  AccesosOpcionesFormData,
  PerfilOpcionPermissions,
} from '../../mantener-accesos-perfil/types/asignarAccesosPerfil.types';

export interface AsignarAccesosUsuarioFormData
  extends AccesosOpcionesFormData {
  usuarioId: number | '';
  grupoId: number | '';
}

export interface UsuarioGrupoOpcionAssignment {
  opcionId: number;
  permissions: PerfilOpcionPermissions;
}

export interface RegistrarUsuarioGrupoOpcionesData {
  usuarioId: number;
  grupoId: number;
  assignments: UsuarioGrupoOpcionAssignment[];
}
