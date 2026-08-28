import type {
  ApiResponse,
  ApiResponseSimple,
} from '@shared/types/indexApi';

// ─────────────────────────────────────────────
// ENTIDADES
// ─────────────────────────────────────────────

export interface Cliente {
  id_cliente: string;
  id_grupo: number;
  nombre: string;
}

export interface GrupoClienteInicialApi {
  nId_Cliente: number;
  cCli_Nombre: string | null;
  swt_estadoGest: number;
  ntip_campanna: number;
  nId_Grupo: number;
  nId_UGrupo: number;
}

export type GetGruposClienteInicialResponse = ApiResponse<
  GrupoClienteInicialApi[]
>;

export interface AnioCarteraApi {
  anio: number;
}

export type GetAniosByClienteResponse = ApiResponse<AnioCarteraApi[]>;

export interface CarteraParametroApi {
  campanna: number;
  anio: number;
  desEstado: string;
  numero: number;
}

export interface CarteraParametro {
  campania: number;
  anio: number;
  estado: string;
  numero: number;
}

export type GetCarterasParametrosByClienteAnioResponse = ApiResponse<
  CarteraParametroApi[]
>;

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
  nid_perfil?: number;
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

export type LoginUsuarioApiResponse = ApiResponseSimple<
  LoginUsuarioApi | null
>;

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
  code: string;
  message: string;
  usuario: Usuario | null;
  token?: string;
  cancelled?: boolean;
  requiresPasswordChange?: boolean;
  requiresPasswordChangeSoon?: boolean;
}

export interface ExpiredPasswordChallenge {
  userId: string;
  message: string;
}

export interface PasswordExpiryWarning {
  message: string;
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
  expiredPasswordChallenge: ExpiredPasswordChallenge | null;
  passwordExpiryWarning: PasswordExpiryWarning | null;
  login: (payload: LoginPayload) => Promise<LoginResponse>;
  logout: () => void;
  seleccionarCliente: (cliente: Cliente) => void;
  clearError: () => void;
  clearExpiredPasswordChallenge: () => void;
  clearPasswordExpiryWarning: () => void;
}
