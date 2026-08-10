import type {
  ApiResponseSimple,
} from '@shared/types/indexApi';

export type GrupoEstado =
  | 'Activo'
  | 'Inactivo';

/**
 * Estructura recibida desde
 * GET /v1/Grupo/GetGruposListado.
 */
export interface GrupoApi {
  nId_Grupo: number;
  cNombre_Grupo: string | null;
  cSigla_Grupo: string | null;
  bEstado: boolean;
  nCant_Grupo: number;
  nid_cliente: number;
  cCli_Nombre: string | null;
}

/**
 * Modelo limpio utilizado por la UI.
 */
export interface Grupo {
  idGrupo: number;
  nombreGrupo: string;
  cliente: string;
  estado: GrupoEstado;
}

/**
 * Estructura recibida desde
 * GET /v1/Grupo/{nId_Grupo}.
 */
export interface GrupoDetalleApi {
  nId_Grupo: number;
  cNombre_Grupo: string | null;
  cSigla_Grupo: string | null;
  bEstado: boolean;
  nCant_Grupo: number;
  nid_cliente: number;
}

export type GetGrupoByIdResponse =
  ApiResponseSimple<
    GrupoDetalleApi | null
  >;

export type GetGruposListadoResponse =
  ApiResponseSimple<
    | GrupoApi[]
    | GrupoApi
    | null
  >;
