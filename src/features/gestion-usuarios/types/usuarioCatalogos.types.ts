import type {
  SelectOption,
} from '@shared/types';

import type {
  ApiResponse,
  ApiResponseSimple,
} from '@shared/types/indexApi';

export interface PerfilApi {
  nid_perfil: number;
  per_Nombre: string;
}

export interface GrupoApi {
  nId_Grupo: number;
  cNombre_Grupo: string;
}

export interface SubZonaGeneralApi {
  nId_SubZonaGen: number;
  cSzgn_Nombre: string;
}

export interface CampanaDiscadorApi {
  nroCampanaDiscador: number;
  cNombreCampana: string;
}

export interface CampanaDiscadorOption
  extends SelectOption<string> {
  codigo: number;
}

export type GetPerfilesResponse =
  ApiResponseSimple<
    PerfilApi[]
  >;

export type GetGruposResponse =
  ApiResponseSimple<
    GrupoApi[]
  >;

export type GetSubZonasGeneralResponse =
  ApiResponseSimple<
    SubZonaGeneralApi[]
  >;

export type GetCampanasDiscadorResponse =
  ApiResponse<
    CampanaDiscadorApi[]
  >;