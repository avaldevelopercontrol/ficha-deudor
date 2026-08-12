import type { ApiResponseSimple } from '@shared/types/indexApi';

export interface CambiarClaveFormData {
  claveActual: string;
  claveNueva: string;
  confirmarClaveNueva: string;
}

export type CambiarClaveField = keyof CambiarClaveFormData;

export type CambiarClaveFormErrors = Partial<
  Record<CambiarClaveField, string>
>;

export interface ResetearClaveUsuarioRequest {
  nId_Usuario: number;
  cUsr_PassActual: string;
  cUsr_PassNueva: string;
  cUsr_PassConfirma: string;
  dFecRegistro: string;
}

export interface ResetearClaveUsuarioResponseApi {
  nId_Usuario: number;
  cUsr_Login: string;
  cUsr_Pass: string;
}

export type ResetearClaveUsuarioApiResponse =
  ApiResponseSimple<ResetearClaveUsuarioResponseApi>;
