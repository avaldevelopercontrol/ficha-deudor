import { apiClient } from '@shared/api/apiClient';

import {
  unwrapApiArrayResponse,
  unwrapApiObjectResponse,
} from '../../../shared/utils/apiResponse.utils';
import {
  isCreateEmailResponse,
  isEmailApi,
  isEmailByIdApi,
  isEmailStatusApi,
  isUpdateEmailResponse,
} from './emailsApi.validators';

import {
  buildCreateEmailRequest,
  buildUpdateEmailRequest,
} from '../mappers/emailRequest.mapper';

import type {
  CreateEmailResponse,
  Email,
  EmailByIdApi,
  EmailEditFormData,
  EmailFormData,
  EmailStatus,
  UpdateEmailResponse,
} from '../types/email.types';

const BASE_EMAIL = '/v1/Email';

const EMAIL_API_ERROR_MESSAGES = {
  list: 'Error cargando emails',

  statuses:
    'Error cargando estados de email',

  create:
    'Error al crear email',

  byId:
    'Error cargando email para editar',

  update:
    'Error al actualizar email',
} as const;

export interface FetchEmailsByDeudorParams {
  idCliente: string;
  idDeudor: string;
}

export interface CreateEmailParams extends FetchEmailsByDeudorParams {
  idUsuario: string;
  data: EmailFormData;
}

export interface FetchEmailByIdParams {
  idEmail: string;
}

export interface UpdateEmailParams extends FetchEmailsByDeudorParams {
  idUsuario: string;
  idEmail: string;
  data: EmailEditFormData;
  fechaRegistroOriginal: string;
}

export async function fetchEmailsByDeudor(
  { idCliente, idDeudor }: FetchEmailsByDeudorParams,
  signal?: AbortSignal
): Promise<Email[]> {
  const params = new URLSearchParams({
    nId_Cliente: idCliente,
    nId_Persdeudor: idDeudor,
    PageNumber: '1',
    PageSize: '1000',
  });

  const result =
    await apiClient<unknown>(
      `${BASE_EMAIL}/GetEmailsByIdDeudor?${params.toString()}`,
      {
        signal,
      }
    );

  const emails = unwrapApiArrayResponse(
    result,
    EMAIL_API_ERROR_MESSAGES.list,
    isEmailApi
  );

  return emails.map((item) => ({
    id: String(item.nId_PersEmail),
    email: item.email ?? '',
    fechaActivacion:
      item.fechaActivacion ?? '',
    estado: item.estado ?? '',
    status: item.status ?? '',
    fuente: item.fuente ?? '',
    baseCliente: item.baseCliente ?? '',
    contacto: item.contacto ?? '',
    prioridad: item.prioridad ?? null,
    comentario: item.comentario ?? '',
  }));
}

export async function fetchEmailStatuses(
  signal?: AbortSignal
): Promise<EmailStatus[]> {
  const result =
    await apiClient<unknown>(
      `${BASE_EMAIL}/GetStatus`,
      {
        signal,
      }
    );

  const statuses = unwrapApiArrayResponse(
    result,
    EMAIL_API_ERROR_MESSAGES.statuses,
    isEmailStatusApi
  );

  return statuses.map((item) => ({
    id: String(
      item.nId_PersTelefOpe
    ),

    nombre:
      item.cNombre_PersTelefOpe,
  }));
}

export async function createEmail(
  { idCliente, idDeudor, idUsuario, data }: CreateEmailParams,
  signal?: AbortSignal
): Promise<CreateEmailResponse> {
  const body = buildCreateEmailRequest(
    idCliente,
    idDeudor,
    idUsuario,
    data
  );

  const result =
    await apiClient<unknown>(
      BASE_EMAIL,
      {
        method: 'POST',
        body,
        signal,
      }
    );

  return unwrapApiObjectResponse(
    result,
    EMAIL_API_ERROR_MESSAGES.create,
    isCreateEmailResponse
  );
}

export async function fetchEmailById(
  { idEmail }: FetchEmailByIdParams,
  signal?: AbortSignal
): Promise<EmailByIdApi> {
  const result =
    await apiClient<unknown>(
      `${BASE_EMAIL}/${idEmail}`,
      {
        signal,
      }
    );

  return unwrapApiObjectResponse(
    result,
    EMAIL_API_ERROR_MESSAGES.byId,
    isEmailByIdApi
  );
}

export async function updateEmail(
  {
    idCliente,
    idDeudor,
    idUsuario,
    idEmail,
    data,
    fechaRegistroOriginal,
  }: UpdateEmailParams,
  signal?: AbortSignal
): Promise<UpdateEmailResponse> {
  const body = buildUpdateEmailRequest(
    idCliente,
    idDeudor,
    idUsuario,
    idEmail,
    data,
    fechaRegistroOriginal
  );

  const result =
    await apiClient<unknown>(
      BASE_EMAIL,
      {
        method: 'PUT',
        body,
        signal,
      }
    );

  return unwrapApiObjectResponse(
    result,
    EMAIL_API_ERROR_MESSAGES.update,
    isUpdateEmailResponse
  );
}