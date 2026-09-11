import type { LoginUsuarioApi } from '../types';
import { isRecord } from './authValidation.utils';

const isOptionalText = (value: unknown): boolean =>
  value === undefined || value === null || typeof value === 'string';

const isOptionalSafeInteger = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === 'number' && Number.isSafeInteger(value));

export const isLoginUsuarioApi = (
  value: unknown
): value is LoginUsuarioApi => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.nId_Usuario === 'number' &&
    Number.isSafeInteger(value.nId_Usuario) &&
    value.nId_Usuario > 0 &&
    typeof value.bEstado === 'boolean' &&
    typeof value.cUsr_Login === 'string' &&
    value.cUsr_Login.trim().length > 0 &&
    isOptionalText(value.cUsr_Nombres) &&
    isOptionalText(value.cUsr_ApePat) &&
    isOptionalText(value.cUsr_ApeMat) &&
    isOptionalText(value.cUsr_Email) &&
    isOptionalText(value.cUsr_EmailPersonal) &&
    isOptionalText(value.cUsr_EmailProfile) &&
    isOptionalText(value.per_Nombre) &&
    isOptionalSafeInteger(value.nid_perfil) &&
    isOptionalSafeInteger(value.nId_PerfilGest)
  );
};
