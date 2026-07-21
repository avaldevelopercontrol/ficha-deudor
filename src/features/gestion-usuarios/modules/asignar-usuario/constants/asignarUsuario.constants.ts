export const ASIGNAR_USUARIO_TEXTS = {
  sectionTitle: 'Usuarios disponibles',
  sectionDescription:
    'Seleccione un usuario para continuar con la asignación de zonas.',
  emptyMessage: 'No se encontraron usuarios para mostrar.',
  selectAction: 'Seleccionar usuario',
} as const;

export const ASIGNAR_USUARIO_COLUMNS = {
  id: 'Id',
  nombre: 'Nombre',
  perfil: 'Perfil',
  login: 'Login',
  acciones: 'Escoger',
} as const;

export const ASIGNAR_USUARIO_COLUMN_WIDTHS = {
  id: '9%',
  nombre: '45',
  perfil: '20%',
  login: '20%',
  acciones: '7%',
} as const;

export const ASIGNAR_USUARIO_PAGE_SIZE_OPTIONS = [
  5,
  10,
  30,
  50,
] as const;