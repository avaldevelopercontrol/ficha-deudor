import type {
  TelefonoEditarApi,
  TelefonoFormData,
} from '../types/telefono.types';
import {
  toBooleanValue,
  toNumberValue,
  toStringValue,
} from '@shared/utils/formValueMappers';

const toSelectValue = (value: unknown): string => {
  const parsedValue = toNumberValue(value);

  return parsedValue > 0 ? toStringValue(parsedValue) : '';
};

export const mapTelefonoEditarApiToFormData = (
  api: TelefonoEditarApi
): TelefonoFormData => ({
  id: toNumberValue(api.nId_PersTelef),
  numero: toStringValue(api.nTelef_Nro),
  anexo: toStringValue(api.nTelef_Anexo),
  resultado: toSelectValue(api.nId_PersTelefOpe),
  operadorTelefonico: toSelectValue(api.nId_OperadorTelefonico),
  ubicacion: toSelectValue(api.nId_PersRefUbi),
  prioridad: toSelectValue(api.nTelef_Prioridad),
  horarioGestion: toSelectValue(api.nId_PersDeudorGestionHrs),
  comentario: toStringValue(api.cTelef_Coment),
  fuenteBusqueda: toSelectValue(api.nId_Fuente),
  referencia: toNumberValue(api.nreferencia),
  reclamoIndecopi: toBooleanValue(api.bReclamo),
  bEstado: toBooleanValue(api.bEstado),
  dFecCarga_PersTelef: toStringValue(api.dFecCarga_PersTelef),
});