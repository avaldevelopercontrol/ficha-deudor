import {
  apiClient,
} from '@shared/api/apiClient';

import {
  PRODUCCION_GESTOR_HOY_API_ENDPOINTS,
  PRODUCCION_GESTOR_HOY_TEXTS,
} from '../constants/produccionGestorHoy.constants';

import {
  mapProduccionGestorHoyResponse,
} from '../mappers/produccionGestorHoy.mapper';

import type {
  GetProduccionGestorHoyResponse,
  ProduccionGestorHoyRow,
} from '../types/produccionGestorHoy.types';

export async function fetchProduccionGestorHoy(
  idCliente: string,
  idUsuario: string,
  signal?: AbortSignal
): Promise<ProduccionGestorHoyRow[]> {
  if (!idCliente || !idUsuario) {
    throw new Error(
      PRODUCCION_GESTOR_HOY_TEXTS
        .missingParams
    );
  }

  const params = new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Usuario: idUsuario,
  });

  const result =
    await apiClient<GetProduccionGestorHoyResponse>(
      `${
        PRODUCCION_GESTOR_HOY_API_ENDPOINTS
          .baseGestion
      }${
        PRODUCCION_GESTOR_HOY_API_ENDPOINTS
          .getGestionToDay
      }?${params.toString()}`,
      {
        signal,
      }
    );

  if (result.statusCode !== 200) {
    throw new Error(
      result.messageUser ||
        result.message ||
        PRODUCCION_GESTOR_HOY_TEXTS
          .loadError
    );
  }

  return mapProduccionGestorHoyResponse(
    result
  );
}