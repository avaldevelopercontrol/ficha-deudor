import { useCallback } from 'react';
import { useApiResource } from '../../../shared/hooks/useApiResource';
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

const ID_CLIENTE_CLARO = '95';

export function useGestionEstados(idCliente: string) {
  const fetcher = useCallback(
    (signal: AbortSignal): Promise<GestionEstadoList[]> => {
      if (!idCliente) return Promise.resolve([]);
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
  idTipoGestion: string = '3'
) {
  const fetcher = useCallback(
    (signal: AbortSignal): Promise<GestionPaletaRespuestaList[]> => {
      if (!idCliente || !idContrato || idSupOpeCodCliOut === '') {
        return Promise.resolve([]);
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
      if (idCliente !== ID_CLIENTE_CLARO || !idCartera) {
        return Promise.resolve([]);
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
      if (idCliente !== ID_CLIENTE_CLARO || !idCartera) {
        return Promise.resolve([]);
      }

      return fetchGestionMotivoNoPago(idCliente, idCartera, signal);
    },
    [idCliente, idCartera]
  );

  return useApiResource(fetcher, [idCliente, idCartera]);
}