import { apiClient } from '@shared/api/apiClient';

import { DOCUMENTOS_ERROR_MESSAGES } from '../constants/documentos.constants';
import { DOCUMENTOS_API_ENDPOINTS } from '../constants/documentosApi.constants';
import { mapGestionBotones } from '../mappers/gestionBotones.mapper';
import type { GestionBoton } from '../types/gestionBoton.types';
import { buildDocumentosBotonesParams } from '../utils/documentosParams.utils';
import { unwrapApiArrayResponse } from '../../../shared/utils/apiResponse.utils';
import { isGestionBotonApi } from './gestionBotonesApi.validators';

interface FetchGestionBotonesParams {
  idCliente: string;
  idContrato: string;
}

export async function fetchGestionBotones(
  { idCliente, idContrato }: FetchGestionBotonesParams,
  signal?: AbortSignal
): Promise<GestionBoton[]> {
  const params = buildDocumentosBotonesParams({
    idCliente,
    idContrato,
  });

  const result = await apiClient<unknown>(
    `${DOCUMENTOS_API_ENDPOINTS.BOTONES}?${params.toString()}`,
    { signal }
  );

  const botones = unwrapApiArrayResponse(
    result,
    DOCUMENTOS_ERROR_MESSAGES.BUTTONS,
    isGestionBotonApi
  );

  return mapGestionBotones(botones);
}
