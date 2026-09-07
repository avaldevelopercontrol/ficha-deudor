import {
  isPositiveIntegerValue,
  toRequiredId,
} from '@shared/utils/number.utils';

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
  requestParams: BuscarDeudoresGestionDeudorParams;
}

type PrepareGestionDeudorSearchResult =
  | {
      status: 'ready';
      request: GestionDeudorSearchRequest;
    }
  | {
      status: 'invalid';
      message: string;
    };

export const normalizeGestionDeudorClientId = (
  idCliente?: string | null
): string | null => {
  if (!isPositiveIntegerValue(idCliente)) {
    return null;
  }

  return String(
    toRequiredId(idCliente, 'idCliente')
  );
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
    'idCliente'
  );

  return {
    status: 'ready',
    request: {
      requestId,
      requestParams: {
        idCliente: String(normalizedClientId),
        busqueda: validation.busqueda,
      },
    },
  };
};
