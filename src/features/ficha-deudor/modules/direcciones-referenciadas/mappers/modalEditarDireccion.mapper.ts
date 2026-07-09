import type {
  DireccionByIdApi,
  DireccionEditFormData,
} from '../types/direccion.types';
import {
  toBooleanValue,
  toNumberValue,
  toStringValue,
} from '@shared/utils/formValueMappers';

const toSelectIdValue = (value: unknown): string => {
  return toNumberValue(value) ? toStringValue(value) : '';
};

export const mapDireccionByIdApiToEditFormData = (
  entity: DireccionByIdApi
): DireccionEditFormData => ({
  id: toStringValue(entity.nId_PersDirecc),
  direccion: toStringValue(entity.cDirecc_Nomb),
  departamento: toSelectIdValue(entity.nId_Departamento),
  provincia: toSelectIdValue(entity.nId_Provincia),
  distrito: toSelectIdValue(entity.nId_Distrito),
  refUbicacion: toSelectIdValue(entity.nId_PersRefUbi),
  comentario: toStringValue(entity.cDirecc_Coment),
  llegoDeBase: toBooleanValue(entity.bOrigen_Base),
  tipoDeudor: toStringValue(entity.cTipoCoDeudor),
  nombreAval: toStringValue(entity.nombreAval),
  estado:
    entity.bEstado === null || entity.bEstado === undefined
      ? true
      : toBooleanValue(entity.bEstado),
});