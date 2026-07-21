import { apiClient } from '@shared/api/apiClient';

import type {
  ApiResponse,
  ApiResponseSimple,
} from '@shared/types/indexApi';

import { assertApiSuccess } from '../../../shared/utils/apiResponse.utils';

import type {
  CreateEmailRequest,
  CreateEmailResponse,
  Email,
  EmailApi,
  EmailByIdApi,
  EmailEditFormData,
  EmailFormData,
  EmailStatus,
  EmailStatusApi,
  UpdateEmailRequest,
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

  assertApiSuccess(
    result,
    EMAIL_API_ERROR_MESSAGES.list
  );

  const emails = Array.isArray(
    result.response
  )
    ? result.response
    : [];

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

  assertApiSuccess(
    result,
    EMAIL_API_ERROR_MESSAGES.statuses
  );

  const statuses = Array.isArray(
    result.response
  )
    ? result.response
    : [];

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
  const now = new Date().toISOString();

  const body: CreateEmailRequest = {
    nId_PersDeudor:
      Number(id_deudor) || 0,

    cPers_Email:
      data.email,

    bEstado:
      data.estado,

    cEmail_Coment:
      data.comentario,

    cEmail_Contacto:
      data.contacto,

    nId_Cliente:
      Number(id_cliente) || 0,

    bBaseCliente:
      false,

    nId_UsuarioAct:
      Number(id_usuario) || 0,

    dFecRegistro:
      now,

    dFecActualizacion:
      now,

    nEmail_Prioridad:
      Number(data.prioridad) || 0,

    nId_PersEmailOpe:
      Number(data.status) || 0,
  };

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

  assertApiSuccess(
    result,
    EMAIL_API_ERROR_MESSAGES.create
  );

  return result.response;
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

  assertApiSuccess(
    result,
    EMAIL_API_ERROR_MESSAGES.byId
  );

  return result.response;
}

export async function updateEmail(
  id_cliente: string,
  id_deudor: string,
  id_usuario: string,
  id_email: string,
  data: EmailEditFormData,
  dFecRegistroOriginal: string
): Promise<UpdateEmailResponse> {
  const body: UpdateEmailRequest = {
    nId_PersEmail:
      Number(id_email) || 0,

    nId_PersDeudor:
      Number(id_deudor) || 0,

    cPers_Email:
      data.email,

    bEstado:
      data.estado,

    cEmail_Coment:
      data.comentario,

    cEmail_Contacto:
      data.contacto,

    nId_Cliente:
      Number(id_cliente) || 0,

    bBaseCliente:
      false,

    nId_UsuarioAct:
      Number(id_usuario) || 0,

    dFecRegistro:
      dFecRegistroOriginal,

    dFecActualizacion:
      new Date().toISOString(),

    nEmail_Prioridad:
      Number(data.prioridad) || 0,

    nId_PersEmailOpe:
      Number(data.status) || 0,
  };

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

  assertApiSuccess(
    result,
    EMAIL_API_ERROR_MESSAGES.update
  );

  return result.response;
}