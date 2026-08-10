import { toRequiredId } from '@shared/utils/number.utils';

import { GESTION_DEUDOR_API_DEFAULTS } from '../constants/gestionDeudorApi.constants';
import type {
  BuscarDeudoresGestionDeudorParams,
  TipoBusquedaGestionDeudor,
} from '../types/gestionDeudor.types';
import { validateGestionDeudorSearch } from '../validations/validations';

interface PrepareGestionDeudorSearchParams {
  idCliente?: string | null;
  tipoBusqueda: TipoBusquedaGestionDeudor;
  valorBusqueda: string;
  requestId: number;
}

export interface GestionDeudorSearchRequest {
  requestId: number;
  apiParams: BuscarDeudoresGestionDeudorParams;
}

export type PrepareGestionDeudorSearchResult =
  | {
      status: 'ready';
      request: GestionDeudorSearchRequest;
    }
  | {
      status: 'invalid';
      message: string;
    };

export const prepareGestionDeudorSearch = ({
  idCliente,
  tipoBusqueda,
  valorBusqueda,
  requestId,
}: PrepareGestionDeudorSearchParams): PrepareGestionDeudorSearchResult => {
  const validation = validateGestionDeudorSearch({
    idCliente,
    tipoBusqueda,
    valorBusqueda,
  });

  if (!validation.isValid) {
    return {
      status: 'invalid',
      message:
        validation.message ??
        'Datos de búsqueda inválidos.',
    };
  }

  const normalizedClientId = toRequiredId(
    idCliente,
    'nId_Cliente'
  );

  return {
    status: 'ready',
    request: {
      requestId,
      apiParams: {
        nIdCliente: String(normalizedClientId),
        busqueda: validation.busqueda,
        pageNumber:
          GESTION_DEUDOR_API_DEFAULTS.pageNumber,
        pageSize:
          GESTION_DEUDOR_API_DEFAULTS.pageSize,
      },
    },
  };
};
