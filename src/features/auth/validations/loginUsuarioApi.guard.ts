import type { LoginUsuarioApi } from '../types';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isOptionalText = (value: unknown): boolean =>
  value === undefined || value === null || typeof value === 'string';

const isOptionalNumber = (value: unknown): boolean =>
  value === undefined || value === null || typeof value === 'number';

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
    isOptionalNumber(value.nid_perfil) &&
    isOptionalNumber(value.nId_PerfilGest)
  );
};
