import {
  createObjectGuard,
  isInteger,
  isString,
} from '../../../shared/utils/runtimeTypeGuards.utils';
import type { AgendaApi } from '../types/agenda.types';

export const isAgendaApi = createObjectGuard<AgendaApi>({
  nid_agenda: isInteger,
  fechaNuevaGestion: isString,
  tiempoVencido: isString,
  cartera: isString,
  deudor: isString,
  respuestaOEstado: isString,
  usuario: isString,
});
