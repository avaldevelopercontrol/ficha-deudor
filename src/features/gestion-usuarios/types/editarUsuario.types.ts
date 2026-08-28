import type {
  ApiResponse,
  ApiResponseSimple,
} from '@shared/types/indexApi';

export interface UsuarioDetalleApi {
  nId_Usuario: number;
  cUsr_NroDoc: string;
  cUsr_ApePat: string;
  cUsr_ApeMat: string;
  cUsr_Nombres: string;
  bSexo: number;
  cUsr_Login: string;
  cUsr_Pass?: string | null;
  bEstado: boolean;
  dUsr_FecNac: string | null;
  nId_Ubigeo: number;
  nId_Grupo: number;
  nid_perfil: number;
  cod_Recau: string;
  nUsr_CiuGestor: string;
  nId_SubZonaGen: number;
  cUsr_Celular: string;
  cUsr_Anexo: string;
  cUsr_Email: string;
  cUsr_EmailPersonal: string;
  nroCampanaDiscador: number;
}

export interface UpdateUsuarioRequestApi {
  nId_Usuario: number;
  cUsr_NroDoc: string;
  cUsr_NroDocNew: string;
  cUsr_ApePat: string;
  cUsr_ApeMat: string;
  cUsr_Nombres: string;
  cUsr_Login: string;
  cUsr_LoginNew: string;
  bCambioPass: boolean;
  cUsr_Pass: string | null;
  cUsr_PassNew: string | null;
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
  cUsr_AnexoNew: string;
  cUsr_Email: string;
  cUsr_EmailPersonal: string;
  nroCampanaDiscador: number;
}

export interface UpdateUsuarioResponseApi {
  nId_Usuario: number;
  cUsr_NroDoc: string;
  cUsr_ApePat: string;
  cUsr_ApeMat: string;
  cUsr_Nombres: string;
  cUsr_Login: string;
}

export interface UsuarioGrupoApi {
  nId_UGrupo: number;
  nId_Usuario: number;
  nid_grupo: number;
  cNombre_Grupo: string;
}

export interface UsuarioGrupoFaltanteApi {
  nId_UGrupo: number;
  nId_Usuario: number;
  nid_grupo: number;
  cNombre_Grupo: string;
}

export interface CreateUsuarioGrupoRequestApi {
  nId_Usuario: number;
  nId_Grupo: number;
  dUGrupo_FecIni: string;
  dUGrupo_FecFin: string;
  bEstado: boolean;
  bActivo: boolean;
  bGestion: boolean;
}

export interface UpdateUsuarioGrupoRequestApi
  extends CreateUsuarioGrupoRequestApi {
  nId_UGrupo: number;
}

export interface UsuarioGrupoMutationResponseApi {
  nId_UGrupo: number;
  nId_Usuario: number;
  nId_Grupo: number;
}

export type GetUsuarioByIdApiResponse =
  ApiResponseSimple<UsuarioDetalleApi>;

export type UpdateUsuarioApiResponse =
  ApiResponseSimple<UpdateUsuarioResponseApi>;

export type GetGruposByUsuarioApiResponse =
  ApiResponse<UsuarioGrupoApi[]>;

export type GetGruposFaltantesByUsuarioApiResponse =
  ApiResponse<UsuarioGrupoFaltanteApi[]>;

export type UsuarioGrupoMutationApiResponse =
  ApiResponseSimple<UsuarioGrupoMutationResponseApi>;
