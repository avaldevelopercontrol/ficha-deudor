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
  GRUPOS_CLIENTE_INICIAL: '/v1/Grupo/GetGruposClienteInicial',
  ANIOS_BY_CLIENTE: '/v1/Cartera/GetAnioByIdCliente',
  CARTERAS_PARAMETROS_BY_CLIENTE_ANIO:
    '/v1/Cartera/GetCarterasParametrosByIdClienteAnnio',
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
  CLIENTES_LOAD_ERROR:
    'No se pudo obtener la lista de clientes disponibles.',
  CLIENTES_INVALID_USER:
    'No se encontró un usuario válido para cargar los clientes.',
  ANIOS_INVALID_RESPONSE:
    'La respuesta de años no contiene datos válidos.',
  ANIOS_LOAD_ERROR:
    'No se pudo obtener la lista de años del cliente.',
  ANIOS_INVALID_CLIENT:
    'No se encontró un cliente válido para cargar los años.',
  CARTERAS_INVALID_RESPONSE:
    'La respuesta de carteras no contiene datos válidos.',
  CARTERAS_LOAD_ERROR:
    'No se pudo obtener la lista de carteras del cliente.',
  CARTERAS_INVALID_CLIENT:
    'No se encontró un cliente válido para cargar las carteras.',
  CARTERAS_INVALID_ANIO:
    'No se encontró un año válido para cargar las carteras.',
} as const;
