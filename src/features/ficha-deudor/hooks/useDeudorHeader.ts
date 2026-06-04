import { useCallback } from 'react';
import { useApiResource } from '../../../shared/hooks/useApiResource';
import { fetchDeudorHeader } from '../api/deudorHeaderApi';
import type { DeudorInfo } from '../../../shared/types';

export function useDeudorHeader(id_cliente: string, id_cartera: string) {
  const fetcher = useCallback(
    (signal: AbortSignal) => fetchDeudorHeader(id_cliente, id_cartera),
    [id_cliente, id_cartera]
  );

  return useApiResource<DeudorInfo>(fetcher, [id_cliente, id_cartera]);
}