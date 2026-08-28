export interface EmailApi {
  nId_PersEmail: number;
  email?: string | null;
  fechaActivacion?: string | null;
  estado?: string | null;
  status?: string | null;
  fuente?: string | null;
  baseCliente?: string | null;
  contacto?: string | null;
  prioridad?: number | null;
  comentario?: string | null;
}

export interface Email {
  id: string;
  email: string;
  fechaActivacion: string;
  estado: string;
  status: string;
  fuente: string;
  baseCliente: string;
  contacto: string;
  prioridad: number | null;
  comentario: string;
}

// ─── GET /v1/Email/GetStatus ───
export interface EmailStatusApi {
  nId_PersTelefOpe: number;
  cNombre_PersTelefOpe: string;
}

export interface EmailStatus {
  id: string;
  nombre: string;
}

// ─── POST /v1/Email ───
export interface CreateEmailRequest {
  nId_PersDeudor: number;
  cPers_Email: string;
  bEstado: boolean;
  cEmail_Coment: string;
  cEmail_Contacto: string;
  nId_Cliente: number;
  bBaseCliente: boolean;
  nId_UsuarioAct: number;
  dFecRegistro: string;
  dFecActualizacion: string;
  nEmail_Prioridad: number;
  nId_PersEmailOpe: number;
}

export interface CreateEmailResponse {
  nId_PersEmail: number;
  nId_PersDeudor: number;
  cPers_Email: string;
}

// ─── Form data para el modal ───
export interface EmailFormData {
  email: string;
  contacto: string;
  comentario: string;
  prioridad: string;
  estado: boolean;
  status: string;
}

// ─── GET /v1/Email/{nId_PersEmail} ───
export interface EmailByIdApi {
  nId_PersEmail: number;
  cPers_Email: string;
  bEstado?: boolean | null;
  cEmail_Coment: string;
  cEmail_Contacto: string;
  dFecRegistro: string;
  nEmail_Prioridad: number;
  nId_PersEmailOpe: number;
}

// ─── PUT /v1/Email ───
export interface UpdateEmailRequest {
  nId_PersEmail: number;
  nId_PersDeudor: number;
  cPers_Email: string;
  bEstado: boolean;
  cEmail_Coment: string;
  cEmail_Contacto: string;
  nId_Cliente: number;
  bBaseCliente: boolean;
  nId_UsuarioAct: number;
  dFecRegistro: string;
  dFecActualizacion: string;
  nEmail_Prioridad: number;
  nId_PersEmailOpe: number;
}

export interface UpdateEmailResponse {
  nId_PersEmail: number;
  nId_PersDeudor: number;
  cPers_Email: string;
}

// ─── Form para editar (mismo shape que crear + id obligatorio) ───
export interface EmailEditFormData extends EmailFormData {
  id: string;
  dFecRegistro: string; 
}