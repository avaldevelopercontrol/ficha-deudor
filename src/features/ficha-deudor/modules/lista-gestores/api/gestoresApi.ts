import { apiClient } from '@shared/api/apiClient';
import type { ApiResponse } from '@shared/types/indexApi';
import {
  unwrapApiArrayResponse,
} from '../../../shared/utils/apiResponse.utils';
import type {
  Gestor,
  GestorApi,
} from '../types/gestor.types';

const GESTORES_ERROR_MESSAGE =
  'Error cargando gestores';

const mapGestor = (item: GestorApi): Gestor => ({
  id: String(item.id ?? ''),
  nombre: item.nombre?.trim() ?? '',
  perfil: item.perfil?.trim() ?? '',
  login: item.login?.trim() ?? '',
  subZona: item.subZona?.trim() ?? '',
  codRecaudacion: item.codRecaudacion?.trim() ?? '',
});

export async function fetchGestoresByCliente(
  idCliente: string,
  signal?: AbortSignal
): Promise<Gestor[]> {
  const params = new URLSearchParams({
    nId_Cliente: idCliente,
    PageNumber: '1',
    PageSize: '1000',
  });

  const result = await apiClient<ApiResponse<GestorApi[]>>(
    `/v1/Usuario/GetUsuariosGrupo?${params.toString()}`,
    {
      method: 'GET',
      signal,
    }
  );

  return unwrapApiArrayResponse<GestorApi>(
    result,
    GESTORES_ERROR_MESSAGE
  ).map(mapGestor);
}
