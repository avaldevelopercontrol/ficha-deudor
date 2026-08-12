export const MANTENER_ACCESOS_USUARIO_TEXTS = {
  sectionTitle:
    'Mantener accesos por usuario',

  sectionDescription:
    'Consulte y administre accesos especiales por usuario y grupo.',

  loadingMessage:
    'Cargando accesos por usuario...',

  emptyMessage:
    'No se encontraron accesos por usuario para mostrar.',

  addAction:
    'Asignar accesos al usuario',

  editAction:
    'Editar accesos del usuario',
} as const;

export const MANTENER_ACCESOS_USUARIO_COLUMNS = {
  idUsuarioGrupoOpcion:
    'Id',

  usuario:
    'Usuario',

  nombreCompleto:
    'Nombre completo',

  grupo:
    'Grupo',

  opcion:
    'Opción',

  estado:
    'Estado',

  editar:
    'Editar',
} as const;

export const MANTENER_ACCESOS_USUARIO_COLUMN_WIDTHS = {
  idUsuarioGrupoOpcion: '9%',
  usuario: '12%',
  nombreCompleto: '22%',
  grupo: '16%',
  opcion: '23%',
  estado: '11%',
  editar: '7%',
} as const;


export const MANTENER_ACCESOS_USUARIO_RULE_MESSAGES = {
  alreadyAssignedUserGroup:
    'El usuario seleccionado ya tiene accesos configurados para este grupo. Utilice Editar para administrarlos.',
  inactiveOrUnavailableUser:
    'Seleccione un usuario activo disponible para el grupo indicado.',
} as const;

export const MANTENER_ACCESOS_USUARIO_PAGE_SIZE_OPTIONS = [
  5,
  10,
  15,
  30,
] as const;
