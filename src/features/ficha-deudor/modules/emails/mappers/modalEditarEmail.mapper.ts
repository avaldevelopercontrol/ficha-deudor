import type {
  EmailByIdApi,
  EmailEditFormData,
} from '../types/email.types';
import {
  toBooleanValue,
  toNumberValue,
  toStringValue,
} from '@shared/utils/formValueMappers';

const toSelectValue = (value: unknown): string => {
  const parsedValue = toNumberValue(value);

  return parsedValue ? toStringValue(value) : '';
};

export const mapEmailByIdApiToEditFormData = (
  api: EmailByIdApi
): EmailEditFormData => ({
  id: toStringValue(api.nId_PersEmail),
  email: toStringValue(api.cPers_Email),
  contacto: toStringValue(api.cEmail_Contacto),
  comentario: toStringValue(api.cEmail_Coment),
  prioridad: toSelectValue(api.nEmail_Prioridad),
  estado:
    api.bEstado === null || api.bEstado === undefined
      ? true
      : toBooleanValue(api.bEstado),
  status: toSelectValue(api.nId_PersEmailOpe),
  dFecRegistro: toStringValue(api.dFecRegistro),
});