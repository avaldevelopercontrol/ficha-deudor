import {
  apiClient,
} from '@shared/api/apiClient';
import {
  assertApiSuccess,
} from '@shared/api/apiResponse.utils';

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
import {
  resolveProduccionGestorHoyIdentity,
} from '../utils/produccionGestorHoyIdentity.utils';

export async function fetchProduccionGestorHoy(
  idCliente: string,
  idUsuario: string,
  signal?: AbortSignal
): Promise<ProduccionGestorHoyRow[]> {
  const identity =
    resolveProduccionGestorHoyIdentity(
      idCliente,
      idUsuario
    );

  if (!identity) {
    throw new Error(
      PRODUCCION_GESTOR_HOY_TEXTS
        .missingParams
    );
  }

  const params = new URLSearchParams({
    nId_Cliente: identity.idCliente,
    nId_Usuario: identity.idUsuario,
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

  assertApiSuccess(
    result,
    PRODUCCION_GESTOR_HOY_TEXTS.loadError
  );

  return mapProduccionGestorHoyResponse(
    result
  );
}