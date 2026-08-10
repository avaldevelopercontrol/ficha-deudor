import type {
  ApiResponseSimple,
} from '@shared/types/indexApi';

export interface CreateUsuarioRequestApi {
  nId_Usuario: number;
  cUsr_NroDoc: string;
  cUsr_ApePat: string;
  cUsr_ApeMat: string;
  cUsr_Nombres: string;
  cUsr_Login: string;
  cUsr_Pass: string;
  nid_perfil: number;
  nId_Grupo: number;
  cod_Recau: string;
  bEstado: boolean;
  dUsr_FecNac: string;
  bSexo: number;
  nId_Ubigeo: number;
  nUsr_CiuGestor: string;
  nId_SubZonaGen: number;
  cUsr_Celular: string;
  cUsr_Anexo: string;
  cUsr_Email: string;
  cUsr_EmailPersonal: string;
  nroCampanaDiscador: number;
}

export interface CreateUsuarioResponseApi {
  nId_Usuario: number;
  cUsr_NroDoc: string;
  cUsr_ApePat: string;
  cUsr_ApeMat: string;
  cUsr_Nombres: string;
  cUsr_Login: string;
}

export type CreateUsuarioApiResponse =
  ApiResponseSimple<
    CreateUsuarioResponseApi
  >;