export const MANTENER_GRUPO_TEXTS = {
  sectionTitle:
    'Grupos registrados',

  sectionDescription:
    'Consulte los grupos disponibles para su mantenimiento.',

  loadingMessage:
    'Cargando grupos...',

  emptyMessage:
    'No se encontraron grupos para mostrar.',

  addAction:
    'Agregar grupo',

  editAction:
    'Editar grupo',

  editUnavailable:
    'La edición del grupo no está disponible.',
} as const;

export const MANTENER_GRUPO_COLUMNS = {
  idGrupo:
    'Id',

  nombreGrupo:
    'Nombre del Grupo',

  cliente:
    'Cliente',

  estado:
    'Estado',

  editar:
    'Editar',
} as const;

export const MANTENER_GRUPO_COLUMN_WIDTHS = {
  idGrupo: '9%',
  nombreGrupo: '36%',
  cliente: '35%',
  estado: '13%',
  editar: '7%',
} as const;

export const MANTENER_GRUPO_PAGE_SIZE_OPTIONS = [
  5,
  10,
  15,
  30,
] as const;
