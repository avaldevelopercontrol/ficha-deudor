import type {
  ApiResponseSimple,
} from '@shared/types/indexApi';

/**
 * Registro enriquecido recibido desde los listados de
 * Usuario - Grupo - Opción.
 */
export interface UsuarioGrupoOpcionListadoApi {
  nId_UsuarioGrupoOpcion: number;
  nId_Usuario: number;
  cUsr_NroDoc: string;
  cUsr_ApePat: string;
  cUsr_ApeMat: string;
  cUsr_Nombres: string;
  cUsr_Login: string;
  nId_Grupo: number;
  cNombre_Grupo: string;
  nId_Opcion: number;
  sCodigoOpcion: string;
  sNombreOpcion: string;
  bConsultar: boolean | null;
  bInsertar: boolean | null;
  bEditar: boolean | null;
  bEliminar: boolean | null;
  bExportar: boolean | null;
  bEstado: boolean;
  nCrea: number;
  dFechaCrea: string;
  nModifica: number | null;
  dFechaModifica: string | null;
}

/** Modelo normalizado utilizado por el listado. */
export interface UsuarioGrupoOpcionListado {
  idUsuarioGrupoOpcion: number;
  idUsuario: number;
  usuario: string;
  nombreCompleto: string;
  idGrupo: number;
  grupo: string;
  idOpcion: number;
  codigoOpcion: string;
  opcion: string;
  consultar: boolean;
  insertar: boolean;
  editar: boolean;
  eliminar: boolean;
  exportar: boolean;
  estado: 'Activo' | 'Inactivo';
}

/**
 * Respuesta reducida de GET /v1/UsuarioGrupoOpcion/{id}.
 */
export interface UsuarioGrupoOpcionDetalleApi {
  nId_UsuarioGrupoOpcion: number;
  nId_Usuario: number;
  nId_Grupo: number;
  nId_Opcion: number;
  bConsultar: boolean | null;
  bInsertar: boolean | null;
  bEditar: boolean | null;
  bEliminar: boolean | null;
  bExportar: boolean | null;
  bEstado: boolean;
  nCrea: number;
  dFechaCrea: string;
  nModifica: number | null;
  dFechaModifica: string | null;
}

/**
 * Relación mínima utilizada para resolver autorización.
 * No incluye auditoría porque nCrea/dFechaCrea no intervienen
 * en la decisión de acceso.
 */
export interface UsuarioGrupoOpcionPermiso {
  idUsuarioGrupoOpcion: number;
  idUsuario: number;
  idGrupo: number;
  idOpcion: number;
  consultar: boolean;
  insertar: boolean;
  editar: boolean;
  eliminar: boolean;
  exportar: boolean;
  estadoActivo: boolean;
}

/**
 * Relación normalizada utilizada para reconciliar altas,
 * reactivaciones, cambios de permisos y bajas lógicas.
 */
export interface UsuarioGrupoOpcionDetalle {
  idUsuarioGrupoOpcion: number;
  idUsuario: number;
  idGrupo: number;
  idOpcion: number;
  consultar: boolean;
  insertar: boolean;
  editar: boolean;
  eliminar: boolean;
  exportar: boolean;
  estadoActivo: boolean;
  crea: number;
  fechaCrea: string;
}

export interface GetUsuarioGrupoOpcionListadoResponse
  extends ApiResponseSimple<
    | UsuarioGrupoOpcionListadoApi[]
    | UsuarioGrupoOpcionListadoApi
    | null
  > {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export type GetUsuarioGrupoOpcionDetalleResponse =
  ApiResponseSimple<
    UsuarioGrupoOpcionDetalleApi | null
  >;

export interface CreateUsuarioGrupoOpcionRequest {
  nId_Usuario: number;
  nId_Grupo: number;
  nId_Opcion: number;
  bConsultar: boolean;
  bInsertar: boolean;
  bEditar: boolean;
  bEliminar: boolean;
  bExportar: boolean;
  bEstado: boolean;
  nCrea: number;
  dFechaCrea: string;
}

export interface UpdateUsuarioGrupoOpcionRequest {
  nId_UsuarioGrupoOpcion: number;
  nId_Usuario: number;
  nId_Grupo: number;
  nId_Opcion: number;
  bConsultar: boolean;
  bInsertar: boolean;
  bEditar: boolean;
  bEliminar: boolean;
  bExportar: boolean;
  bEstado: boolean;
  nCrea: number;
  dFechaCrea: string;
  nModifica: number;
  dFechaModifica: string;
}

export interface UsuarioGrupoOpcionMutationResponseApi {
  nId_UsuarioGrupoOpcion: number;
  nId_Usuario: number;
  nId_Grupo: number;
  nId_Opcion: number;
}

export type CreateUsuarioGrupoOpcionApiResponse =
  ApiResponseSimple<
    UsuarioGrupoOpcionMutationResponseApi | null
  >;

export type UpdateUsuarioGrupoOpcionApiResponse =
  ApiResponseSimple<
    UsuarioGrupoOpcionMutationResponseApi | null
  >;
