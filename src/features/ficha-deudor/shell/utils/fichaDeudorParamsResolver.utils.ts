import type { FichaDeudorParams } from '../../shared/types/fichaDeudor.types';
import { isFichaDeudorParams } from '../../shared/utils/fichaDeudorSession.utils';

export type FichaDeudorParamsSource =
  | 'location-state'
  | 'legacy-url'
  | 'session';

export interface ResolvedFichaDeudorParams {
  params: FichaDeudorParams;
  source: FichaDeudorParamsSource;
}

interface ResolveFichaDeudorParamsOptions {
  locationState: unknown;
  search: string;
  sessionParams: FichaDeudorParams | null;
  defaultFechaInicioGestion: string;
}

const getParamsFromLocationState = (
  state: unknown
): FichaDeudorParams | null => {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const fichaDeudorParams = (
    state as {
      fichaDeudorParams?: unknown;
    }
  ).fichaDeudorParams;

  return isFichaDeudorParams(fichaDeudorParams)
    ? fichaDeudorParams
    : null;
};

const getParamsFromLegacyUrl = (
  search: string,
  defaultFechaInicioGestion: string
): FichaDeudorParams | null => {
  if (!search) {
    return null;
  }

  const searchParams = new URLSearchParams(search);

  const params: FichaDeudorParams = {
    id_cliente: searchParams.get('id_cliente') ?? '',
    id_cartera: searchParams.get('id_cartera') ?? '',
    id_deudor: searchParams.get('id_deudor') ?? '',
    id_contrato: searchParams.get('id_contrato') ?? '',
    id_usuario: searchParams.get('id_usuario') ?? '',
    fecha_inicio_gestion:
      searchParams.get('fecha_inicio_gestion') ??
      defaultFechaInicioGestion,
  };

  return isFichaDeudorParams(params) ? params : null;
};

export const resolveFichaDeudorParams = ({
  locationState,
  search,
  sessionParams,
  defaultFechaInicioGestion,
}: ResolveFichaDeudorParamsOptions): ResolvedFichaDeudorParams | null => {
  const locationStateParams = getParamsFromLocationState(locationState);

  if (locationStateParams) {
    return {
      params: locationStateParams,
      source: 'location-state',
    };
  }

  const legacyUrlParams = getParamsFromLegacyUrl(
    search,
    defaultFechaInicioGestion
  );

  if (legacyUrlParams) {
    return {
      params: legacyUrlParams,
      source: 'legacy-url',
    };
  }

  if (sessionParams && isFichaDeudorParams(sessionParams)) {
    return {
      params: sessionParams,
      source: 'session',
    };
  }

  return null;
};
