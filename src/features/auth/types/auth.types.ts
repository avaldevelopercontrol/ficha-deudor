// ─────────────────────────────────────────────
// ENTIDADES
// ─────────────────────────────────────────────

export interface Cliente {
  id_cliente: string;
  id_grupo: number;
  nombre: string;
}

export interface CarteraParametro {
  campania: number;
  anio: number;
  estado: string;
  numero: number;
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

/**
 * Subconjunto del usuario remoto que Auth valida y consume.
 *
 * El backend puede devolver propiedades adicionales. No se modelan aquí
 * porque no forman parte de las garantías runtime del feature de Auth.
 */
export interface LoginUsuarioApi {
  nId_Usuario: number;
  bEstado: boolean;
  cUsr_Login: string;
  cUsr_Nombres?: string | null;
  cUsr_ApePat?: string | null;
  cUsr_ApeMat?: string | null;
  cUsr_Email?: string | null;
  cUsr_EmailPersonal?: string | null;
  cUsr_EmailProfile?: string | null;
  per_Nombre?: string | null;
  nid_perfil?: number | null;
  nId_PerfilGest?: number | null;
}

// ─────────────────────────────────────────────
// PAYLOADS / REQUESTS
// ─────────────────────────────────────────────

export interface LoginPayload {
  username: string;
  password: string;
}

// ─────────────────────────────────────────────
// RESPUESTAS NORMALIZADAS PARA FRONTEND
// ─────────────────────────────────────────────

export interface LoginResponse {
  success: boolean;
  code: string;
  message: string;
  usuario: Usuario | null;
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
