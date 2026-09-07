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

import { useAuth } from '@features/auth/hooks/useAuth';

import { FICHA_DEUDOR_ROUTES } from '../../shared/constants/fichaDeudorRoutes.constants';
import type { FichaDeudorParams } from '../../shared/types/fichaDeudor.types';
import { getCurrentPeruDateTime } from '../../shared/utils/date.utils';
import {
  clearFichaDeudorSession,
  readFichaDeudorSession,
  saveFichaDeudorSession,
} from '../../shared/utils/fichaDeudorSession.utils';
import { resolveFichaDeudorParams } from '../utils/fichaDeudorParamsResolver.utils';

const EMPTY_PARAMS: FichaDeudorParams = {
  id_cliente: '',
  id_cartera: '',
  id_deudor: '',
  id_contrato: '',
  id_usuario: '',
  fecha_inicio_gestion: '',
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

  /*
   * La lectura es deliberadamente libre de mutaciones. Si el
   * contenido de storage es inválido, la limpieza se realiza
   * posteriormente desde un efecto.
   */
  const [sessionReadResult] = useState(
    readFichaDeudorSession
  );

  const resolved = useMemo(
    () =>
      resolveFichaDeudorParams({
        locationState: location.state,
        search: location.search,
        sessionParams:
          sessionReadResult.params,
        defaultFechaInicioGestion:
          fechaInicioGestion,
      }),
    [
      fechaInicioGestion,
      location.search,
      location.state,
      sessionReadResult.params,
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
      clienteSeleccionada?.id_cliente ===
        params.id_cliente
  );

  const hasRequiredParams = Boolean(
    resolved && belongsToCurrentSession
  );

  useEffect(() => {
    if (
      sessionReadResult.status ===
      'invalid'
    ) {
      clearFichaDeudorSession();
    }
  }, [sessionReadResult.status]);

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
  }, [
    belongsToCurrentSession,
    params,
    resolved,
  ]);

  useEffect(() => {
    if (
      !belongsToCurrentSession ||
      resolved?.source !== 'legacy-url'
    ) {
      return;
    }

    navigate(
      FICHA_DEUDOR_ROUTES.FICHA_DEUDOR,
      {
        replace: true,
        state: {
          fichaDeudorParams: params,
        },
      }
    );
  }, [
    belongsToCurrentSession,
    navigate,
    params,
    resolved?.source,
  ]);

  return {
    params,
    hasRequiredParams,
    actualizarFechaInicioGestion,
  };
}
