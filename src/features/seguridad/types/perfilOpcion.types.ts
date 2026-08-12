import type {
  ApiResponseSimple,
} from '@shared/types/indexApi';

/**
 * Estructura recibida desde
 * GetPerfilOptionsCount.
 */
export interface PerfilOpcionCountApi {
  nId_Perfil: number;
  per_Nombre: string;
  nCantidadOpciones: number;
}

/**
 * Modelo utilizado por la tabla.
 */
export interface PerfilOpcionCount {
  idPerfil: number;
  nombrePerfil: string;
  cantidadOpciones: number;
  estadoActivo?: boolean;
}

export interface GetPerfilOptionsCountResponse
  extends ApiResponseSimple<
    | PerfilOpcionCountApi[]
    | PerfilOpcionCountApi
    | null
  > {
  pageNumber?: number;
  pageSize?: number;
  totalRecords?: number;
  totalPages?: number;
}

/**
 * Estructura reducida recibida desde
 * GET /v1/Perfil/GetPerfiles.
 */
export interface PerfilAccesoOptionApi {
  nid_perfil: number;
  per_Nombre: string;
  nEstadoGest: number;
}

export type GetPerfilesAccesoResponse =
  ApiResponseSimple<
    | PerfilAccesoOptionApi[]
    | PerfilAccesoOptionApi
    | null
  >;

/**
 * Relación PERFIL - OPCIÓN recibida desde
 * GetOpcionesPorPerfil.
 */
export interface PerfilOpcionApi {
  nId_PerfilOpcion: number;
  nId_Perfil: number;
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

export interface PerfilOpcionDetalle {
  idPerfilOpcion: number;
  idPerfil: number;
  idOpcion: number;
  consultar: boolean;
  insertar: boolean;
  editar: boolean;
  eliminar: boolean;
  exportar: boolean;
  estadoActivo: boolean;
}

export type GetPerfilOpcionesPorPerfilResponse =
  ApiResponseSimple<
    | PerfilOpcionApi[]
    | PerfilOpcionApi
    | null
  >;

export interface CreatePerfilOpcionRequest {
  nId_Perfil: number;
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

export interface CreatePerfilOpcionResponseApi {
  nId_Perfil: number;
  nId_Opcion: number;
}

export type CreatePerfilOpcionApiResponse =
  ApiResponseSimple<
    CreatePerfilOpcionResponseApi | null
  >;

export interface UpdatePerfilOpcionRequest {
  nId_PerfilOpcion: number;
  nId_Perfil: number;
  nId_Opcion: number;
  bConsultar: boolean;
  bInsertar: boolean;
  bEditar: boolean;
  bEliminar: boolean;
  bExportar: boolean;
  bEstado: boolean;
  nModifica: number;
  dFechaModifica: string;
}

export interface UpdatePerfilOpcionResponseApi {
  nId_PerfilOpcion: number;
  nId_Perfil: number;
  per_Nombre: string;
  nId_Opcion: number;
  sNombreOpcion: string;
}

export type UpdatePerfilOpcionApiResponse =
  ApiResponseSimple<
    UpdatePerfilOpcionResponseApi | null
  >;
