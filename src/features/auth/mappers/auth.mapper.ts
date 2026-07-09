import { getPerfilUsuarioNombreById } from '../constants/perfilesUsuario.constants';
import type { LoginUsuarioApi, Usuario } from '../types';

const cleanText = (value?: string | null): string => value?.trim() || '';

export const mapUsuarioApiToUsuario = (
  usuarioApi: LoginUsuarioApi
): Usuario => {
  const apellidoPaterno = cleanText(usuarioApi.cUsr_ApePat);
  const apellidoMaterno = cleanText(usuarioApi.cUsr_ApeMat);
  const apellido = [apellidoPaterno, apellidoMaterno].filter(Boolean).join(' ');

  const email =
    cleanText(usuarioApi.cUsr_Email) ||
    cleanText(usuarioApi.cUsr_EmailPersonal) ||
    cleanText(usuarioApi.cUsr_EmailProfile);

  const perfilId = usuarioApi.nid_perfil ?? usuarioApi.nId_PerfilGest ?? null;

  return {
    id_usuario: String(usuarioApi.nId_Usuario),
    nombre: cleanText(usuarioApi.cUsr_Nombres),
    apellido,
    username: cleanText(usuarioApi.cUsr_Login),
    email,
    perfil: getPerfilUsuarioNombreById(perfilId),
    perfilId,
  };
};
