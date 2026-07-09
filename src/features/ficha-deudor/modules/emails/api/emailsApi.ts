import { apiClient } from '@shared/api/apiClient';
import type { ApiResponseSimple } from '@shared/types/indexApi';

import type {
  EmailApi,
  Email,
  EmailStatusApi,
  EmailStatus,
  CreateEmailRequest,
  CreateEmailResponse,
  EmailFormData,
  EmailEditFormData,
  UpdateEmailResponse,
  UpdateEmailRequest,
  EmailByIdApi,
} from '../types/email.types';

import type {
  ApiResponse
} from '@shared/types/indexApi';

const BASE_EMAIL = '/v1/Email';

// ─── GET: Lista de emails (ya existente) ───
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

  const result = await apiClient<ApiResponse<EmailApi[]>>(
    `${BASE_EMAIL}/GetEmailsByIdDeudor?${params.toString()}`,
    { signal }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando emails');
  }

  return result.response.map((item) => ({
    id: String(item.nId_PersEmail),
    email: item.email,
    fechaActivacion: item.fechaActivacion,
    estado: item.estado,
    status: item.status,
    fuente: item.fuente,
    baseCliente: item.baseCliente,
    contacto: item.contacto,
    prioridad: item.prioridad,
    comentario: item.comentario,
  }));
}

// ─── GET: Status de email ───
export async function fetchEmailStatuses(signal?: AbortSignal): Promise<EmailStatus[]> {
  const result = await apiClient<ApiResponseSimple<EmailStatusApi[]>>(
    `${BASE_EMAIL}/GetStatus`,
    { signal }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando estados de email');
  }

  return result.response.map((item) => ({
    id: String(item.nId_PersTelefOpe),
    nombre: item.cNombre_PersTelefOpe,
  }));
}

// ─── POST: Crear email ───
export async function createEmail(
  id_cliente: string,
  id_deudor: string,
  id_usuario: string,
  data: EmailFormData
): Promise<CreateEmailResponse> {
  const body: CreateEmailRequest = {
    nId_PersDeudor: Number(id_deudor) || 0,
    cPers_Email: data.email,
    bEstado: data.estado,
    cEmail_Coment: data.comentario,
    cEmail_Contacto: data.contacto,
    nId_Cliente: Number(id_cliente) || 0,
    bBaseCliente: false,
    nId_UsuarioAct: Number(id_usuario) || 0,
    dFecRegistro: new Date().toISOString(),
    dFecActualizacion: new Date().toISOString(),
    nEmail_Prioridad: Number(data.prioridad) || 0,
    nId_PersEmailOpe: Number(data.status) || 0,
  };

  const result = await apiClient<ApiResponse<CreateEmailResponse>>(
    `${BASE_EMAIL}`,
    {
      method: 'POST',
      body,
    }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error al crear email');
  }

  return result.response;
}

// ─── GET: Email por ID ───
export async function fetchEmailById(
  idEmail: string,
  signal?: AbortSignal
): Promise<EmailByIdApi> {
  const result = await apiClient<ApiResponse<EmailByIdApi>>(
    `${BASE_EMAIL}/${idEmail}`,
    { signal }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando email para editar');
  }

  return result.response;
}

// ─── PUT: Actualizar email ───
export async function updateEmail(
  id_cliente: string,
  id_deudor: string,
  id_usuario: string,
  id_email: string,
  data: EmailEditFormData,
  dFecRegistroOriginal: string  // ← Nuevo parámetro
): Promise<UpdateEmailResponse> {
  const body: UpdateEmailRequest = {
    nId_PersEmail: Number(id_email) || 0,
    nId_PersDeudor: Number(id_deudor) || 0,
    cPers_Email: data.email,
    bEstado: data.estado,
    cEmail_Coment: data.comentario,
    cEmail_Contacto: data.contacto,
    nId_Cliente: Number(id_cliente) || 0,
    bBaseCliente: false,
    nId_UsuarioAct: Number(id_usuario) || 0,
    dFecRegistro: dFecRegistroOriginal,  // ← Usa la fecha original del GET
    dFecActualizacion: new Date().toISOString(),
    nEmail_Prioridad: Number(data.prioridad) || 0,
    nId_PersEmailOpe: Number(data.status) || 0,
  };

  const result = await apiClient<ApiResponse<UpdateEmailResponse>>(
    `${BASE_EMAIL}`,
    {
      method: 'PUT',
      body,
    }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error al actualizar email');
  }

  return result.response;
}