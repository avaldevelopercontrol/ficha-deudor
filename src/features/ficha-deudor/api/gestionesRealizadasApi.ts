import { apiClient } from '../../../shared/api/apiClient';
import { mockGestionesRealizadas } from '../mocks/mocks/gestionesRealizadas';
import type { GestionRealizada, GestionCompleta } from '../../../shared/types';

export interface GestionesResponse {
  resumido: GestionRealizada[];
  completo: GestionCompleta[];
}

export async function fetchGestionesRealizadas(
  id_deudor: string,
  id_cartera: string
): Promise<GestionesResponse> {
  return apiClient<GestionesResponse>(
    `/gestiones-realizadas?id_deudor=${id_deudor}&id_cartera=${id_cartera}`,
    {
      mock: () => mockGestionesRealizadas[id_deudor] ?? { resumido: [], completo: [] },
    }
  );
}