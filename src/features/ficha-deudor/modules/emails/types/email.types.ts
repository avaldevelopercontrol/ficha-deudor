export interface EmailApi {
  nId_PersEmail: number;
  email: string;
  fechaActivacion: string;
  estado: string;
  status: string;
  fuente: string;
  baseCliente: string;
  contacto: string;
  prioridad: number;
  comentario: string;
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
  prioridad: number;
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
  nId_PersDeudor: number;
  cPers_Email: string;
  bEstado: boolean;
  cEmail_Coment: string;
  cEmail_Contacto: string;
  nId_Cliente: number;
  bBaseCliente: boolean;
  dFecRegistro: string;
  nId_UsuarioAct: number;
  dFecActualizacion: string;
  nEmail_Prioridad: number;
  nId_EstadoEnvioEmail: number;
  cEstado: string;
  dFecEstadoEnvio: string;
  nId_EstadoEnvioEmailGen: number;
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