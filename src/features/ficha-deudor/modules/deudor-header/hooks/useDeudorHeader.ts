import { useCallback } from 'react';
import { useApiResource } from '@shared/hooks/useApiResource';
import { fetchDeudorHeader, fetchCabeceraHeader } from '../api/deudorHeaderApi';
import type { DeudorInfo, CabeceraInfo } from '../../../shared/types';

export function useCabeceraHeader(
  id_cliente: string,
  id_cartera: string
) {
  const fetcher = useCallback(
    (signal: AbortSignal) =>
      fetchCabeceraHeader(
        id_cliente,
        id_cartera,
        signal
      ),
    [id_cliente, id_cartera]
  );

  return useApiResource<CabeceraInfo>(
    fetcher,
    [id_cliente, id_cartera]
  );
}

export function useDeudorHeader(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string
) {
  const fetcher = useCallback(
    (signal: AbortSignal) =>
      fetchDeudorHeader(
        id_cliente,
        id_cartera,
        id_deudor,
        signal
      ),
    [id_cliente, id_cartera, id_deudor]
  );

  return useApiResource<DeudorInfo>(
    fetcher,
    [id_cliente, id_cartera, id_deudor]
  );
}