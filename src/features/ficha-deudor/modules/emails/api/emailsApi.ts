import { apiClient } from '@shared/api/apiClient';

import type {
  ApiResponse,
  ApiResponseSimple,
} from '@shared/types/indexApi';

import {
  unwrapApiArrayResponse,
  unwrapApiObjectResponse,
} from '../../../shared/utils/apiResponse.utils';

import {
  buildCreateEmailRequest,
  buildUpdateEmailRequest,
} from '../mappers/emailRequest.mapper';

import type {
  CreateEmailResponse,
  Email,
  EmailApi,
  EmailByIdApi,
  EmailEditFormData,
  EmailFormData,
  EmailStatus,
  EmailStatusApi,
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

export async function fetchEmailsByDeudor(
  id_cliente: string,
  id_deudor: string,
  signal?: AbortSignal
): Promise<Email[]> {
  const params = new URLSearchParams({
    nId_Cliente: id_cliente,
    nId_Persdeudor: id_deudor,
    PageNumber: '1',
    PageSize: '1000',
  });

  const result =
    await apiClient<
      ApiResponse<EmailApi[]>
    >(
      `${BASE_EMAIL}/GetEmailsByIdDeudor?${params.toString()}`,
      {
        signal,
      }
    );

  const emails = unwrapApiArrayResponse<EmailApi>(
    result,
    EMAIL_API_ERROR_MESSAGES.list
  );

  return emails.map((item) => ({
    id: String(item.nId_PersEmail),
    email: item.email,
    fechaActivacion:
      item.fechaActivacion,
    estado: item.estado,
    status: item.status,
    fuente: item.fuente,
    baseCliente: item.baseCliente,
    contacto: item.contacto,
    prioridad: item.prioridad,
    comentario: item.comentario,
  }));
}

export async function fetchEmailStatuses(
  signal?: AbortSignal
): Promise<EmailStatus[]> {
  const result =
    await apiClient<
      ApiResponseSimple<
        EmailStatusApi[]
      >
    >(
      `${BASE_EMAIL}/GetStatus`,
      {
        signal,
      }
    );

  const statuses = unwrapApiArrayResponse<EmailStatusApi>(
    result,
    EMAIL_API_ERROR_MESSAGES.statuses
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
  id_cliente: string,
  id_deudor: string,
  id_usuario: string,
  data: EmailFormData
): Promise<CreateEmailResponse> {
  const body = buildCreateEmailRequest(
    id_cliente,
    id_deudor,
    id_usuario,
    data
  );

  const result =
    await apiClient<
      ApiResponse<CreateEmailResponse>
    >(
      BASE_EMAIL,
      {
        method: 'POST',
        body,
      }
    );

  return unwrapApiObjectResponse<CreateEmailResponse>(
    result,
    EMAIL_API_ERROR_MESSAGES.create
  );
}

export async function fetchEmailById(
  idEmail: string,
  signal?: AbortSignal
): Promise<EmailByIdApi> {
  const result =
    await apiClient<
      ApiResponse<EmailByIdApi>
    >(
      `${BASE_EMAIL}/${idEmail}`,
      {
        signal,
      }
    );

  return unwrapApiObjectResponse<EmailByIdApi>(
    result,
    EMAIL_API_ERROR_MESSAGES.byId
  );
}

export async function updateEmail(
  id_cliente: string,
  id_deudor: string,
  id_usuario: string,
  id_email: string,
  data: EmailEditFormData,
  dFecRegistroOriginal: string
): Promise<UpdateEmailResponse> {
  const body = buildUpdateEmailRequest(
    id_cliente,
    id_deudor,
    id_usuario,
    id_email,
    data,
    dFecRegistroOriginal
  );

  const result =
    await apiClient<
      ApiResponse<UpdateEmailResponse>
    >(
      BASE_EMAIL,
      {
        method: 'PUT',
        body,
      }
    );

  return unwrapApiObjectResponse<UpdateEmailResponse>(
    result,
    EMAIL_API_ERROR_MESSAGES.update
  );
}