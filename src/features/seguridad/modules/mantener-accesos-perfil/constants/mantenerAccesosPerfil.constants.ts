export const MANTENER_ACCESOS_PERFIL_TEXTS = {
  sectionTitle:
    'Accesos por perfil',

  sectionDescription:
    'Consulte la cantidad de opciones asignadas a cada perfil.',

  loadingMessage:
    'Cargando accesos por perfil...',

  emptyMessage:
    'No se encontraron perfiles para mostrar.',

  addAction:
    'Asignar Accesos al Perfil',

  editAction:
    'Editar accesos del perfil',

  editPendingTitle:
    'La edición se habilitará cuando se configure la API de detalle y actualización.',
} as const;

export const MANTENER_ACCESOS_PERFIL_COLUMNS = {
  idPerfil:
    'Id',

  nombrePerfil:
    'Nombre',

  cantidadOpciones:
    'Cantidad Opciones',

  editar:
    'Editar',
} as const;

export const MANTENER_ACCESOS_PERFIL_COLUMN_WIDTHS = {
  idPerfil: '9%',
  nombrePerfil: '64%',
  cantidadOpciones: '20%',
  editar: '7%',
} as const;

export const MANTENER_ACCESOS_PERFIL_PAGE_SIZE_OPTIONS = [
  5,
  10,
  15,
  30,
] as const;
