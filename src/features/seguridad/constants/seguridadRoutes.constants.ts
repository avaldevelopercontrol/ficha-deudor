export const SEGURIDAD_ROUTES = {
  MANTENER_PERFIL:
    '/seguridad/mantener-perfil',

  MANTENER_MODULOS:
    '/seguridad/mantener-modulos',

  MANTENER_ACCESOS_PERFIL:
    '/seguridad/mantener-accesos-por-perfil',
} as const;

export const SEGURIDAD_API_ENDPOINTS = {
  perfiles:
    '/v1/Perfil',

  listadoPerfiles:
    '/v1/Perfil/GetPerfiles',

  opciones:
    '/v1/Opcion',

  listadoOpciones:
    '/v1/Opcion/GetOpciones',

  perfilOpciones:
    '/v1/PerfilOpcion',

  perfilOpcionesCount:
    '/v1/PerfilOpcion/GetPerfilOptionsCount',

  perfilOpcionesPorPerfil:
    '/v1/PerfilOpcion/GetOpcionesPorPerfil',
} as const;
