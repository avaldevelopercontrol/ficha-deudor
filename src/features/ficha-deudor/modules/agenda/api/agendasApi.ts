import { apiClient } from '@shared/api/apiClient';
import {
  unwrapApiArrayResponse,
} from '../../../shared/utils/apiResponse.utils';
import type { Agenda } from '../types/agenda.types';
import { isAgendaApi } from './agendaApi.validators';

const BASE_GESTION = '/v1/Gestion';
const AGENDAS_ERROR_MESSAGE = 'Error cargando agendas';

export interface FetchAgendasByDeudorParams {
  idCliente: string;
  idCartera: string;
  idDeudor: string;
  idUsuario: string;
}

export async function fetchAgendasByDeudor(
  { idCliente, idCartera, idDeudor, idUsuario }: FetchAgendasByDeudorParams,
  signal?: AbortSignal
): Promise<Agenda[]> {
  const params = new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Cartera: idCartera,
    nId_Persdeudor: idDeudor,
    nId_PerfilUsuario: idUsuario,
    PageNumber: '1',
    PageSize: '1000',
  });

  const result = await apiClient<unknown>(
    `${BASE_GESTION}/GetGestionAgendasDeudor?${params.toString()}`,
    { signal }
  );

  const agendas = unwrapApiArrayResponse(
    result,
    AGENDAS_ERROR_MESSAGE,
    isAgendaApi
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
