import type {
  UsuarioListado,
  UsuarioListadoApi,
} from '../types/usuarioListado.types';

const toNumberValue = (value: unknown): number => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
};

const toTrimmedString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
};

export const mapUsuarioListado = (
  usuario: UsuarioListadoApi
): UsuarioListado => {
  return {
    id: toNumberValue(usuario.id),
    nombre: toTrimmedString(usuario.nombres),
    estado: toTrimmedString(usuario.estado),
    perfil: toTrimmedString(usuario.perfil),
    codigoRecaudacion: toTrimmedString(
      usuario.codigoRecurso
    ),
    login: toTrimmedString(usuario.login),
  };
};

export const mapUsuariosListadoResponse = (
  response:
    | UsuarioListadoApi[]
    | UsuarioListadoApi
    | null
): UsuarioListado[] => {
  const usuarios = Array.isArray(response)
    ? response
    : response
      ? [response]
      : [];

  return usuarios.map(mapUsuarioListado);
};