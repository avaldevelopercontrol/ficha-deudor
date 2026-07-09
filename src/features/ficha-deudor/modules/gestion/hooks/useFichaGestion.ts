import { useCallback } from 'react';
import { useApiResource } from '@shared/hooks/useApiResource';
import {
  fetchGestionEstados,
  fetchGestionTipos,
  fetchGestionPaletaRespuesta,
  fetchGestionEstadoGestionClaro,
  fetchGestionMotivoNoPago,
} from '../api/fichaGestionApi';
import type {
  GestionEstadoList,
  GestionTipoList,
  GestionPaletaRespuestaList,
  GestionEstadoClaroList,
  GestionMotivoNoPagoList,
} from '../../../shared/types';
import {
  CLIENTE_CLARO_ID,
  TIPO_GESTION_PALETA,
} from '../constants/fichaGestion.constants';

const resolveEmptyList = <T>() => Promise.resolve<T[]>([]);

const hasValue = (value: string | number | null | undefined) => {
  return String(value ?? '').trim() !== '';
};

const hasRequiredValues = (
  ...values: Array<string | number | null | undefined>
) => {
  return values.every(hasValue);
};

const isClienteClaro = (idCliente: string) => {
  return String(idCliente) === CLIENTE_CLARO_ID;
};

export function useGestionEstados(idCliente: string) {
  const fetcher = useCallback(
    (signal: AbortSignal): Promise<GestionEstadoList[]> => {
      if (!hasRequiredValues(idCliente)) {
        return resolveEmptyList<GestionEstadoList>();
      }

      return fetchGestionEstados(idCliente, signal);
    },
    [idCliente]
  );

  return useApiResource(fetcher, [idCliente]);
}

export function useGestionTipos() {
  const fetcher = useCallback(
    (signal: AbortSignal): Promise<GestionTipoList[]> =>
      fetchGestionTipos(signal),
    []
  );

  return useApiResource(fetcher, []);
}

export function useGestionPaletaRespuesta(
  idCliente: string,
  idContrato: string,
  nivelPaleta: number,
  idSupOpeCodCliOut: string,
  idTipoGestion: string = TIPO_GESTION_PALETA
) {
  const fetcher = useCallback(
    (signal: AbortSignal): Promise<GestionPaletaRespuestaList[]> => {
      if (!hasRequiredValues(idCliente, idContrato, idSupOpeCodCliOut)) {
        return resolveEmptyList<GestionPaletaRespuestaList>();
      }

      return fetchGestionPaletaRespuesta(
        {
          idCliente,
          idContrato,
          nivelPaleta,
          idSupOpeCodCliOut,
          idTipoGestion,
        },
        signal
      );
    },
    [idCliente, idContrato, nivelPaleta, idSupOpeCodCliOut, idTipoGestion]
  );

  return useApiResource(fetcher, [
    idCliente,
    idContrato,
    nivelPaleta,
    idSupOpeCodCliOut,
    idTipoGestion,
  ]);
}

export function useGestionEstadoGestionClaro(
  idCliente: string,
  idCartera: string
) {
  const fetcher = useCallback(
    (signal: AbortSignal): Promise<GestionEstadoClaroList[]> => {
      if (!isClienteClaro(idCliente) || !hasRequiredValues(idCartera)) {
        return resolveEmptyList<GestionEstadoClaroList>();
      }

      return fetchGestionEstadoGestionClaro(idCliente, idCartera, signal);
    },
    [idCliente, idCartera]
  );

  return useApiResource(fetcher, [idCliente, idCartera]);
}

export function useGestionMotivoNoPago(
  idCliente: string,
  idCartera: string
) {
  const fetcher = useCallback(
    (signal: AbortSignal): Promise<GestionMotivoNoPagoList[]> => {
      if (!isClienteClaro(idCliente) || !hasRequiredValues(idCartera)) {
        return resolveEmptyList<GestionMotivoNoPagoList>();
      }

      return fetchGestionMotivoNoPago(idCliente, idCartera, signal);
    },
    [idCliente, idCartera]
  );

  return useApiResource(fetcher, [idCliente, idCartera]);
}