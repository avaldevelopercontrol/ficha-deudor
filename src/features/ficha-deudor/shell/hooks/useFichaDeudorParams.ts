import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@features/auth/contexts/authContextValue';

import { FICHA_DEUDOR_ROUTES } from '../../shared/constants/fichaDeudorRoutes.constants';
import type {
  FichaDeudorParams,
  FichaDeudorRequiredParamKey,
} from '../../shared/types/fichaDeudor.types';
import {
  clearFichaDeudorSession,
  isFichaDeudorParams,
  loadFichaDeudorSession,
  saveFichaDeudorSession,
} from '../../shared/utils/fichaDeudorSession.utils';

const REQUIRED_PARAMS = [
  'id_cliente',
  'id_cartera',
  'id_deudor',
  'id_contrato',
  'id_usuario',
] as const;

type RequiredParamName = FichaDeudorRequiredParamKey;

type FichaDeudorParamsSource =
  | 'location-state'
  | 'session'
  | 'legacy-url';

interface ResolvedFichaDeudorParams {
  params: FichaDeudorParams;
  source: FichaDeudorParamsSource;
}

const EMPTY_PARAMS: FichaDeudorParams = {
  id_cliente: '',
  id_cartera: '',
  id_deudor: '',
  id_contrato: '',
  id_usuario: '',
  fecha_inicio_gestion: '',
};

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
  search: string
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
      new Date().toISOString(),
  };

  return isFichaDeudorParams(params) ? params : null;
};

export function useFichaDeudorParams() {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, clienteSeleccionada } = useAuth();

  const resolved = useMemo<ResolvedFichaDeudorParams | null>(() => {
    const locationStateParams = getParamsFromLocationState(
      location.state
    );

    if (locationStateParams) {
      return {
        params: locationStateParams,
        source: 'location-state',
      };
    }

    /*
     * Compatibilidad temporal con las URLs antiguas.
     * La URL se limpiará posteriormente mediante navigate(..., replace).
     */
    const legacyUrlParams = getParamsFromLegacyUrl(location.search);

    if (legacyUrlParams) {
      return {
        params: legacyUrlParams,
        source: 'legacy-url',
      };
    }

    const sessionParams = loadFichaDeudorSession();

    if (sessionParams) {
      return {
        params: sessionParams,
        source: 'session',
      };
    }

    return null;
  }, [location.search, location.state]);

  const params = resolved?.params ?? EMPTY_PARAMS;

  const belongsToCurrentSession = Boolean(
    resolved &&
      usuario?.id_usuario === params.id_usuario &&
      (!clienteSeleccionada ||
        clienteSeleccionada.id_cliente === params.id_cliente)
  );

  const missingParams = REQUIRED_PARAMS.filter(
    (paramName: RequiredParamName) => !params[paramName]
  );

  const hasRequiredParams =
    belongsToCurrentSession && missingParams.length === 0;

  useEffect(() => {
    if (!resolved) {
      return;
    }

    /*
     * Impide reutilizar una ficha almacenada por otro usuario
     * o correspondiente a otro cliente.
     */
    if (!belongsToCurrentSession) {
      clearFichaDeudorSession();
      return;
    }

    saveFichaDeudorSession(resolved.params);

    /*
     * Cuando se recibe una URL antigua con parámetros,
     * reemplaza esa entrada por la URL limpia.
     */
    if (resolved.source === 'legacy-url') {
      navigate(FICHA_DEUDOR_ROUTES.FICHA_DEUDOR, {
        replace: true,
        state: {
          fichaDeudorParams: resolved.params,
        },
      });
    }
  }, [belongsToCurrentSession, navigate, resolved]);

  return {
    params,
    hasRequiredParams,
    missingParams,
  };
}

export function useUrlParams(): FichaDeudorParams {
  const { params } = useFichaDeudorParams();

  return params;
}