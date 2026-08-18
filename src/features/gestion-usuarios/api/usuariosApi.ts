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
  buildUpdateUsuarioRequest,
  getUsuarioUpdateMismatches,
} from '../mappers/editarUsuario.mapper';

import {
  mapUsuariosListadoResponse,
} from '../mappers/usuarioListado.mapper';

import type {
  EditarUsuarioFormData,
  EditarUsuarioOriginalValues,
} from '../modules/mantener-usuario/types/editarUsuario.types';

import type {
  RegistrarUsuarioFormData,
} from '../modules/mantener-usuario/types/registrarUsuario.types';

import type {
  CreateUsuarioApiResponse,
  CreateUsuarioResult,
} from '../types/crearUsuario.types';

import type {
  GetUsuarioByIdApiResponse,
  UpdateUsuarioApiResponse,
  UpdateUsuarioResponseApi,
  UsuarioDetalleApi,
} from '../types/editarUsuario.types';

import type {
  GetUsuariosListResponse,
  UsuarioListado,
} from '../types/usuarioListado.types';

const USUARIOS_ERROR_MESSAGES = {
  list:
    'No se pudo obtener la lista de usuarios.',

  create:
    'No se pudo registrar el usuario.',

  detail:
    'No se pudo obtener el usuario.',

  update:
    'No se pudo actualizar el usuario.',
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
  const normalizedCode =
    result.code?.trim();

  const validCode =
    normalizedCode === '00' ||
    normalizedCode === '200';

  const validStatus =
    result.statusCode === 0 ||
    (result.statusCode >= 200 &&
      result.statusCode < 300);

  /*
   * HTTP 200 no basta: la API también comunica el resultado
   * de negocio mediante code. Exigir ambas señales evita
   * mostrar éxito frente a respuestas 200 con código de error.
   */
  return validCode && validStatus;
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
        cache: 'no-store',
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

const assertPositiveUsuarioId = (
  idUsuario: number
): void => {
  if (
    !Number.isInteger(idUsuario) ||
    idUsuario <= 0
  ) {
    throw new Error(
      'El identificador del usuario no es válido.'
    );
  }
};

export const fetchUsuarioById = async (
  idUsuario: number,
  signal?: AbortSignal
): Promise<UsuarioDetalleApi> => {
  assertPositiveUsuarioId(idUsuario);

  try {
    const result =
      await apiClient<
        GetUsuarioByIdApiResponse
      >(
        `${
          GESTION_USUARIOS_API_ENDPOINTS
            .getUsuarioById
        }/${idUsuario}`,
        {
          method: 'GET',
          signal,
          cache: 'no-store',
        }
      );

    if (!isSuccessfulResponse(result)) {
      throw new Error(
        result.messageUser?.trim() ||
          result.message?.trim() ||
          USUARIOS_ERROR_MESSAGES.detail
      );
    }

    const usuario = result.response;

    if (
      !usuario ||
      !Number.isInteger(
        usuario.nId_Usuario
      ) ||
      usuario.nId_Usuario <= 0
    ) {
      throw new Error(
        'El servidor no devolvió un usuario válido.'
      );
    }

    return usuario;
  } catch (error) {
    throw new Error(
      resolveUsuarioApiError(
        error,
        USUARIOS_ERROR_MESSAGES.detail
      )
    );
  }
};

export const updateUsuario = async (
  form: EditarUsuarioFormData,
  original: EditarUsuarioOriginalValues
): Promise<UpdateUsuarioResponseApi> => {
  assertPositiveUsuarioId(
    original.idUsuario
  );

  const body =
    buildUpdateUsuarioRequest(
      form,
      original
    );

  try {
    const result =
      await apiClient<
        UpdateUsuarioApiResponse
      >(
        GESTION_USUARIOS_API_ENDPOINTS
          .updateUsuario,
        {
          method: 'PUT',
          body,
        }
      );

    if (!isSuccessfulResponse(result)) {
      throw new Error(
        result.messageUser?.trim() ||
          result.message?.trim() ||
          USUARIOS_ERROR_MESSAGES.update
      );
    }

    const usuario = result.response;

    if (
      !usuario ||
      !Number.isInteger(
        usuario.nId_Usuario
      ) ||
      usuario.nId_Usuario <= 0
    ) {
      throw new Error(
        'El servidor confirmó la actualización, pero no devolvió un usuario válido.'
      );
    }

    /*
     * Un HTTP 200 solo confirma que la petición terminó. Para
     * este mantenimiento verificamos además que el GET de
     * detalle refleje lo enviado antes de cerrar el modal.
     * Así un no-op del backend deja de verse como un éxito.
     */
    const persisted =
      await fetchUsuarioById(
        original.idUsuario
      );

    const mismatches =
      getUsuarioUpdateMismatches(
        form,
        persisted
      );

    if (mismatches.length > 0) {
      throw new Error(
        `El servidor respondió correctamente, pero los cambios no se reflejaron al volver a consultar el usuario. Campos sin persistir: ${mismatches.join(', ')}.`
      );
    }

    return usuario;
  } catch (error) {
    throw new Error(
      resolveUsuarioApiError(
        error,
        USUARIOS_ERROR_MESSAGES.update
      )
    );
  }
};
