export const SEGURIDAD_ROUTES = {
  MANTENER_PERFIL:
    '/seguridad/mantener-perfil',

  MANTENER_MODULOS:
    '/seguridad/mantener-modulos',

  MANTENER_GRUPO:
    '/seguridad/mantener-grupo',

  MANTENER_ACCESOS_PERFIL:
    '/seguridad/mantener-accesos-por-perfil',

  MANTENER_ACCESOS_USUARIO:
    '/seguridad/mantener-accesos-por-usuario',
} as const;

export const SEGURIDAD_API_ENDPOINTS = {
  perfiles:
    '/v1/Perfil',

  listadoPerfiles:
    '/v1/Perfil/GetPerfiles',

  grupos:
    '/v1/Grupo',

  listadoGrupos:
    '/v1/Grupo/GetGruposListado',

  clientesActivos:
    '/v1/Cliente/GetClientesActivos',

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

  usuarioGrupoOpciones:
    '/v1/UsuarioGrupoOpcion',

  usuarioGrupoOpcionesListado:
    '/v1/UsuarioGrupoOpcion/GetUsuarioGrupoOpcionListado',

  usuarioGrupoOpcionesPorUsuarioGrupo:
    '/v1/UsuarioGrupoOpcion/GetByIdUsuarioIdGrupo',
} as const;
