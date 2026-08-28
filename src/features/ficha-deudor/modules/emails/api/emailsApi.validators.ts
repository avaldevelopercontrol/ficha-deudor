import {
  createObjectGuard,
  isOptionalNullableBoolean,
  isOptionalNullableInteger,
  isInteger,
  isString,
} from '../../../shared/utils/runtimeTypeGuards.utils';
import type {
  CreateEmailResponse,
  EmailApi,
  EmailByIdApi,
  EmailStatusApi,
  UpdateEmailResponse,
} from '../types/email.types';

const isOptionalNullableString = (
  value: unknown
): value is string | null | undefined => {
  return (
    value === undefined ||
    value === null ||
    isString(value)
  );
};

export const isEmailApi = createObjectGuard<EmailApi>({
  nId_PersEmail: isInteger,
  email: isOptionalNullableString,
  fechaActivacion: isOptionalNullableString,
  estado: isOptionalNullableString,
  status: isOptionalNullableString,
  fuente: isOptionalNullableString,
  baseCliente: isOptionalNullableString,
  contacto: isOptionalNullableString,
  prioridad: isOptionalNullableInteger,
  comentario: isOptionalNullableString,
});

export const isEmailStatusApi = createObjectGuard<EmailStatusApi>({
  nId_PersTelefOpe: isInteger,
  cNombre_PersTelefOpe: isString,
});

const isEmailMutationResponse = createObjectGuard<CreateEmailResponse>({
  nId_PersEmail: isInteger,
  nId_PersDeudor: isInteger,
  cPers_Email: isString,
});

export const isCreateEmailResponse = isEmailMutationResponse;

export const isUpdateEmailResponse = (
  value: unknown
): value is UpdateEmailResponse => {
  return isEmailMutationResponse(value);
};

export const isEmailByIdApi = createObjectGuard<EmailByIdApi>({
  nId_PersEmail: isInteger,
  cPers_Email: isString,
  bEstado: isOptionalNullableBoolean,
  cEmail_Coment: isString,
  cEmail_Contacto: isString,
  dFecRegistro: isString,
  nEmail_Prioridad: isInteger,
  nId_PersEmailOpe: isInteger,
});
