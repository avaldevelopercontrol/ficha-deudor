// ─────────────────────────────────────────────
// ENTIDADES
// ─────────────────────────────────────────────

export interface Cliente {
  id_cliente: string;
  nombre: string;
  codigo: string;
  activa: boolean;
}

export interface Usuario {
  id_usuario: string;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  perfil: string;
  perfilId: number | null;
}

// ─────────────────────────────────────────────
// API REAL: GET /v1/Usuario/GetLoginUsuario
// ─────────────────────────────────────────────

export interface LoginUsuarioApi {
  nId_Usuario: number;
  cUsr_NroDoc: string;
  cUsr_ApePat: string;
  cUsr_ApeMat: string;
  cUsr_Nombres: string;
  bSexo: number;
  cUsr_Login: string;
  cUsr_Pass: string;
  bEstado: boolean;
  mUsr_CostoMes: number;
  nId_Horario: number;
  nUsr_CtaNroAcum: number;
  nUsr_CtaMontoAcum: number;
  nUsr_CtaMontoRecAcum: number;
  nUsr_CtaMontoRecEfi: number;
  cUsr_Anexo: string;
  cUsr_Celular: string;
  cUsr_Email: string;
  cUsr_Telef: string;
  nId_UTipo: number;
  nId_Cargo: number;
  dUsr_FecNac?: string;
  dUsr_FecIngreso?: string;
  nId_Mtabla?: number;
  cUsr_Direcc: string;
  nId_Ubigeo: number;
  cUsr_DireccRef: string;
  nId_Grupo: number;
  nId_Sucursal: number;
  dUsr_FecSalida?: string;
  nId_UEstado?: number;
  nid_perfil: number;
  cod_Recau?: string;
  nUsr_CiuGestor?: string;
  nUsr_Zona?: string;
  cComp_Zona?: string;
  bValidaGesAsterisk?: boolean;
  cGestionaEstado?: string;
  nroCampanaDiscador?: number;
  cUsr_EmailPersonal?: string;
  nId_ZonaGen?: number;
  dUsr_PassUpdate?: string;
  nUsr_NroIntentoAcc?: number;
  cUsr_EmailProfile?: string;
  nId_PerfilGest?: number;
  nId_ClientePri?: number;
  nId_SubZonaGen?: number;
  nBuscarReniec?: number;
  nid_UsuSuper?: number;
  dUsr_FecCese?: string;
  bEmailVerificacion?: boolean;
  cEmailVerificacion_codigo?: string;
  cUsr_EmailVerificacion?: string;
  dFechaHora_Codigo?: string;
}

export interface LoginUsuarioApiResponse {
  code: string;
  message: string;
  messageUser: string;
  statusCode: number;
  response: LoginUsuarioApi | null;
}

// ─────────────────────────────────────────────
// PAYLOADS / REQUESTS
// ─────────────────────────────────────────────

export interface LoginPayload {
  username: string;
  password: string;
}

export interface SeleccionarClientePayload {
  id_usuario: string;
  id_cliente: string;
}

// ─────────────────────────────────────────────
// RESPUESTAS NORMALIZADAS PARA FRONTEND
// ─────────────────────────────────────────────

export interface LoginResponse {
  success: boolean;
  message: string;
  usuario: Usuario | null;
  token?: string;
}

export interface ClientesResponse {
  success: boolean;
  clientes: Cliente[];
}

// ─────────────────────────────────────────────
// ESTADO DE AUTENTICACIÓN
// ─────────────────────────────────────────────

export interface AuthState {
  isAuthenticated: boolean;
  usuario: Usuario | null;
  clienteSeleccionada: Cliente | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: () => void;
  seleccionarCliente: (cliente: Cliente) => void;
  clearError: () => void;
}
