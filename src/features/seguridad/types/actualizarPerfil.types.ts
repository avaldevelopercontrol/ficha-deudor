import type {
  ApiResponseSimple,
} from '@shared/types/indexApi';

import type {
  PerfilMutationResponseApi,
} from './perfil.types';

export interface UpdatePerfilRequestApi {
  nid_perfil: number;
  per_Fecha: string;
  per_Nombre: string;

  nper_EliminaRegJud: number;
  nper_AvisoVencidoJud: number;
  nper_RegistraRegJud: number;
  nper_MantUsuario: number;

  per_abreviatura: string;

  nEquiv_rrhh: number;
  nEstadoGest: number;

  bProduccionOnline: boolean;
  nId_TipoGestion: number;
  bvisualiza_deudorhistoria: boolean;
}

export type UpdatePerfilResponseApi =
  PerfilMutationResponseApi;

export type UpdatePerfilApiResponse =
  ApiResponseSimple<
    UpdatePerfilResponseApi
  >;