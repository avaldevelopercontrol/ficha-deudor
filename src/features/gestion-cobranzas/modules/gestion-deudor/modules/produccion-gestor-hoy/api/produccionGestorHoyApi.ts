import {
  apiClient,
} from '@shared/api/apiClient';
import {
  assertApiSuccess,
} from '@shared/api/apiResponse.utils';

import {
  parseGestionDeudorApiEnvelope,
} from '../../../api/gestionDeudorApiBoundary';
import type {
  GestionDeudorIdentity,
} from '../../../utils/gestionDeudorIdentity.utils';
import {
  resolveGestionDeudorIdentity,
} from '../../../utils/gestionDeudorIdentity.utils';
import {
  PRODUCCION_GESTOR_HOY_API_ENDPOINTS,
  PRODUCCION_GESTOR_HOY_TEXTS,
} from '../constants/produccionGestorHoy.constants';
import {
  mapProduccionGestorHoyResponse,
} from '../mappers/produccionGestorHoy.mapper';
import type {
  ProduccionGestorHoyRow,
} from '../types/produccionGestorHoy.types';

export async function fetchProduccionGestorHoy(
  identityInput: GestionDeudorIdentity,
  signal?: AbortSignal
): Promise<ProduccionGestorHoyRow[]> {
  const identity =
    resolveGestionDeudorIdentity(
      identityInput?.idCliente,
      identityInput?.idUsuario
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
    parseGestionDeudorApiEnvelope(
      await apiClient<unknown>(
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
      ),
      PRODUCCION_GESTOR_HOY_TEXTS.loadError
    );

  assertApiSuccess(
    result,
    PRODUCCION_GESTOR_HOY_TEXTS.loadError
  );

  return mapProduccionGestorHoyResponse(
    result.response
  );
}
