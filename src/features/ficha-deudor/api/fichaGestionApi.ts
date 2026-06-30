import { apiClient } from '../../../shared/api/apiClient';
import type {
  GestionEstadoApi,
  GestionEstadoList,
  GestionTipoApi,
  GestionTipoList,
} from '../../../shared/types';
import type {
  ApiResponse
} from '../../../shared/types/indexApi';

const BASE_GESTION = '/v1/Gestion';

export async function fetchGestionEstados(
  idCliente: string,
  signal?: AbortSignal
): Promise<GestionEstadoList[]> {
  const params = new URLSearchParams({
    nId_Cliente: idCliente,
  });

  const result = await apiClient<ApiResponse<GestionEstadoApi[]>>(
    `${BASE_GESTION}/GetGestionEstadoGestion?${params.toString()}`,
    { signal }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando estados de gestión');
  }

  return result.response.map((item) => ({
    id: String(item.nId_OpeCodCliOut),
    nombre: item.cNombre_OpeCodCliOut,
  }));
}

export async function fetchGestionTipos(signal?: AbortSignal): Promise<GestionTipoList[]> {
  const result = await apiClient<ApiResponse<GestionTipoApi[]>>(
    `${BASE_GESTION}/GetGestionTipoGestion`,
    { signal }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando tipos de gestión');
  }

  return result.response.map((item) => ({
    id: String(item.nId_TipoGestion),
    nombre: item.cNomTipoGestion,
  }));
}