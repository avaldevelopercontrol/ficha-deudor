import { apiClient } from '@shared/api/apiClient';

import { GESTION_USUARIOS_API_ENDPOINTS } from '../constants/gestionUsuariosRoutes.constants';
import { mapUsuariosListadoResponse } from '../mappers/usuarioListado.mapper';
import type {
  GetUsuariosListResponse,
  UsuarioListado,
} from '../types/usuarioListado.types';

export const fetchUsuariosList = async (
  signal?: AbortSignal
): Promise<UsuarioListado[]> => {
  const result =
    await apiClient<GetUsuariosListResponse>(
      GESTION_USUARIOS_API_ENDPOINTS.getUsuariosList,
      {
        method: 'GET',
        signal,
        headers: {
          Accept: 'application/json',
        },
      }
    );

  const isSuccessfulResponse =
    result.statusCode === 200 ||
    result.code === '200';

  if (!isSuccessfulResponse) {
    throw new Error(
      result.messageUser?.trim() ||
        result.message?.trim() ||
        'No se pudo obtener la lista de usuarios.'
    );
  }

  return mapUsuariosListadoResponse(
    result.response
  );
};