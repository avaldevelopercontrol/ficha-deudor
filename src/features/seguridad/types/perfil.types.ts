    import type {
  ApiResponseSimple,
} from '@shared/types/indexApi';

export type PerfilEstado =
  | 'Activo'
  | 'Inactivo';

export type PerfilIndicador =
  | 'Sí'
  | 'No';

/**
 * Representa exactamente la estructura
 * recibida desde la API.
 */
export interface PerfilApi {
  nid_perfil: number;
  per_Fecha: string | null;
  per_Nombre: string | null;
  nper_EliminaRegJud: number;
  nper_AvisoVencidoJud: number;
  nper_RegistraRegJud: number;
  nper_MantUsuario: number;
  per_abreviatura: string | null;
  nEquiv_rrhh: number;
  nEstadoGest: number;
  bProduccionOnline: boolean;
  nId_TipoGestion: number;
  bvisualiza_deudorhistoria: boolean;
}

/**
 * Modelo limpio utilizado por React.
 * La interfaz no depende de los nombres
 * técnicos que devuelve el backend.
 */
export interface Perfil {
  idPerfil: number;
  nombrePerfil: string;
  abreviatura: string;
  fechaRegistro: string;
  estado: PerfilEstado;
  produccionOnline: PerfilIndicador;
  historiaDeudor: PerfilIndicador;
}

export type GetPerfilesResponse =
  ApiResponseSimple<
    | PerfilApi[]
    | PerfilApi
    | null
  >;

export interface PerfilMutationResponseApi {
  nid_Perfil: number;
  per_Nombre: string;
}

export type GetPerfilByIdResponse =
  ApiResponseSimple<
    PerfilApi | null
  >;