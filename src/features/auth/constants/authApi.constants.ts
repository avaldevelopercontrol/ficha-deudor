export const AUTH_LOGIN_CODES = {
  SUCCESS: '00',
  PASSWORD_EXPIRED: '092',
  PASSWORD_EXPIRING: '093',
  LOGIN_ATTEMPTS_EXCEEDED: '094',
  CLIENT_ERROR: 'CLIENT_ERROR',
  CANCELLED: 'CANCELLED',
} as const;

export const AUTH_API_ENDPOINTS = {
  USUARIO_BASE: '/v1/Usuario',
  LOGIN_USUARIO: '/v1/Usuario/GetLoginUsuario',
} as const;

export const AUTH_API_MESSAGES = {
  LOGIN_SUCCESS: 'Login exitoso.',
  LOGIN_INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos.',
  LOGIN_INACTIVE_USER: 'El usuario se encuentra inactivo.',
  LOGIN_UNEXPECTED_ERROR: 'Error al iniciar sesión.',
  LOGIN_CANCELLED: 'La autenticación fue cancelada.',
  LOGIN_PASSWORD_EXPIRED: 'Su clave ha expirado.',
  LOGIN_PASSWORD_EXPIRING:
    'Debe cambiar su clave antes de que expire.',
  LOGIN_ATTEMPTS_EXCEEDED:
    'Ha excedido la cantidad de intentos permitidos.',
  LOGIN_INVALID_RESPONSE:
    'La respuesta del servidor no contiene datos válidos.',
  CLIENTES_INVALID_RESPONSE:
    'La respuesta de clientes no contiene datos válidos.',
  CLIENTES_INVALID_USER:
    'No se encontró un usuario válido para cargar los clientes.',
  CLIENTES_ENDPOINT_NOT_CONFIGURED:
    'fetchClientesByUsuario requiere endpoint real. Configura VITE_USE_CLIENTES_MOCK=true o implementa el endpoint de clientes.',
} as const;
