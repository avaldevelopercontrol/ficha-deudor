import { apiClient } from '@shared/api/apiClient';
import type { ApiResponse } from '@shared/types/indexApi';
import {
  unwrapApiArrayResponse,
} from '../../../shared/utils/apiResponse.utils';
import type { Agenda, AgendaApi } from '../types/agenda.types';

const BASE_GESTION = '/v1/Gestion';
const AGENDAS_ERROR_MESSAGE = 'Error cargando agendas';

export async function fetchAgendasByDeudor(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  id_usuario: string,
  signal?: AbortSignal
): Promise<Agenda[]> {
  const params = new URLSearchParams({
    nId_Cliente: id_cliente,
    nId_Cartera: id_cartera,
    nId_Persdeudor: id_deudor,
    nId_PerfilUsuario: id_usuario,
    PageNumber: '1',
    PageSize: '1000',
  });

  const result = await apiClient<ApiResponse<AgendaApi[]>>(
    `${BASE_GESTION}/GetGestionAgendasDeudor?${params.toString()}`,
    { signal }
  );

  const agendas = unwrapApiArrayResponse<AgendaApi>(
    result,
    AGENDAS_ERROR_MESSAGE
  );

  return agendas.map((item) => ({
    id: String(item.nid_agenda),
    fechaNuevaGestion: item.fechaNuevaGestion,
    tiempoVencido: item.tiempoVencido || '—',
    cartera: item.cartera || '—',
    deudor: item.deudor || '—',
    respuestaOEstado: item.respuestaOEstado || '—',
    usuario: item.usuario || '—',
  }));
}
