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

  updateUsuario:
    '/v1/Usuario',

  getUsuarioById:
    '/v1/Usuario',

  resetearClaveUsuario:
    '/v1/Usuario/ResetearClaveUsuario',

  getPerfiles:
    '/v1/Perfil/GetPerfiles',

  getGrupos:
    '/v1/Grupo/GetGrupos',

  getGruposByUsuario:
    '/v1/UGrupo/GetGruposByIdUsuario',

  getGruposFaltantesByUsuario:
    '/v1/UGrupo/GetGruposFaltantesByIdUsuario',

  usuarioGrupo:
    '/v1/UGrupo',

  getSubZonasGeneral:
    '/v1/Usuario/GetSubZonasGeneral',

  getCampanasDiscadorByUsuario:
    '/v1/Usuario/GetCampannaDiscadorByIdUsuario',

  getZonasFaltantesByClienteUsuario:
    '/v1/Usuario/ZonasFaltantesByIdClienteAndIdUsuario',

  getZonasAsignadasByClienteUsuario:
    '/v1/Usuario/ZonasAsignadosByIdClienteAndIdUsuario',

  createAsignaUsuario:
    '/v1/Usuario/CreateAsignaUsuario',

  editAsignaUsuario:
    '/v1/Usuario/EditAsignaUsuario',
} as const;