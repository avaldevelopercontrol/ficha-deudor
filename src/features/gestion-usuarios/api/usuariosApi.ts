import {
  ApiError,
  apiClient,
} from '@shared/api/apiClient';

import {
  GESTION_USUARIOS_API_ENDPOINTS,
} from '../constants/gestionUsuariosRoutes.constants';

import {
  buildCreateUsuarioRequest,
} from '../mappers/crearUsuario.mapper';

import {
  mapUsuariosListadoResponse,
} from '../mappers/usuarioListado.mapper';

import type {
  RegistrarUsuarioFormData,
} from '../modules/mantener-usuario/types/registrarUsuario.types';

import type {
  CreateUsuarioApiResponse,
  CreateUsuarioResult,
} from '../types/crearUsuario.types';

import type {
  GetUsuariosListResponse,
  UsuarioListado,
} from '../types/usuarioListado.types';

const USUARIOS_ERROR_MESSAGES = {
  list:
    'No se pudo obtener la lista de usuarios.',

  create:
    'No se pudo registrar el usuario.',
} as const;

const isRecord = (
  value: unknown
): value is Record<
  string,
  unknown
> =>
  typeof value === 'object' &&
  value !== null;

const getStringProperty = (
  value:
    Record<string, unknown>,
  property: string
): string | null => {
  const propertyValue =
    value[property];

  if (
    typeof propertyValue !==
      'string' ||
    !propertyValue.trim()
  ) {
    return null;
  }

  return propertyValue.trim();
};

const resolveUsuarioApiError = (
  error: unknown,
  fallbackMessage: string
): string => {
  /*
   * apiClient crea ApiError para respuestas
   * HTTP 400 o 500. Se prioriza messageUser
   * porque es el texto pensado para la interfaz.
   */
  if (
    error instanceof ApiError &&
    isRecord(error.data)
  ) {
    return (
      getStringProperty(
        error.data,
        'messageUser'
      ) ??
      getStringProperty(
        error.data,
        'message'
      ) ??
      (
        error.message.trim() ||
        fallbackMessage
      )
    );
  }

  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message.trim();
  }

  return fallbackMessage;
};

const isSuccessfulResponse = (
  result: {
    code: string;
    statusCode: number;
  }
): boolean => {
  /*
   * Si el backend informa un statusCode real, ese valor
   * prevalece sobre code. El fallback por code conserva
   * compatibilidad con respuestas antiguas que usaban 0.
   */
  if (result.statusCode !== 0) {
    return (
      result.statusCode >= 200 &&
      result.statusCode < 300
    );
  }

  return (
    result.code === '00' ||
    result.code === '200'
  );
};

export const fetchUsuariosList = async (
  signal?: AbortSignal
): Promise<UsuarioListado[]> => {
  const result =
    await apiClient<
      GetUsuariosListResponse
    >(
      GESTION_USUARIOS_API_ENDPOINTS
        .getUsuariosList,
      {
        method: 'GET',
        signal,
      }
    );

  if (
    !isSuccessfulResponse(
      result
    )
  ) {
    throw new Error(
      result.messageUser?.trim() ||
        result.message?.trim() ||
        USUARIOS_ERROR_MESSAGES.list
    );
  }

  return mapUsuariosListadoResponse(
    result.response
  );
};

export const createUsuario = async (
  form:
    RegistrarUsuarioFormData
): Promise<CreateUsuarioResult> => {
  const body =
    buildCreateUsuarioRequest(
      form
    );

  try {
    const result =
      await apiClient<
        CreateUsuarioApiResponse
      >(
        GESTION_USUARIOS_API_ENDPOINTS
          .createUsuario,
        {
          method: 'POST',
          body,
        }
      );

    /*
     * También se valida la respuesta interna,
     * porque algunas APIs pueden responder
     * HTTP 200 con un statusCode de error.
     */
    if (
      !isSuccessfulResponse(
        result
      )
    ) {
      throw new Error(
        result.messageUser?.trim() ||
          result.message?.trim() ||
          USUARIOS_ERROR_MESSAGES.create
      );
    }

    const usuarioCreado =
      result.response;

    if (
      !usuarioCreado ||
      !Number.isInteger(
        usuarioCreado.nId_Usuario
      ) ||
      usuarioCreado.nId_Usuario <= 0
    ) {
      throw new Error(
        'El servidor confirmó el registro, pero no devolvió un usuario válido.'
      );
    }

    const backendMessage =
      result.messageUser?.trim();

    return {
      usuario: usuarioCreado,
      message:
        backendMessage &&
        backendMessage.toUpperCase() !== 'OK'
          ? backendMessage
          : 'Usuario registrado correctamente.',
    };
  } catch (error) {
    throw new Error(
      resolveUsuarioApiError(
        error,
        USUARIOS_ERROR_MESSAGES.create
      )
    );
  }
};