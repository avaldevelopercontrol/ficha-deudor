import type {
  CarteraParametro,
  Cliente,
  LoginResponse,
  Usuario,
} from '../types';

// ─────────────────────────────────────────────
// USUARIOS MOCK
// Solo se mantienen para simular login local.
// Ya no contienen clientesAsignados.
// ─────────────────────────────────────────────

const usuariosMock: Record<string, { usuario: Usuario; password: string }> = {
  admin: {
    password: 'admin123',
    usuario: {
      id_usuario: '16068',
      nombre: 'Carlos',
      apellido: 'Ramírez',
      username: 'admin',
      email: 'c.ramirez@avalperu.pe',
      perfil: 'Administrador Base Datos',
      perfilId: 9,
    },
  },
  gestor1: {
    password: 'gestor123',
    usuario: {
      id_usuario: '16069',
      nombre: 'María',
      apellido: 'López',
      username: 'gestor1',
      email: 'm.lopez@avalperu.pe',
      perfil: 'GESTOR',
      perfilId: 2,
    },
  },
  gestor2: {
    password: 'gestor456',
    usuario: {
      id_usuario: '16070',
      nombre: 'Juan',
      apellido: 'Pérez',
      username: 'gestor2',
      email: 'j.perez@avalperu.pe',
      perfil: 'GESTOR',
      perfilId: 5,
    },
  },
};

// ─────────────────────────────────────────────
// CLIENTES MOCK
// ─────────────────────────────────────────────

export const clientesMock: Cliente[] = [
  {
    id_cliente: '95',
    id_grupo: 156,
    nombre: 'CLARO CORPORATIVO',
  },
];

export const aniosCarteraMock = [2026, 2025, 2024] as const;

export const carterasParametrosMock: CarteraParametro[] = [
  { campania: 8, anio: 2026, estado: 'Vigente', numero: 0 },
  { campania: 7, anio: 2026, estado: 'Vigente', numero: 0 },
  { campania: 5, anio: 2026, estado: 'Vigente', numero: 0 },
];

// ─────────────────────────────────────────────
// MOCK FUNCTIONS
// ─────────────────────────────────────────────

const waitForMockDelay = (
  duration: number,
  signal?: AbortSignal
): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      const error = new Error('Solicitud cancelada');
      error.name = 'AbortError';
      reject(error);
      return;
    }

    const timeoutId = setTimeout(() => {
      signal?.removeEventListener('abort', handleAbort);
      resolve();
    }, duration);

    const handleAbort = () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', handleAbort);
      const error = new Error('Solicitud cancelada');
      error.name = 'AbortError';
      reject(error);
    };

    signal?.addEventListener('abort', handleAbort, { once: true });
  });

/**
 * Simula el endpoint de login.
 * POST /api/auth/login
 */
export const mockLogin = async (payload: {
  username: string;
  password: string;
}): Promise<LoginResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const registro = usuariosMock[payload.username];

  if (!registro) {
    return {
      success: false,
      code: '01',
      message: 'Usuario no encontrado',
      usuario: null,
    };
  }

  if (registro.password !== payload.password) {
    return {
      success: false,
      code: '01',
      message: 'Contraseña incorrecta',
      usuario: null,
    };
  }

  return {
    success: true,
    code: '00',
    message: 'Login exitoso',
    usuario: registro.usuario,
    token: `mock-jwt-token-${Date.now()}`,
  };
};

/**
 * Simula el listado inicial de relaciones grupo-cliente en desarrollo local.
 */
export const mockGetGruposClienteInicial = async (
  signal?: AbortSignal
): Promise<Cliente[]> => {
  await waitForMockDelay(500, signal);

  return clientesMock;
};

export const mockGetAniosByCliente = async (
  signal?: AbortSignal
): Promise<number[]> => {
  await waitForMockDelay(300, signal);

  return [...aniosCarteraMock];
};

export const mockGetCarterasParametrosByClienteAnio = async (
  signal?: AbortSignal
): Promise<CarteraParametro[]> => {
  await waitForMockDelay(300, signal);

  return carterasParametrosMock.map((cartera) => ({ ...cartera }));
};
