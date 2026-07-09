export const AUTH_API_ENDPOINTS = {
  USUARIO_BASE: '/v1/Usuario',
  LOGIN_USUARIO: '/v1/Usuario/GetLoginUsuario',
} as const;

export const AUTH_API_MESSAGES = {
  LOGIN_SUCCESS: 'Login exitoso.',
  LOGIN_INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos.',
  LOGIN_INACTIVE_USER: 'El usuario se encuentra inactivo.',
  LOGIN_UNEXPECTED_ERROR: 'Error al iniciar sesión.',
  CLIENTES_ENDPOINT_NOT_CONFIGURED:
    'fetchClientesByUsuario requiere endpoint real. Configura VITE_USE_CLIENTES_MOCK=true o implementa el endpoint de clientes.',
} as const;
