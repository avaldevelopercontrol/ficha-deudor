import { useCallback } from 'react';
import { useApiResource } from '@shared/hooks/useApiResource';
import { fetchDeudorHeader, fetchCabeceraHeader, fetchMejorRHeader } from '../api/deudorHeaderApi';
import type { DeudorInfo, CabeceraInfo, MejorRInfo } from '../../../shared/types';

export function useCabeceraHeader(id_cliente: string, id_cartera: string) {
  const fetcher = useCallback(
    () => fetchCabeceraHeader(id_cliente, id_cartera),
    [id_cliente, id_cartera]
  );

  return useApiResource<CabeceraInfo>(fetcher, [id_cliente, id_cartera]);
}

export function useDeudorHeader(id_cliente: string, id_cartera: string, id_deudor: string) {
  const fetcher = useCallback(
    () => fetchDeudorHeader(id_cliente, id_cartera, id_deudor),
    [id_cliente, id_cartera, id_deudor]
  );

  return useApiResource<DeudorInfo>(fetcher, [id_cliente, id_cartera, id_deudor]);
}

export function useMejorRHeader(id_cliente: string, id_cartera: string, id_deudor: string) {
  const fetcher = useCallback(
    () => fetchMejorRHeader(id_cliente, id_cartera, id_deudor),
    [id_cliente, id_cartera, id_deudor]
  );

  return useApiResource<MejorRInfo>(fetcher, [id_cliente, id_cartera, id_deudor]);
}