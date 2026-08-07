import type {
  ApiResponseSimple,
} from '@shared/types/indexApi';

export interface UpdateGrupoRequestApi {
  nId_Grupo: number;
  cNombre_Grupo: string;
  cNombre_GrupoNuevo: string;
  cSigla_Grupo: string;
  bEstado: boolean;
  nCant_Grupo: null;
  nid_cliente: number;
}

export interface UpdateGrupoResponseApi {
  nId_Grupo: number;
  cNombre_Grupo: string;
  nid_cliente: number;
}

export type UpdateGrupoApiResponse =
  ApiResponseSimple<
    UpdateGrupoResponseApi
  >;
