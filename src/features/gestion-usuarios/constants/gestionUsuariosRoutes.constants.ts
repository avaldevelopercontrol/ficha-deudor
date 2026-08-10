export const GESTION_USUARIOS_ROUTES = {
  CAMBIAR_CLAVE:
    '/gestion-usuarios/cambiar-clave',

  ASIGNAR_USUARIO:
    '/gestion-usuarios/asignar-usuario',

  MANTENER_USUARIO:
    '/gestion-usuarios/mantener-usuario',
} as const;

export const GESTION_USUARIOS_API_ENDPOINTS = {
  getUsuariosList:
    '/v1/Usuario/GetUsuariosList',

  createUsuario:
    '/v1/Usuario',

  getPerfiles:
    '/v1/Perfil/GetPerfiles',

  getGrupos:
    '/v1/Grupo/GetGrupos',

  getSubZonasGeneral:
    '/v1/Usuario/GetSubZonasGeneral',

  getCampanasDiscadorByUsuario:
    '/v1/Usuario/GetCampannaDiscadorByIdUsuario',
} as const;