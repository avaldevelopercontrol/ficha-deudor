import { apiClient } from '@shared/api/apiClient';
import type { Agenda, AgendaListResponse } from '../types/agenda.types';

const BASE_GESTION = '/v1/Gestion';

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

  const result = await apiClient<AgendaListResponse>(
    `${BASE_GESTION}/GetGestionAgendasDeudor?${params.toString()}`,
    { signal }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando agendas');
  }

  return result.response.map((item) => ({
    id: String(item.nid_agenda),
    fechaNuevaGestion: item.fechaNuevaGestion,
    tiempoVencido: item.tiempoVencido || '—',
    cartera: item.cartera || '—',
    deudor: item.deudor || '—',
    respuestaOEstado: item.respuestaOEstado || '—',
    usuario: item.usuario || '—',
  }));
}