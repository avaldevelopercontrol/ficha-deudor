import type { ApiResponse } from '@shared/types/indexApi';

export interface UsuarioListadoApi {
  id: number;
  nombres: string;
  estado: string;
  perfil: string;
  codigoRecurso: string;
  login: string;
}

export interface UsuarioListado {
  id: number;
  nombre: string;
  estado: string;
  perfil: string;
  codigoRecaudacion: string;
  login: string;
}

export type GetUsuariosListResponse = ApiResponse<
  UsuarioListadoApi[] | UsuarioListadoApi | null
>;