import { apiClient } from '../../../shared/api/apiClient';
import { env } from '../../../app/config/env';
import { mockLogin, mockGetClientesByUsuario } from '../mocks';

import type {
  ClientesResponse,
  LoginPayload,
  LoginResponse,
  LoginUsuarioApi,
  LoginUsuarioApiResponse,
  Usuario,
} from '../types';

const BASE_USUARIO = '/v1/Usuario';

const cleanText = (value?: string | null): string => {
  return value?.trim() || '';
};

const mapUsuarioApiToUsuario = (usuarioApi: LoginUsuarioApi): Usuario => {
  const apellidoPaterno = cleanText(usuarioApi.cUsr_ApePat);
  const apellidoMaterno = cleanText(usuarioApi.cUsr_ApeMat);

  const apellido = [apellidoPaterno, apellidoMaterno]
    .filter(Boolean)
    .join(' ');

  const email =
    cleanText(usuarioApi.cUsr_Email) ||
    cleanText(usuarioApi.cUsr_EmailPersonal) ||
    cleanText(usuarioApi.cUsr_EmailProfile);

  return {
    id_usuario: String(usuarioApi.nId_Usuario),
    nombre: cleanText(usuarioApi.cUsr_Nombres),
    apellido,
    username: cleanText(usuarioApi.cUsr_Login),
    email,
    perfil: String(usuarioApi.nid_perfil ?? usuarioApi.nId_PerfilGest ?? ''),
    clientesAsignados: usuarioApi.nId_ClientePri
      ? [String(usuarioApi.nId_ClientePri)]
      : [],
  };
};

const buildLoginErrorResponse = (message: string): LoginResponse => {
  return {
    success: false,
    message,
    usuario: null,
  };
};

export const login = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  if (env.useMocks) {
    return mockLogin(payload);
  }

  const params = new URLSearchParams({
    cUsr_Login: payload.username.trim(),
    cUsr_Pass: payload.password,
  });

  try {
    const result = await apiClient<LoginUsuarioApiResponse>(
      `${BASE_USUARIO}/GetLoginUsuario?${params.toString()}`
    );

    const usuarioApi = result.response;

    if (result.statusCode !== 200 || result.code !== '00' || !usuarioApi) {
      return buildLoginErrorResponse(
        result.messageUser ||
          result.message ||
          'Usuario o contraseña incorrectos.'
      );
    }

    if (!usuarioApi.bEstado) {
      return buildLoginErrorResponse('El usuario se encuentra inactivo.');
    }

    return {
      success: true,
      message: result.messageUser || result.message || 'Login exitoso.',
      usuario: mapUsuarioApiToUsuario(usuarioApi),
    };
  } catch (error) {
    return buildLoginErrorResponse(
      error instanceof Error
        ? error.message
        : 'Error al iniciar sesión.'
    );
  }
};

export const fetchClientesByUsuario = async (
  id_usuario: string
): Promise<ClientesResponse> => {
  return mockGetClientesByUsuario(id_usuario);
};