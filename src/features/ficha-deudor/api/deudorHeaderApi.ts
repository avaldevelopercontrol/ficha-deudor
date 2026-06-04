import { apiClient } from '../../../shared/api/apiClient';
import { mockDeudorHeader } from '../mocks/mocks/deudorHeaderMock';
import type { DeudorInfo } from '../../../shared/types';

export async function fetchDeudorHeader(
  id_cliente: string,
  id_cartera: string
): Promise<DeudorInfo> {
  return apiClient<DeudorInfo>(
    `/deudor-header?id_cliente=${id_cliente}&id_cartera=${id_cartera}`,
    {
      mock: () => mockDeudorHeader[id_cliente] ?? mockDeudorHeader['default'],
    }
  );
}