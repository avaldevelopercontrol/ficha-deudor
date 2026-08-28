import { apiClient } from '@shared/api/apiClient';
import {
  unwrapApiArrayResponse,
} from '../../../shared/utils/apiResponse.utils';
import type {
  Gestor,
  GestorApi,
} from '../types/gestor.types';
import { isGestorApi } from './gestoresApi.validators';

const GESTORES_ERROR_MESSAGE =
  'Error cargando gestores';

export interface FetchGestoresByClienteParams {
  idCliente: string;
}

const mapGestor = (item: GestorApi): Gestor => ({
  id: String(item.id ?? ''),
  nombre: item.nombre?.trim() ?? '',
  perfil: item.perfil?.trim() ?? '',
  login: item.login?.trim() ?? '',
  subZona: item.subZona?.trim() ?? '',
  codRecaudacion: item.codRecaudacion?.trim() ?? '',
});

export async function fetchGestoresByCliente(
  { idCliente }: FetchGestoresByClienteParams,
  signal?: AbortSignal
): Promise<Gestor[]> {
  const params = new URLSearchParams({
    nId_Cliente: idCliente,
    PageNumber: '1',
    PageSize: '1000',
  });

  const result = await apiClient<unknown>(
    `/v1/UGrupo/GetUsuariosGrupo?${params.toString()}`,
    {
      method: 'GET',
      signal,
    }
  );

  return unwrapApiArrayResponse(
    result,
    GESTORES_ERROR_MESSAGE,
    isGestorApi
  ).map(mapGestor);
}
