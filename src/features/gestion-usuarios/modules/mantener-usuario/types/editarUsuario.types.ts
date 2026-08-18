import type {
  RegistrarUsuarioCatalogErrors,
  RegistrarUsuarioCatalogLoading,
  RegistrarUsuarioCatalogos,
  SexoUsuarioValue,
} from './registrarUsuario.types';

export interface EditarUsuarioFormData {
  dni: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  usuario: string;
  contrasenaActual: string;
  cambiarContrasena: boolean;
  contrasenaNueva: string;
  perfil: string;
  estado: boolean;
  fechaNacimiento: string;
  sexo: SexoUsuarioValue;
  departamentoLabor: string;
  ciudadGestor: string;
  subZonalOficina: string;
  movilEmpresa: string;
  anexo: string;
  emailEmpresa: string;
  emailPersonal: string;
  campanaDiscador: string;
}

export interface EditarUsuarioOriginalValues {
  idUsuario: number;
  dni: string;
  usuario: string;
  passwordPersistida: string;
  anexo: string;
  grupoPrincipalId: number;
  codigoRecaudador: string;
}

export interface UsuarioGrupoItem {
  idUsuarioGrupo: number | null;
  idUsuario: number;
  idGrupo: number;
  nombre: string;
}

export interface EditarUsuarioPayload {
  form: EditarUsuarioFormData;
  usuarioModificado: boolean;
  original: EditarUsuarioOriginalValues;
  gruposIniciales: UsuarioGrupoItem[];
  gruposActuales: UsuarioGrupoItem[];
}

export type EditarUsuarioCatalogos = Omit<
  RegistrarUsuarioCatalogos,
  'grupos'
>;

export type EditarUsuarioCatalogLoading = Omit<
  RegistrarUsuarioCatalogLoading,
  'grupos'
>;

export type EditarUsuarioCatalogErrors = Omit<
  RegistrarUsuarioCatalogErrors,
  'grupos'
>;

export type EditarUsuarioFieldChange = <
  K extends keyof EditarUsuarioFormData,
>(
  field: K,
  value: EditarUsuarioFormData[K]
) => void;
