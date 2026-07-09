import { apiClient } from '@shared/api/apiClient';
import type {
  Gestor,
  GestorApi,
  GestoresApiResponse,
} from '../types/gestor.types';

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

  const data = await apiClient<GestoresApiResponse>(
    `/v1/Usuario/GetUsuariosGrupo?${params.toString()}`,
    {
      method: 'GET',
      signal,
    }
  );

  return Array.isArray(data.response)
    ? data.response.map(mapGestor)
    : [];
}