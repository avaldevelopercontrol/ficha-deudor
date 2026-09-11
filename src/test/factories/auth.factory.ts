import type {
  AuthContextValue,
  AuthState,
  Cliente,
  LoginUsuarioApi,
  Usuario,
} from '../../features/auth/types';

export const createUsuario = (
  overrides: Partial<Usuario> = {}
): Usuario => ({
  id_usuario: '16068',
  nombre: 'Carlos',
  apellido: 'Ramírez López',
  username: 'cramirez',
  email: 'carlos@avalperu.pe',
  perfil: 'Administrador Base Datos',
  perfilId: 9,
  ...overrides,
});

export const createCliente = (
  overrides: Partial<Cliente> = {}
): Cliente => ({
  id_cliente: '95',
  id_grupo: 156,
  nombre: 'CLARO CORPORATIVO',
  ...overrides,
});

export const createLoginUsuarioApi = (
  overrides: Partial<LoginUsuarioApi> = {}
): LoginUsuarioApi => ({
  nId_Usuario: 16068,
  bEstado: true,
  cUsr_Login: 'cramirez',
  cUsr_Nombres: 'Carlos',
  cUsr_ApePat: 'Ramírez',
  cUsr_ApeMat: 'López',
  cUsr_Email: 'carlos@avalperu.pe',
  cUsr_EmailPersonal: '',
  cUsr_EmailProfile: '',
  per_Nombre: 'Administrador Base Datos      ',
  nid_perfil: 9,
  ...overrides,
});

export const createAuthState = (
  overrides: Partial<AuthState> = {}
): AuthState => ({
  isAuthenticated: true,
  usuario: createUsuario(),
  clienteSeleccionada: createCliente(),
  isLoading: false,
  error: null,
  ...overrides,
});

export const createAuthContextValue = (
  overrides: Partial<AuthContextValue> = {}
): AuthContextValue => ({
  ...createAuthState(),
  expiredPasswordChallenge: null,
  passwordExpiryWarning: null,
  login: async () => ({
    success: true,
    code: '00',
    message: 'Login exitoso',
    usuario: createUsuario(),
  }),
  logout: () => undefined,
  seleccionarCliente: () => undefined,
  clearError: () => undefined,
  clearExpiredPasswordChallenge: () => undefined,
  clearPasswordExpiryWarning: () => undefined,
  ...overrides,
});
