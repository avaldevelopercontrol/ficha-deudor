import type { Cliente, LoginResponse, Usuario, ClientesResponse } from '../types';

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
    nombre: 'CLARO CORPORATIVO',
    codigo: 'CLARO',
    activa: true,
  },
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
      message: 'Usuario no encontrado',
      usuario: null,
    };
  }

  if (registro.password !== payload.password) {
    return {
      success: false,
      message: 'Contraseña incorrecta',
      usuario: null,
    };
  }

  return {
    success: true,
    message: 'Login exitoso',
    usuario: registro.usuario,
    token: `mock-jwt-token-${Date.now()}`,
  };
};

/**
 * Simula la carga de clientes disponibles.
 * Ya no filtra por usuario.
 */
export const mockGetClientesByUsuario = async (
  _id_usuario?: string,
  signal?: AbortSignal
): Promise<ClientesResponse> => {
  void _id_usuario;
  await waitForMockDelay(500, signal);

  const clientesActivos = clientesMock.filter((cliente) => cliente.activa);

  return {
    success: true,
    clientes: clientesActivos,
  };
};