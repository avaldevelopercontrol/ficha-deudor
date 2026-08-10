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
  nombre: 'CLARO CORPORATIVO',
  codigo: 'CLARO',
  activa: true,
  ...overrides,
});

export const createLoginUsuarioApi = (
  overrides: Partial<LoginUsuarioApi> = {}
): LoginUsuarioApi => ({
  nId_Usuario: 16068,
  cUsr_NroDoc: '12345678',
  cUsr_ApePat: 'Ramírez',
  cUsr_ApeMat: 'López',
  cUsr_Nombres: 'Carlos',
  bSexo: 1,
  cUsr_Login: 'cramirez',
  cUsr_Pass: 'secreto',
  bEstado: true,
  mUsr_CostoMes: 0,
  nId_Horario: 1,
  nUsr_CtaNroAcum: 0,
  nUsr_CtaMontoAcum: 0,
  nUsr_CtaMontoRecAcum: 0,
  nUsr_CtaMontoRecEfi: 0,
  cUsr_Anexo: '',
  cUsr_Celular: '',
  cUsr_Email: 'carlos@avalperu.pe',
  cUsr_Telef: '',
  nId_UTipo: 1,
  nId_Cargo: 1,
  cUsr_Direcc: '',
  nId_Ubigeo: 0,
  cUsr_DireccRef: '',
  nId_Grupo: 0,
  nId_Sucursal: 0,
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
  login: async () => ({
    success: true,
    message: 'Login exitoso',
    usuario: createUsuario(),
  }),
  logout: () => undefined,
  seleccionarCliente: () => undefined,
  clearError: () => undefined,
  ...overrides,
});
