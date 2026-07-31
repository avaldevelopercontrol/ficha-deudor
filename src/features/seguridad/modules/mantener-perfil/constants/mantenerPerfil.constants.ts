export const MANTENER_PERFIL_TEXTS = {
  sectionTitle:
    'Perfiles registrados',

  sectionDescription:
    'Consulte los perfiles disponibles para su mantenimiento.',

  loadingMessage:
    'Cargando perfiles...',

  emptyMessage:
    'No se encontraron perfiles para mostrar.',

  editAction:
    'Editar perfil',

  addAction:
    'Agregar Perfil',
} as const;

export const MANTENER_PERFIL_COLUMNS = {
  idPerfil:
    'ID Perfil',

  nombrePerfil:
    'Nombre del Perfil',

  abreviatura:
    'Abreviatura',

  fechaRegistro:
    'Fecha Registro',

  estado:
    'Estado',

  produccionOnline:
    'Producción Online',

  historiaDeudor:
    'Historia Deudor',

  editar:
    'Editar',
} as const;

export const MANTENER_PERFIL_COLUMN_WIDTHS = {
  idPerfil: '9%',
  nombrePerfil: '27%',
  abreviatura: '19%',
  fechaRegistro: '13%',
  estado: '10%',
  produccionOnline: '10%',
  historiaDeudor: '10%',
  editar: '7%',
} as const;

export const MANTENER_PERFIL_PAGE_SIZE_OPTIONS = [
  5,
  10,
  15,
  30,
] as const;