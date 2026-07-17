import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useAuth } from '@features/auth/contexts/authContextValue';

import { FICHA_DEUDOR_ROUTES } from '../../shared/constants/fichaDeudorRoutes.constants';
import type {
  FichaDeudorParams,
  FichaDeudorRequiredParamKey,
} from '../../shared/types/fichaDeudor.types';
import { getCurrentPeruDateTime } from '../../shared/utils/date.utils';
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

type RequiredParamName =
  FichaDeudorRequiredParamKey;

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

  return isFichaDeudorParams(
    fichaDeudorParams
  )
    ? fichaDeudorParams
    : null;
};

const getParamsFromLegacyUrl = (
  search: string
): FichaDeudorParams | null => {
  if (!search) {
    return null;
  }

  const searchParams =
    new URLSearchParams(search);

  const params: FichaDeudorParams = {
    id_cliente:
      searchParams.get('id_cliente') ?? '',
    id_cartera:
      searchParams.get('id_cartera') ?? '',
    id_deudor:
      searchParams.get('id_deudor') ?? '',
    id_contrato:
      searchParams.get('id_contrato') ?? '',
    id_usuario:
      searchParams.get('id_usuario') ?? '',
    fecha_inicio_gestion:
      searchParams.get(
        'fecha_inicio_gestion'
      ) ?? getCurrentPeruDateTime(),
  };

  return isFichaDeudorParams(params)
    ? params
    : null;
};

export function useFichaDeudorParams() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    usuario,
    clienteSeleccionada,
  } = useAuth();

  /*
   * Se genera una sola vez cuando se abre la vista.
   *
   * useState con inicialización diferida evita que la fecha
   * cambie cuando el componente vuelve a renderizar.
   */
  const [
    fechaInicioGestion,
    setFechaInicioGestion,
  ] = useState(getCurrentPeruDateTime);

  const actualizarFechaInicioGestion =
  useCallback(
    (nuevaFechaInicio: string) => {
      setFechaInicioGestion(
        nuevaFechaInicio
      );
    },
    []
  );

  const resolved =
    useMemo<ResolvedFichaDeudorParams | null>(
      () => {
        const locationStateParams =
          getParamsFromLocationState(
            location.state
          );

        if (locationStateParams) {
          return {
            params: locationStateParams,
            source: 'location-state',
          };
        }

        /*
         * Compatibilidad temporal con URLs antiguas.
         */
        const legacyUrlParams =
          getParamsFromLegacyUrl(
            location.search
          );

        if (legacyUrlParams) {
          return {
            params: legacyUrlParams,
            source: 'legacy-url',
          };
        }

        const sessionParams =
          loadFichaDeudorSession();

        if (sessionParams) {
          return {
            params: sessionParams,
            source: 'session',
          };
        }

        return null;
      },
      [
        location.search,
        location.state,
      ]
    );

  /*
   * La fecha que pudo venir desde Gestión Deudor o desde
   * sessionStorage se reemplaza por la fecha real en que
   * se abrió esta instancia de Ficha Deudor.
   */
  const params =
    useMemo<FichaDeudorParams>(() => {
      if (!resolved) {
        return EMPTY_PARAMS;
      }

      return {
        ...resolved.params,
        fecha_inicio_gestion:
          fechaInicioGestion,
      };
    }, [
      fechaInicioGestion,
      resolved,
    ]);

  const belongsToCurrentSession = Boolean(
    resolved &&
      usuario?.id_usuario ===
        params.id_usuario &&
      (!clienteSeleccionada ||
        clienteSeleccionada.id_cliente ===
          params.id_cliente)
  );

  const missingParams =
    REQUIRED_PARAMS.filter(
      (
        paramName: RequiredParamName
      ) => !params[paramName]
    );

  const hasRequiredParams =
    belongsToCurrentSession &&
    missingParams.length === 0;

  useEffect(() => {
    if (!resolved) {
      return;
    }

    if (!belongsToCurrentSession) {
      clearFichaDeudorSession();
      return;
    }

    /*
     * Se guarda también la nueva fecha de inicio,
     * no la fecha generada antes de navegar.
     */
    saveFichaDeudorSession(params);

    if (
      resolved.source === 'legacy-url'
    ) {
      navigate(
        FICHA_DEUDOR_ROUTES.FICHA_DEUDOR,
        {
          replace: true,
          state: {
            fichaDeudorParams: params,
          },
        }
      );
    }
  }, [
    belongsToCurrentSession,
    navigate,
    params,
    resolved,
  ]);

  return {
    params,
    hasRequiredParams,
    missingParams,
    actualizarFechaInicioGestion,
  };
}

export function useUrlParams(): FichaDeudorParams {
  const { params } =
    useFichaDeudorParams();

  return params;
} 