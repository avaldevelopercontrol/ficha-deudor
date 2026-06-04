import { apiClient } from '../../../shared/api/apiClient';
import { mockEstadosGestion } from '../mocks/mocks/estadosGestion';
import type { EstadoGestion, EstadoGestionCompleta } from '../../../shared/types';

export interface EstadosGestionResponse {
  resumido: EstadoGestion[];
  completo: EstadoGestionCompleta[];
}

export async function fetchEstadosGestion(
  id_deudor: string,
  id_cartera: string
): Promise<EstadosGestionResponse> {
  return apiClient<EstadosGestionResponse>(
    `/estados-gestion?id_deudor=${id_deudor}&id_cartera=${id_cartera}`,
    {
      mock: () => mockEstadosGestion[id_deudor] ?? { resumido: [], completo: [] },
    }
  );
}