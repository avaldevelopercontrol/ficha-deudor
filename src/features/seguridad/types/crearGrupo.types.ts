import type {
  ApiResponseSimple,
} from '@shared/types/indexApi';

export interface CreateGrupoRequestApi {
  nId_Grupo: number;
  cNombre_Grupo: string;
  cSigla_Grupo: string;
  bEstado: boolean;
  nCant_Grupo: null;
  nid_cliente: number;
}

export interface CreateGrupoResponseApi {
  nId_Grupo: number;
  cNombre_Grupo: string;
  nid_cliente: number;
}

export type CreateGrupoApiResponse =
  ApiResponseSimple<
    CreateGrupoResponseApi
  >;
