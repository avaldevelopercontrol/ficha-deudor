export const MANTENER_USUARIO_TEXTS = {
  sectionTitle: 'Usuarios registrados',

  sectionDescription:
    'Consulte los usuarios disponibles para su mantenimiento.',

  emptyMessage:
    'No se encontraron usuarios para mostrar.',

  editAction:
    'Editar',
} as const;

export const MANTENER_USUARIO_COLUMNS = {
  id: 'Id',
  nombre: 'Nombre',
  estado: 'Estado',
  perfil: 'Perfil',
  codigoRecaudacion: 'Código Rec.',
  login: 'Login',
  editar: 'Editar',
} as const;

export const MANTENER_USUARIO_COLUMN_WIDTHS = {
  id: '7%',
  nombre: '26%',
  estado: '11%',
  perfil: '20%',
  codigoRecaudacion: '14%',
  login: '14%',
  editar: '8%',
} as const;

export const MANTENER_USUARIO_PAGE_SIZE_OPTIONS = [
  5,
  10,
  15,
  30,
] as const;