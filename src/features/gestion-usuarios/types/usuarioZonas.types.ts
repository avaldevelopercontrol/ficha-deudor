import type {
  ApiResponse,
  ApiResponseSimple,
} from '@shared/types/indexApi';

export interface UsuarioZonaFaltanteApi {
  zona: string;
  descripcionZona: string;
  bEstado: boolean | null;
  nid_asignacion: number | null;
}

export interface UsuarioZonaAsignadaApi {
  nid_asignacion: number;
  nid_usuario: number;
  nid_cliente: number;
  zona: string;
  bestado: boolean;
  region: string;
}

export interface UsuarioZonaMutationRequestApi {
  nid_asignacion: number;
  nid_usuario: number;
  nid_cliente: number;
  zona: string;
  bestado: boolean;
}

export interface UsuarioZonaMutationResponseApi {
  nid_asignacion: number;
  nid_usuario: number;
  nid_cliente: number;
  zona: string;
}

export type GetZonasFaltantesApiResponse =
  ApiResponse<UsuarioZonaFaltanteApi[]>;

export type GetZonasAsignadasApiResponse =
  ApiResponse<UsuarioZonaAsignadaApi[]>;

export type UsuarioZonaMutationApiResponse =
  ApiResponseSimple<UsuarioZonaMutationResponseApi>;
